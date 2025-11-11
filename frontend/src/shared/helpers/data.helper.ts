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
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    
    return `${ano}-${mes}-${dia}`;
}

export function getDataHoraHojeString(): string {
    const data = new Date();
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    const hora = String(data.getHours()).padStart(2, '0');
    const minuto = String(data.getMinutes()).padStart(2, '0');
    const segundo = String(data.getSeconds()).padStart(2, '0');
    
    return `${ano}-${mes}-${dia}T${hora}:${minuto}:${segundo}`;
}

export function getDiasNoMes(ano: number, mes: number): number {
    return new Date(ano, mes + 1, 0).getDate();
}

export function getPrimeiroDiaSemana(ano: number, mes: number): number {
    return new Date(ano, mes, 1).getDay();
}

export function formatarDataParaExibicao(data: string): string {
    const dateObj = new Date(data.replace(/-/g, '/')); 
    if (isNaN(dateObj.getTime())) {
        return '';
    }

    return dateObj.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
}

export function formatarDataHoraParaExibicao(data: string): string {
    const dateObj = new Date(data.replace(/-/g, '/').replace('T', ' '));

    if (isNaN(dateObj.getTime())) {
        return 'Data Inválida';
    }

    const dataFormatada = dateObj.toLocaleDateString('pt-BR');
    const horaFormatada = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return `${dataFormatada} ${horaFormatada}`;
}

