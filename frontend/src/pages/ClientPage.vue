<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useClienteStore } from '@/shared/stores/cliente.store';
import type { Cliente } from '@/shared/types/cliente.type';
import ClienteCard from '@/shared/components/client-page/ClienteCard.vue';
import ClienteEditarModal from '@/shared/components/client-page/ClienteEditarModal.vue';
import ClienteAdicionarModal from '@/shared/components/client-page/ClienteAdicionarModal.vue'; 

const store = useClienteStore();
const clienteParaEditar = ref<Cliente | null>(null);
const mostrarModalEdicao = ref(false);
const mostrarModalAdicionar = ref(false); 

onMounted(() => {
    store.carregarClientes();
});

const abrirEdicao = (cliente: Cliente) => {
    clienteParaEditar.value = cliente;
    mostrarModalEdicao.value = true;
};

const fecharModalEdicao = () => {
    mostrarModalEdicao.value = false;
    clienteParaEditar.value = null;
};

const handleClienteAtualizado = () => {
    fecharModalEdicao();
}

const abrirModalAdicionar = () => {
    mostrarModalAdicionar.value = true;
};

const fecharModalAdicionar = () => {
    mostrarModalAdicionar.value = false;
};

const handleClienteAdicionado = () => {
    fecharModalAdicionar();
}
</script>

<template>
    <div class="min-h-screen text-white py-2 p-8 w-full">
        <div class="mb-6 flex justify-between items-center p-4 bg-gray-800 rounded-xl shadow-xl">
            <h1 class="text-2xl font-bold text-white">Gerenciamento de Clientes</h1>
            
            <div class="flex items-center space-x-4">
                <p class="text-xl font-semibold">Total: {{ store.clientes.length }}</p>
                <button 
                    @click="abrirModalAdicionar" 
                    class="py-2 px-4 bg-green-600 rounded-lg text-white font-semibold hover:bg-green-700 transition flex items-center"
                >
                    <i class="fi fi-rr-user-add mr-2"></i> Adicionar Cliente
                </button>
            </div>
        </div>

        <div class="space-y-4">
            <p v-if="store.clientes.length === 0" class="text-gray-500 text-center py-10">
                Nenhum cliente cadastrado ainda. Clique em "Adicionar Cliente" para começar.
            </p>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <ClienteCard
                    v-for="cliente in store.clientes"
                    :key="cliente.uuid"
                    :cliente="cliente"
                    @edit="abrirEdicao"
                />
            </div>
        </div>

        <ClienteAdicionarModal
            v-if="mostrarModalAdicionar"
            @close="fecharModalAdicionar"
            @cliente-added="handleClienteAdicionado"
        />

        <ClienteEditarModal
            v-if="mostrarModalEdicao"
            :cliente="clienteParaEditar"
            @close="fecharModalEdicao"
            @cliente-updated="handleClienteAtualizado"
        />
    </div>
</template>