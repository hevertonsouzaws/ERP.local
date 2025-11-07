<script setup lang="ts">
import type { useDiscountLogic } from '@/shared/helpers/create-order/discountLogic';

const props = defineProps<{
    discountLogica: ReturnType<typeof useDiscountLogic>;
}>();
</script>

<template>
    <div class="bg-gray-700 p-4 rounded-xl shadow-lg space-y-3">
        <h3 class="text-lg font-semibold text-white flex items-center">
            <i class="fi fi-rr-tags text-yellow-400 mr-2"></i> Desconto Aplicado
        </h3>
        
        <div class="flex items-center space-x-3">
            <input
                type="number"
                v-model.number="props.discountLogica.descontoPorcentagem.value"
                min="0"
                max="100"
                step="1"
                placeholder="0"
                class="w-full p-2 bg-gray-600 border border-gray-600 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500"
            >
            <span class="text-xl font-bold text-gray-300">%</span>
        </div>

        <p class="text-sm text-gray-400 mt-2">
            Desconto aplicado ao valor total do pedido.
        </p>
    </div>
</template>