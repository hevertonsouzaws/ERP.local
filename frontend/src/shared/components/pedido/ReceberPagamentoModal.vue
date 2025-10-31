<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { usePedidoStore } from '@/shared/stores/pedido.store';
import type { Pedido, FormaPagamento, PagamentoRegistro, PedidoStatus } from '@/shared/types/pedido.type';

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
    const restante = valorTotalPedido.value - valorTotalPago.value;
    return Math.max(0, restante);
});

const podeQuitar = computed(() => valorRestante.value <= 0);

watch(() => props.pedido, (novoPedido) => {
    if (novoPedido) {
        valorTotalPedido.value = novoPedido.valor;
        valorPagoAnterior.value = novoPedido.valorPago;
        pagamentosAtuais.value = [];
        novoPagamento.value.valor = Math.max(0, novoPedido.valor - novoPedido.valorPago);
    }
}, { immediate: true });

const adicionarPagamento = () => {
    const valorPagar = parseFloat(novoPagamento.value.valor.toFixed(2));
    
    if (valorPagar <= 0) {
        alert('O valor a pagar deve ser maior que zero.');
        return;
    }
    
    pagamentosAtuais.value.push({
        forma: novoPagamento.value.forma,
        valor: valorPagar,
        timestamp: Date.now(),
    });
    
    novoPagamento.value.valor = valorRestante.value;
};

const removerPagamento = (index: number) => {
    pagamentosAtuais.value.splice(index, 1);
    novoPagamento.value.valor = valorRestante.value;
};

const salvarPagamento = async () => {
    if (!props.pedido || pagamentosAtuais.value.length === 0) {
        alert('Nenhum pagamento novo para registrar.');
        return;
    }

    // AQUI: Usando 'uuid' em vez de 'id'
    const { uuid, status } = props.pedido; 

    const novosPagamentos = props.pedido.pagamentos.concat(pagamentosAtuais.value);
    const novoValorPago = valorTotalPago.value;
    
    const novoStatus: PedidoStatus = podeQuitar.value ? 'CONCLUIDO' : 'PENDENTE';
    
    try {
        await pedidoStore.registrarNovoPagamento(
            uuid, // MUDANÇA: Passando o UUID (string)
            novosPagamentos,
            novoValorPago,
            novoStatus,
            props.pedido.valor
        );
        
        alert(`Pagamento(s) registrado(s) com sucesso. Novo Status: ${novoStatus}.`);
        emit('payment-success');
    } catch (error) {
        console.error('Erro ao registrar pagamento:', error);
        alert('Houve um erro ao registrar o pagamento.');
    }
};

const fecharModal = () => {
    emit('close');
}
</script>

<template>
    <div v-if="pedido" class="fixed inset-0 bg-gray-900 bg-opacity-80 flex justify-center items-center z-50 p-4"
        @click.self="fecharModal">
        
        <div class="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-lg relative text-white max-h-[90vh] overflow-y-auto">
            <button @click="fecharModal" class="absolute top-4 right-4 text-gray-400 hover:text-white transition"><i
                    class="fi fi-rr-cross text-xl"></i></button>
            <h2 class="text-2xl font-bold mb-6 text-yellow-400 border-b border-gray-700 pb-2">
                Receber Pagamento | Pedido #{{ pedido.uuid.substring(0, 8) }}
            </h2>

            <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="p-3 bg-gray-700 rounded-lg">
                    <p class="text-sm text-gray-400">Cliente</p>
                    <p class="font-bold">{{ pedido.clienteNome }}</p>
                </div>
                <div class="p-3 bg-gray-700 rounded-lg">
                    <p class="text-sm text-gray-400">Total do Pedido</p>
                    <p class="font-bold text-green-400 text-xl">R$ {{ valorTotalPedido.toFixed(2) }}</p>
                </div>
            </div>

            <div class="mb-6 p-4 rounded-lg" :class="podeQuitar ? 'bg-green-900/40' : 'bg-red-900/40'">
                   <p class="text-lg font-medium text-gray-200">Total Pago Anteriormente:</p>
                   <p class="text-xl font-extrabold text-blue-400">R$ {{ valorPagoAnterior.toFixed(2) }}</p>

                   <p class="text-lg font-medium text-gray-200 mt-3">Valor Pendente:</p>
                   <p class="text-3xl font-extrabold" :class="valorRestante > 0 ? 'text-red-400' : 'text-green-400'">
                       R$ {{ valorRestante.toFixed(2) }}
                   </p>
            </div>
            
            <div class="p-4 bg-gray-700 rounded-lg mb-6">
                <h3 class="font-bold mb-3 flex items-center text-lg text-green-300"><i class="fi fi-rr-money-bill-wave mr-2"></i> Adicionar Pagamento</h3>
                
                <div class="flex space-x-2">
                    <select v-model="novoPagamento.forma" class="flex-1 p-2 bg-gray-600 border border-gray-600 rounded text-sm">
                        <option v-for="forma in formasDisponiveis" :key="forma" :value="forma">{{ forma }}</option>
                    </select>
                    
                    <input type="number" v-model.number="novoPagamento.valor" min="0" step="0.01"
                        placeholder="Valor a Pagar"
                        class="w-2/5 p-2 bg-gray-600 border border-gray-600 rounded text-sm">
                    
                    <button @click="adicionarPagamento" :disabled="novoPagamento.valor <= 0 || valorRestante < 0"
                        class="w-1/4 bg-green-600 p-2 rounded text-sm hover:bg-green-500 disabled:opacity-50 transition">
                        <i class="fi fi-rr-plus"></i>
                    </button>
                </div>
                
                <div v-if="pagamentosAtuais.length > 0" class="mt-4 pt-3 border-t border-gray-600 space-y-1">
                    <p class="text-sm text-gray-400">Pagamentos a registrar:</p>
                    <div v-for="(pag, index) in pagamentosAtuais" :key="index" 
                        class="flex justify-between items-center bg-gray-600 p-2 rounded text-sm">
                        <span class="font-medium">{{ pag.forma }}:</span>
                        <span class="text-yellow-300 font-bold">R$ {{ pag.valor.toFixed(2) }}</span>
                        <button @click="removerPagamento(index)" class="text-red-400 hover:text-red-300 transition">
                            <i class="fi fi-rr-trash text-xs"></i>
                        </button>
                    </div>
                </div>
            </div>

            <button @click="salvarPagamento" :disabled="pagamentosAtuais.length === 0"
                class="w-full py-3 rounded-lg font-semibold transition duration-150 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 cursor-pointer">
                Registrar {{ pagamentosAtuais.length }} Pagamento(s)
            </button>
            <p v-if="podeQuitar" class="text-xs text-green-400 text-center mt-2">O pedido será automaticamente marcado como **CONCLUÍDO**.</p>
        </div>
    </div>
</template>