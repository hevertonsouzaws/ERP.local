<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    distribuicao: Record<string, number>;
    totalRecebido: number;
}>();

const itensFormatados = computed(() => {
    return Object.entries(props.distribuicao)
        .filter(([, valor]) => valor > 0)
        .sort(([, a], [, b]) => b - a) 
        .map(([metodo, valor]) => {
            const porcentagem = props.totalRecebido > 0 
                ? (valor / props.totalRecebido) * 100 
                : 0;

            return {
                metodo,
                valorFormatado: `R$ ${valor.toFixed(2).replace('.', ',')}`,
                porcentagem: porcentagem.toFixed(1) + '%',
                barraWidth: `${porcentagem}%`
            };
        });
});

const getColorClass = (index: number) => {
    const colors = [
        'bg-blue-500', 
        'bg-green-500', 
        'bg-yellow-500', 
        'bg-purple-500', 
        'bg-red-500',
    ];
    return colors[index % colors.length];
};

</script>

<template>
    <div class="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 h-full">
        <h3 class="text-xl font-bold text-white mb-4 flex items-center">
            <i class="fi fi-rr-chart-pie-alt mr-2 text-blue-400"></i>
            Distribuição por Forma de Pagamento
        </h3>
        
        <div v-if="totalRecebido === 0" class="text-center py-4 text-gray-400">
            Nenhum recebimento registrado para análise.
        </div>

        <div v-else class="space-y-4">
            <div v-for="(item, index) in itensFormatados" :key="item.metodo" class="relative">
                <div class="flex justify-between items-center mb-1 text-sm">
                    <span class="font-medium text-gray-300 capitalize">{{ item.metodo.toLowerCase() }}</span>
                    <span class="font-semibold text-white">{{ item.valorFormatado }} ({{ item.porcentagem }})</span>
                </div>
                
                <div class="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                    <div :style="{ width: item.barraWidth }" 
                         :class="[getColorClass(index), 'h-2 rounded-full transition-all duration-700']">
                    </div>
                </div>
            </div>
             <div class="pt-4 mt-4 border-t border-gray-700">
                <div class="flex justify-between text-lg font-bold text-green-400">
                    <span>Total Recebido:</span>
                    <span>R$ {{ totalRecebido.toFixed(2).replace('.', ',') }}</span>
                </div>
            </div>
        </div>
    </div>
</template>