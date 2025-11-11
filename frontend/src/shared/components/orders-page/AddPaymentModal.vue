<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { usePedidoStore } from '@/shared/stores/pedido.store';
import type { Pedido, FormaPagamento, PagamentoRegistro } from '@/shared/types/order.type';
import { showToast } from '@/shared/helpers/toastState'; 

const props = defineProps<{
    pedido: Pedido | null;
}>();

const emit = defineEmits(['close', 'payment-success']); 

const pedidoStore = usePedidoStore();

const formasDisponiveis: FormaPagamento[] = ['DINHEIRO', 'PIX', 'DEBITO', 'CREDITO', 'OUTRO'];

const pagamentosAtuais = ref<PagamentoRegistro[]>([]);
const valorTotalPedido = ref(0);
const valorPagoAnterior = ref(0);

const novoPagamento = ref({
    forma: 'DINHEIRO' as FormaPagamento,
    valor: 0,
});

const valorTotalPago = computed(() => {
    return valorPagoAnterior.value + pagamentosAtuais.value.reduce((total, p) => total + p.valor, 0);
});

const valorRestante = computed(() => {
    return Math.max(0, valorTotalPedido.value - valorTotalPago.value);
});

const podeQuitar = computed(() => valorTotalPago.value >= valorTotalPedido.value);

watch(() => props.pedido, (newPedido) => {
    if (newPedido) {
        const subtotal = newPedido.itens.reduce((totalGeral, peca) => {
            const subtotalPeca = peca.servicos.reduce((totalPeca, servico) => {
                return totalPeca + (servico.quantidade * servico.unitPrice);
            }, 0);
            return totalGeral + subtotalPeca;
        }, 0);

        const valorComDesconto = subtotal * (1 - newPedido.descontoPorcentagem / 100);
        valorTotalPedido.value = parseFloat(valorComDesconto.toFixed(2));
        
        valorPagoAnterior.value = newPedido.valorPago;
        pagamentosAtuais.value = []; 
        novoPagamento.value.valor = parseFloat(valorRestante.value.toFixed(2));
    }
}, { immediate: true });

const adicionarPagamento = () => {
    const valorPagar = parseFloat(novoPagamento.value.valor.toFixed(2));

    if (valorPagar <= 0) {
        showToast('O valor a pagar deve ser maior que zero.', 'warning'); 
        return;
    }

    pagamentosAtuais.value.push({
        forma: novoPagamento.value.forma,
        valor: valorPagar,
        timestamp: Date.now(),
    });

    novoPagamento.value.valor = parseFloat(valorRestante.value.toFixed(2));
};

const removerPagamento = (index: number) => {
    pagamentosAtuais.value.splice(index, 1);
    novoPagamento.value.valor = parseFloat(valorRestante.value.toFixed(2));
};

const salvarPagamento = async () => {
    if (!props.pedido || pagamentosAtuais.value.length === 0) {
        showToast('Nenhum pagamento novo para registrar.', 'warning'); 
        return;
    }

    const { uuid } = props.pedido;

    const novosPagamentos = props.pedido.pagamentos.concat(pagamentosAtuais.value);
    const novoValorPago = valorTotalPago.value;

    try {
        await pedidoStore.registrarNovoPagamento(
            uuid,
            novosPagamentos,
            novoValorPago,
        );

        showToast(`Pagamento(s) registrado(s) com sucesso.`, 'success'); 
        emit('payment-success');
        
    } catch (error) {
        console.error('Erro ao registrar pagamento:', error);
        showToast('Houve um erro ao registrar o pagamento.', 'error'); 
    }
};

const fecharModal = () => {
    emit('close');
}
</script>

<template>
    <div v-if="pedido" class="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
        <div class="bg-gray-800 rounded-xl shadow-2xl w-full lg:max-w-xl p-6 flex flex-col max-h-[90vh]" @click.stop>

            <div class="flex justify-between items-center pb-4 border-b border-gray-700 mb-4">
                <h2 class="text-2xl font-bold text-white flex items-center">
                    <i class="fi fi-rr-money-bill-wave text-3xl mr-3 text-green-400"></i>
                    Receber Pagamento
                </h2>
                <button @click="fecharModal" class="text-gray-400 hover:text-white transition">
                    <i class="fi fi-rr-cross-small text-2xl"></i>
                </button>
            </div>

            <div class="flex-1 overflow-y-auto pr-2 space-y-4">
                
                <div class="bg-gray-700 p-4 rounded-xl shadow-inner space-y-2">
                    <p class="text-sm font-semibold text-gray-300">Pedido: <span class="text-blue-400">#{{ pedido.uuid.substring(0, 8) }}</span></p>
                    <p class="text-lg font-bold text-white">Cliente: {{ pedido.clienteNome }}</p>
                    <div class="grid grid-cols-3 gap-3 text-center pt-2 border-t border-gray-600">
                        <div>
                            <p class="text-xs text-gray-400">Total</p>
                            <p class="text-lg font-bold text-yellow-400">R$ {{ valorTotalPedido.toFixed(2) }}</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-400">Pago Antes</p>
                            <p class="text-lg font-bold text-gray-300">R$ {{ valorPagoAnterior.toFixed(2) }}</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-400">Falta Pagar</p>
                            <p class="text-lg font-bold" :class="valorRestante > 0 ? 'text-red-400' : 'text-green-400'">
                                R$ {{ valorRestante.toFixed(2) }}
                            </p>
                        </div>
                    </div>
                </div>

                <h3 class="text-xl font-bold text-white mt-4 border-b border-gray-700 pb-2">Registrar Novo Pagamento</h3>
                
                <div class="bg-gray-700 p-4 rounded-xl shadow-lg space-y-3">
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-1">Forma de Pagamento</label>
                            <select v-model="novoPagamento.forma" class="w-full p-2 bg-gray-600 border border-gray-600 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500">
                                <option v-for="forma in formasDisponiveis" :key="forma" :value="forma">{{ forma }}</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-1">Valor (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                v-model.number="novoPagamento.valor"
                                class="w-full p-2 bg-gray-600 border border-gray-600 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500"
                            >
                        </div>
                    </div>

                    <button @click="adicionarPagamento" 
                        class="w-full py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        :disabled="novoPagamento.valor <= 0">
                        Adicionar à Lista
                    </button>
                </div>

                <div v-if="pagamentosAtuais.length > 0" class="mt-4">
                    <h4 class="text-lg font-semibold text-white mb-2">Pagamentos a Registrar ({{ pagamentosAtuais.length }})</h4>
                    <ul class="space-y-2">
                        <li v-for="(p, index) in pagamentosAtuais" :key="index" class="flex justify-between items-center bg-gray-700 p-3 rounded-lg shadow-md">
                            <span class="text-gray-300">{{ p.forma }}</span>
                            <span class="text-white font-bold">R$ {{ p.valor.toFixed(2) }}</span>
                            <button @click="removerPagamento(index)" class="text-red-400 hover:text-red-500 transition">
                                <i class="fi fi-rr-trash text-base"></i>
                            </button>
                        </li>
                    </ul>
                </div>

                <div v-if="valorRestante <= 0 && pagamentosAtuais.length > 0" class="mt-4 p-3 bg-yellow-600 rounded-lg text-white font-semibold text-center">
                    Atenção: O valor pago ultrapassa o valor restante.
                </div>
            </div>

            <div class="mt-6 pt-4 border-t border-gray-700 flex justify-between items-center">
                <span class="text-lg font-bold" :class="valorRestante <= 0 ? 'text-green-400' : 'text-red-400'">
                    Novo Total Pago: R$ {{ valorTotalPago.toFixed(2) }}
                </span>
                
                <button @click="salvarPagamento"
                    :disabled="pagamentosAtuais.length === 0"
                    class="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed">
                    Registrar Pagamento(s)
                </button>
            </div>
        </div>
    </div>
</template>