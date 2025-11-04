<script setup lang="ts">
import { usePedidoStore } from '@/shared/stores/pedido.store';
import { formatarDataParaExibicao } from '@/shared/helpers/data.helper';
import type { PedidoStatus } from '@/shared/types/pedido.type';

const pedidoStore = usePedidoStore();

const getStatusClass = (status: PedidoStatus) => {
    switch (status) {
        case 'PENDENTE': return 'bg-yellow-500';
        case 'CONCLUIDO': return 'bg-green-500';
        case 'CANCELADO': return 'bg-red-500';
        default: return 'bg-gray-500';
    }
}
</script>

<template>
    <div class="w-full h-full bg-gray-800 p-6 rounded-xl shadow-xl text-white overflow-y-auto">
        <h3 class="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">
            Pedidos para: {{ formatarDataParaExibicao(pedidoStore.dataSelecionada) }}
        </h3>

        <p v-if="pedidoStore.pedidosFiltrados.length === 0" class="text-gray-500 text-center mt-8">
            <i class="fi fi-rr-calendar-minus text-4xl mb-2"></i>
            <br>
            Nenhum pedido para este dia.
        </p>

        <div v-else>
            <router-link to="/pedidos" class="space-y-2">
                <div v-for="pedido in pedidoStore.pedidosFiltrados" :key="pedido.uuid"
                    class="p-4 bg-gray-900 rounded-lg shadow-md transition duration-150 hover:bg-gray-600 h-[100px]">
                    <div class="flex justify-between items-start mb-2">
                        <p class="font-bold text-base text-gray-200">{{ pedido.clienteNome }}</p>
                        <span
                            :class="['text-xs font-semibold py-1 px-3 rounded-full uppercase', getStatusClass(pedido.status)]">
                            {{ pedido.status }}
                        </span>
                    </div>
                    <div class="flex gap-2">
                        <p class="text-sm text-gray-200"><span class="font-medium">Emissão:</span> {{
                            formatarDataParaExibicao(pedido.dataCriacao) }}
                        </p>
                        <p class="text-sm text-white"><span class="font-medium">Entrega:</span> {{
                            formatarDataParaExibicao(pedido.dataEntrega) }}
                        </p>
                    </div>
                </div>
            </router-link>
        </div>
    </div>
</template>