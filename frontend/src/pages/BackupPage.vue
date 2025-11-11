<script setup lang="ts">
import { ref } from 'vue';
import {
    exportarBackupClientes,
    exportarBackupPedidos,
    importarBackupClientes,
    importarBackupPedidos
} from '@/shared/helpers/backup.helper';
import { usePedidoStore } from '@/shared/stores/pedido.store';
import { useClienteStore } from '@/shared/stores/cliente.store';
import { showToast } from '@/shared/helpers/toastState';

const isLoading = ref(false);
const message = ref('');

const pedidoStore = usePedidoStore();
const clienteStore = useClienteStore();

const handleExportarClientes = async () => {
    isLoading.value = true;
    message.value = '';
    try {
        await exportarBackupClientes();
        message.value = 'Backup de CLIENTES criado e download iniciado com sucesso!';
    } catch (error: any) {
        message.value = `Erro ao exportar CLIENTES: ${error.message}`;
    } finally {
        isLoading.value = false;
    }
};

const handleExportarPedidos = async () => {
    isLoading.value = true;
    message.value = '';
    try {
        await exportarBackupPedidos();
        message.value = 'Backup de PEDIDOS criado e download iniciado com sucesso!';
    } catch (error: any) {
        message.value = `Erro ao exportar PEDIDOS: ${error.message}`;
    } finally {
        isLoading.value = false;
    }
};

const handleImportarClientes = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) return;
    if (!confirm('ATENÇÃO: A importação de CLIENTES irá MESCLAR os dados atuais. Clientes do arquivo com ID existente serão ATUALIZADOS. Novos clientes serão ADICIONADOS. Continuar?')) {
        target.value = ''; return;
    }

    isLoading.value = true;
    message.value = '';

    try {
        await importarBackupClientes(file);
        await clienteStore.carregarClientes();
        message.value = 'CLIENTES mesclados e restaurados com sucesso!';
    } catch (error: any) {
        message.value = `Erro ao importar CLIENTES: ${error.message || 'Arquivo inválido.'}`;
    } finally {
        isLoading.value = false;
        target.value = '';
    }
};

const handleImportarPedidos = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) return;

    isLoading.value = true;
    message.value = '';

    try {
        await importarBackupPedidos(file);
        await pedidoStore.carregarPedidos();
        message.value = 'PEDIDOS mesclados e restaurados com sucesso!';
    } catch (error: any) {
        message.value = `Erro ao importar PEDIDOS: ${error.message || 'Arquivo inválido.'}`;
    } finally {
        isLoading.value = false;
        target.value = '';
    }
};
</script>

<template>
    <div class="text-white p-8 w-full lg:max-w-[80%] m-auto">
        <div class="flex flex-col items-center justify-between border border-gray-500 mb-5 p-5 rounded-lg w-full">
            <h1 class="text-2xl mb-4 flex items-center">
                <i class="fi fi-rr-cloud text-3xl mr-3"></i>Backup e Restauração
            </h1>
            <div class="text-base  bg-green-950 rounded-xl w-full xl:w-[50%]">
                <h1 class="p-2 flex items-center justify-center">
                    <i class="fi fi-rr-info text-2xl mr-3"></i>
                    Esta área foi criada para recuperar dados baixados do nosso sistema.
                </h1>
            </div>
        </div>

        <div class="p-6 rounded-lg shadow-2xl space-y-8 border border-gray-500">
            <p class="text-gray-200 text-base">
                Como fazer: 1° ao final do dia clique em <span class="text-purple-400">"Baixar Clientes"</span>, 2°
                Clique
                em <span class="text-yellow-400">"Baixar Pedidos"</span> isso irá gerar dois arquivos. Após isso importe
                e
                restaure
                primeiro, o arquivo de clientes e depois o arquivo de pedidos.
            </p>
            <div class="flex space-x-4">
                <div class="p-8 rounded-lg w-1/2 border border-gray-500">
                    <h2 class="text-xl font-bold mb-4 flex items-center text-gray-200"><i
                            class="fi fi-rr-download mr-2"></i> Exportar Clientes</h2>
                    <button @click="handleExportarClientes" :disabled="isLoading"
                        class="w-full py-2 border border-gray-500 rounded-lg font-semibold transition hover:bg-purple-900 hover:border-purple-900   disabled:opacity-50">
                        Baixar Clientes
                    </button>
                </div>
                <div class="p-8 rounded-lg w-1/2 border border-gray-500">
                    <h2 class="text-xl font-bold mb-4 flex items-center text-gray-200"><i
                            class="fi fi-rr-download mr-2"></i> Exportar Pedidos</h2>
                    <button @click="handleExportarPedidos" :disabled="isLoading"
                        class="w-full py-2 border border-gray-500 rounded-lg font-semibold transition hover:bg-yellow-600  hover:border-yellow-600 disabled:opacity-50">
                        Baixar Pedidos
                    </button>
                </div>
            </div>

            <div class="flex space-x-4">
                <div class="p-8 rounded-lg flex flex-col justify-center items-left w-full border border-gray-500">
                    <h2 class="text-xl font-bold mb-4 text-gray-200"><i
                            class="fi fi-rr-upload mr-2"></i> 1.Importar Clientes</h2>
                    <input type="file" accept=".json" @change="handleImportarClientes" :disabled="isLoading"
                        class="block w-full text-sm text-white file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-800 file:text-white hover:file:bg-green-600 disabled:opacity-50 cursor-pointer">
                </div>
                <div class="p-8 rounded-lg flex flex-col justify-center items-left w-full border border-gray-500">
                    <h2 class="text-xl font-bold mb-4 flex items-center text-gray-200"><i
                            class="fi fi-rr-upload mr-2"></i> 2.Importar Pedidos</h2>
                    <input type="file" accept=".json" @change="handleImportarPedidos" :disabled="isLoading"
                        class="block w-full text-sm text-white file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-800 file:text-white hover:file:bg-green-600 disabled:opacity-50 cursor-pointer">
                </div>
            </div>

            <p v-if="message" class="mt-4 p-3 rounded-lg text-center"
                :class="{ 'bg-green-800 text-green-200': message.includes('sucesso'), 'bg-red-800 text-red-200': message.includes('Erro') }">
                {{ message }}
            </p>
        </div>
    </div>
</template>