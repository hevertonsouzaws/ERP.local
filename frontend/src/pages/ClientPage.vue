<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'; 
import { useClienteStore } from '@/shared/stores/cliente.store';
import type { Cliente } from '@/shared/types/cliente.type';
import ClienteCard from '@/shared/components/client-page/ClientCard.vue';
import ClienteEditarModal from '@/shared/components/client-page/ClientEditModal.vue';
import ClienteAdicionarModal from '@/shared/components/client-page/ClientAddModal.vue';

const store = useClienteStore();
const clienteParaEditar = ref<Cliente | null>(null);
const mostrarModalEdicao = ref(false);
const mostrarModalAdicionar = ref(false);

const termoBusca = ref('');

const clientesFiltrados = computed(() => {
    if (!termoBusca.value) {
        return store.clientes;
    }

    const termo = termoBusca.value.toLowerCase().trim();

    return store.clientes.filter(cliente =>
        cliente.nome.toLowerCase().includes(termo)
    );
});

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
        <div
            class="mb-6 flex flex-col md:flex-row md:justify-between md:items-center p-4 border border-gray-500 rounded-xl shadow-xl">
            <h1 class="text-2xl font-semibold text-white mb-4 md:mb-0">Clientes Cadastrados</h1>

            <div
                class="flex flex-col md:flex-row items-stretch md:items-center space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">

                <div class="relative w-full md:w-80">
                    <i class="fi fi-rr-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    <input type="text" v-model="termoBusca" placeholder="Buscar cliente por nome..."
                        class="w-full py-2 pl-10 pr-4 bg-gray-800 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>

                <p class="text-xl font-semibold hidden md:block">Total: {{ store.clientes.length }}</p>

                <button @click="abrirModalAdicionar"
                    class="py-2 px-4 bg-green-600 rounded-lg text-white font-semibold hover:bg-green-700 transition flex items-center justify-center w-full md:w-auto">
                    <i class="fi fi-rr-user-add mr-2"></i> Adicionar Cliente
                </button>
            </div>
        </div>

        <div class="space-y-4">
            <p v-if="clientesFiltrados.length === 0 && store.clientes.length > 0"
                class="text-gray-500 text-center py-10">
                Nenhum cliente encontrado para o termo "{{ termoBusca }}".
            </p>
            <p v-else-if="store.clientes.length === 0" class="text-gray-500 text-center py-10">
                Nenhum cliente cadastrado ainda. Clique em "Adicionar Cliente" para começar.
            </p>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <ClienteCard v-for="cliente in clientesFiltrados" :key="cliente.uuid" :cliente="cliente"
                    @edit="abrirEdicao" />
            </div>
        </div>

        <ClienteAdicionarModal v-if="mostrarModalAdicionar" @close="fecharModalAdicionar"
            @cliente-added="handleClienteAdicionado" />

        <ClienteEditarModal v-if="mostrarModalEdicao" :cliente="clienteParaEditar" @close="fecharModalEdicao"
            @cliente-updated="handleClienteAtualizado" />
    </div>
</template>