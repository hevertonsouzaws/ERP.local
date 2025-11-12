<script setup lang="ts">
import { useFinanceiroStore } from '@/shared/stores/finances.stores';
import { usePedidoStore } from '@/shared/stores/pedido.store';
import FinancialMetricCard from '@/shared/components/finances-page/FinancialMetricCard.vue';
import FinancialTransactionTable from '@/shared/components/finances-page/FinancialTransactionTable.vue';
import PaymentDistributionCard from '@/shared/components/finances-page/Payments.vue';
import FinancialReportPDFExporter from '@/shared/components/finances-page/FinancialReportModal.vue';
import { computed } from 'vue';
import { formatNumberAsCurrency } from '@/shared/helpers/currency.helper';

const pedidoStore = usePedidoStore();
pedidoStore.carregarPedidos();

const financeiroStore = useFinanceiroStore();
const metricas = computed(() => financeiroStore.metricas);
const transacoes = computed(() => financeiroStore.transacoesPedidos);
const distribuicaoPagamentos = computed(() => financeiroStore.distribuicaoPagamentos);
const LIMITE_ALVO = 81000;
const resultadoLimite = computed(() => LIMITE_ALVO - metricas.value.valorPagoEmPedidos);
const limiteAlvoFormatado = computed(() => {
    return formatNumberAsCurrency(LIMITE_ALVO)
});

</script>

<template>
    <div class="min-h-screen text-white py-2 p-8 w-full">
        <div class="flex justify-between">
            <h1 class="text-3xl font-bold mb-6 text-white flex items-center">
                <i class="fi fi-rr-stats mr-3 text-white"></i>
                Controle Financeiro
            </h1>

            <FinancialReportPDFExporter :pedidos="pedidoStore.pedidos" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

            <FinancialMetricCard title="Total Recebido" :value="metricas.valorPagoEmPedidos" icon="fi fi-rr-credit-card"
                color-class="text-green-400" :is-currency="true" />

            <FinancialMetricCard title="Pendentes" :value="metricas.valorPendenteEmPedidos"
                icon="fi fi-rr-money-bill-wave" color-class="text-yellow-400" :is-currency="true" />

            <FinancialMetricCard title="Concluídos" :value="metricas.pedidosConcluidos"
                icon="fi fi-rr-list-check" color-class="text-blue-400">
                <template #default>
                    <p class="text-3xl font-bold mt-1 text-blue-400">
                        {{ metricas.pedidosConcluidos }} / {{ pedidoStore.pedidos.length }}
                    </p>
                </template>
            </FinancialMetricCard>

            <FinancialMetricCard :title="`Limite (R$ ${limiteAlvoFormatado})`" :value="resultadoLimite"
                icon="fi fi-rr-chart-line" :color-class="resultadoLimite >= 0 ? 'text-green-500' : 'text-red-500'"
                :is-currency="true" />
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

            <div class="lg:col-span-1">
                <PaymentDistributionCard :distribuicao="distribuicaoPagamentos"
                    :total-recebido="metricas.valorPagoEmPedidos" />
            </div>

            <div class="lg:col-span-2">
                <FinancialTransactionTable :transacoes="transacoes" />
            </div>
            
        </div>

    </div>

</template>