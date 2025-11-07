<script setup lang="ts">
import { useFinanceiroStore } from '@/shared/stores/finances.stores';
import { usePedidoStore } from '@/shared/stores/pedido.store';
import FinancialMetricCard from '@/shared/components/finance-page/FinancialMetricCard.vue';
import FinancialTransactionTable from '@/shared/components/finance-page/FinancialTransactionTable.vue';
import PaymentDistributionCard from '@/shared/components/finance-page/Payments.vue'; 
import { computed, onMounted } from 'vue';

const financeiroStore = useFinanceiroStore();
const pedidoStore = usePedidoStore();

const metricas = computed(() => financeiroStore.metricas);
const transacoes = computed(() => financeiroStore.transacoesPedidos);
const distribuicaoPagamentos = computed(() => financeiroStore.distribuicaoPagamentos); 


const LIMITE_ALVO = 81.000; 

const resultadoLimite = computed(() => metricas.value.valorPagoEmPedidos - LIMITE_ALVO);

onMounted(() => {
    pedidoStore.carregarPedidos();
});
</script>

<template>
    <div class="min-h-screen text-white py-2 p-8 w-full bg-gray-900">
        <h1 class="text-3xl font-bold mb-6 text-white flex items-center">
            <i class="fi fi-rr-stats mr-3 text-green-400"></i>
            Controle Financeiro
        </h1>

        <!-- Cards de Métricas -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            
            <FinancialMetricCard 
                title="Total Recebido (Pedidos)"
                :value="metricas.valorPagoEmPedidos"
                icon="fi fi-rr-credit-card"
                color-class="text-green-400"
                :is-currency="true"
            />
            
            <FinancialMetricCard 
                title="A Receber (Pedidos)"
                :value="metricas.valorPendenteEmPedidos"
                icon="fi fi-rr-money-bill-wave"
                color-class="text-yellow-400"
                :is-currency="true"
            />

            <FinancialMetricCard 
                title="Pedidos Concluídos/Total"
                :value="metricas.pedidosConcluidos"
                icon="fi fi-rr-list-check"
                color-class="text-blue-400"
            >
                <template #default>
                    <p class="text-3xl font-bold mt-1 text-blue-400">
                        {{ metricas.pedidosConcluidos }} / {{ pedidoStore.pedidos.length }}
                    </p>
                </template>
            </FinancialMetricCard>

            <FinancialMetricCard 
                :title="`Resultado vs Limite (R$ ${LIMITE_ALVO.toLocaleString('pt-BR')})`"
                :value="resultadoLimite"
                icon="fi fi-rr-chart-line"
                :color-class="resultadoLimite >= 0 ? 'text-green-500' : 'text-red-500'"
                :is-currency="true"
            />
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            <div class="lg:col-span-1">
                 <PaymentDistributionCard 
                    :distribuicao="distribuicaoPagamentos"
                    :total-recebido="metricas.valorPagoEmPedidos"
                />
            </div>

            <div class="lg:col-span-2">
                 <FinancialTransactionTable 
                    :transacoes="transacoes"
                />
            </div>
        </div>

        <div class="mt-8 bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
            <h3 class="text-xl font-medium text-white">Análise de Dados (Gráficos Futuros)</h3>
            <p class="text-gray-400 mt-2">Esta seção pode ser usada para integrar componentes de gráficos (como ApexCharts ou Chart.js) para visualizar receitas por mês, tipo de serviço, etc.</p>
        </div>
    </div>
</template>