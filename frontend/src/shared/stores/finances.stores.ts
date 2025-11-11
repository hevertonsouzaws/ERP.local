import { defineStore } from 'pinia';
import { computed } from 'vue';
import { usePedidoStore } from './pedido.store';
import type { MetricasFinanceiras, TransacaoFinanceira } from '../types/fincance.type';

export const useFinanceiroStore = defineStore('financeiro', () => {
    const pedidoStore = usePedidoStore();

    const transacoesPedidos = computed<TransacaoFinanceira[]>(() => {
        const transacoes: TransacaoFinanceira[] = [];

        pedidoStore.pedidos.forEach(pedido => {
            pedido.pagamentos.forEach(pagamento => {
                transacoes.push({
                    id: `${pedido.uuid}-${pagamento.dataRecebimento}`,
                    data: pagamento.dataRecebimento,
                    descricao: pedido.clienteNome,
                    tipo: 'RECEITA',
                    valor: pagamento.valor,
                    referencia: pedido.uuid,
                    metodoPagamento: pagamento.forma,
                });
            });
        });
        return transacoes.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    });

    const distribuicaoPagamentos = computed<Record<string, number>>(() => {
        return transacoesPedidos.value.reduce((acc, transacao) => {
            if (transacao.tipo === 'RECEITA') {
                const metodo = transacao.metodoPagamento.toUpperCase() || 'OUTRO';
                acc[metodo] = (acc[metodo] || 0) + transacao.valor;
            }
            return acc;
        }, {} as Record<string, number>);
    });

    const metricas = computed<MetricasFinanceiras>(() => {
        const pedidosConcluidos = pedidoStore.pedidos.filter(p => p.status === 'CONCLUIDO').length;
        const pedidosPendentes = pedidoStore.pedidos.filter(p => p.status === 'PENDENTE').length;
        const valorPagoEmPedidos = transacoesPedidos.value.reduce((acc, t) => acc + t.valor, 0);
        const receitaTotalGeral = pedidoStore.pedidos.reduce((acc, p) => acc + pedidoStore.calcularValorTotalPedido(p), 0);
        const valorPendenteEmPedidos = Math.max(0, receitaTotalGeral - valorPagoEmPedidos);

        return {
            receitaTotal: receitaTotalGeral,
            valorPagoEmPedidos: valorPagoEmPedidos,
            valorPendenteEmPedidos: valorPendenteEmPedidos,
            pedidosConcluidos,
            pedidosPendentes,
        };
    });

    return {
        transacoesPedidos,
        distribuicaoPagamentos,
        metricas,
    };
});