import { defineStore } from "pinia";
import { ref, toRaw } from "vue";
import { db } from "../services/Database/Database";
import type { Cliente } from "../types/cliente.type";
import { toCaps, formatarTelefone } from "@/shared/helpers/data.helper";
import { generateUUID } from "../helpers/uuid.helper";
import { showToast } from "../helpers/toastState";

export const useClienteStore = defineStore('clientes', () => {
    const clientes = ref<Cliente[]>([]);
    const carregando = ref(false);

    async function carregarClientes() {
        try {
            clientes.value = await db.clientes.toArray();
            carregando.value = true;
        } catch (error) {
            showToast('Erro ao carregar clientes:', 'error');
            throw error;
        }
    }

    async function adicionarCliente(novoClienteData: Omit<Cliente, 'uuid'>): Promise<string | undefined> {
        try {
            const clienteParaSalvar: Cliente = {
                ...toRaw(novoClienteData),
                uuid: generateUUID(),
                nome: toCaps(novoClienteData.nome),
                telefone: novoClienteData.telefone ? formatarTelefone(novoClienteData.telefone) : '',
            };

            const uuid = await db.clientes.add(clienteParaSalvar);
            await carregarClientes();
            return uuid;

        } catch (error) {
            showToast('Erro ao adicionar cliente ao Dexie:', 'error');
            throw error;
        }
    }


    async function atualizarCliente(uuid: string, dados: { nome: string; telefone: string }) {
        try {
            await db.clientes.update(uuid, dados);
            await carregarClientes();
        } catch (error) {
            showToast(`Erro ao atualizar cliente ${uuid}:`, 'error');
            throw error;
        }
    }


    return {
        clientes,
        carregando,
        carregarClientes,
        adicionarCliente,
        atualizarCliente,
    };
});