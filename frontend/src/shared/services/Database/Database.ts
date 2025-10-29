import Dexie, { type Table } from "dexie";
import type { Cliente } from "@/shared/types/cliente.type";
import type { Pedido } from "@/shared/types/pedido.type";
import type { Metrica } from "@/shared/types/metrica.type";

export class AppDB extends Dexie {
    clientes!: Table<Cliente>;
    pedidos!: Table<Pedido>;
    metricas!: Table<Metrica>;

    constructor() {
        super('SistemaComandasLocalDB');
        this.version(1).stores({
            clientes: '++id, nome', 
            pedidos: '++id, clienteId, dataEntrega, status, dataCriacao', 
            metricas: '&mesAno', 
        });
    }
}

export const db = new AppDB();