import { ref, computed, watch } from 'vue';
import { useDraftOrderStore } from '@/shared/stores/draftOrder.store';
import { type FormaPagamento } from '@/shared/types/order.type';
import { FORMAS_PAGAMENTO_DISPONIVEIS } from '@/shared/consts/create-order/paymentOptions.const'; 
import { showToast } from '../toastState';

export function usePaymentFormLogic() {
    const draftStore = useDraftOrderStore();

    const novoPagamento = ref({
        forma: 'DINHEIRO' as FormaPagamento,
        valor: 0,
    });

    const formasDisponiveis = FORMAS_PAGAMENTO_DISPONIVEIS;

    const valorTotalPedido = computed(() => draftStore.valorTotalPedido);
    const valorTotalPago = computed(() => draftStore.valorTotalPago);
    const valorRestante = computed(() => draftStore.valorRestante); 
    const pagamentosRegistrados = computed(() => draftStore.rascunho.pagamentos);

    const novoValorPagamentoSugerido = computed(() => Math.max(0, valorRestante.value));

    const adicionarPagamento = () => {
        const valorPagar = parseFloat(novoPagamento.value.valor.toFixed(2));
        const valorLimite = novoValorPagamentoSugerido.value; 
        if (valorPagar <= 0) {
            showToast('O valor a pagar deve ser maior que zero.', 'warning');
            return;
        }
        
        if (valorPagar > valorLimite) {
            showToast(`O valor a pagar (${valorPagar.toFixed(2)}) não pode ser maior que o restante (${valorLimite.toFixed(2)}).`, 'error');
            novoPagamento.value.valor = valorLimite;
            return; 
        }

        if (valorLimite === 0 && valorPagar > 0) {
            showToast('O pedido já está quitado. Remova um pagamento ou zere o valor a pagar.', 'warning');
            return;
        }
        
        draftStore.addPayment(novoPagamento.value.forma, valorPagar);

        novoPagamento.value.valor = novoValorPagamentoSugerido.value;
    };

    const removerPagamento = (index: number) => {
        draftStore.removePayment(index);
        novoPagamento.value.valor = novoValorPagamentoSugerido.value;
    };

    watch(valorRestante, (novoRestante) => {
        novoPagamento.value.valor = novoRestante;
    }, { immediate: true });

    watch(valorTotalPedido, (novoValor) => {
        if (pagamentosRegistrados.value.length === 0) {
            novoPagamento.value.valor = novoValor;
        }
    }, { immediate: true });


    return {
        formasDisponiveis,
        novoPagamento,
        valorTotalPedido,
        valorTotalPago,
        valorRestante,
        pagamentosRegistrados,
        novoValorPagamentoSugerido,
        adicionarPagamento,
        removerPagamento,
    };
}

export type PaymentFormLogic = ReturnType<typeof usePaymentFormLogic>;