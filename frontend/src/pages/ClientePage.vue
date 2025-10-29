<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useClienteStore } from '@/shared/stores/cliente.store';
import type { Cliente } from '@/shared/types/cliente.type';

const store = useClienteStore();
const clienteEmEdicao = ref<Cliente | null>(null);

onMounted(() => {
    store.carregarClientes();
});

const iniciarEdicao = (cliente: Cliente) => {
    // Cria uma cópia para não alterar o estado da Store diretamente antes de salvar
    clienteEmEdicao.value = { ...cliente };
};

const salvarEdicao = async () => {
    if (clienteEmEdicao.value && clienteEmEdicao.value.id) {
        // Você precisará de uma função 'atualizarCliente' na store
        // Por enquanto, apenas fechar o modal
        alert(`Implementar: Atualizar cliente ID ${clienteEmEdicao.value.id}`);
        clienteEmEdicao.value = null;
    }
};

const excluirCliente = async (clienteId: number | undefined) => {
    if (!clienteId) return;

    if (confirm(`Tem certeza que deseja excluir o cliente ID ${clienteId}?`)) {
        // Você precisará de uma função 'excluirCliente' na store
        alert(`Implementar: Excluir cliente ID ${clienteId}`);
        await store.carregarClientes();
    }
};
</script>

<template>
    <div class="min-h-screen bg-gray-900 text-white p-8">
        <h1 class="text-3xl font-extrabold text-blue-400 mb-8 flex items-center">
            <i class="fi fi-rr-users text-4xl mr-3"></i>
            Clientes Cadastrados ({{ store.clientes.length }})
        </h1>

        <div class="bg-gray-800 p-6 rounded-xl shadow-2xl">
            <p v-if="!store.carregando" class="text-gray-500 flex items-center">
                <i class="fi fi-rr-spinner animate-spin mr-2"></i> Carregando dados locais...
            </p>
            <p v-else-if="store.clientes.length === 0" class="text-gray-500 text-center py-10">
                Nenhum cliente cadastrado localmente.
            </p>

            <div v-else class="flex flex-col space-y-4">
                <div 
                    v-for="cliente in store.clientes" 
                    :key="cliente.id" 
                    class="flex justify-between items-center p-4 bg-gray-700 rounded-lg shadow-md hover:bg-gray-600 transition duration-150"
                >
                    <div class="flex-1 min-w-0">
                        <p class="font-bold text-xl text-white truncate">{{ cliente.nome }}</p>
                        <p class="text-sm text-gray-400">ID: {{ cliente.id }} | Tel: {{ cliente.telefone || 'N/A' }}</p>
                    </div>

                    <div class="flex space-x-3 ml-4">
                        <button 
                            @click="iniciarEdicao(cliente)" 
                            class="text-blue-400 hover:text-blue-300 p-2 rounded-full hover:bg-gray-500 transition"
                            title="Editar Cliente"
                        >
                            <i class="fi fi-rr-pencil text-lg"></i>
                        </button>
                        <button 
                            @click="excluirCliente(cliente.id)" 
                            class="text-red-400 hover:text-red-300 p-2 rounded-full hover:bg-gray-500 transition"
                            title="Excluir Cliente"
                        >
                            <i class="fi fi-rr-trash text-lg"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <div v-if="clienteEmEdicao" class="fixed inset-0 bg-gray-900 bg-opacity-80 flex justify-center items-center z-50 p-4" @click.self="clienteEmEdicao = null">
            <div class="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md">
                <h3 class="text-2xl font-bold mb-4 border-b border-gray-700 pb-2">Editar Cliente</h3>
                
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-400">Nome</label>
                    <input type="text" v-model="clienteEmEdicao.nome" class="w-full p-3 bg-gray-700 border border-gray-600 rounded mt-1">
                </div>
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-400">Telefone</label>
                    <input type="text" v-model="clienteEmEdicao.telefone" class="w-full p-3 bg-gray-700 border border-gray-600 rounded mt-1">
                </div>

                <div class="flex justify-end space-x-3">
                    <button @click="clienteEmEdicao = null" class="py-2 px-4 bg-gray-600 rounded-lg hover:bg-gray-500 transition">Cancelar</button>
                    <button @click="salvarEdicao" class="py-2 px-4 bg-blue-600 rounded-lg hover:bg-blue-500 transition">Salvar Alterações</button>
                </div>
            </div>
        </div>
    </div>
</template>