<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useClienteStore } from '@/shared/stores/cliente.store';
import { usePedidoStore } from '@/shared/stores/pedido.store';
import { useDraftOrderStore } from '@/shared/stores/draftOrder.store';
import { useServiceStore } from '@/shared/stores/catolog.store';
import { getDataHojeString, toCaps } from '@/shared/helpers/data.helper';
import type { Cliente } from '@/shared/types/cliente.type';
import { type FormaPagamento, type PedidoItemPeca, type PedidoItemServico } from '@/shared/types/pedido.type';
import type { IService, IGarmentType } from '@/shared/types/catalog.type';

const emit = defineEmits(['close']);

const clienteStore = useClienteStore();
const pedidoStore = usePedidoStore();
const draftStore = useDraftOrderStore();
const catalogStore = useServiceStore();

clienteStore.carregarClientes();
catalogStore.loadCatalog();

draftStore.resetDraft();

const formasDisponiveis: FormaPagamento[] = ['DINHEIRO', 'PIX', 'DEBITO', 'CREDITO', 'OUTRO'];

const novoPagamento = ref({
    forma: 'DINHEIRO' as FormaPagamento,
    valor: 0,
});

const selectedGarmentTypeUuid = ref<string | null>(null);
const selectedServiceUuid = ref<string | null>(null);
const itemQuantity = ref(1);

const garmentTypes = computed(() => catalogStore.garmentTypes as IGarmentType[]);
const services = computed(() => catalogStore.services as IService[]);

const valorTotalPedido = computed(() => draftStore.valorTotalPedido);
const valorTotalPago = computed(() => draftStore.valorTotalPago);
const valorRestante = computed(() => draftStore.valorRestante);
const pagamentosRegistrados = computed(() => draftStore.rascunho.pagamentos);
const itensDoPedido = computed(() => draftStore.rascunho.itens as PedidoItemPeca[]);

const novoValorPagamentoSugerido = computed(() => Math.max(0, valorRestante.value));

watch(valorRestante, (novoRestante) => {
    novoPagamento.value.valor = novoRestante;
}, { immediate: true });

const currentSelectedItem = computed<IService | undefined>(() => {
    return services.value.find(s => s.uuid === selectedServiceUuid.value);
});

const currentItemPrice = computed(() => {
    if (currentSelectedItem.value && itemQuantity.value > 0) {
        return currentSelectedItem.value.defaultPrice * itemQuantity.value;
    }
    return 0;
});

const adicionarItemAoPedido = () => {
    const garment = garmentTypes.value.find(g => g.uuid === selectedGarmentTypeUuid.value);
    const service = services.value.find(s => s.uuid === selectedServiceUuid.value);
    const quantity = itemQuantity.value;

    if (!garment || !service || quantity <= 0) {
        alert('Selecione o tipo de peça, o serviço e uma quantidade válida.');
        return;
    }

    draftStore.addGarment(garment);

    const newGarmentUuid = draftStore.rascunho.itens.slice(-1)[0]?.uuid;

    if (newGarmentUuid) {
        draftStore.addServiceToGarment(
            newGarmentUuid,
            service,
            quantity,
            service.defaultPrice
        );
    } else {
        alert('Erro interno: Falha ao adicionar item principal.');
        return;
    }

    selectedGarmentTypeUuid.value = null;
    selectedServiceUuid.value = null;
    itemQuantity.value = 1;
};

const removerItem = (uuid: string) => {
    draftStore.removeGarment(uuid);
};

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

    draftStore.addPayment(novoPagamento.value.forma, valorPagar);

    novoPagamento.value.valor = novoValorPagamentoSugerido.value;
};

const removerPagamento = (index: number) => {
    draftStore.removePayment(index);
    novoPagamento.value.valor = novoValorPagamentoSugerido.value;
};

const clienteBusca = ref(draftStore.rascunho.cliente?.nome || '');
const mostrarNovoCliente = ref(false);
const novoClienteData = ref<Omit<Cliente, 'uuid'>>({ nome: '', telefone: '' });

const clientesFiltrados = computed(() => {
    if (!clienteBusca.value) return clienteStore.clientes.slice(0, 5);
    return clienteStore.clientes.filter(c =>
        c.nome.toLowerCase().includes(clienteBusca.value.toLowerCase())
    );
});

const selecionarCliente = (cliente: Cliente) => {
    draftStore.setCliente(cliente);
    clienteBusca.value = cliente.nome;
};

const cadastrarESelecionarCliente = async () => {
    if (!novoClienteData.value.nome) return;

    const uuid = await clienteStore.adicionarCliente(novoClienteData.value);

    if (uuid) {
        const clienteRecemCadastrado = clienteStore.clientes.find(c => c.uuid === uuid);
        if (clienteRecemCadastrado) {
            selecionarCliente(clienteRecemCadastrado);
            mostrarNovoCliente.value = false;
        }
    }
}

const salvarPedido = async () => {
    if (!draftStore.rascunho.cliente || valorTotalPedido.value <= 0) {
        alert('Selecione um cliente e adicione itens ao pedido.');
        return;
    }

    try {
        const pedidoParaSalvar = draftStore.toPedidoForSave();
        const uuidSalvo = await pedidoStore.adicionarPedido(pedidoParaSalvar);

        if (uuidSalvo) {
            alert(`Pedido Criado com Sucesso! Status: ${pedidoParaSalvar.status}.`);
            draftStore.resetDraft();
            emit('close');
        } else {
            console.error('Falha ao salvar o pedido.');
            alert('Falha ao salvar o pedido. Verifique o console para erros.');
        }
    } catch (error) {
        console.error('Erro ao salvar o pedido:', error);
        alert(`Erro ao salvar: `);
    }
}

watch(valorTotalPedido, (novoValor) => {
    if (pagamentosRegistrados.value.length === 0) {
        novoPagamento.value.valor = novoValor;
    }
}, { immediate: true });
</script>

<template>
    <div class="fixed inset-0 bg-gray-900 bg-opacity-80 flex justify-center items-center z-50 p-4"
        @click.self="emit('close')">

        <div class="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-7xl relative text-white
                             max-h-full overflow-y-auto">
            <button @click="emit('close')" class="absolute top-4 right-4 text-gray-400 hover:text-white transition">
                <i class="fi fi-rr-cross text-xl"></i>
            </button>
            <h2 class="text-2xl font-bold mb-6 text-gray-200 border-b border-gray-700 pb-2">Novo Pedido</h2>

            <div class="flex space-x-6">

                <div class="w-1/2 space-y-4 pr-3 border-r border-gray-700">

                    <div class="p-4 bg-gray-900 rounded-lg">
                        <h3 class="font-bold mb-3 flex items-center text-lg"><i class="fi fi-rr-user text-xl mr-2"></i>
                            Cliente</h3>
                        <div v-if="draftStore.rascunho.cliente"
                            class="p-3 bg-blue-900/50 rounded-lg mb-3 flex justify-between items-center">
                            <span>{{ draftStore.rascunho.cliente.nome }}</span>
                            <button @click="draftStore.setCliente(null as unknown as Cliente); clienteBusca = ''"
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

                    <div class="space-y-3 p-4 bg-gray-900 rounded-lg border border-gray-700">
                        <h3 class="font-bold flex items-center text-lg text-blue-400">
                            <i class="fi fi-rr-hanger mr-2"></i> Itens do Pedido
                        </h3>

                        <div class="p-3 bg-gray-700 rounded-lg space-y-2">
                            <div class="flex space-x-2">
                                <select v-model="selectedGarmentTypeUuid"
                                    class="flex-1 p-2 bg-gray-600 border border-gray-600 rounded text-sm">
                                    <option :value="null" disabled>Selecione a Peça</option>
                                    <option v-for="garment in garmentTypes" :key="garment.uuid" :value="garment.uuid">
                                        {{ garment.name }}
                                    </option>
                                </select>

                                <select v-model="selectedServiceUuid"
                                    class="flex-1 p-2 bg-gray-600 border border-gray-600 rounded text-sm">
                                    <option :value="null" disabled>Selecione o Serviço</option>
                                    <option v-for="service in services" :key="service.uuid" :value="service.uuid">
                                        {{ service.name }} (R$ {{ service.defaultPrice.toFixed(2) }})
                                    </option>
                                </select>
                            </div>
                            <div class="flex space-x-2 items-center">
                                <input type="number" v-model.number="itemQuantity" min="1"
                                    class="w-1/4 p-2 bg-gray-600 border border-gray-600 rounded text-sm text-center" />

                                <span class="flex-1 text-sm font-semibold text-right text-yellow-400">
                                    Total Item: R$ {{ currentItemPrice.toFixed(2) }}
                                </span>

                                <button @click="adicionarItemAoPedido"
                                    :disabled="!selectedGarmentTypeUuid || !selectedServiceUuid || itemQuantity <= 0"
                                    class="w-1/4 bg-blue-600 p-2 rounded text-sm hover:bg-blue-500 disabled:opacity-50 transition">
                                    <i class="fi fi-rr-plus"></i>
                                </button>
                            </div>
                        </div>

                        <div class="mt-3 max-h-48 overflow-y-auto space-y-2">
                            <div v-if="itensDoPedido.length === 0" class="text-gray-500 text-center text-sm p-4">
                                Nenhum item adicionado ao pedido.
                            </div>
                            <div v-for="(item, index) in itensDoPedido" :key="item.uuid"
                                class="flex justify-between items-center bg-gray-600 p-3 rounded text-sm">
                                <span class="font-medium text-gray-200">
                                    {{ item.servicos[0].quantidade }}x {{ item.garmentName }} ({{ item.servicos[0].name
                                    }})
                                </span>
                                <div class="flex items-center space-x-3">
                                    <span class="text-green-400 font-bold">R$ {{ (item.servicos[0].quantidade *
                                        item.servicos[0].unitPrice).toFixed(2) }}</span>
                                    <button @click="removerItem(item.uuid)"
                                        class="text-red-400 hover:text-red-300 transition">
                                        <i class="fi fi-rr-trash text-xs"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <div class="w-1/2 space-y-4">

                    <div class="space-y-3 p-4 bg-gray-900 rounded-lg">
                        <h3 class="font-bold mb-4 flex items-center text-lg"><i class="fi fi-rr-calendar mr-2"></i>
                            Datas</h3>
                        <div>
                            <label class="block text-sm font-medium text-gray-200">Data e Horário de Entrega</label>
                            <div class="flex space-x-2 mt-1">
                                <input type="date" v-model="draftStore.rascunho.dataEntrega"
                                    class="flex-1 p-2 bg-gray-700 border border-gray-600 rounded text-sm cursor-pointer">
                                <input type="time" v-model="draftStore.rascunho.horarioEntrega"
                                    class="w-1/3 p-2 bg-gray-700 border border-gray-600 rounded text-sm cursor-pointer">
                            </div>
                        </div>
                    </div>

                    <div class="p-4 bg-gray-900 rounded-lg">
                        <h3 class="font-bold mb-4 flex items-center justify-left text-lg text-green-600">
                            <i class="fi fi-rr-credit-card mr-2"></i> Resumo Financeiro
                        </h3>

                        <div class="mt-4 pt-3 border-t border-gray-400 flex justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-200">Total do Pedido:</p>
                                <p class="text-3xl text-green-400">R$ {{ valorTotalPedido.toFixed(2) }}</p>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-gray-200">Total Pago:</p>
                                <p class="text-3xl text-gray-200">R$ {{ valorTotalPago.toFixed(2) }}</p>
                            </div>
                        </div>
                        <div class="mt-4 border-t border-gray-700 pt-3 text-right">
                            <p class="text-sm font-medium text-gray-200">Falta Pagar:</p>
                            <p class="text-4xl font-extrabold"
                                :class="valorRestante > 0 ? 'text-red-500' : 'text-green-500'">
                                R$ {{ valorRestante.toFixed(2) }}
                            </p>
                        </div>
                    </div>

                    <div class="p-4 bg-gray-900 rounded-lg">
                        <h3 class="font-bold mb-3 flex items-center text-lg text-gray-200">
                            <i class="fi fi-rr-money-bill-wave mr-2 text-green-400"></i> Registrar Pagamentos
                        </h3>

                        <div class="flex space-x-2 mb-3">
                            <select v-model="novoPagamento.forma"
                                class="flex-1 p-2 bg-gray-600 border border-gray-600 rounded text-sm">
                                <option v-for="forma in formasDisponiveis" :key="forma" :value="forma">{{ forma }}
                                </option>
                            </select>

                            <input type="number" v-model.number="novoPagamento.valor" min="0" step="0.01"
                                class="w-2/5 p-2 bg-gray-600 border border-gray-600 rounded text-sm">

                            <button @click="adicionarPagamento"
                                :disabled="novoPagamento.valor <= 0 || valorTotalPedido <= 0"
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
                <button @click="salvarPedido" :disabled="!draftStore.rascunho.cliente || valorTotalPedido <= 0"
                    class="w-80 py-3 rounded-lg font-semibold transition duration-150" :class="{
                        'bg-green-600 hover:bg-green-500': valorRestante <= 0 && draftStore.rascunho.cliente && valorTotalPedido > 0,
                        'bg-blue-600 hover:bg-blue-500': valorRestante > 0 && draftStore.rascunho.cliente,
                        'opacity-50 cursor-not-allowed': !draftStore.rascunho.cliente || valorTotalPedido <= 0
                    }">
                    {{ valorRestante <= 0 ? 'SALVAR PEDIDO (QUITADO)' : 'SALVAR PEDIDO' }} </button>
            </div>
            <p v-if="!draftStore.rascunho.cliente || valorTotalPedido <= 0"
                class="text-xs text-red-400 text-center mt-2">
                Selecione um cliente e adicione itens para salvar.
            </p>
        </div>
    </div>
</template>
