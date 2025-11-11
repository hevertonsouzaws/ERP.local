import type { FormaPagamento } from "./order.type";

export interface MetricasFinanceiras {
    receitaTotal: number;
    valorPagoEmPedidos: number;
    valorPendenteEmPedidos: number;
    pedidosConcluidos: number;
    pedidosPendentes: number;
}

export interface TransacaoFinanceira {
    id: string;
    data: string; 
    descricao: string;
    tipo: 'RECEITA' | 'DESPESA';
    valor: number;
    referencia: string; 
    metodoPagamento: FormaPagamento;
}