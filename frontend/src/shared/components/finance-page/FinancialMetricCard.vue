<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    title: string;
    value: number;
    icon: string; 
    colorClass: string; 
    isCurrency?: boolean;
}>();

const formattedValue = computed(() => {
    if (props.isCurrency) {
        return `R$ ${props.value.toFixed(2).replace('.', ',')}`;
    }
    return props.value.toString();
});
</script>

<template>
    <div class="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-blue-500 transition duration-300">
        <div class="flex justify-between items-start">
            <div class="text-white">
                <p class="text-sm font-medium text-gray-400 uppercase tracking-wider">{{ title }}</p>
                <h3 class="text-3xl font-bold mt-1" :class="colorClass">{{ formattedValue }}</h3>
            </div>
            <i :class="[icon, 'text-3xl', colorClass]"></i>
        </div>
    </div>
</template>