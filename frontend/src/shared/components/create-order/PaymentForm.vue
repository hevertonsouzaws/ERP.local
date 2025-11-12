<script setup lang="ts">
import { ref } from 'vue';
import { type PaymentFormLogic } from '@/shared/helpers/create-order/paymentFormLogic.helper';
import {
    formatCurrency,
    formatNumberAsCurrency,
    processCurrencyInput
} from '@/shared/helpers/currency.helper';

const props = defineProps<{
    paymentLogica: PaymentFormLogic;
}>();

const novoPagamentoValorFormatado = ref(formatNumberAsCurrency(props.paymentLogica.novoPagamento.value.valor));

const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement;

    const { numericValue, formattedValue } = processCurrencyInput(target.value);

    props.paymentLogica.novoPagamento.value.valor = numericValue;

    novoPagamentoValorFormatado.value = formattedValue;

    let valueLength = target.value.replace(/\D/g, '').length;
    let diff = formattedValue.length - valueLength;
    let newCursorPos = (target.selectionStart || 0) + diff;

    requestAnimationFrame(() => {
        target.setSelectionRange(newCursorPos, newCursorPos);
    });
};

const formatOnBlur = () => {
    novoPagamentoValorFormatado.value = formatNumberAsCurrency(props.paymentLogica.novoPagamento.value.valor);
};

const formatarMoeda = formatCurrency;
</script>

<template>
    <div class="space-y-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
        <h3 class="font-bold flex items-center text-lg border-b border-gray-700 pb-2">
            <i class="fi fi-rr-money-bill-wave mr-2"></i> Resumo e Pagamento
        </h3>

        <div class="space-y-2 text-sm">
            <div class="flex justify-between items-center text-gray-300">
                <span>Total dos Itens:</span>
                <span class="text-lg">{{ formatarMoeda(paymentLogica.valorTotalPedido.value) }}</span>
            </div>

            <div class="flex justify-between items-center text-green-400">
                <span>Total Pago:</span>
                <span>{{ formatarMoeda(paymentLogica.valorTotalPago.value) }}</span>
            </div>

            <div class="flex justify-between items-center pt-2 border-t border-gray-700"
                :class="{ 'text-red-500': paymentLogica.valorRestante.value > 0, 'text-green-500': paymentLogica.valorRestante.value <= 0 }">
                <span class="font-semibold text-lg">Restante a Pagar:</span>
                <span class="font-semibold text-xl">{{ formatarMoeda(paymentLogica.valorRestante.value) }}</span>
            </div>
        </div>

        <div class="pt-3 border-t border-gray-700 space-y-3">
            <h4 class="font-semibold">Adicionar Pagamento:</h4>

            <div class="flex space-x-2">
                <select v-model="paymentLogica.novoPagamento.value.forma"
                    class="w-2/5 p-2 bg-gray-800 border border-gray-600 rounded text-sm">
                    <option v-for="forma in paymentLogica.formasDisponiveis" :key="forma" :value="forma">
                        {{ forma }}
                    </option>
                </select>

                <input type="text" :value="novoPagamentoValorFormatado" @input="handleInput" @blur="formatOnBlur"
                    @focus="($event.target as HTMLInputElement)?.select()"
                    class="flex-1 p-2 bg-gray-800 border border-gray-600 rounded text-sm text-right w-full"
                    inputmode="decimal">

                <button @click="paymentLogica.adicionarPagamento"
                    :disabled="paymentLogica.novoPagamento.value.valor <= 0"
                    class="w-1/4 bg-green-600 p-2 rounded text-sm hover:bg-green-700 disabled:opacity-50 transition cursor-pointer">
                    Adicionar
                </button>
            </div>
        </div>

        <div class="pt-3 border-t border-gray-700 space-y-2">
            <h4 class="font-semibold text-gray-200">Pagamentos:</h4>
            <div v-if="paymentLogica.pagamentosRegistrados.value.length === 0" class="text-gray-500 text-sm italic">
                Nenhum pagamento registrado.
            </div>
            <ul class="space-y-1">
                <li v-for="(pagamento, index) in paymentLogica.pagamentosRegistrados.value" :key="index"
                    class="flex justify-between items-center bg-gray-700 p-2 rounded text-xs">
                    <span class="text-gray-300">{{ pagamento.forma }}</span>
                    <div class="flex items-center">
                        <span class="font-semibold text-green-400 mr-3">{{ formatarMoeda(pagamento.valor) }}</span>
                        <button @click="paymentLogica.removerPagamento(index)"
                            class="text-red-400 hover:text-red-300 transition">
                            <i class="fi fi-rr-trash text-sm"></i>
                        </button>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>