<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePedidoStore } from '@/shared/stores/pedido.store';
import { exportFinanceReportToPDF } from '@/shared/helpers/pdf-exporter.helper';

const pedidoStore = usePedidoStore();

const isModalOpen = ref(false);
const mesFiltro = ref<string>('');

const pedidos = computed(() => pedidoStore.pedidos);

const abrirModal = () => {
    isModalOpen.value = true;
};

const fecharModal = () => {
    isModalOpen.value = false;
};

const gerarRelatorio = () => {
    if (pedidos.value.length === 0) {
        alert("Não há pedidos para gerar o relatório.");
        return;
    }
    
    exportFinanceReportToPDF({
        pedidos: pedidos.value,
        mesFiltro: mesFiltro.value 
    });
    
    fecharModal();
};

const mesSelecionadoTexto = computed(() => {
    if (!mesFiltro.value) return 'Geral (Todos os meses)';
    const [ano, mes] = mesFiltro.value.split('-');
    return new Date(parseInt(ano), parseInt(mes) - 1, 1).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' });
});

</script>

<template>
    <div>
        <button
            @click="abrirModal"
            class="px-4 py-2 border border-gray-500 hover:bg-gray-800 text-white font-semibold rounded-lg shadow-md flex items-center space-x-2"
        >
            <i class="fi fi-rr-file-pdf"></i>
            <span>Exportar Relatório Financeiro</span>
        </button>

        <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70" @click.self="fecharModal">
            <div class="bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-md">
                <div class="flex justify-between items-center border-b pb-3 border-gray-700 mb-4">
                    <h3 class="text-xl font-bold text-white">Filtro para Exportação PDF</h3>
                    <button @click="fecharModal" class="text-gray-400 hover:text-white">
                        <i class="fi fi-rr-cross-small text-2xl"></i>
                    </button>
                </div>

                <div class="mb-6">
                    <label for="mes-filtro" class="block text-gray-300 mb-2">Selecione o Mês de Referência:</label>
                    <input 
                        type="month" 
                        id="mes-filtro" 
                        v-model="mesFiltro" 
                        class="bg-gray-700 border border-gray-600 text-white text-base rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
                    />
                    <p class="text-sm mt-2 text-gray-400">
                        Relatório atual: **{{ mesSelecionadoTexto }}**
                    </p>
                </div>

                <div class="flex justify-end space-x-3">
                    <button @click="fecharModal" class="px-4 py-2 text-gray-300 hover:text-white border border-gray-700 hover:border-gray-200 rounded-lg transition duration-150">
                        Cancelar
                    </button>
                    <button
                        @click="gerarRelatorio"
                        class="px-4 py-2 border border-gray-200 hover:bg-gray-700 text-white font-semibold rounded-lg transition duration-150"
                    >
                        Gerar PDF
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
input[type="month"]::-webkit-calendar-picker-indicator {
    filter: invert(1); 
}
</style>