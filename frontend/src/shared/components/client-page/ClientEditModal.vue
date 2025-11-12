<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Cliente } from '@/shared/types/cliente.type';
import { useClienteStore } from '@/shared/stores/cliente.store';

const props = defineProps<{
    cliente: Cliente | null;
}>();

const emit = defineEmits(['close', 'cliente-updated']);

const clienteStore = useClienteStore();

const clienteEditado = ref<Cliente>({
    uuid: '',
    nome: '',
    telefone: '',
});

watch(() => props.cliente, (novoCliente) => {
    if (novoCliente) {
        clienteEditado.value = { ...novoCliente };
    }
}, { immediate: true });

const salvarEdicao = async () => {
    if (!clienteEditado.value.nome || !clienteEditado.value.uuid) {
        alert('O nome do cliente é obrigatório.');
        return;
    }

    try {
        await clienteStore.atualizarCliente(clienteEditado.value.uuid, {
            nome: clienteEditado.value.nome,
            telefone: clienteEditado.value.telefone,
        });
        alert(`Cliente ${clienteEditado.value.nome} atualizado com sucesso!`);
        emit('cliente-updated');
        emit('close');
    } catch (error) {
        console.error('Erro ao salvar edição do cliente:', error);
        alert('Erro ao tentar salvar as alterações do cliente.');
    }
};
</script>

<template>
    <div v-if="cliente" class="fixed inset-0 bg-gray-950 bg-opacity-80 flex justify-center items-center z-50 p-4"
        @click.self="emit('close')">
        
        <div class="bg-gray-950 border border-gray-200 p-8 rounded-2xl shadow-2xl w-full max-w-md relative text-white">
            <button @click="emit('close')" class="absolute top-4 right-4 text-gray-400 hover:text-white transition"><i
                    class="fi fi-rr-cross text-xl"></i></button>
            <h2 class="text-xl mb-6 text-white border-b border-gray-700 pb-2">
                Editar Cliente #{{ cliente.uuid.substring(0, 8) }}
            </h2>

            <form @submit.prevent="salvarEdicao" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-400 mb-1">Nome Completo</label>
                    <input type="text" v-model="clienteEditado.nome" required
                        class="w-full p-3 bg-gray-950 border border-gray-500 rounded-lg text-white">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-400 mb-1">Telefone (Opcional)</label>
                    <input type="text" v-model="clienteEditado.telefone"
                        class="w-full p-3 bg-gray-950 border border-gray-500 rounded-lg text-white">
                </div>
                
                <button type="submit"
                    class="w-full py-3 mt-4 bg-green-700 rounded-lg font-semibold hover:bg-green-600 transition">
                    Salvar
                </button>
            </form>
        </div>
    </div>
</template>