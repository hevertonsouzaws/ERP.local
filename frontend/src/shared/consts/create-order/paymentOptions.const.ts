import { type FormaPagamento } from '@/shared/types/pedido.type';

export const FORMAS_PAGAMENTO_DISPONIVEIS: FormaPagamento[] = [
    'DINHEIRO',
    'PIX',
    'DEBITO',
    'CREDITO',
    'OUTRO'
];