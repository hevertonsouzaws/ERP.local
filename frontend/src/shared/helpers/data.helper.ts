export function formatarTelefone(telefone: string): string {
    const limpo = telefone.replace(/\D/g, '');
    const match = limpo.match(/^(\d{2})(\d{5})(\d{4})$/);
    if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return telefone;
}

export function toCaps(texto: string): string {
    return texto.toUpperCase();
}

export function getMesAnoAtual(): string {
    const data = new Date();
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    return `${ano}-${mes}`;
}

export function getDataHojeString(): string {
    const data = new Date();
    return data.toISOString().split('T')[0];
}

export function getDiasNoMes(ano: number, mes: number): number {
    return new Date(ano, mes + 1, 0).getDate();
}

export function getPrimeiroDiaSemana(ano: number, mes: number): number {
    return new Date(ano, mes, 1).getDay();
}

export function formatarDataParaExibicao(data: string): string {
    const [ano, mes, dia] = data.split('-').map(Number);
    const date = new Date(ano, mes - 1, dia);
    return date.toLocaleDateString('pt-BR', { weekday: 'short', month: 'short', day: 'numeric' });
}