export type PedidoStatus = 'PENDENTE' | 'CONCLUIDO' | 'CANCELADO'

export interface Pedido {
    id?: number;
    clienteId: number;
    clienteNome: string;
    dataEntrega: string;
    horarioEntrega?: string;
    descricao: string;
    valor: number;
    status: PedidoStatus;
    dataCriacao: string;
}
