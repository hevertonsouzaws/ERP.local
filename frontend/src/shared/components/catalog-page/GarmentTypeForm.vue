<template>
    <div class="flex flex-col space-y-4">
        <h3 class="text-2xl font-bold text-white border-b pb-2">
            {{ isEditing ? 'Editar Tipo de Peça' : 'Novo Tipo de Peça' }}
        </h3>

        <form @submit.prevent="handleSubmit" class="flex flex-col space-y-4">
            <label class="flex flex-col">
                <span class="text-sm font-medium mb-1">Nome da Peça (Ex: Calça)</span>
                <input 
                    v-model="formData.name" 
                    type="text" 
                    required 
                    class="bg-transparent p-2 border border-gray-200 rounded-md"
                />
            </label>

            <label class="flex flex-col">
                <span class="text-sm font-medium mb-1">Categoria (Ex: Inferior, Superior)</span>
            </label>

            <div class="flex justify-end space-x-3 pt-2">
                <button 
                    type="button" 
                    @click="$emit('close')" 
                    class="px-4 py-2  bg-gray-800 rounded-md hover:bg-red-900 transition duration-150 border border-gray-400"
                >
                    Cancelar
                </button>
                <button 
                    type="submit" 
                    class="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 transition duration-150"
                >
                    {{ isEditing ? 'Salvar Alterações' : 'Cadastrar Peça' }}
                </button>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { IGarmentType } from '@/shared/types/catalog.type';
import { useServiceStore } from '@/shared/stores/catolog.store';

const props = defineProps<{
    peca: IGarmentType | null;
}>();

const emit = defineEmits(['close']);

const serviceStore = useServiceStore();

const defaultGarmentState: IGarmentType = {
    uuid: '',
    name: '',
};

const formData = ref<IGarmentType>({ ...defaultGarmentState });

const isEditing = computed(() => !!props.peca);

watch(() => props.peca, (newVal) => {
    if (newVal) {
        formData.value = { ...newVal };
    } else {
        formData.value = { ...defaultGarmentState };
    }
}, { immediate: true });

function handleSubmit() {
    if (isEditing.value) {
        serviceStore.updateGarmentType(formData.value);
    } else {
        const { uuid, ...newGarment } = formData.value;
        serviceStore.addGarmentType(newGarment);
    }
    emit('close');
}
</script>