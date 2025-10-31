<script setup lang="ts">
import { ref } from 'vue';
import { useClienteStore } from '@/shared/stores/cliente.store';
import type { Cliente } from '@/shared/types/cliente.type';

const emit = defineEmits(['close', 'cliente-added']);

const clienteStore = useClienteStore();

const novoCliente = ref<Omit<Cliente, 'uuid'>>({
    nome: '',
    telefone: '',
});

const salvarNovoCliente = async () => {
    if (!novoCliente.value.nome) {
        alert('O nome do cliente é obrigatório.');
        return;
    }

    try {
        const uuid = await clienteStore.adicionarCliente(novoCliente.value);
        
        alert(`Cliente ${novoCliente.value.nome} cadastrado com sucesso! UUID: ${uuid}`);
        
        novoCliente.value.nome = '';
        novoCliente.value.telefone = '';

        emit('cliente-added');
        emit('close');
    } catch (error) {
        alert('Erro ao tentar salvar o novo cliente.');
    }
};
</script>

<template>
    <div class="fixed inset-0 bg-gray-900 bg-opacity-80 flex justify-center items-center z-50 p-4"
        @click.self="emit('close')">
        
        <div class="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md relative text-white">
            <button @click="emit('close')" class="absolute top-4 right-4 text-gray-400 hover:text-white transition"><i
                    class="fi fi-rr-cross text-xl"></i></button>
            <h2 class="text-2xl font-bold mb-6 text-green-400 border-b border-gray-700 pb-2">
                Adicionar Novo Cliente
            </h2>

            <form @submit.prevent="salvarNovoCliente" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-400 mb-1">Nome Completo</label>
                    <input type="text" v-model="novoCliente.nome" required
                        class="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-green-500">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-400 mb-1">Telefone (Opcional)</label>
                    <input type="text" v-model="novoCliente.telefone"
                        class="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-green-500">
                </div>
                
                <button type="submit"
                    class="w-full py-3 mt-4 bg-green-600 rounded-lg font-semibold hover:bg-green-500 transition flex items-center justify-center">
                    <i class="fi fi-rr-check mr-2"></i> Cadastrar Cliente
                </button>
            </form>
        </div>
    </div>
</template>