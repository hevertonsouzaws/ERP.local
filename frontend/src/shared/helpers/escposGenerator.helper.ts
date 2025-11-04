import type { DesignElement } from '@/shared/stores/printer';

const ESC = '\x1B';
const GS = '\x1D';

const INIT = ESC + '@'; 
const CUT = GS + 'V' + '\x00'; 

function setStyle(size: DesignElement['size'], bold: boolean): string {
    let command = '';

    // Negrito (Bold)
    command += ESC + (bold ? 'E\x01' : 'E\x00');
    
    // Tamanho da fonte (ESC ! n) - Múltiplos de 16
    switch (size) {
        case 'sml': // Fonte normal (Altura e Largura 1x)
            command += ESC + '!' + '\x00';
            break;
        case 'md': // Largura 2x (ESC ! \x10)
            command += ESC + '!' + '\x10'; 
            break;
        case 'lg': // Altura 2x e Largura 2x (ESC ! \x31)
            command += ESC + '!' + '\x31'; 
            break;
    }
    return command;
}

function setAlign(align: DesignElement['align']): string {
    let command = ESC + 'a'; 
    switch (align) {
        case 'left':
            command += '\x00';
            break;
        case 'center':
            command += '\x01';
            break;
        case 'right':
            command += '\x02';
            break;
    }
    return command;
}

//  GERAÇÃO DE COMANDOS PARA IMPRESSORA 

export function generateEscPos(elements: DesignElement[], footerLines: number): string {
    let escposOutput = INIT; // Comando de inicialização

    elements.forEach(element => {
        // 1. Aplica o alinhamento e estilo
        escposOutput += setAlign(element.align);
        escposOutput += setStyle(element.size, element.bold);
        
        // 2. Adiciona o texto e quebra de linha
        escposOutput += element.text + '\n';
    });

    // 3. Adiciona o feed (alimentação) final antes do corte
    escposOutput += ESC + 'd' + String.fromCharCode(footerLines);
    
    // 4. Comando de corte
    escposOutput += CUT;

    return escposOutput;
}

// --- GERAÇÃO DE PREVIEW PARA TELA ---

const PREVIEW_WIDTH = 48; // Largura simulada da impressão na tela (caracteres)

/**
 * Cria a pré-visualização formatada (para a tela)
 */
export function generatePreview(elements: DesignElement[]): string[] {
    const previewLines: string[] = [];

    elements.forEach(element => {
        let text = element.text;
        
        // Simulação básica de negrito (com asteriscos)
        if (element.bold) {
            text = `*${text}*`;
        }

        // Simulação de alinhamento
        const padding = PREVIEW_WIDTH - text.length;

        if (padding > 0) {
            switch (element.align) {
                case 'center':
                    // Arredonda para garantir que a diferença não cause erro
                    const leftPad = Math.floor(padding / 2);
                    const rightPad = padding - leftPad;
                    text = ' '.repeat(leftPad) + text + ' '.repeat(rightPad);
                    break;
                case 'right':
                    text = ' '.repeat(padding) + text;
                    break;
                case 'left':
                default:
                    text = text + ' '.repeat(padding);
                    break;
            }
        }
        
        // Trunca para a largura da tela (48 colunas)
        if (text.length > PREVIEW_WIDTH) {
            text = text.substring(0, PREVIEW_WIDTH);
        }

        previewLines.push(text.trimEnd());
    });

    return previewLines;
}