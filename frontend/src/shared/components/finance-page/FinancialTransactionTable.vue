<script setup lang="ts">
import type { TransacaoFinanceira } from '@/shared/types/fincanceiro.type';
import { formatarDataParaExibicao } from '@/shared/helpers/data.helper';

const props = defineProps<{
    transacoes: TransacaoFinanceira[];
}>();
</script>

<template>
    <div class="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-700">
        <h3 class="text-xl font-bold text-white mb-4">Últimas Transações</h3>
        
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-700">
                <thead>
                    <tr>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Data</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Descrição</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Valor</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Método</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tipo</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-700">
                    <tr v-for="t in transacoes" :key="t.id" class="hover:bg-gray-700 transition">
                        <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-300">
                            {{ formatarDataParaExibicao(t.data) }}
                        </td>
                        <td class="px-4 py-2 text-sm font-medium text-white">{{ t.descricao }}</td>
                        <td class="px-4 py-2 whitespace-nowrap text-sm font-semibold" 
                            :class="t.tipo === 'RECEITA' ? 'text-gray-200' : 'text-gray-200'">
                            {{ t.tipo === 'RECEITA' ? '+' : '-' }} R$ {{ t.valor.toFixed(2).replace('.', ',') }}
                        </td>
                        <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{{ t.metodoPagamento }}</td>
                        <td class="px-4 py-2 whitespace-nowrap">
                             <span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', 
                                t.tipo === 'RECEITA' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">
                                {{ t.tipo }}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <p v-if="transacoes.length === 0" class="text-center text-gray-500 py-4">Nenhuma transação encontrada.</p>
    </div>
</template>