import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatNumberAsCurrency } from './currency.helper';
import { type Pedido, type PagamentoRegistro, type FormaPagamento } from '@/shared/types/order.type'; 

interface ExportData {
    pedidos: Pedido[];
    mesFiltro: string; 
}

// Estilos Padronizados para as Tabelas (Formato RGB)
const tableStyles = {
    headerColor: [44, 62, 80],       // Azul Marinho Escuro
    borderColor: [200, 200, 200],    // Cinza Claro
    alternateRowColor: [247, 247, 247], // Cinza Suave
    totalRowColor: [220, 220, 220],    // Cinza Médio
    textColor: [0, 0, 0],            // Preto
    headerTextColor: [255, 255, 255], // Branco
    totalValueColor: [0, 0, 0],      // Preto (Valor Total)
};

const consolidarDados = (pedidos: Pedido[], mesFiltro: string | null) => {
    const distribuicao: Record<FormaPagamento, number> = {
        'PIX': 0, 'DEBITO': 0, 'CREDITO': 0, 'DINHEIRO': 0, 'OUTRO': 0,
    } as Record<FormaPagamento, number>;
    
    const transacoesDetalhe: { pedido: Pedido, pagamento: PagamentoRegistro }[] = [];
    let totalPago = 0;

    const [anoFiltro, mesFiltroStr] = mesFiltro ? mesFiltro.split('-') : [null, null];

    pedidos.forEach(pedido => {
        pedido.pagamentos.forEach(pagamento => {
            const dataPagamento = new Date(pagamento.timestamp);

            let deveIncluir = true;
            if (mesFiltro) {
                const dataAno = dataPagamento.getFullYear().toString();
                const dataMes = (dataPagamento.getMonth() + 1).toString().padStart(2, '0');
                
                if (dataAno !== anoFiltro || dataMes !== mesFiltroStr) {
                    deveIncluir = false;
                }
            }
            
            if (deveIncluir) {
                totalPago += pagamento.valor;
                if (distribuicao[pagamento.forma as FormaPagamento] !== undefined) {
                     distribuicao[pagamento.forma as FormaPagamento] += pagamento.valor;
                }
                
                transacoesDetalhe.push({ pedido, pagamento });
            }
        });
    });

    return { distribuicao, totalPago, transacoesDetalhe };
};

export const exportFinanceReportToPDF = ({ pedidos, mesFiltro }: ExportData) => {
    const { distribuicao, totalPago, transacoesDetalhe } = consolidarDados(pedidos, mesFiltro);
    
    const doc = new jsPDF();
    const titulo = "Relatório de Recebimentos por Pedido";

    let mesFormatado;
    if (mesFiltro) {
        const [ano, mes] = mesFiltro.split('-').map(Number);
        const data = new Date(ano, mes - 1, 1); 
        mesFormatado = data.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' });
    } else {
        mesFormatado = "Geral";
    }

    const subTitulo = `Período de Referência: ${mesFormatado}`;
    const dataGeracao = new Date().toLocaleDateString('pt-BR');
    
    let y = 10;

    // --- 1. Cabeçalho e Metadados
    doc.setFontSize(18);
    doc.setTextColor(tableStyles.textColor[0], tableStyles.textColor[1], tableStyles.textColor[2]); // PRETO
    doc.text(titulo, 14, y);
    y += 8;
    
    doc.setFontSize(12);
    doc.setTextColor(tableStyles.textColor[0], tableStyles.textColor[1], tableStyles.textColor[2]); // PRETO
    doc.text(subTitulo, 14, y);
    y += 7;
    
    doc.setFontSize(10);
    doc.setTextColor(tableStyles.textColor[0], tableStyles.textColor[1], tableStyles.textColor[2]); // PRETO
    doc.text(`Gerado em: ${dataGeracao}`, 14, y);
    y += 10;
    
    // --- 2. Exibição do Total do Período (Destaque)
    doc.setFillColor(230, 230, 230); 
    doc.rect(14, y, 182, 12, 'F'); 
    
    doc.setFontSize(12);
    doc.setTextColor(tableStyles.textColor[0], tableStyles.textColor[1], tableStyles.textColor[2]); // PRETO
    doc.setFont('helvetica', 'normal');
    doc.text("TOTAL RECEBIDO NO PERÍODO:", 16, y + 8);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(tableStyles.totalValueColor[0], tableStyles.totalValueColor[1], tableStyles.totalValueColor[2]); // PRETO
    doc.text(formatNumberAsCurrency(totalPago), 196, y + 8, { align: 'right' });
    
    y += 18;
    
    // --- 3. Resumo da Distribuição de Pagamentos (Tabela de Resumo)
    doc.setFontSize(14);
    doc.setTextColor(tableStyles.textColor[0], tableStyles.textColor[1], tableStyles.textColor[2]); // PRETO
    doc.setFont('helvetica', 'normal');
    doc.text("Resumo de Recebimentos por Forma", 14, y);
    y += 7;

    const distribuicaoData: string[][] = [];
    const distribuicaoOrdenada = Object.entries(distribuicao)
        .filter(([, valor]) => valor > 0)
        .sort(([, a], [, b]) => (b as number) - (a as number));
        
    for (const [tipo, valor] of distribuicaoOrdenada) {
        const percentual = totalPago > 0 ? ((valor / totalPago) * 100).toFixed(1) + '%' : '0.0%';
        distribuicaoData.push([tipo, formatNumberAsCurrency(valor as number), percentual]);
    }
    
    distribuicaoData.push(['**TOTAL GERAL RECEBIDO**', formatNumberAsCurrency(totalPago), '100.0%']);

    (doc as any).autoTable({
        startY: y,
        head: [['Forma de Pagamento', 'Valor Recebido', 'Percentual']],
        body: distribuicaoData,
        styles: { 
            fontSize: 10, 
            cellPadding: 3,
            lineColor: tableStyles.borderColor, 
            lineWidth: 0.1,
            textColor: tableStyles.textColor
        },
        headStyles: { 
            fillColor: tableStyles.headerColor, 
            textColor: tableStyles.headerTextColor, 
            fontStyle: 'bold'
        }, 
        columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
        didParseCell: (data: any) => {
             if (data.row.raw[0].includes('TOTAL GERAL')) {
                data.cell.styles.fontStyle = 'bold';
            }
        },
        didDrawCell: (data: any) => {
            if (data.row.raw[0].includes('TOTAL GERAL')) {
                doc.setFillColor(tableStyles.totalRowColor[0], tableStyles.totalRowColor[1], tableStyles.totalRowColor[2]); 
                doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
            }
        },
        margin: { top: 5 }
    });
    
    y = (doc as any).lastAutoTable.finalY + 10;
    
    // --- 4. Detalhe das Transações
    doc.setFontSize(14);
    doc.setTextColor(tableStyles.textColor[0], tableStyles.textColor[1], tableStyles.textColor[2]); // PRETO
    doc.text(`Detalhe dos Recebimentos (${transacoesDetalhe.length} registros)`, 14, y);
    y += 7;
    
    const transacoesHeader = [['ID Pedido', 'Cliente', 'Data/Hora Pag.', 'Forma Pag.', 'Valor']];
    const transacoesBody = transacoesDetalhe.map(({ pedido, pagamento }) => [
        pedido.uuid.substring(0, 8), 
        pedido.clienteNome,
        new Date(pagamento.timestamp).toLocaleDateString('pt-BR') + ' ' + 
        new Date(pagamento.timestamp).toLocaleTimeString('pt-BR').substring(0, 5),
        pagamento.forma,
        formatNumberAsCurrency(pagamento.valor)
    ]);
    
    (doc as any).autoTable({
        startY: y,
        head: transacoesHeader,
        body: transacoesBody,
        styles: { 
            fontSize: 8, 
            cellPadding: 2,
            lineColor: tableStyles.borderColor,
            lineWidth: 0.1,
            textColor: tableStyles.textColor
        },
        headStyles: { 
            fillColor: tableStyles.headerColor, 
            textColor: tableStyles.headerTextColor,
            fontStyle: 'bold'
        },
        alternateRowStyles: { fillColor: tableStyles.alternateRowColor },
        columnStyles: { 4: { halign: 'right' } },
        margin: { bottom: 15 }
    });

    // --- 5. Rodapé
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Página ${i} de ${totalPages}`, doc.internal.pageSize.width - 14, doc.internal.pageSize.height - 10, { align: 'right' });
    }

    doc.save(`Relatorio_Financeiro_${mesFiltro || 'Geral'}.pdf`);
};