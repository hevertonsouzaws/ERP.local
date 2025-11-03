<script setup lang="ts">
import type { Cliente } from '@/shared/types/cliente.type';

const props = defineProps<{
    cliente: Cliente;
}>();

const emit = defineEmits(['edit']);
</script>

<template>
    <div class="bg-gray-700 p-4 rounded-lg shadow-md flex justify-between items-center transition duration-150 hover:bg-gray-600">
        <div class="flex items-center space-x-4">
            <i class="fi fi-rr-user text-2xl text-purple-400"></i>
            <div>
                <p class="text-white font-semibold">{{ cliente.nome }}</p>
                <p v-if="cliente.telefone" class="text-gray-400 text-sm">
                    <i class="fi fi-rr-phone-call text-xs mr-1 text-green-400"></i>
                    {{ cliente.telefone }}
                </p>
                <p v-else class="text-gray-500 text-xs italic">Sem telefone</p>
            </div>
        </div>
        
        <button 
            @click="emit('edit', cliente)"
            class="py-1 px-3 bg-purple-700 rounded-lg text-sm text-white font-medium hover:bg-purple-800 transition flex items-center"
        >
            <i class="fi fi-rr-edit text-sm mr-1"></i> Editar
        </button>
    </div>
</template>