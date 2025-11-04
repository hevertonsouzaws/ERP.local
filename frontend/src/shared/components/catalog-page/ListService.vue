<template>
    <div class="overflow-y-auto rounded-md w-full flex justify-between items-center flex-wrap gap-y-4">
        <div v-for="service in services" :key="service.uuid" class="flex justify-between items-center p-6 rounded-lg bg-gray-900 w-[48%] border border-blue-600">
            <span class="text-base font-medium">{{ service.name }} (R$ {{ service.defaultPrice.toFixed(2) }})</span>
            <div class="flex space-x-2">
                <button @click="$emit('edit', service)" class="bg-gray-900 text-xs text-white hover:text-blue-500 transition border p-2 rounded-lg">Editar</button>
                <button @click="handleDelete(service.uuid)" class="text-xs text-white hover:text-red-500 transition border p-2 rounded-lg">Excluir</button>
            </div>
        </div>
        <div v-if="services && services.length === 0" class="p-3 text-center text-gray-500">Nenhum serviço cadastrado.</div>
    </div>
</template>

<script setup lang="ts">
import type { IService } from '@/shared/types/catalog.type';
import { useServiceStore } from '@/shared/stores/catolog.store'; 

const props = defineProps<{
    services: IService[]; 
}>();

const emit = defineEmits(['edit']);

// Instancia a Store
const serviceStore = useServiceStore();

async function handleDelete(uuid: string) {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
        try {
            await serviceStore.deleteService(uuid);
        } catch (error) {
            console.error('Falha ao deletar serviço:', error);
            alert('Não foi possível excluir o serviço.');
        }
    }
}
</script>