<script setup lang="ts">
import type { Pedido, PedidoStatus } from '@/shared/types/pedido.type';
import { formatarDataParaExibicao } from '@/shared/helpers/data.helper';
import { computed } from 'vue';

const props = defineProps<{
    pedido: Pedido;
}>();

const emit = defineEmits(['change-status', 'open-payment-modal']);

const getStatusClass = (status: PedidoStatus) => {
    switch (status) {
        case 'PENDENTE': return 'border-2 border-yellow-400 text-yellow-200 bg-yellow-900/20';
        case 'CONCLUIDO': return 'border-2 border-green-400 text-green-200 bg-green-900/20';
        case 'CANCELADO': return 'border-2 border-red-600 text-red-200 bg-red-900/20';
    }
}

const valorRestante = computed(() => props.pedido.valor - props.pedido.valorPago);

const emitirMudarStatus = (novoStatus: PedidoStatus) => {
    emit('change-status', props.pedido, novoStatus);
}

const emitirAbrirPagamento = () => {
    emit('open-payment-modal', props.pedido);
}
</script>

<template>
    <div 
        class="p-5 bg-gray-700 rounded-lg shadow-md transition duration-150 w-[32%] h-auto"
    >
        <div class="flex justify-between items-start border-b border-gray-600 pb-3 mb-3">
            <div class="flex items-center">
                <i class="fi fi-rr-user text-blue-400 mr-2"></i>
                <p class="font-semibold text-base text-white">{{ pedido.clienteNome }}</p>
            </div>
            <span :class="['text-xs font-semibold py-0.5 px-2 rounded-full uppercase', getStatusClass(pedido.status)]">
                {{ pedido.status }}
            </span>
        </div>

        <div class="flex justify-between items-center mb-2">
            <div>
                <p class="font-semibold text-base">{{ formatarDataParaExibicao(pedido.dataEntrega) }} <span v-if="pedido.horarioEntrega">({{ pedido.horarioEntrega }})</span></p>
            </div>
            <div class="text-right">
                <p class="font-bold text-base text-white">Total: R$ {{ pedido.valor.toFixed(2) }}</p>
                <p class="text-sm font-semibold" 
                    :class="valorRestante <= 0 ? 'text-green-400' : 'text-red-400'">
                    Pago: R$ {{ pedido.valorPago.toFixed(2) }}
                </p>
            </div>
        </div>
        
        <div class="h-[110px] overflow-y-auto border-t border-b border-gray-600 rounded-lg p-2 mb-3">
            <p class="text-gray-300 text-sm italic">{{ pedido.descricao }}</p>
        </div>

        <div class="pt-2 flex justify-end gap-2">
            <button 
                v-if="valorRestante > 0 && pedido.status !== 'CANCELADO' && pedido.status !== 'CONCLUIDO'"
                @click="emitirAbrirPagamento"
                class="py-1 px-3 rounded-lg text-sm transition duration-150 bg-yellow-600 hover:bg-yellow-500 text-white font-semibold flex items-center"
            >
                <i class="fi fi-rr-coins mr-1"></i> Receber
            </button>

            <button 
                @click="emitirMudarStatus('PENDENTE')" 
                :disabled="pedido.status === 'PENDENTE'"
                class="py-1 px-3 rounded-lg text-sm transition duration-150"
                :class="[pedido.status === 'PENDENTE' ? 'bg-gray-600 text-gray-200 cursor-not-allowed' : 'border-2 border-yellow-600 hover:bg-yellow-600 text-white']"
            >
                <i class="fi fi-rr-clock mr-1"></i> Pendente
            </button>

            <button 
                @click="emitirMudarStatus('CONCLUIDO')" 
                :disabled="pedido.status === 'CONCLUIDO'"
                class="py-1 px-3 rounded-lg text-sm transition duration-150"
                :class="[pedido.status === 'CONCLUIDO' ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'border-2 border-green-600 hover:bg-green-800 text-white']"
            >
                <i class="fi fi-rr-check-circle mr-1"></i> Concluir
            </button>
        </div>
    </div>
</template>