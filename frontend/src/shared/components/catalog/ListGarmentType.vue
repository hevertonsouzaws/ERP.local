<template>
    <div class="overflow-y-auto rounded-md w-full flex justify-between items-center flex-wrap gap-y-4">
        <div v-for="garment in garmentTypes" :key="garment.uuid"
            class="flex justify-between items-center p-6 rounded-lg bg-gray-900 w-[48%] border border-green-600">
            <span class="text-base font-medium">{{ garment.name }}</span>
            <div class="flex space-x-2">
                <button @click="$emit('edit', garment)"
                    class="bg-gray-900 text-xs text-white hover:text-blue-500 transition border p-2 rounded-lg">Editar</button>
                <button @click="handleDelete(garment.uuid)"
                    class="text-xs text-white hover:text-red-500 transition border p-2 rounded-lg">Excluir</button>
            </div>
        </div>
        <div v-if="garmentTypes && garmentTypes.length === 0" class="p-3 text-center text-gray-500">Nenhum tipo de peça
            cadastrado.</div>
    </div>
</template>

<script setup lang="ts">
import type { IGarmentType } from '@/shared/types/catalog.type';
import { useServiceStore } from '@/shared/stores/catolog.store';

const props = defineProps<{
    garmentTypes: IGarmentType[];
}>();

const emit = defineEmits(['edit']);

const serviceStore = useServiceStore();

// CORRIGIDO: Tornar a função assíncrona para chamar a ação da Store
async function handleDelete(uuid: string) {
    if (confirm('Tem certeza que deseja excluir este tipo de peça?')) {
        try {
            // CORRIGIDO: Usar await para garantir que a exclusão termine
            await serviceStore.deleteGarmentType(uuid);
        } catch (error) {
            console.error('Falha ao deletar o tipo de peça:', error);
            // Poderia adicionar uma notificação de erro ao usuário aqui
        }
    }
}
</script>