export type FormaPagamento = 'PIX' | 'DEBITO' | 'CREDITO' | 'DINHEIRO' | 'OUTRO';

export interface PagamentoRegistro {
    forma: FormaPagamento;
    valor: number;
    timestamp: number; // registro de quanod o pagemnto foi feito 
}

export type PedidoStatus = 'PENDENTE' | 'CONCLUIDO' | 'CANCELADO'

export interface Pedido {
    uuid: string;
    clienteUuidd: string;
    clienteNome: string;
    dataEntrega: string;
    horarioEntrega?: string;
    descricao: string;
    valor: number;
    status: PedidoStatus;
    dataCriacao: string;
    pagamentos: PagamentoRegistro[];
    valorPago: number;
}
