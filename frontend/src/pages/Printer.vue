<template>
    <div class="printer-designer-container">
        <div class="controls-panel bg-gray-800 text-white">
            <h2>Editor de Design da Nota</h2>
            
            <button @click="store.addElement()" :disabled="store.isPrinting">
                Adicionar Nova Linha
            </button>
            <button v-if="store.activeIndex !== null" 
                    @click="store.removeElement(store.activeIndex)" 
                    class="btn-delete"
                    :disabled="store.isPrinting">
                Remover Linha Selecionada
            </button>

            <hr>
            
            <div v-if="store.activeElement">
                <h3>Editar Linha ({{ store.activeIndex }})</h3>
                <label>
                    Texto:
                    <input type="text" class=" bg-gray-800 border rounded-lg" v-model="store.activeElement.text" @input="store.saveDesign">
                </label>
                
                <label class=" bg-gray-800">
                    Alinhamento:
                    <select v-model="store.activeElement.align" @change="store.saveDesign" class=" bg-gray-800 border rounded-lg">
                        <option value="left">Esquerda</option>
                        <option value="center">Centro</option>
                        <option value="right">Direita</option>
                    </select>
                </label>

                <label>
                    Tamanho da Fonte:
                    <select v-model="store.activeElement.size" @change="store.saveDesign" class=" bg-gray-800 border rounded-lg">
                        <option value="sml">Pequena</option>
                        <option value="md">Média (Largura Dupla)</option>
                        <option value="lg">Grande (Altura e Largura Dupla)</option>
                    </select>
                </label>

                <label class="checkbox-label">
                    <input type="checkbox" v-model="store.activeElement.bold" @change="store.saveDesign">
                    Negrito
                </label>
            </div>
            <div v-else>
                <p>Selecione uma linha na pré-visualização para editar.</p>
            </div>
        </div>

        <div class="preview-panel">
            <h2>Pré-Visualização e Ação</h2>
            
            <div class="receipt-preview">
                <p v-for="(line, index) in preview" 
                   :key="line + index"
                   :class="{ 'active-line': index === store.activeIndex }"
                   @click="store.setActive(index)">
                    {{ line }}
                </p>
                <div class="cut-line">** --- CORTE DE PAPEL --- **</div>
            </div>

            <button @click="sendToPrinter" :disabled="store.isPrinting">
                {{ store.isPrinting ? 'Enviando...' : 'IMPRIMIR (Enviar para NSPRINTER)' }}
            </button>
            
            <p v-if="store.isPrinting" class="status-message">Aguardando resposta do servidor local...</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { usePrinterStore } from '@/shared/stores/printer';
import { generateEscPos, generatePreview } from '@/shared/helpers/escposGenerator.helper';

const store = usePrinterStore();

onMounted(() => {
    store.loadDesign();
});

const preview = computed<string[]>(() => {
    return generatePreview(store.designElements);
});


const sendToPrinter = async () => {
    if (store.isPrinting) return;

    store.setIsPrinting(true);

    const escposData = generateEscPos(store.designElements, store.footerLines);

    try {
        const response = await fetch('http://localhost:8080/print', {
            method: 'POST',
            
            headers: {
                'Content-Type': 'text/plain; charset=iso-8859-1', 
            },
            
            body: escposData,
            
            mode: 'cors'
        });

        if (response.ok) {
            alert("Impressão de teste enviada com sucesso ao NSPRINTER!");
        } else {
            const errorText = await response.text();
            alert(`Erro de comunicação (Status ${response.status}). Possível problema no NSPRINTER ou no Driver da Impressora: ${errorText}`);
        }
    } catch (error) {
        alert("ERRO: O NSPRINTER (Ponte C#) não está ativo em http://localhost:8080. Por favor, execute o Nsprinter.exe no Notebook da loja.");
    } finally {
        store.setIsPrinting(false);
        store.saveDesign();
    }
};
</script>


<style scoped>
/* Estilos básicos para o Designer */
.printer-designer-container {
    display: flex;
    gap: 30px;
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

.controls-panel, .preview-panel {
    flex: 1;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
}

/* Painel de Controle */
.controls-panel label {
    display: block;
    margin-bottom: 10px;
    font-weight: bold;
}
.controls-panel input[type="text"], .controls-panel select {
    width: 100%;
    padding: 8px;
    margin-top: 5px;
    box-sizing: border-box;
}
.checkbox-label {
    margin-top: 15px;
    display: flex;
    align-items: center;
}
.checkbox-label input {
    width: auto;
    margin-right: 10px;
}
.btn-delete {
    background-color: #f44336;
    color: white;
}

/* Pré-visualização do Cupom */
.receipt-preview {
    background-color: #413f3f;
    border: 1px dashed #333;
    padding: 10px;
    margin-bottom: 20px;
    font-family: monospace; 
    white-space: pre; 
    cursor: pointer;
    max-height: 500px;
    overflow-y: auto;
}
.receipt-preview p {
    margin: 0;
    line-height: 1.2;
    padding: 2px 0;
}

.cut-line {
    text-align: center;
    color: #999;
    border-top: 1px solid #999;
    margin-top: 10px;
    padding-top: 5px;
}

.preview-panel button {
    width: 100%;
    padding: 15px;
    background-color: #4CAF50;
    color: white;
    font-size: 1.2em;
    cursor: pointer;
    border: none;
    border-radius: 4px;
}
.preview-panel button:disabled {
    background-color: #aaa;
}
.status-message {
    margin-top: 10px;
    color: #007bff;
    text-align: center;
}
</style>