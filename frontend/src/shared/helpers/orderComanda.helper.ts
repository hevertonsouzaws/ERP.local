import type { Pedido } from '@/shared/types/order.type';
import { formatCurrency } from '@/shared/helpers/currency.helper'; 

function calcularValorTotalPedido(pedido: Pedido): number {
    const subtotal = pedido.itens.reduce((totalPeca, peca) => {
        const subtotalPeca = peca.servicos.reduce((subtotalServico, servico) => {
            return subtotalServico + (servico.quantidade * servico.unitPrice);
        }, 0);
        return totalPeca + subtotalPeca;
    }, 0);

    const percentualDesconto = pedido.descontoPorcentagem || 0;
    const valorDesconto = subtotal * (percentualDesconto / 100);

    return subtotal - valorDesconto;
}


export function generateWhatsAppComanda(pedido: Pedido): string {
    const nomeCliente = pedido.clienteNome;
    const numeroPedido = pedido.uuid.substring(0, 8).toUpperCase();
    
    const dataEntregaFormatada = new Date(pedido.dataEntrega).toLocaleDateString('pt-BR');
    const horarioEntregaFormatado = pedido.horarioEntrega;
    
    const valorTotalLiquido = calcularValorTotalPedido(pedido);
    const subtotalBruto = pedido.itens.reduce((totalPeca, peca) => {
        const subtotalPeca = peca.servicos.reduce((subtotalServico, servico) => {
            return subtotalServico + (servico.quantidade * servico.unitPrice);
        }, 0);
        return totalPeca + subtotalPeca;
    }, 0);

    const descontoValor = subtotalBruto * (pedido.descontoPorcentagem / 100);

    let message = `*🧾 CONFIRMAÇÃO DE PEDIDO - #${numeroPedido}*\n\n`;
    message += `*CLIENTE:* ${nomeCliente}\n`;
    message += `*ENTREGA:* ${dataEntregaFormatada} às ${horarioEntregaFormatado}\n`;
    message += `*STATUS:* ${pedido.status}\n`;
    message += `-----------------------------------------------------\n`;
    
    message += `*ITENS DO PEDIDO (${pedido.itens.length}):*\n`;
    pedido.itens.forEach((item, index) => {
        message += `${index + 1}. ${item.garmentName} (${item.lineNumber})\n`;
        item.servicos.forEach(servico => {
            const totalServico = servico.quantidade * servico.unitPrice;
            message += `\t${servico.name} (${servico.quantidade}x): ${formatCurrency(totalServico)}\n`;
        });
        const totalPeca = item.servicos.reduce((sum, s) => sum + (s.unitPrice * s.quantidade), 0);
        message += `Total Peça: ${formatCurrency(totalPeca)}\n`;
    });
    message += `-----------------------------------------------------\n`;

    message += `SUBTOTAL: ${formatCurrency(subtotalBruto)}\n`;
    if (pedido.descontoPorcentagem > 0) {
        message += `DESCONTO (${pedido.descontoPorcentagem}%): -${formatCurrency(descontoValor)}\n`;
    }
    message += `*TOTAL DO PEDIDO:* *${formatCurrency(valorTotalLiquido)}*\n`;
    message += `TOTAL PAGO: ${formatCurrency(pedido.valorPago)}\n`;
    
    const restante = valorTotalLiquido - pedido.valorPago;
    if (restante > 0) {
        message += `*RESTANTE A PAGAR:* *${formatCurrency(restante)}*\n`;
    } else {
        message += `PAGAMENTO: *QUITADO*\n`;
    }
    
    message += `\n_PRAZO DE RETIRADA 30 DIAS._`;

    return message;
}