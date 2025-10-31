export const formatCurrency = (value: number): string => {
    const numericValue = typeof value === 'number' ? value : 0;

    return numericValue.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
};

export const formatNumber = (value: number): string => {
    const numericValue = typeof value === 'number' ? value : 0;
    
    return numericValue.toLocaleString('pt-BR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
};