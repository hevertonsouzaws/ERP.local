export type FormaPagamento = 'PIX' | 'DEBITO' | 'CREDITO' | 'DINHEIRO' | 'OUTRO';

export interface PagamentoRegistro {
    forma: FormaPagamento;
    valor: number;
    dataRecebimento: string; 
}

export type PedidoStatus = 'PENDENTE' | 'CONCLUIDO' | 'CANCELADO'

export interface PedidoItemServico {
    uuid: string;         
    serviceId: string;    
    name: string;          
    quantidade: number;    
    unitPrice: number;    
}

export interface PedidoItemPeca {
    uuid: string;         
    garmentTypeId: string;
    garmentName: string;   
    lineNumber: number;    
    servicos: PedidoItemServico[]; 
}


export interface Pedido {
    uuid: string;
    clienteUuidd: string;
    clienteNome: string;
    dataEntrega: string;
    horarioEntrega?: string;
    itens: PedidoItemPeca[]; 
    status: PedidoStatus; 
    dataCriacao: string;
    pagamentos: PagamentoRegistro[];
    valorPago: number;
    descontoPorcentagem: number; 
}