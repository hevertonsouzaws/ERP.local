import Dexie, { type Table } from "dexie";
import type { Cliente } from "@/shared/types/cliente.type";
import type { Pedido } from "@/shared/types/pedido.type";
import type { Metrica } from "@/shared/types/metrica.type";
import type { IGarmentType, IService } from "@/shared/types/catalog.type"; 

export class AppDB extends Dexie {
    clientes!: Table<Cliente, string>;
    pedidos!: Table<Pedido, string>;
    metricas!: Table<Metrica, string>;
    garmentTypes!: Table<IGarmentType, string>; 
    services!: Table<IService, string>;

    constructor() {
        super('SistemaComandasLocalDB');
        this.version(5).stores({ 
            clientes: 'uuid, nome, *telefone', 
            pedidos: 'uuid, clienteUuidd, dataEntrega, status', 
            metricas: 'mesAno',
            garmentTypes: 'uuid, name', 
            services: 'uuid, name, price', 
        });
    }
}

export const db = new AppDB();