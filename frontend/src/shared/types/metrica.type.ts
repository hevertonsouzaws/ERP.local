import { type FormaPagamento } from './pedido.type';

export type TotalPorFormaPagamento = {
    [key in FormaPagamento]: number;
};

export interface Metrica {
    mesAno: string;
    totalFinalizados: number;
    totalCancelados: number;
    valorFaturado: number;
    valorPendente: number;
    receitaTotal: number;
    receitaPorForma: TotalPorFormaPagamento;
}