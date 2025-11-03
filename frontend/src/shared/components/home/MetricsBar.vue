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
            class="w-full py-3 p-4 bg-gray-800 shadow-xl rounded-xl 
                    flex justify-between items-center transition duration-300 hover:scale-[1.02] hover:shadow-2xl border-b-4 border-blue-600  mt2">
            <div>
                <p class="text-sm font-medium text-gray-400">Clientes</p>
                <p class="text-2xl font-semibold text-gray-200">{{ clienteStore.clientes.length }}</p>
            </div>

            <i class="fi fi-rr-users text-2xl text-white bg-blue-800/70 py-3 p-4 rounded-full"></i>
        </div>

        <div
            class="py-3 p-4 w-full bg-gray-800 shadow-xl rounded-xl 
                    flex justify-between items-center transition duration-300 hover:scale-[1.02] hover:shadow-2xl border-b-4 border-green-600 mt2">
            <div>
                <p class="text-sm font-medium text-gray-400">Receita</p>
                <p class="text-xl font-semibold text-gray-200">
                    {{ formatCurrency(pedidoStore.metricasAtuais?.receitaTotal || 0) }}
                </p>
            </div>

            <i class="fi fi-rr-wallet text-2xl text-white bg-green-900/70 py-3 p-4 rounded-full"></i>
        </div>

        <div
            class="py-3 p-4 w-full bg-gray-800 shadow-xl rounded-xl 
                    flex justify-between items-center transition duration-300 hover:scale-[1.02] hover:shadow-2xl border-b-4 border-yellow-600  mt2">
            <div>
                <p class="text-sm font-medium text-gray-400">Pendente</p>
                <p class="text-xl font-semibold text-gray-200">
                    {{ formatCurrency(pedidoStore.metricasAtuais?.valorPendente || 0) }}
                </p>
            </div>
            <i class="fi fi-rr-hand-holding-usd text-3xl text-white bg-yellow-500/40 py-2.5 p-3.5 rounded-full"></i>
        </div>

        <div
            class="py-3 p-4 w-full bg-gray-800 shadow-xl rounded-xl 
                    flex justify-between items-center transition duration-300 hover:scale-[1.02] hover:shadow-2xl border-b-4 border-purple-600 mt2">
            <div>
                <p class="text-sm font-medium text-gray-400">Finalizados</p>
                <p class="text-2xl font-semibold text-gray-200">
                    {{ pedidoStore.metricasAtuais?.totalFinalizados || 0 }}
                </p>
            </div>
            <div>
                <i class="fi fi-rr-calendar-check text-3xl text-white bg-purple-500/20 py-2 p-4 rounded-full"></i>
            </div>
        </div>
    </div>
</template>