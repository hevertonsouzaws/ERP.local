import { defineStore } from "pinia";
import { ref, toRaw, computed } from "vue";
import { db } from "../services/Database/Database";
import type { Pedido, PedidoStatus, PagamentoRegistro, PedidoItemPeca } from "../types/order.type";
import type { Metrica, TotalPorFormaPagamento } from "../types/metrica.type";
import { getMesAnoAtual, getDataHojeString } from "@/shared/helpers/data.helper";
import { generateUUID } from "../helpers/uuid.helper";
import { showToast } from "@/shared/helpers/toastState";

function calcularValorTotalPedido(pedido: Pedido): number {
    const subtotal = pedido.itens.reduce((totalPeca, peca: PedidoItemPeca) => {
        const subtotalPeca = peca.servicos.reduce((subtotalServico, servico) => {
            return subtotalServico + (servico.quantidade * servico.unitPrice);
        }, 0);
        return totalPeca + subtotalPeca;
    }, 0);

    const percentualDesconto = pedido.descontoPorcentagem || 0;
    const valorDesconto = subtotal * (percentualDesconto / 100);

    return subtotal - valorDesconto;
}

export const usePedidoStore = defineStore('pedidos', () => {
    const pedidos = ref<Pedido[]>([]);
    const carregando = ref(false);
    const metricasAtuais = ref<Metrica>();
    const dataSelecionada = ref(getDataHojeString());

    const pedidosFiltrados = computed(() => {
        return pedidos.value
            .filter(p => p.dataEntrega === dataSelecionada.value)
            .sort((a, b) => (a.horarioEntrega || '').localeCompare(b.horarioEntrega || ''));
    });

    const getValorTotalPedido = (pedido: Pedido) => calcularValorTotalPedido(pedido);

    const getPedidoByUuid = (uuid: string) => computed(() => pedidos.value.find(p => p.uuid === uuid));

    async function carregarPedidos() {
        try {
            pedidos.value = await db.pedidos.toArray();
            carregando.value = true;
        } catch (error) {
            showToast('Erro ao carregar pedidos. Verifique a base de dados.', 'error');
        }
    }

    async function calcularMetricasGerais() {
        const mesAnoAtual = getMesAnoAtual();
        let receitaTotal = 0;
        let valorPendente = 0;
        let totalFinalizados = 0;
        let totalCancelados = 0;

        const totaisPorForma: TotalPorFormaPagamento = {
            PIX: 0, DEBITO: 0, CREDITO: 0, DINHEIRO: 0, OUTRO: 0
        };

        for (const pedido of pedidos.value) {
            const valorTotalLiquido = calcularValorTotalPedido(pedido);

            receitaTotal += pedido.valorPago;

            const restante = valorTotalLiquido - pedido.valorPago;

            if (restante > 0 && pedido.status !== 'CANCELADO') {
                valorPendente += restante;
            }
            for (const pagamento of pedido.pagamentos) {
                if (pagamento.forma in totaisPorForma) {
                    totaisPorForma[pagamento.forma as keyof TotalPorFormaPagamento] += pagamento.valor;
                } else {
                    totaisPorForma['OUTRO'] += pagamento.valor;
                }
            }

            const dataPedidoMesAno = pedido.dataCriacao.substring(0, 7);

            if (dataPedidoMesAno === mesAnoAtual) {
                if (pedido.status === 'CONCLUIDO') {
                    totalFinalizados += 1;
                } else if (pedido.status === 'CANCELADO') {
                    totalCancelados += 1;
                }
            }
        }

        const metricasDB = await db.metricas.get(mesAnoAtual) || {
            mesAno: mesAnoAtual,
            totalFinalizados: 0, totalCancelados: 0, valorFaturado: 0, valorPendente: 0, receitaTotal: 0,
            receitaPorForma: { PIX: 0, DEBITO: 0, CREDITO: 0, DINHEIRO: 0, OUTRO: 0 }
        };

        metricasAtuais.value = {
            ...metricasDB,
            receitaTotal: receitaTotal,
            valorPendente: valorPendente,
            totalFinalizados: totalFinalizados,
            totalCancelados: totalCancelados,
            valorFaturado: metricasDB.valorFaturado,
            receitaPorForma: totaisPorForma,
        };
    }

    async function carregarMetricasAtuais() {
        if (!carregando.value) {
            await carregarPedidos();
        }
        await calcularMetricasGerais();
    }

    async function adicionarPedido(novoPedidoData: Omit<Pedido, 'uuid'>): Promise<string | undefined> {
        try {
            const uuid = generateUUID();
            const pedidoPlano: Pedido = {
                descontoPorcentagem: novoPedidoData.descontoPorcentagem || 0,
                ...JSON.parse(JSON.stringify(toRaw(novoPedidoData))),
                uuid: uuid
            };

            await db.pedidos.add(pedidoPlano);
            await carregarPedidos();
            await calcularMetricasGerais();

            showToast(`✅ Pedido #${uuid.substring(0, 8)} criado com sucesso!`, 'success');

            return uuid;
        } catch (error) {
            showToast('Erro ao adicionar pedido.', 'error');
        }
    }

    async function atualizarMetricasAposConclusao(valorPedido: number) {
        const mesAno = getMesAnoAtual();

        const metricas = await db.metricas.get(mesAno) || {
            mesAno,
            totalFinalizados: 0,
            totalCancelados: 0,
            valorFaturado: 0,
            valorPendente: 0,
            receitaTotal: 0,
            receitaPorForma: { PIX: 0, DEBITO: 0, CREDITO: 0, DINHEIRO: 0, OUTRO: 0 }
        };

        metricas.totalFinalizados += 1;
        metricas.valorFaturado += valorPedido;

        await db.metricas.put(metricas);
    }

    async function atualizarStatusPedido(pedidoUuid: string, novoStatus: PedidoStatus) {
        try {
            const pedido = pedidos.value.find(p => p.uuid === pedidoUuid);
            if (!pedido) {
                showToast('Pedido não encontrado para atualização de status.', 'warning');
                return;
            }

            const valorPedido = calcularValorTotalPedido(pedido);

            await db.pedidos.update(pedidoUuid, { status: novoStatus });

            const pedidoIndex = pedidos.value.findIndex(p => p.uuid === pedidoUuid);

            if (pedidoIndex !== -1) {
                const statusMudouParaConcluido = (pedidos.value[pedidoIndex].status !== 'CONCLUIDO' && novoStatus === 'CONCLUIDO');

                pedidos.value[pedidoIndex].status = novoStatus;

                if (statusMudouParaConcluido) {
                    await atualizarMetricasAposConclusao(valorPedido);
                }
            }

            await calcularMetricasGerais();
            showToast(`Status do pedido #${pedidoUuid.substring(0, 8)} atualizado para ${novoStatus}!`, 'warning');

        } catch (error) {
            showToast('Erro ao atualizar status do pedido.', 'error');
        }
    }

    async function atualizarItensOuPagamentosPedido(
        pedidoUuid: string,
        novosItens: PedidoItemPeca[],
        novosPagamentos: PagamentoRegistro[],
        novoDescontoPorcentagem: number,
    ) {
        try {
            const pedido = pedidos.value.find(p => p.uuid === pedidoUuid);
            if (!pedido) return;

            const novoPedidoCalculo: Pedido = {
                ...pedido,
                itens: novosItens,
                descontoPorcentagem: novoDescontoPorcentagem
            };

            const novoValorPago = novosPagamentos.reduce((total, p) => total + p.valor, 0);

            await db.pedidos.update(pedidoUuid, {
                itens: JSON.parse(JSON.stringify(toRaw(novosItens))),
                pagamentos: JSON.parse(JSON.stringify(toRaw(novosPagamentos))),
                valorPago: novoValorPago,
                descontoPorcentagem: novoDescontoPorcentagem,
            });

            const pedidoIndex = pedidos.value.findIndex(p => p.uuid === pedidoUuid);
            if (pedidoIndex !== -1) {
                pedidos.value[pedidoIndex].itens = novosItens;
                pedidos.value[pedidoIndex].pagamentos = novosPagamentos;
                pedidos.value[pedidoIndex].valorPago = novoValorPago;
                pedidos.value[pedidoIndex].descontoPorcentagem = novoDescontoPorcentagem;
            }

            await calcularMetricasGerais();
            showToast(`Pedido #${pedidoUuid.substring(0, 8)} atualizado com sucesso!`, 'success');

        } catch (error) {
            showToast(`Erro ao atualizar pedido #${pedidoUuid.substring(0, 8)}.`, 'error');
            throw error;
        }
    }

    async function registrarNovoPagamento(
        pedidoUuid: string,
        pagamentos: PagamentoRegistro[],
        valorPago: number,
    ) {
        try {
            const pagamentosPlano = JSON.parse(JSON.stringify(pagamentos));

            await db.pedidos.update(pedidoUuid, {
                pagamentos: pagamentosPlano,
                valorPago: valorPago,
            });

            const pedidoIndex = pedidos.value.findIndex(p => p.uuid === pedidoUuid);

            if (pedidoIndex !== -1) {
                pedidos.value[pedidoIndex] = {
                    ...pedidos.value[pedidoIndex],
                    pagamentos: pagamentosPlano,
                    valorPago: valorPago,
                };
            }

            await calcularMetricasGerais();

        } catch (error) {
            console.error(`Erro ao registrar novo pagamento para o pedido ${pedidoUuid}:`, error);
            throw error;
        }
    }

    function filtrarPedidosPorData(data: string) {
        dataSelecionada.value = data;
    }

    return {
        pedidos,
        carregando,
        metricasAtuais,
        dataSelecionada,
        pedidosFiltrados,
        getValorTotalPedido,
        getPedidoByUuid,
        carregarPedidos,
        carregarMetricasAtuais,
        adicionarPedido,
        atualizarStatusPedido,
        atualizarItensOuPagamentosPedido,
        registrarNovoPagamento,
        filtrarPedidosPorData,
    };
});