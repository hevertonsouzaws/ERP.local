<script setup lang="ts">
import { useClienteStore } from '@/shared/stores/cliente.store';
import { usePedidoStore } from '@/shared/stores/pedido.store';
import { formatCurrency } from '@/shared/helpers/format.helper';

const clienteStore = useClienteStore();
const pedidoStore = usePedidoStore();

clienteStore.carregarClientes();
pedidoStore.carregarMetricasAtuais();
</script>

<template>
    <div class="flex flex-col justify-between items-center mb-4 w-full gap-5 lg:flex-row">
        <div
            class="w-full py-3 p-4 border border-gray-400 shadow-xl rounded-xl 
                    flex justify-between items-center transition duration-300 mt2 hover:scale-[1.02]">
            <div>
                <p class="text-sm font-medium">Clientes</p>
                <p class="text-xl font-semibold text-gray-200">{{ clienteStore.clientes.length }}</p>
            </div>

            <i class="fi fi-rr-users text-2xl text-white bg-blue-800/70 py-3 p-4 rounded-full"></i>
        </div>

        <div
            class="py-3 p-4 w-full border border-gray-400 shadow-xl rounded-xl 
                    flex justify-between items-center transition duration-300 mt2 hover:scale-[1.02]">
            <div>
                <p class="text-sm font-medium">Receita</p>
                <p class="text-xl font-semibold text-red-200">
                    {{ formatCurrency(pedidoStore.metricasAtuais?.receitaTotal || 0) }}
                </p>
            </div>

            <i class="fi fi-rr-wallet text-2xl text-white bg-green-900/70 py-3 p-4 rounded-full"></i>
        </div>

        <div
            class="py-3 p-4 w-full border border-gray-400 shadow-xl rounded-xl 
                    flex justify-between items-center transition duration-300 mt2 hover:scale-[1.02]">
            <div>
                <p class="text-sm font-medium">Pendente</p>
                <p class="text-xl font-semibold">
                    {{ formatCurrency(pedidoStore.metricasAtuais?.valorPendente || 0) }}
                </p>
            </div>
            <i class="fi fi-rr-hand-holding-usd text-3xl text-white bg-yellow-500/40 py-2.5 p-3.5 rounded-full"></i>
        </div>
        
        <div
            class="py-3 p-4 w-full border border-gray-400 shadow-xl rounded-xl 
                    flex justify-between items-center transition duration-300 mt2 hover:scale-[1.02]">
            <div>
                <p class="text-sm font-medium">Finalizados</p>
                <p class="text-xl font-semibold">
                     {{ pedidoStore.metricasAtuais?.totalFinalizados || 0 }}
                </p>
            </div>
            <i class="fi-rr-calendar-check text-3xl text-white bg-purple-800 py-2.5 p-3.5 rounded-full"></i>
        </div>
    </div>
</template>