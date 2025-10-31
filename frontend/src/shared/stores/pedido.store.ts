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

    async function carregarMetricasAtuais() {
        try {
            const mesAno = getMesAnoAtual();
            metricasAtuais.value = await db.metricas.get(mesAno) || {
                mesAno,
                totalFinalizados: 0,
                totalCancelados: 0,
                valorFaturado: 0,
            };
        } catch (error) {
            console.error('Erro ao carregar métricas:', error);
        }
    }

    async function adicionarPedido(novoPedidoData: Omit<Pedido, 'uuid'>): Promise<string | undefined> {
        try {
            const pedidoPlanoBruto = toRaw(novoPedidoData);
            const pedidoPlano: Pedido = {
                ...JSON.parse(JSON.stringify(pedidoPlanoBruto)),
                uuid: generateUUID()
            };

            const uuid = await db.pedidos.add(pedidoPlano);

            await carregarPedidos();

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
        };

        metricas.totalFinalizados += 1;
        metricas.valorFaturado += valorPedido;

        await db.metricas.put(metricas);
    }

    async function atualizarStatusPedido(pedidoUuid: string, novoStatus: PedidoStatus, valorPedido: number) {
        try {
            await db.pedidos.update(pedidoUuid, { status: novoStatus });

            if (novoStatus === 'CONCLUIDO') {
                // CORREÇÃO AQUI: Usar 'uuid' em vez de 'pedidoUuid'
                const pedido = pedidos.value.find(p => p.uuid === pedidoUuid);
                if (pedido && pedido.status !== 'CONCLUIDO') {
                    await atualizarMetricasAposConclusao(valorPedido);
                }
            } else if (novoStatus === 'CANCELADO') {
                const mesAno = getMesAnoAtual();
                const metricas = await db.metricas.get(mesAno) || { mesAno, totalFinalizados: 0, totalCancelados: 0, valorFaturado: 0 };
                metricas.totalCancelados += 1;
                await db.metricas.put(metricas);
            }

            await carregarPedidos();
            await carregarMetricasAtuais();

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

            await db.pedidos.update(pedidoUuid, {
                pagamentos: pagamentosPlano,
                valorPago: valorPago,
                status: novoStatus
            });

            if (novoStatus === 'CONCLUIDO') {
                // CORREÇÃO AQUI: Usar 'uuid' em vez de 'pedidoUuid'
                const pedido = pedidos.value.find(p => p.uuid === pedidoUuid);
                // Só atualiza métrica se o status mudou DE fato para CONCLUIDO (para não contar 2x)
                if (pedido && pedido.status !== 'CONCLUIDO') {
                    await atualizarMetricasAposConclusao(valorPedido);
                }
            }

            await carregarPedidos();
            await carregarMetricasAtuais();

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