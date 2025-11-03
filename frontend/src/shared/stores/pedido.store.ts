import { defineStore } from "pinia";
import { ref, toRaw, computed } from "vue";
import { db } from "../services/Database/Database";
import type { Pedido, PedidoStatus, PagamentoRegistro, PedidoItemPeca } from "../types/pedido.type";
import type { Metrica } from "../types/metrica.type";
import { getMesAnoAtual, getDataHojeString } from "@/shared/helpers/data.helper";
import { generateUUID } from "../helpers/uuid.helper";

function calcularValorTotalPedido(pedido: Pedido): number {
    return pedido.itens.reduce((totalPeca, peca: PedidoItemPeca) => {
        const subtotalPeca = peca.servicos.reduce((subtotalServico, servico) => {
            return subtotalServico + (servico.quantidade * servico.unitPrice);
        }, 0);
        return totalPeca + subtotalPeca;
    }, 0);
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

    async function carregarPedidos() {
        try {
            pedidos.value = await db.pedidos.toArray();
            carregando.value = true;
        } catch (error) {
            console.error('Erro ao carregar pedidos:', error);
        }
    }

    async function calcularMetricasGerais() {
        const mesAnoAtual = getMesAnoAtual();
        let receitaTotal = 0;
        let valorPendente = 0;
        let totalFinalizados = 0;
        let totalCancelados = 0;

        for (const pedido of pedidos.value) {
            const valorTotal = calcularValorTotalPedido(pedido);
            
            receitaTotal += pedido.valorPago;
            
            const restante = valorTotal - pedido.valorPago;
            if (restante > 0 && pedido.status !== 'CANCELADO') {
                valorPendente += restante;
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
            totalFinalizados: 0, totalCancelados: 0, valorFaturado: 0, valorPendente: 0, receitaTotal: 0
        };

        metricasAtuais.value = {
            ...metricasDB,
            receitaTotal: receitaTotal,
            valorPendente: valorPendente,
            totalFinalizados: totalFinalizados,
            totalCancelados: totalCancelados,
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
                ...JSON.parse(JSON.stringify(toRaw(novoPedidoData))),
                uuid: uuid
            };

            await db.pedidos.add(pedidoPlano);
            await carregarPedidos();
            await calcularMetricasGerais();

            return uuid;
        } catch (error) {
            console.error('Erro ao adicionar pedido ao Dexie:', error);
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
        };

        metricas.totalFinalizados += 1;
        metricas.valorFaturado += valorPedido;

        await db.metricas.put(metricas);
    }

    async function atualizarStatusPedido(pedidoUuid: string, novoStatus: PedidoStatus) {
        try {
            const pedido = pedidos.value.find(p => p.uuid === pedidoUuid);
            if (!pedido) return;

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

        } catch (error) {
            console.error('Erro ao atualizar status ou métricas:', error);
        }
    }

    async function registrarNovoPagamento(
        pedidoUuid: string,
        pagamentos: PagamentoRegistro[],
        valorPago: number,
        novoStatus: PedidoStatus
    ) {
        try {
            const pedido = pedidos.value.find(p => p.uuid === pedidoUuid);
            if (!pedido) return;

            const valorPedido = calcularValorTotalPedido(pedido);
            const pagamentosPlano = JSON.parse(JSON.stringify(pagamentos));

            await db.pedidos.update(pedidoUuid, {
                pagamentos: pagamentosPlano,
                valorPago: valorPago,
                status: novoStatus
            });

            const pedidoIndex = pedidos.value.findIndex(p => p.uuid === pedidoUuid);
            
            if (pedidoIndex !== -1) {
                const statusMudouParaConcluido = (pedidos.value[pedidoIndex].status !== 'CONCLUIDO' && novoStatus === 'CONCLUIDO');
                
                pedidos.value[pedidoIndex] = {
                    ...pedidos.value[pedidoIndex],
                    pagamentos: pagamentosPlano,
                    valorPago: valorPago,
                    status: novoStatus
                };

                if (statusMudouParaConcluido) {
                    await atualizarMetricasAposConclusao(valorPedido);
                }
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
        carregarPedidos,
        carregarMetricasAtuais,
        adicionarPedido,
        atualizarStatusPedido,
        registrarNovoPagamento,
        filtrarPedidosPorData,
    };
});