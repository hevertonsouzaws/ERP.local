<script setup lang="ts">
import { ref } from 'vue';
import { useClienteStore } from '@/shared/stores/cliente.store';
import type { Cliente } from '@/shared/types/cliente.type';
import { formatarTelefone } from '@/shared/helpers/data.helper';

const store = useClienteStore()

const clienteNovo = ref<Omit<Cliente, 'uuid'>>({
    nome: '',
    telefone: '',
});

const telefoneFormatado = ref('');

const atualizarTelefone = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const telefoneLimpo = input.value.replace(/\D/g, '');
    telefoneFormatado.value = formatarTelefone(telefoneLimpo);
    clienteNovo.value.telefone = telefoneLimpo; // Guarda o valor limpo na store/state
};

const salvarCliente = async () => {
    if (clienteNovo.value.nome) {
        // A formatação CAPS LOCK e final do telefone é feita DENTRO da store
        await store.adicionarCliente(clienteNovo.value);

        clienteNovo.value.nome = '';
        clienteNovo.value.telefone = '';
        telefoneFormatado.value = '';
        alert('Cliente salvo localmente!');
    }
};

</script>

<template>
    <div class="p-6 bg-white shadow-lg rounded-lg max-w-sm mx-auto">
        <h2 class="text-xl font-bold mb-4 text-gray-800">Cadastrar Cliente</h2>
        <div class="mb-4">
            <label for="nome" class="block text-sm font-medium text-gray-700">Nome (Obrigatório)</label>
            <input type="text" id="nome" v-model="clienteNovo.nome"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500">
        </div>
        <div class="mb-6">
            <label for="telefone" class="block text-sm font-medium text-gray-700">Telefone (Opcional)</label>
            <input type="text" id="telefone" :value="telefoneFormatado" @input="atualizarTelefone" maxlength="15"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500">
        </div>
        <button @click="salvarCliente"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-150">
            Salvar Localmente
        </button>
    </div>
</template>