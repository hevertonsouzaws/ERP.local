import Dexie, { type Table } from "dexie";
import type { Cliente } from "@/shared/types/cliente.type";
import type { Pedido } from "@/shared/types/pedido.type";
import type { Metrica } from "@/shared/types/metrica.type";

export class AppDB extends Dexie {
    clientes!: Table<Cliente, string>;
    pedidos!: Table<Pedido, string>;
    metricas!: Table<Metrica, string>;

    constructor() {
        super('SistemaComandasLocalDB');
        this.version(4).stores({ 
            clientes: 'uuid, nome, *telefone', 
            pedidos: 'uuid, clienteUuid, dataEntrega, status', 
            metricas: 'mesAno',
        });
    }
}

export const db = new AppDB();