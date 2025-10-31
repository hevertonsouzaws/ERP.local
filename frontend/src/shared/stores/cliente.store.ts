import { defineStore } from "pinia";
import { ref, toRaw } from "vue";
import { db } from "../services/Database/Database";
import type { Cliente } from "../types/cliente.type";
import { toCaps, formatarTelefone } from "@/shared/helpers/data.helper";
import { generateUUID } from "../helpers/uuid.helper";

export const useClienteStore = defineStore('clientes', () => {
    const clientes = ref<Cliente[]>([]);
    const carregando = ref(false);

    async function carregarClientes() {
        try {
            // Note que clientes agora é Table<Cliente, string>
            clientes.value = await db.clientes.toArray();
            carregando.value = true;
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
        }
    }

    async function adicionarCliente(novoClienteData: Omit<Cliente, 'uuid'>): Promise<string | undefined> {
        try {
            const clienteParaSalvar: Cliente = {
                ...toRaw(novoClienteData),
                uuid: generateUUID(), // GERAÇÃO DO UUID
                nome: toCaps(novoClienteData.nome),
                telefone: novoClienteData.telefone ? formatarTelefone(novoClienteData.telefone) : '',
            };

            const uuid = await db.clientes.add(clienteParaSalvar);
            await carregarClientes();
            return uuid;

        } catch (error) {
            console.error('Erro ao adicionar cliente ao Dexie:', error);
        }
    }


    async function atualizarCliente(uuid: string, dados: { nome: string; telefone: string}) {
        try {
            await db.clientes.update(uuid, dados); 
            await carregarClientes();
        } catch (error) {
            console.error(`Erro ao atualizar cliente ${uuid}:`, error)
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