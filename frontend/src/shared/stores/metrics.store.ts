import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { db } from "../services/Database/Database";
import type { Metrica, TotalPorFormaPagamento } from "../types/metrica.type";
import { getMesAnoAtual } from "@/shared/helpers/data.helper";
import { usePedidoStore } from "./pedido.store";

export const useMetricasStore = defineStore('metricas', () => {
    const metricasAtuais = ref<Metrica>();

    const pedidoStore = usePedidoStore();

    const metricasGerais = computed(() => metricasAtuais.value);

    async function calcularMetricasGerais() {
        const mesAnoAtual = getMesAnoAtual();
        let receitaTotal = 0;
        let valorPendente = 0;
        let totalFinalizados = 0;
        let totalCancelados = 0;

        const totaisPorForma: TotalPorFormaPagamento = {
            PIX: 0, DEBITO: 0, CREDITO: 0, DINHEIRO: 0, OUTRO: 0
        };

        for (const pedido of pedidoStore.pedidos) {
            const valorTotalLiquido = pedidoStore.calcularValorTotalPedido(pedido);

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
        await pedidoStore.carregarPedidos();
        await calcularMetricasGerais();
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

    return {
        metricasAtuais,
        metricasGerais,
        calcularMetricasGerais,
        carregarMetricasAtuais,
        atualizarMetricasAposConclusao,
    };
});