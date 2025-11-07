<script setup lang="ts">
import { useFinanceiroStore } from '@/shared/stores/finances.stores';
import { usePedidoStore } from '@/shared/stores/pedido.store';
import FinancialMetricCard from '@/shared/components/finance-page/FinancialMetricCard.vue';
import FinancialTransactionTable from '@/shared/components/finance-page/FinancialTransactionTable.vue';
import { computed, onMounted } from 'vue';

const financeiroStore = useFinanceiroStore();
const pedidoStore = usePedidoStore();

const metricas = computed(() => financeiroStore.metricas);
const transacoes = computed(() => financeiroStore.transacoesPedidos);

const despesaTotal = 81.000; 
const lucroTotal = computed(() => metricas.value.valorPagoEmPedidos - despesaTotal);

onMounted(() => {
    pedidoStore.carregarPedidos();
});
</script>

<template>
    <div class="min-h-screen text-white p-8 w-full">
        <h1 class="text-3xl font-bold mb-6 text-white flex items-center">
            <i class="fi fi-rr-stats mr-3 text-green-400"></i>
            Controle Financeiro
        </h1>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <FinancialMetricCard 
                title="Total Recebido (Pedidos)"
                :value="metricas.valorPagoEmPedidos"
                icon="fi fi-rr-credit-card"
                :is-currency="true"
            />
            
            <FinancialMetricCard 
                title="A Receber (Pedidos)"
                :value="metricas.valorPendenteEmPedidos"
                icon="fi fi-rr-money-bill-wave"
                :is-currency="true"
            />

            <FinancialMetricCard 
                title="Pedidos Concluídos/Total"
                :value="metricas.pedidosConcluidos"
                :sub-value="pedidoStore.pedidos.length"
                icon="fi fi-rr-list-check"
            >
                <template #default>
                    <p class="text-3xl font-bold mt-1 text-gray-200">
                        {{ metricas.pedidosConcluidos }} / {{ pedidoStore.pedidos.length }}
                    </p>
                </template>
            </FinancialMetricCard>

            <FinancialMetricCard 
                title="Limite atual"
                :value="lucroTotal"
                icon="fi fi-rr-chart-line"
                :is-currency="true"
            />
        </div>
        
        <FinancialTransactionTable 
            :transacoes="transacoes"
        />

        <div class="mt-8 bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
             <h3 class="text-xl font-medium text-white">Análise de Dados (Gráficos Futuros)</h3>
             <p class="text-gray-400 mt-2">Esta seção pode ser usada para integrar componentes de gráficos (como ApexCharts ou Chart.js) para visualizar receitas por mês, tipo de serviço, etc.</p>
        </div>

     
    </div>
</template>