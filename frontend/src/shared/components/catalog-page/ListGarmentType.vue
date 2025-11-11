<script setup lang="ts">
import type { IGarmentType } from '@/shared/types/catalog.type';
import { useServiceStore } from '@/shared/stores/catolog.store';

const props = defineProps<{
    garmentTypes: IGarmentType[];
}>();

const emit = defineEmits(['edit']);

const serviceStore = useServiceStore();

async function handleDelete(uuid: string) {
    if (confirm('Tem certeza que deseja excluir este tipo de peça?')) {
        try {
            await serviceStore.deleteGarmentType(uuid);
        } catch (error) {
            console.error('Falha ao deletar o tipo de peça:', error);
        }
    }
}
</script>

<template>
    <div class="overflow-y-auto rounded-md w-full flex justify-between items-center flex-wrap gap-y-2">
        <div v-for="garment in garmentTypes" :key="garment.uuid"
            class="flex flex-col md:flex-row justify-between items-center gap-4 p-4 rounded-xl w-full border border-gray-500">
            <span class="text-base truncate">{{ garment.name }}</span>
            <div class="flex space-x-2">
                <button @click="$emit('edit', garment)"
                    class="bg-gray-900 text-xs text-white hover:bg-green-800 transition border py-2 p-4 rounded-lg">Editar</button>
                <button @click="handleDelete(garment.uuid)"
                    class="text-xs text-white hover:bg-red-800 transition border py-2 p-4 rounded-lg">Excluir</button>
            </div>
        </div>
        <div v-if="garmentTypes && garmentTypes.length === 0" class="p-3 text-center text-gray-500">Nenhum tipo de peça
            cadastrado.</div>
    </div>
</template>

