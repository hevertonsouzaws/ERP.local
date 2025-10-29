<script setup lang="ts">
import { ref, computed } from 'vue';
import { useClienteStore } from '@/shared/stores/cliente.store';
import { usePedidoStore } from '@/shared/stores/pedido.store';
import { getDataHojeString, toCaps } from '@/shared/helpers/data.helper';
import type { Cliente } from '@/shared/types/cliente.type';
import type { Pedido } from '@/shared/types/pedido.type';

const emit = defineEmits(['close']);

const clienteStore = useClienteStore();
const pedidoStore = usePedidoStore();

clienteStore.carregarClientes(); // Garante que a lista de clientes está carregada

// Formulário de Pedido
const novoPedido = ref<Omit<Pedido, 'id' | 'status' | 'dataCriacao'>>({
    clienteId: 0,
    clienteNome: '',
    dataEntrega: getDataHojeString(),
    horarioEntrega: '',
    descricao: '',
    valor: 0,
});

// Lógica de Cliente
const clienteBusca = ref('');
const clienteSelecionado = ref<Cliente | null>(null);
const mostrarNovoCliente = ref(false);
const novoClienteData = ref<Omit<Cliente, 'id'>>({ nome: '', telefone: '' });

const clientesFiltrados = computed(() => {
    if (!clienteBusca.value) return clienteStore.clientes.slice(0, 5); // Sugere os 5 primeiros
    return clienteStore.clientes.filter(c =>
        c.nome.toLowerCase().includes(clienteBusca.value.toLowerCase())
    );
});

const selecionarCliente = (cliente: Cliente) => {
    clienteSelecionado.value = cliente;
    novoPedido.value.clienteId = cliente.id as number;
    novoPedido.value.clienteNome = cliente.nome;
    clienteBusca.value = cliente.nome;
};

const cadastrarESelecionarCliente = async () => {
    if (!novoClienteData.value.nome) return;

    // Simula a adição (ID é retornado)
    const id = await clienteStore.adicionarCliente(novoClienteData.value);

    if (id) {
        const clienteRecemCadastrado = clienteStore.clientes.find(c => c.id === id);
        if (clienteRecemCadastrado) {
            selecionarCliente(clienteRecemCadastrado);
            mostrarNovoCliente.value = false;
        }
    }
}

const salvarPedido = async () => {
    if (clienteSelecionado.value && novoPedido.value.descricao && novoPedido.value.valor > 0) {
        const pedidoCompleto: Pedido = {
            ...novoPedido.value as Pedido,
            status: 'PENDENTE',
            dataCriacao: getDataHojeString(),
            clienteNome: toCaps(novoPedido.value.clienteNome) // Garante que o nome salvo é CAPS
        };

        await pedidoStore.adicionarPedido(pedidoCompleto);
        alert('Pedido Criado com Sucesso!');
        emit('close');
    } else {
        alert('Por favor, selecione um cliente e preencha a descrição e valor.');
    }
}
</script>

<template>
    <div class="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50 p-4 max-w-3xl m-auto"
        @click.self="emit('close')">
        <div class="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-lg relative text-white min-w-full ">
            <button @click="emit('close')" class="absolute top-4 right-4 text-gray-400 hover:text-white transition"><i
                    class="fi fi-rr-cross text-xl"></i></button>
            <h2 class="text-2xl font-bold mb-6 text-blue-400 border-b border-gray-700 pb-2">Novo Pedido</h2>

            <div class="mb-6 p-4 bg-gray-700 rounded-lg">
                <h3 class="font-bold mb-3 flex items-center"><i class="fi fi-rr-user text-lg mr-2"></i> Cliente</h3>

                <div v-if="clienteSelecionado"
                    class="p-3 bg-blue-900/50 rounded-lg mb-3 flex justify-between items-center">
                    <span>{{ clienteSelecionado.nome }}</span>
                    <button @click="clienteSelecionado = null; clienteBusca = ''"
                        class="text-xs text-red-300 hover:text-red-400">Trocar</button>
                </div>

                <div v-else>
                    <input type="text" v-model="clienteBusca" placeholder="Buscar cliente existente..."
                        class="w-full p-2 bg-gray-800 border border-gray-600 rounded mb-2 text-sm focus:border-blue-500">

                    <div v-if="clientesFiltrados.length > 0 && clienteBusca"
                        class="max-h-32 overflow-y-auto mb-2 border border-gray-600 rounded">
                        <div v-for="cliente in clientesFiltrados" :key="cliente.id" @click="selecionarCliente(cliente)"
                            class="p-2 cursor-pointer text-sm hover:bg-gray-600 transition border-b border-gray-700 last:border-b-0">
                            {{ cliente.nome }} ({{ cliente.telefone || 'Sem Tel' }})
                        </div>
                    </div>

                    <button @click="mostrarNovoCliente = !mostrarNovoCliente"
                        class="text-xs text-blue-400 hover:text-blue-300 transition">
                        {{ mostrarNovoCliente ? 'Ocultar Novo Cadastro' : 'Cadastrar Novo Cliente' }}
                    </button>

                    <div v-if="mostrarNovoCliente" class="mt-3 p-3 bg-gray-600 rounded-lg">
                        <input type="text" v-model="novoClienteData.nome" placeholder="Nome Completo"
                            class="w-full p-2 bg-gray-700 border border-gray-500 rounded mb-2 text-sm">
                        <input type="text" v-model="novoClienteData.telefone" placeholder="Telefone (Opcional)"
                            class="w-full p-2 bg-gray-700 border border-gray-500 rounded mb-3 text-sm">
                        <button @click="cadastrarESelecionarCliente"
                            class="w-full bg-green-600 p-2 rounded text-sm hover:bg-green-500">
                            Cadastrar e Usar
                        </button>
                    </div>
                </div>
            </div>

            <div class="space-y-4">
                <h3 class="font-bold flex items-center"><i class="fi fi-rr-document text-lg mr-2"></i> Detalhes</h3>

                <div>
                    <label class="block text-sm font-medium text-gray-400">Data e Horário de Entrega</label>
                    <div class="flex space-x-2 mt-1">
                        <input type="date" v-model="novoPedido.dataEntrega"
                            class="flex-1 p-2 bg-gray-700 border border-gray-600 rounded text-sm">
                        <input type="time" v-model="novoPedido.horarioEntrega"
                            class="w-1/3 p-2 bg-gray-700 border border-gray-600 rounded text-sm">
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-400">Descrição do Pedido</label>
                    <textarea v-model="novoPedido.descricao" rows="3"
                        class="w-full p-2 bg-gray-700 border border-gray-600 rounded mt-1 text-sm"></textarea>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-400">Valor Total (R$)</label>
                    <input type="number" v-model.number="novoPedido.valor" min="0" step="0.01"
                        class="w-full p-2 bg-gray-700 border border-gray-600 rounded mt-1 text-sm">
                </div>
            </div>

            <button @click="salvarPedido" :disabled="!clienteSelecionado"
                class="w-full mt-6 py-3 bg-blue-600 rounded-lg font-semibold transition duration-150"
                :class="{ 'opacity-50 cursor-not-allowed': !clienteSelecionado, 'hover:bg-blue-500': clienteSelecionado }">
                Salvar Pedido (Pendente)
            </button>
        </div>
    </div>
</template>