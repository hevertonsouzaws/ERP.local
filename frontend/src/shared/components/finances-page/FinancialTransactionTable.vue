<script setup lang="ts">
import type { TransacaoFinanceira } from '@/shared/types/fincance.type';
import { formatarDataHoraParaExibicao } from '@/shared/helpers/data.helper';
import { ref, computed } from 'vue';

const props = defineProps<{
    transacoes: TransacaoFinanceira[];
}>();

const dataInicial = ref('');
const dataFinal = ref('');

const transacoesFiltradas = computed(() => {
    const start = dataInicial.value ? new Date(dataInicial.value) : null;
    const end = dataFinal.value ? new Date(dataFinal.value) : null;

    if (!start && !end) {
        return props.transacoes;
    }

    return props.transacoes.filter(t => {
        const transacaoDate = new Date(t.data);
        
        if (end) {
            end.setHours(23, 59, 59, 999);
        }

        const isAfterStart = !start || transacaoDate >= start;
        const isBeforeEnd = !end || transacaoDate <= end;

        return isAfterStart && isBeforeEnd;
    });
});
</script>

<template>
    <div class="p-6 rounded-xl shadow-lg border border-gray-500">
        <h3 class="text-xl font-bold text-white mb-4">Últimas Transações</h3>
        
        <div class="flex space-x-4 mb-6 p-3 rounded-xl border border-gray-500">
            <div class="flex-1">
                <label for="data-inicial" class="block text-xs font-medium text-gray-300 mb-1">Data Inicial:</label>
                <input type="date" id="data-inicial" v-model="dataInicial"
                    class="w-full p-2 bg-gray-900 border border-gray-500 rounded-md text-sm text-white focus:ring-blue-500 focus:border-blue-500">
            </div>
            <div class="flex-1">
                <label for="data-final" class="block text-xs font-medium text-gray-300 mb-1">Data Final:</label>
                <input type="date" id="data-final" v-model="dataFinal"
                    class="w-full p-2 cursor-pointer bg-gray-900 border border-gray-500 rounded-md text-sm text-white focus:ring-blue-500 focus:border-blue-500">
            </div>
        </div>
        
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-700">
                <thead>
                    <tr>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Data</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Cliente</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Valor</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Método</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tipo</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-700">
                    <tr v-for="t in transacoesFiltradas" :key="t.id" class="hover:bg-gray-700 transition">
                        <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-300">
                            {{ formatarDataHoraParaExibicao(t.data) }}
                        </td>
                        <td class="px-4 py-2 text-sm font-medium text-white">{{ t.descricao }}</td>
                        <td class="px-4 py-2 whitespace-nowrap text-sm font-semibold" 
                            :class="t.tipo === 'RECEITA' ? 'text-green-400' : 'text-red-400'">
                            {{ t.tipo === 'RECEITA' ? '+' : '-' }} R$ {{ t.valor.toFixed(2).replace('.', ',') }}
                        </td>
                        <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{{ t.metodoPagamento }}</td>
                        <td class="px-4 py-2 whitespace-nowrap">
                             <span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', 
                                t.tipo === 'RECEITA' ? 'bg-green-700/30 text-green-400' : 'bg-red-700/30 text-red-400']">
                                {{ t.tipo }}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <p v-if="transacoesFiltradas.length === 0" class="text-center text-gray-500 py-4">Nenhuma transação encontrada no período.</p>
    </div>
</template>