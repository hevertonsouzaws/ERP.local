// src/stores/printer.ts

import { defineStore } from 'pinia';

// Tipagem de cada linha da nota fiscal
export type DesignElement = {
    uuid: string; // Identificador único
    type: 'text' | 'image' | 'barcode' | 'qr'; // Tipo de conteúdo
    text: string;
    size: 'sml' | 'md' | 'lg'; // Tamanho da fonte (Small, Medium, Large)
    align: 'left' | 'center' | 'right'; // Alinhamento
    bold: boolean; // Negrito
};

interface PrinterState {
    designElements: DesignElement[];
    activeIndex: number | null; // Índice do elemento ativo para edição
    isPrinting: boolean;
    footerLines: number; // Linhas para alimentação após o corte (finalização)
}

export const usePrinterStore = defineStore('printer', {
    state: (): PrinterState => ({
        designElements: [
            // Elemento de exemplo padrão
            { uuid: crypto.randomUUID(), type: 'text', text: '--- NOTA DE SERVIÇO NS ---', size: 'sml', align: 'center', bold: true },
            { uuid: crypto.randomUUID(), type: 'text', text: 'Cliente: NOME DO CLIENTE', size: 'md', align: 'left', bold: false },
        ],
        activeIndex: 0,
        isPrinting: false,
        footerLines: 8, // Padrão de 8 linhas para feed/corte
    }),
    
    actions: {
        setActive(index: number | null) {
            this.activeIndex = index;
            if (index !== null) {
                this.saveDesign();
            }
        },

        setActiveElement(element: DesignElement) {
            if (this.activeIndex !== null) {
                this.designElements[this.activeIndex] = element;
                this.saveDesign();
            }
        },

        addElement() {
            const newElement: DesignElement = {
                uuid: crypto.randomUUID(),
                type: 'text',
                text: 'Novo Elemento de Texto',
                size: 'sml',
                align: 'left',
                bold: false,
            };
            this.designElements.push(newElement);
            this.activeIndex = this.designElements.length - 1;
            this.saveDesign();
        },

        // Corrigido para lidar com 'null' na chamada do template
        removeElement(index: number | null) { 
            if (index === null) return;
            this.designElements.splice(index, 1);
            this.activeIndex = null;
            this.saveDesign();
        },

        setIsPrinting(status: boolean) {
            this.isPrinting = status;
        },

        // Persistência com Local Storage
        saveDesign() {
            localStorage.setItem('printerDesign', JSON.stringify({
                elements: this.designElements,
                footer: this.footerLines
            }));
        },

        loadDesign() {
            const savedData = localStorage.getItem('printerDesign');
            if (savedData) {
                const data = JSON.parse(savedData);
                this.designElements = data.elements || this.designElements;
                this.footerLines = data.footer || this.footerLines;
            }
        },
    },
    
    getters: {
        activeElement: (state) => {
            return state.activeIndex !== null ? state.designElements[state.activeIndex] : null;
        }
    }
});