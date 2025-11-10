<template>
    <div class="overflow-y-auto rounded-md w-full flex justify-between items-center flex-wrap gap-y-2">
        <div v-for="service in services" :key="service.uuid"
            class="flex flex-col md:flex-row justify-between items-center gap-4 p-4 rounded-xl w-full border border-gray-500">

            <p class="text-base max-w-full truncate">{{ service.name }} (R$ {{
                service.defaultPrice.toFixed(2) }})</p>

            <div class="flex space-x-2">
                <button @click="$emit('edit', service)"
                    class="bg-gray-900 text-xs text-white hover:bg-blue-800 transition border py-2 p-4 rounded-lg">Editar</button>
                <button @click="handleDelete(service.uuid)"
                    class="text-xs text-white hover:bg-red-800 transition border py-2 p-4 rounded-lg">Excluir</button>
            </div>
        </div>
        <div v-if="services && services.length === 0" class="p-3 text-center text-gray-500">Nenhum serviço cadastrado.
        </div>
    </div>
</template>

<script setup lang="ts">
import type { IService } from '@/shared/types/catalog.type';
import { useServiceStore } from '@/shared/stores/catolog.store';
import { showToast } from '@/shared/helpers/toastState';

const props = defineProps<{
    services: IService[];
}>();

const emit = defineEmits(['edit']);

const serviceStore = useServiceStore();

async function handleDelete(uuid: string) {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
        try {
            await serviceStore.deleteService(uuid);
        } catch (error) {
            showToast('Falha ao deletar serviço:', 'error');
        }
    }
}
</script>