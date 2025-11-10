import { formatNumber } from "./format.helper";

export function formatCurrency(value: number): string {
    if (typeof value !== 'number' || !isFinite(value)) {
        return 'R$ 0,00';
    }

    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

export function formatNumberAsCurrency(value: number): string {
    const formatted = formatCurrency(value);
    return formatted.replace('R$', '').trim();
}