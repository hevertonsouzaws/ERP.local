import { defineStore } from 'pinia';
import { usePedidoStore } from './pedido.store';
import type { MetricasFinanceiras, TransacaoFinanceira } from '../types/fincanceiro.type';

export const useFinanceiroStore = defineStore('financeiro', {
    state: () => ({
    }),
    getters: {
        transacoesPedidos(state): TransacaoFinanceira[] {
            const pedidoStore = usePedidoStore();
            const transacoes: TransacaoFinanceira[] = [];

            pedidoStore.pedidos.forEach(pedido => {
                pedido.pagamentos.forEach(pagamento => {
                    transacoes.push({
                        id: `${pedido.uuid}-${pagamento.data}`,
                        data: pagamento.data,
                        descricao: `Pagamento do Pedido #${pedido.uuid.substring(0, 8)}`,
                        tipo: 'RECEITA',
                        valor: pagamento.valor,
                        referencia: pedido.uuid,
                        metodoPagamento: pagamento.metodo,
                    });
                });
            });
            return transacoes.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
        },

        metricas(state): MetricasFinanceiras {
            const pedidoStore = usePedidoStore();

            const pedidosConcluidos = pedidoStore.pedidos.filter(p => p.status === 'CONCLUIDO').length;
            const pedidosPendentes = pedidoStore.pedidos.filter(p => p.status === 'PENDENTE').length;

            const valorPagoEmPedidos = this.transacoesPedidos.reduce((acc, t) => acc + t.valor, 0);
            
            // Calculamos o total de todos os pedidos e subtraímos o que foi pago para ter o pendente
            const receitaTotalGeral = pedidoStore.pedidos.reduce((acc, p) => acc + pedidoStore.getValorTotalPedido(p), 0);
            const valorPendenteEmPedidos = receitaTotalGeral - valorPagoEmPedidos;


            return {
                receitaTotal: receitaTotalGeral,
                valorPagoEmPedidos: valorPagoEmPedidos,
                valorPendenteEmPedidos: valorPendenteEmPedidos,
                pedidosConcluidos,
                pedidosPendentes,
            };
        }
    },
    actions: {
       
    }
});