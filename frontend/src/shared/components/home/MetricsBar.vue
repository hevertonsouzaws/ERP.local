<script setup lang="ts">
import { useClienteStore } from '@/shared/stores/cliente.store';
import { usePedidoStore } from '@/shared/stores/pedido.store';

const clienteStore = useClienteStore();
const pedidoStore = usePedidoStore();

clienteStore.carregarClientes();
pedidoStore.carregarMetricasAtuais();
</script>

<template>
    <div class="flex space-x-4 mb-8">
        <div class="flex-1 p-4 bg-gray-800 shadow-xl rounded-xl flex items-center justify-between transition duration-300 hover:shadow-2xl">
            <div>
                <p class="text-sm font-light text-gray-400">Clientes Cadastrados</p>
                <p class="text-3xl font-bold text-white">{{ clienteStore.clientes.length }}</p>
            </div>
            <i class="fi fi-rr-users text-3xl text-blue-400"></i>
        </div>
        <div class="flex-1 p-4 bg-gray-800 shadow-xl rounded-xl flex items-center justify-between hover:shadow-2xl">
            <div>
                <p class="text-sm font-light text-gray-400">Finalizados (Mês)</p>
                <p class="text-3xl font-bold text-white">{{ pedidoStore.metricasAtuais?.totalFinalizados || 0 }}</p>
            </div>
            <i class="fi fi-rr-badge-check text-3xl text-green-400"></i>
        </div>
        <div class="flex-1 p-4 bg-gray-800 shadow-xl rounded-xl flex items-center justify-between hover:shadow-2xl">
            <div>
                <p class="text-sm font-light text-gray-400">Cancelados (Mês)</p>
                <p class="text-3xl font-bold text-white">{{ pedidoStore.metricasAtuais?.totalCancelados || 0 }}</p>
            </div>
            <i class="fi fi-rr-cross-circle text-3xl text-red-400"></i>
        </div>
    </div>
</template>