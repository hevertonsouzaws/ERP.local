<script setup lang="ts">
import type { ClientFormLogic } from '@/shared/helpers/create-order/clientFormLogic.helper';
defineProps<{
    clienteLogica: ClientFormLogic;
}>();
</script>

<template>
    <div class="p-4 border border-gray-400 rounded-lg">
        <h3 class="font-bold mb-3 flex items-center text-lg">
            <i class="fi fi-rr-user text-xl mr-2"></i> Cliente
        </h3>

        <div v-if="clienteLogica.clienteSelecionado.value"
            class="p-2 bg-gray-950 border border-purple-700 rounded-lg mb-3 flex justify-between items-center">

            <span>{{ clienteLogica.clienteSelecionado.value.nome }}</span>

            <button @click="clienteLogica.selecionarCliente(null as any)"
                class="text-xs text-white hover:text-gray-200 hover:scale-105 border border-gray-200 p-1.5 rounded-lg">
                Trocar
            </button>
        </div>

        <div v-else>
            <input v-if="!clienteLogica.mostrarNovoCliente.value" type="text" v-model="clienteLogica.clienteBusca.value"
                placeholder="Buscar cliente existente..."
                class="w-full p-2 bg-gray-900 border border-gray-600 rounded-xl mb-2 text-sm focus:border-blue-500">

            <div v-if="clienteLogica.clientesFiltrados.value.length > 0 && clienteLogica.clienteBusca.value && !clienteLogica.mostrarNovoCliente.value"
                class="max-h-32 overflow-y-auto mb-2 border border-gray-600 rounded">
                <div v-for="cliente in clienteLogica.clientesFiltrados.value" :key="cliente.uuid"
                    @click="clienteLogica.selecionarCliente(cliente)"
                    class="p-2 cursor-pointer text-sm hover:bg-gray-600 transition border-b border-gray-700 last:border-b-0">
                    {{ cliente.nome }} ({{ cliente.telefone || 'Sem Tel' }})
                </div>
            </div>

            <button @click="clienteLogica.mostrarNovoCliente.value = !clienteLogica.mostrarNovoCliente.value"
                class="text-base text-blue-400 hover:text-blue-300 transition block">
                {{ clienteLogica.mostrarNovoCliente.value ? 'Ocultar Novo Cadastro' : 'Cadastrar Novo Cliente' }}
            </button>

            <div v-if="clienteLogica.mostrarNovoCliente.value"
                class="mt-3 p-3 bg-gray-950 border border-gray-500 rounded-lg">
                <input type="text" v-model="clienteLogica.novoClienteData.value.nome" placeholder="Nome Completo"
                    class="w-full p-2 bg-gray-900 border border-gray-500 rounded-xl mb-2 text-sm">
                <input type="text" v-model="clienteLogica.novoClienteData.value.telefone"
                    placeholder="Telefone (Opcional)"
                    class="w-full p-2 bg-gray-900 border border-gray-500 rounded-xl mb-3 text-sm">
                <button @click="clienteLogica.cadastrarESelecionarCliente"
                    :disabled="!clienteLogica.novoClienteData.value.nome"
                    class="w-full bg-green-600 p-2 rounded text-sm hover:bg-green-500 disabled:opacity-50">
                    Cadastrar e Usar
                </button>
            </div>
        </div>
    </div>
</template>
