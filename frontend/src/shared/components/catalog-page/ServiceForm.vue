<template>
    <div class="flex flex-col space-y-4 text-white">
        <h3 class="text-2xl font-bold border-b pb-2">
            {{ isEditing ? 'Editar Serviço' : 'Novo Serviço' }}
        </h3>

        <form @submit.prevent="handleSubmit" class="flex flex-col space-y-4">
            <label class="flex flex-col">
                <span class="text-sm font-medium mb-1">Nome do Serviço</span>
                <input v-model="formData.name" type="text" required
                    class="bg-transparent p-2 border border-gray-200 rounded-md" />
            </label>

            <label class="flex flex-col">
                <span class="text-sm font-medium mb-1">Preço Padrão (R$)</span>
                <input v-model.number="formData.defaultPrice" type="number" step="0.01" min="0" required
                    class="bg-transparent p-2 border border-gray-200 rounded-md" />
            </label>
            
            <div class="flex justify-end space-x-3 pt-2">
                <button type="button" @click="$emit('close')"
                    class="px-4 py-2  bg-gray-800 rounded-md hover:bg-red-900 transition duration-150 border border-gray-400">
                    Cancelar
                </button>
                <button type="submit"
                    class="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition duration-150">
                    {{ isEditing ? 'Salvar Alterações' : 'Cadastrar Serviço' }}
                </button>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { IService } from '@/shared/types/catalog.type';
import { useServiceStore } from '@/shared/stores/catolog.store';

const props = defineProps<{
    servico: IService | null;
}>();

const emit = defineEmits(['close']);

const serviceStore = useServiceStore();

const defaultServiceState: IService = {
    uuid: '',
    name: '',
    defaultPrice: 0.00,
};

const formData = ref<IService>({ ...defaultServiceState });

const isEditing = computed(() => !!props.servico);

watch(() => props.servico, (newVal) => {
    if (newVal) {
        formData.value = { ...newVal };
    } else {
        formData.value = { ...defaultServiceState };
    }
}, { immediate: true });

function handleSubmit() {
    if (isEditing.value) {
        serviceStore.updateService(formData.value);
    } else {
        const { uuid, ...newService } = formData.value;
        serviceStore.addService(newService);
    }
    emit('close');
}
</script>