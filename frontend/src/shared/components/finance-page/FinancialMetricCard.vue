<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    title: string;
    value: number;
    icon: string; 
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
    <div class="p-6 rounded-xl shadow-lg border border-gray-500 hover:border-white transition duration-300">
        <div class="flex justify-between items-start">
            <div class="text-white">
                <p class="text-sm  text-gray-200 uppercase tracking-wider">{{ title }}</p>
                <h3 class="text-3xl mt-1">{{ formattedValue }}</h3>
            </div>
            <i :class="[icon, 'text-3xl']"></i>
        </div>
    </div>
</template>