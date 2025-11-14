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

    let message = `*NS COSTURAS PEDIDO\n\n`;
    message += `*CLIENTE:* ${nomeCliente}\n`;
    message += `*ENTREGA:* ${dataEntregaFormatada} ${horarioEntregaFormatado}\n`;
    message += `*STATUS:* ${pedido.status}\n`;

    message += `*PEÇAS (${pedido.itens.length}):*\n`;
    message += '\n'

    pedido.itens.forEach((item, index) => {
        message += `${item.garmentName} (${item.lineNumber})\n`;
        item.servicos.forEach(servico => {
            const totalServico = servico.quantidade * servico.unitPrice;
            message += `- ${servico.name} (${servico.quantidade}x): ${formatCurrency(totalServico)}\n`;
        });
    });

    message += '\n'
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

    message += `\nAtenção  o prazo de retirada é de 30 dias, após a data de conclusão`;
    message += `\nObrigado ${nomeCliente} volte sempre!`;

    return message;
}