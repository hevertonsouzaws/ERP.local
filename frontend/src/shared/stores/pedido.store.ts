import { defineStore } from "pinia";
import { ref, toRaw, computed } from "vue";
import { db } from "../services/Database/Database";
import type { Pedido, PedidoStatus } from "../types/pedido.type";
import type { Metrica } from "../types/metrica.type";
import { getMesAnoAtual, getDataHojeString } from "@/shared/helpers/data.helper";

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

    async function adicionarPedido(novoPedido: Pedido): Promise<number | undefined> {
        try {
            const pedidoPlano = toRaw(novoPedido);
            const id = await db.pedidos.add(pedidoPlano);
            
            await carregarPedidos(); 

            return id;
        } catch (error) {
            console.error('Erro ao adicionar pedido ao Dexie:', error);
        }
    }

    async function atualizarStatusPedido(pedidoId: number, novoStatus: PedidoStatus, valorPedido: number) {
        try {
            await db.pedidos.update(pedidoId, { status: novoStatus });

            const mesAno = getMesAnoAtual();
            const metricas = await db.metricas.get(mesAno) || {
                mesAno,
                totalFinalizados: 0,
                totalCancelados: 0,
                valorFaturado: 0,
            };

            if (novoStatus === 'CONCLUIDO') {
                metricas.totalFinalizados += 1;
                metricas.valorFaturado += valorPedido;
            } else if (novoStatus === 'CANCELADO') {
                metricas.totalCancelados += 1;
            }

            await db.metricas.put(metricas);

            await carregarPedidos();
            await carregarMetricasAtuais();

        } catch (error) {
            console.error('Erro ao atualizar status ou métricas:', error);
        }
    }

    function filtrarPedidosPorData(data: string) {
        dataSelecionada.value = data;
    }

    return {
        pedidos,
        carregando,
        metricasAtuais,
        dataSelecionada, // Exporta a data selecionada
        pedidosFiltrados, // Exporta os pedidos filtrados
        carregarPedidos,
        carregarMetricasAtuais,
        adicionarPedido,
        atualizarStatusPedido,
        filtrarPedidosPorData, // Novo método de filtro
    };
});