import { defineStore } from "pinia";
import { ref, toRaw, computed } from "vue";
import { db } from "../services/Database/Database";
import type { Pedido, PedidoStatus, PagamentoRegistro } from "../types/pedido.type";
import type { Metrica } from "../types/metrica.type";
import { getMesAnoAtual, getDataHojeString } from "@/shared/helpers/data.helper";
import { generateUUID } from "../helpers/uuid.helper";

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
            
            receitaTotal += pedido.valorPago;
            
            const restante = pedido.valor - pedido.valorPago;
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

        // LEITURA: Leva apenas os dados persistentes (valorFaturado) do Dexie.
        const metricasDB = await db.metricas.get(mesAnoAtual) || {
            mesAno: mesAnoAtual,
            totalFinalizados: 0, totalCancelados: 0, valorFaturado: 0, valorPendente: 0, receitaTotal: 0
        };

        // ATUALIZAÇÃO DO PINIA (Memória): Mescla os valores persistentes com os valores dinâmicos calculados.
        metricasAtuais.value = {
            ...metricasDB,
            receitaTotal: receitaTotal,
            valorPendente: valorPendente,
            totalFinalizados: totalFinalizados,
            totalCancelados: totalCancelados,
        };
        
        // REMOVIDO: await db.metricas.put(metricasAtuais.value); 
        // A persistência só deve ocorrer em funções que alteram o status/pagamento.
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

    // Esta função PERSISTE APENAS os dados mensais (totalFinalizados e valorFaturado)
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

        metricas.totalFinalizados += 1; // Adicionado de volta aqui, pois esta é a lógica de persistência
        metricas.valorFaturado += valorPedido;

        await db.metricas.put(metricas);
    }

    async function atualizarStatusPedido(pedidoUuid: string, novoStatus: PedidoStatus, valorPedido: number) {
        try {
            // 1. Atualiza o status no Dexie (await garante que a operação termine)
            await db.pedidos.update(pedidoUuid, { status: novoStatus });

            const pedidoIndex = pedidos.value.findIndex(p => p.uuid === pedidoUuid);

            if (pedidoIndex !== -1) {
                const statusMudouParaConcluido = (pedidos.value[pedidoIndex].status !== 'CONCLUIDO' && novoStatus === 'CONCLUIDO');
                
                // 2. Atualiza o status na memória (Pinia)
                pedidos.value[pedidoIndex].status = novoStatus; 

                // 3. Persiste métricas MENSAIS (se aplicável)
                if (statusMudouParaConcluido) {
                    await atualizarMetricasAposConclusao(valorPedido);
                }
            }

            // 4. Recalcula métricas GERAIS (receita total e pendente) com base na memória atualizada
            await calcularMetricasGerais();

        } catch (error) {
            console.error('Erro ao atualizar status ou métricas:', error);
        }
    }

    async function registrarNovoPagamento(
        pedidoUuid: string,
        pagamentos: PagamentoRegistro[],
        valorPago: number,
        novoStatus: PedidoStatus,
        valorPedido: number
    ) {
        try {
            const pagamentosPlano = JSON.parse(JSON.stringify(pagamentos));

            // 1. Atualiza o pedido no Dexie (await garante que a operação termine)
            await db.pedidos.update(pedidoUuid, {
                pagamentos: pagamentosPlano,
                valorPago: valorPago,
                status: novoStatus
            });

            const pedidoIndex = pedidos.value.findIndex(p => p.uuid === pedidoUuid);
            
            if (pedidoIndex !== -1) {
                const statusMudouParaConcluido = (pedidos.value[pedidoIndex].status !== 'CONCLUIDO' && novoStatus === 'CONCLUIDO');
                
                // 2. Atualiza o pedido na memória (Pinia)
                pedidos.value[pedidoIndex] = {
                    ...pedidos.value[pedidoIndex],
                    pagamentos: pagamentosPlano,
                    valorPago: valorPago,
                    status: novoStatus
                };

                // 3. Persiste métricas MENSAIS (se aplicável)
                if (statusMudouParaConcluido) {
                    await atualizarMetricasAposConclusao(valorPedido);
                }
            }

            // 4. Recalcula métricas GERAIS com base na memória atualizada
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
        carregarPedidos,
        carregarMetricasAtuais,
        adicionarPedido,
        atualizarStatusPedido,
        registrarNovoPagamento,
        filtrarPedidosPorData,
    };
});