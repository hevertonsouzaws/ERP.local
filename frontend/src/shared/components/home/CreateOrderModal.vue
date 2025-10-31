<script setup lang="ts">
import { ref, computed } from 'vue';
import { useClienteStore } from '@/shared/stores/cliente.store';
import { usePedidoStore } from '@/shared/stores/pedido.store';
import { getDataHojeString, toCaps } from '@/shared/helpers/data.helper';
import type { Cliente } from '@/shared/types/cliente.type';
import type { Pedido, PagamentoRegistro } from '@/shared/types/pedido.type';
import { type FormaPagamento } from '@/shared/types/pedido.type';

const emit = defineEmits(['close']);

const clienteStore = useClienteStore();
const pedidoStore = usePedidoStore();

clienteStore.carregarClientes();

const novoPedido = ref<Omit<Pedido, 'uuid' | 'status' | 'dataCriacao' | 'pagamentos' | 'valorPago' | 'clienteUuid'>>({
    clienteUuidd: '',
    clienteNome: '',
    dataEntrega: getDataHojeString(),
    horarioEntrega: '',
    descricao: '',
    valor: 0,
});
const pagamentosRegistrados = ref<PagamentoRegistro[]>([]);

const formasDisponiveis: FormaPagamento[] = ['DINHEIRO', 'PIX', 'DEBITO', 'CREDITO', 'OUTRO'];

const novoPagamento = ref({
    forma: 'DINHEIRO' as FormaPagamento,
    valor: 0,
});

const valorTotalPago = computed(() => {
    return pagamentosRegistrados.value.reduce((total, p) => total + p.valor, 0);
});

const valorRestante = computed(() => {
    const restante = novoPedido.value.valor - valorTotalPago.value;
    return Math.max(0, restante);
});

const novoValorPagamentoSugerido = computed(() => {
    return Math.max(0, valorRestante.value);
});

const adicionarPagamento = () => {
    const valorPagar = parseFloat(novoPagamento.value.valor.toFixed(2));

    if (valorPagar <= 0) {
        alert('O valor a pagar deve ser maior que zero.');
        return;
    }

    const valorLimite = valorRestante.value;

    if (valorLimite === 0 && valorPagar > 0) {
        alert('O pedido já está quitado. Remova um pagamento ou zere o valor a pagar.');
        return;
    }

    if (valorPagar > valorLimite && valorLimite > 0) {
        if (!confirm(`O valor de R$ ${valorPagar.toFixed(2)} excede o restante de R$ ${valorLimite.toFixed(2)}. Continuar e registrar o excesso?`)) {
            return;
        }
    }

    pagamentosRegistrados.value.push({
        forma: novoPagamento.value.forma,
        valor: valorPagar,
        timestamp: Date.now(),
    });

    novoPagamento.value.valor = novoValorPagamentoSugerido.value;
};

const removerPagamento = (index: number) => {
    pagamentosRegistrados.value.splice(index, 1);
    novoPagamento.value.valor = novoValorPagamentoSugerido.value;
};

const clienteBusca = ref('');
const clienteSelecionado = ref<Cliente | null>(null);
const mostrarNovoCliente = ref(false);
// ATENÇÃO: Cliente agora usa 'uuid'
const novoClienteData = ref<Omit<Cliente, 'uuid'>>({ nome: '', telefone: '' });

const clientesFiltrados = computed(() => {
    if (!clienteBusca.value) return clienteStore.clientes.slice(0, 5);
    return clienteStore.clientes.filter(c =>
        c.nome.toLowerCase().includes(clienteBusca.value.toLowerCase())
    );
});

// ATENÇÃO: Cliente agora usa 'uuid'
const selecionarCliente = (cliente: Cliente) => {
    clienteSelecionado.value = cliente;
    // Removido: novoPedido.value.clienteId = cliente.id as number;
    novoPedido.value.clienteNome = cliente.nome;
    clienteBusca.value = cliente.nome;
};

// ATENÇÃO: Cliente agora usa 'uuid'
const cadastrarESelecionarCliente = async () => {
    if (!novoClienteData.value.nome) return;

    // A store agora retorna o UUID (string)
    const uuid = await clienteStore.adicionarCliente(novoClienteData.value);

    if (uuid) {
        // Busca na store pelo UUID
        const clienteRecemCadastrado = clienteStore.clientes.find(c => c.uuid === uuid);
        if (clienteRecemCadastrado) {
            selecionarCliente(clienteRecemCadastrado);
            mostrarNovoCliente.value = false;
        }
    }
}

const salvarPedido = async () => {
    if (!clienteSelecionado.value || !novoPedido.value.descricao || novoPedido.value.valor <= 0) {
        alert('Selecione um cliente e preencha a descrição/valor total.');
        return;
    }

    // Constrói o Pedido Completo
    const pedidoCompleto: Pedido = {
        ...novoPedido.value,
        uuid: '', // Será gerado na store
        clienteUuid: clienteSelecionado.value.uuid, // NOVO CAMPO: UUID do cliente
        pagamentos: pagamentosRegistrados.value,
        valorPago: valorTotalPago.value,
        status: valorRestante.value <= 0 ? 'CONCLUIDO' : 'PENDENTE',
        dataCriacao: getDataHojeString(),
        clienteNome: toCaps(novoPedido.value.clienteNome)
    } as Pedido;

    // Omitimos a propriedade 'id'
    const pedidoParaSalvar: Omit<Pedido, 'uuid'> = pedidoCompleto;

    // A store vai gerar o UUID
    const uuidSalvo = await pedidoStore.adicionarPedido(pedidoParaSalvar);

    if (uuidSalvo) {
        alert(`Pedido Criado com Sucesso! Status: ${pedidoCompleto.status}.`);
        emit('close');
    } else {
        alert('Falha ao salvar o pedido. Verifique o console para erros do Dexie.');
    }
}
</script>

<template>
    <div class="fixed inset-0 bg-gray-900 bg-opacity-80 flex justify-center items-center z-50 p-4"
        @click.self="emit('close')">

        <div class="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-4xl relative text-white 
                             max-h-full overflow-y-auto">
            <button @click="emit('close')" class="absolute top-4 right-4 text-gray-400 hover:text-white transition"><i
                    class="fi fi-rr-cross text-xl"></i></button>
            <h2 class="text-2xl font-bold mb-6 text-gray-200 border-b border-gray-700 pb-2">Novo Pedido</h2>

            <div class="flex space-x-6">

                <div class="w-1/2 space-y-4 pr-3 border-r border-gray-700">

                    <div class="p-4 bg-gray-900 rounded-lg">
                        <h3 class="font-bold mb-3 flex items-center text-lg"><i class="fi fi-rr-user text-xl mr-2"></i>
                            Cliente</h3>
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
                                <div v-for="cliente in clientesFiltrados" :key="cliente.uuid"
                                    @click="selecionarCliente(cliente)"
                                    class="p-2 cursor-pointer text-sm hover:bg-gray-600 transition border-b border-gray-700 last:border-b-0">
                                    {{ cliente.nome }} ({{ cliente.telefone || 'Sem Tel' }})
                                </div>
                            </div>

                            <button @click="mostrarNovoCliente = !mostrarNovoCliente"
                                class="text-xs text-blue-400 hover:text-blue-300 transition block">
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

                    <div class="space-y-3">
                        <div>
                            <label class="block text-sm font-medium text-gray-200">Descrição do Pedido</label>
                            <textarea v-model="novoPedido.descricao" rows="3"
                                class="w-full p-2 bg-gray-900 border border-gray-600 rounded mt-1 text-sm"></textarea>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-200">Data e Horário de Entrega</label>
                            <div class="flex space-x-2 mt-1">
                                <input type="date" v-model="novoPedido.dataEntrega"
                                    class="flex-1 p-2 bg-gray-700 border border-gray-600 rounded text-sm cursor-pointer">
                                <input type="time" v-model="novoPedido.horarioEntrega"
                                    class="w-1/3 p-2 bg-gray-700 border border-gray-600 rounded text-sm cursor-pointer">
                            </div>
                        </div>
                    </div>
                </div>

                <div class="w-1/2 space-y-4">

                    <div class="p-4 bg-gray-900 rounded-lg">
                        <h3 class="font-bold mb-4 flex items-center justify-left text-lg text-green-600"><i
                                class="fi fi-rr-credit-card mr-2"></i>Pagamento</h3>

                        <div>
                            <label class="block text-sm font-medium text-gray-200">Valor Total do Pedido (R$)</label>
                            <input type="number" v-model.number="novoPedido.valor" min="0" step="0.01"
                                class="w-full p-2 text-xl bg-gray-900 border border-gray-600 mt-1 text-white rounded-lg">
                        </div>

                        <div class="mt-4 pt-3 border-t border-gray-400 flex justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-200">Total Pago:</p>
                                <p class="text-3xl text-gray-200">R$ {{ valorTotalPago.toFixed(2) }}</p>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-gray-200">Falta Pagar:</p>
                                <p class="text-3xl" :class="valorRestante > 0 ? 'text-red-500' : 'text-green-500'">
                                    R$ {{ valorRestante.toFixed(2) }}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="p-4 bg-gray-900 rounded-lg">
                        <h3 class="font-bold mb-3 flex items-center text-lg text-gray-200"><i
                                class="fi fi-rr-money-bill-wave mr-2 text-green-400"></i> Registrar Pagamentos</h3>

                        <div class="flex space-x-2 mb-3">
                            <select v-model="novoPagamento.forma"
                                class="flex-1 p-2 bg-gray-600 border border-gray-600 rounded text-sm">
                                <option v-for="forma in formasDisponiveis" :key="forma" :value="forma">{{ forma }}
                                </option>
                            </select>

                            <input type="number" v-model.number="novoPagamento.valor" min="0" step="0.01"
                                class="w-2/5 p-2 bg-gray-600 border border-gray-600 rounded text-sm">

                            <button @click="adicionarPagamento"
                                :disabled="novoPagamento.valor <= 0 || novoPedido.valor <= 0"
                                class="w-1/4 bg-green-600 p-2 rounded text-sm hover:bg-green-500 disabled:opacity-50 transition">
                                <i class="fi fi-rr-plus"></i>
                            </button>
                        </div>

                        <div v-if="pagamentosRegistrados.length > 0" class="mt-3 max-h-40 overflow-y-auto space-y-1">
                            <div v-for="(pag, index) in pagamentosRegistrados" :key="index"
                                class="flex justify-between items-center bg-gray-600 p-2 rounded text-sm">
                                <span class="font-medium">{{ pag.forma }}:</span>
                                <span class="text-gray-200 font-bold">R$ {{ pag.valor.toFixed(2) }}</span>
                                <button @click="removerPagamento(index)"
                                    class="text-red-400 hover:text-red-300 transition">
                                    <i class="fi fi-rr-trash text-xs"></i>
                                </button>
                            </div>
                        </div>
                        <p v-else class="text-gray-400 text-sm italic text-center">Nenhum pagamento registrado.</p>
                    </div>

                </div>
            </div>

            <div class="w-full text-center mt-10">
                <button @click="salvarPedido" :disabled="!clienteSelecionado || novoPedido.valor <= 0"
                class="w-80 py-3 rounded-lg font-semibold transition duration-150" :class="{
                    'bg-green-600 hover:bg-green-500': valorRestante <= 0 && clienteSelecionado,
                    'bg-blue-600 hover:bg-blue-500': valorRestante > 0 && clienteSelecionado,
                    'opacity-50 cursor-not-allowed': !clienteSelecionado || novoPedido.valor <= 0
                }">
                {{ valorRestante <= 0 ? 'SALVAR PEDIDO (QUITADO)' : 'SALVAR PEDIDO' }} </button>
            </div>
                    <p v-if="!clienteSelecionado" class="text-xs text-red-400 text-center mt-2">Selecione um cliente e
                        defina o valor total para salvar.</p>
        </div>
    </div>
</template>