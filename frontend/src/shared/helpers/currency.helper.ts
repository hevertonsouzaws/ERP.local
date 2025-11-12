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

export function processCurrencyInput(inputValue: string): { numericValue: number; formattedValue: string } {
    let value = inputValue;

    value = value.replace(/\D/g, ''); 

    if (value.length === 0) {
        return { numericValue: 0, formattedValue: '' }; 
    }

    let numericValue = parseInt(value, 10) / 100;

    const formattedValue = formatNumberAsCurrency(numericValue);

    return {
        numericValue,
        formattedValue,
    };
}