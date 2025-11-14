<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { usePedidoStore } from '@/shared/stores/pedido.store';
import PedidoComandaActions from '@/shared/components/PedidoComandaActions.vue'; 
import { formatarDataParaExibicao } from '@/shared/helpers/data.helper';

import type { Pedido } from '@/shared/types/order.type';

const pedidoStore = usePedidoStore();

const pedidoSelecionado = ref<Pedido | null>(null);

onMounted(async () => {
    await pedidoStore.carregarPedidos();

    if (pedidoStore.pedidos.length > 0) {
        selecionarPedido(pedidoStore.pedidos[0]);
    }
});

const selecionarPedido = (pedido: Pedido) => {
    pedidoSelecionado.value = pedido;
};
</script>

<template>
    <div class="p-8 min-h-screen">
        <h1 class="text-3xl font-bold text-white mb-6">Teste de Envio de Comanda</h1>

        <div class="grid grid-cols-12 gap-8 ">
            <div class="col-span-12 lg:col-span-6 space-y-3 h-[70vh] overflow-y-auto border border-gray-500 p-5 rounded-xl">
                <div class="bg-gray-800 sticky  top-0 z-10 rounded-xl">
                    <h2 class="text-xl font-semibold text-white p-2 -m-">
                        Selecione um Pedido ({{ pedidoStore.pedidos.length }})
                    </h2>
                </div>
                <div v-if="pedidoStore.pedidos.length === 0" class="text-gray-400">
                    Nenhum pedido carregado.
                </div>

                <div v-for="pedido in pedidoStore.pedidos" :key="pedido.uuid" @click="selecionarPedido(pedido)" :class="[
                    'p-4 rounded-lg cursor-pointer transition border',
                    pedidoSelecionado?.uuid === pedido.uuid ? 'bg-purple-800 border-purple-600 shadow-xl' : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                ]">
                    <p class="font-seemibold text-lg text-white">#{{ pedido.uuid.substring(0, 8).toUpperCase() }} - {{
                        pedido.clienteNome }}
                    </p>
                    <p
                        :class="['text-sm', pedidoSelecionado?.uuid === pedido.uuid ? 'text-blue-200' : 'text-gray-300']">
                        Entrega: {{ formatarDataParaExibicao(pedido.dataEntrega)}} {{
                            pedido?.horarioEntrega }} | Status: {{ pedido.status }}
                    </p>
                </div>
            </div>

            <div class="col-span-12 lg:col-span-6 sticky top-8">
                <div v-if="pedidoSelecionado">
                    <PedidoComandaActions :pedido="pedidoSelecionado" />
                </div>
                <div v-else class="bg-gray-800 p-6 rounded-lg text-center text-gray-400">
                    Clique em um pedido na lista para liberar as opções de envio.
                </div>
            </div>
        </div>
    </div>
</template>