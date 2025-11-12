<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Pedido } from '@/shared/types/order.type';
import { showToast } from '@/shared/helpers/toastState';
import { generateWhatsAppComanda } from '@/shared/helpers/orderComanda.helper';
import { formatarDataParaExibicao, formatarTelefone } from '../helpers/data.helper';

const props = defineProps<{
    pedido: Pedido;
}>();

const telefoneDestino = ref(props.pedido.clienteTelefone || '');
const emailDestino = ref(props.pedido.clienteEmail || '');

watch(() => props.pedido, () => {
    telefoneDestino.value = formatarTelefone(props.pedido.clienteTelefone) || '';
    emailDestino.value = props.pedido.clienteEmail || '';
}, { immediate: true });

const sendComandaToWhatsApp = () => {
    const telefone = telefoneDestino.value.replace(/\D/g, '');

    if (!telefone) {
        showToast('Por favor, digite um número de válido.', 'error');
        return;
    }

    const mensagemComanda = generateWhatsAppComanda(props.pedido);
    const encodedMessage = encodeURIComponent(mensagemComanda);

    const whatsappLink = `https://wa.me/${telefone}?text=${encodedMessage}`;
    window.open(whatsappLink, '_blank');
};

const sendComandaToGmailWeb = () => {
    const email = emailDestino.value.trim();

    if (!email || !email.includes('@')) {
        showToast('Por favor, digite um endereço de e-mail válido.', 'error');
        return;
    }

    const numeroPedido = props.pedido.uuid.substring(0, 8).toUpperCase();
    const assunto = encodeURIComponent(`Comanda de Pedido #${numeroPedido}`);

    const mensagemComanda = generateWhatsAppComanda(props.pedido);

    const corpoEmail = encodeURIComponent(mensagemComanda);

    const gmailLink = `https://mail.google.com/mail/u/0/?view=cm&fs=1&to=${email}&su=${assunto}&body=${corpoEmail}`;
    window.open(gmailLink, '_blank');
};
</script>

<template>
    <div class="bg-gray-900 border border-gray-500 p-6 rounded-lg shadow-xl space-y-4">
        <h3 class="text-2xl font-bold text-white border-b border-gray-600 pb-3">
            Comanda do Pedido #{{ pedido.uuid.substring(0, 8).toUpperCase() }}
        </h3>

        <p class="text-gray-200">
            <span class="font-semibold text-gray-200">Cliente:</span> {{ pedido.clienteNome }} {{
                formatarTelefone(pedido.clienteTelefone) }}
        </p>
        <p class="text-gray-200">
            <span class="font-semibold text-gray-200">Entrega:</span> {{ formatarDataParaExibicao(pedido.dataEntrega) }}
            {{ pedido.horarioEntrega || 'sem horário' }}
        </p>

        <div class="space-y-2">
            <label for="whatsapp-telefone" class="block text-base font-medium text-gray-300">
                <i class="fi fi-rr-circle-phone mr-2 text-lg text-green-400"></i><span class="">Telefone do
                    Cliente</span>
            </label>
            <div class="flex flex-col lg:flex-row gap-5">
                <input id="whatsapp-telefone" v-model="telefoneDestino" type="tel" placeholder="Ex: 11 987654321"
                    class="w-full px-3 py-2 bg-gray-800 border border-gray-500 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500"
                    required>
                <button @click="sendComandaToWhatsApp" :disabled="telefoneDestino.length < 10"
                    class="w-full px-4 py-3 bg-gray-900 border text-white font-semibold rounded-lg hover:bg-green-800 hover:border-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed">
                    Enviar por WhatsApp
                </button>
            </div>
        </div>

        <div class="space-y-2 pt-4 border-t border-gray-600">
            <label for="email-destino" class="block text-base font-medium text-gray-300">
                <i class="fi fi-rr-envelope mr-1 text-red-500"></i> E-mail de Destino
            </label>
            <div class="flex flex-col lg:flex-row gap-5">
                <input id="email-destino" v-model="emailDestino" type="email" placeholder="nome@exemplo.com"
                    class="w-full px-3 py-2 bg-gray-800 border border-gray-500 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500"
                    required>
                <button @click="sendComandaToGmailWeb" :disabled="!emailDestino.includes('@')"
                    class="w-full px-4 py-3 bg-gray-900 border text-white font-semibold rounded-lg hover:bg-red-800 transition disabled:opacity-50 disabled:cursor-not-allowed">
                    Enviar por e-mail
                </button>
            </div>
        </div>
    </div>
</template>