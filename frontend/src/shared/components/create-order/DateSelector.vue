<script setup lang="ts">
import { type DateLogic } from '@/shared/helpers/create-order/dateLogic';

defineProps<{
    dateLogica: DateLogic;
}>();
</script>

<template>
   <div class="space-y-3 p-4 border border-gray-400 rounded-lg">
         <h3 class="font-bold mb-4 flex items-center text-lg">
            <i class="fi fi-rr-calendar mr-2 mt-1"></i> Entrega
             </h3>
         <div>
            <label class="block text-sm font-medium text-gray-200">Data e Horário de Entrega</label>
            <div class="flex space-x-2 mt-1">
               <input type="date"  v-model="dateLogica.dataEntrega.value" 
                   class="flex-1 p-2 bg-gray-800 border border-gray-600 rounded text-sm cursor-pointer">
               <input type="time"  v-model="dateLogica.horarioEntrega.value" 
                   class="w-1/3 p-2 bg-gray-800 border border-gray-600 rounded text-sm cursor-pointer">
                </div>
             </div>
       </div>
</template>