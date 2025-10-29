<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { usePedidoStore } from '@/shared/stores/pedido.store';
import { formatarDataParaExibicao } from '@/shared/helpers/data.helper';
import type { Pedido, PedidoStatus } from '@/shared/types/pedido.type';

const store = usePedidoStore();
const filtroStatus = ref<PedidoStatus | 'TODOS'>('TODOS');

onMounted(() => {
    // Já carregamos na Home, mas garantimos aqui
    if (!store.carregando) {
        store.carregarPedidos();
    }
});

const pedidosFiltrados = computed(() => {
    if (filtroStatus.value === 'TODOS') {
        // Ordena por data de entrega mais próxima
        return store.pedidos.slice().sort((a, b) => a.dataEntrega.localeCompare(b.dataEntrega));
    }
    return store.pedidos
        .filter(p => p.status === filtroStatus.value)
        .sort((a, b) => a.dataEntrega.localeCompare(b.dataEntrega));
});

const getStatusClass = (status: PedidoStatus) => {
    switch (status) {
        case 'PENDENTE': return 'border-2 border-yellow-400 text-white';
        case 'CONCLUIDO': return 'border-2 border-green-400 text-white';
        case 'CANCELADO': return 'border-2 border-red-600 text-white';
    }
}

const mudarStatus = async (pedido: Pedido, novoStatus: PedidoStatus) => {
    if (pedido.status === novoStatus) return;

    if (confirm(`Deseja realmente mudar o status do pedido ${pedido.id} para ${novoStatus}?`)) {
        await store.atualizarStatusPedido(pedido.id as number, novoStatus, pedido.valor);
        alert(`Status do Pedido ${pedido.id} alterado para ${novoStatus}!`);
    }
}
</script>

<template>
    <div class="min-h-screen text-white py-2 p-6">
        <div class="mb-6 flex justify-between items-center p-4 bg-gray-800 rounded-xl shadow-xl">
            <p class="text-xl font-semibold">Total de Pedidos: {{ store.pedidos.length }}</p>
            
            <div class="flex items-center space-x-3">
                <label class="text-gray-400">Filtrar por Status:</label>
                <select v-model="filtroStatus" class="p-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    <option value="TODOS">Todos ({{ store.pedidos.length }})</option>
                    <option value="PENDENTE">Pendentes</option>
                    <option value="CONCLUIDO">Concluídos</option>
                    <option value="CANCELADO">Cancelados</option>
                </select>
            </div>
        </div>

        <div class="bg-gray-800 p-6 rounded-xl shadow-2xl">
            <p v-if="!store.carregando" class="text-gray-500 flex items-center">
                <i class="fi fi-rr-spinner animate-spin mr-2"></i> Carregando pedidos...
            </p>
            <p v-else-if="pedidosFiltrados.length === 0" class="text-gray-500 text-center py-10">
                Nenhum pedido encontrado com o filtro atual.
            </p>

            <div v-else class="flex flex-row flex-wrap gap-5">
                <div 
                    v-for="pedido in pedidosFiltrados" 
                    :key="pedido.id" 
                    class="p-5 bg-gray-700 rounded-lg shadow-md transition duration-150 min-w-[32%] max-w-[32%] min-h-[270px] max-h-[270px]"
                >
                    <div class="flex justify-between items-start border-b border-gray-600 pb-3 mb-3">
                        <div class="flex items-center">
                            <i class="fi fi-rr-user text-blue-400 mr-2"></i>
                            <p class="font-semibold text-base text-white">{{ pedido.clienteNome }}</p>
                        </div>
                        <span :class="['text-xs font-semibold py-0.5 px-2 rounded-full uppercase', getStatusClass(pedido.status)]">
                            {{ pedido.status }}
                        </span>
                    </div>

                    <div class="flex justify-between items-center mb-5">
                        <div>
                            <p class="font-semibold text-base">{{ formatarDataParaExibicao(pedido.dataEntrega) }} <span v-if="pedido.horarioEntrega">({{ pedido.horarioEntrega }})</span></p>
                        </div>
                        <div class="text-right">
                            <p class="font-bold text-base text-white">R$ {{ pedido.valor.toFixed(2) }}</p>
                        </div>
                    </div>
                    
                    <div class="min-h-[90px] max-h-[90px] border-t border-b border-gray-400 rounded-lg p-1">
                        <p class="text-gray-200 mb-4 text-sm">{{ pedido.descricao }}</p>
                    </div>

                    <div class="pt-4 flex justify-end gap-2">
                        <button 
                            @click="mudarStatus(pedido, 'PENDENTE')" 
                            :disabled="pedido.status === 'PENDENTE'"
                            class="py-1 px-3 rounded-lg text-sm transition duration-150"
                            :class="[pedido.status === 'PENDENTE' ? 'bg-gray-600 text-gray-200 cursor-not-allowed' : 'border-2 border-yellow-600 hover:bg-yellow-600 text-white']"
                        >
                            <i class="fi fi-rr-clock mr-1"></i> Pendente
                        </button>
                        <button 
                            @click="mudarStatus(pedido, 'CONCLUIDO')" 
                            :disabled="pedido.status === 'CONCLUIDO'"
                            class="py-1 px-3 rounded-lg text-sm transition duration-150"
                            :class="[pedido.status === 'CONCLUIDO' ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'border-2 border-green-600 hover:bg-green-800 text-white']"
                        >
                            <i class="fi fi-rr-check-circle mr-1"></i> Concluir
                        </button>
                        <button 
                            @click="mudarStatus(pedido, 'CANCELADO')" 
                            :disabled="pedido.status === 'CANCELADO'"
                            class="py-1 px-3 rounded-lg text-sm transition duration-150"
                            :class="[pedido.status === 'CANCELADO' ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'border-2 border-red-600 hover:bg-red-600 text-white']"
                        >
                            <i class="fi fi-rr-cross-circle mr-1"></i> Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>