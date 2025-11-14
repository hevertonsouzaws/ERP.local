import { defineStore } from "pinia";
import { ref } from "vue";
import type { User, LoginSession } from "../types/user.type";
import { useUserStore } from "./user.store";
import { generateUUID } from "../helpers/uuid.helper";
import { getDataHoraHojeString } from "../helpers/data.helper";
import type { PersistedStateOptions } from "pinia-plugin-persistedstate";
import { db } from "../services/Database/Database"; 

export const useAuthLogStore = defineStore('auth-log', () => {
    const userStore = useUserStore();
    
    const currentSession = ref<LoginSession | null>(null);
    
    const sessionLogs = ref<LoginSession[]>([]); 

    async function loadSessionLogs() {
        try {
            sessionLogs.value = await db.loginSessions.orderBy('loginTime').reverse().toArray();
        } catch (error) {
            console.error("Erro ao carregar logs de sessão do banco de dados:", error);
            sessionLogs.value = [];
        }
    }

    async function login(user: User) {
        if (currentSession.value) {
            await logout(); 
        }

        const newSession: LoginSession = {
            uuid: generateUUID(),
            userUuid: user.uuid,
            userName: user.name,
            loginTime: getDataHoraHojeString(),
            logoutTime: null, 
        }

        currentSession.value = newSession;
        userStore.setCurrentUser(user);

        try {
            await db.loginSessions.add(newSession);
            sessionLogs.value.unshift(newSession); 
        } catch (error) {
            console.error("Erro ao salvar log de login no Dexie:", error);
        }
    }

    async function logout() {
        if (currentSession.value) {
            const logoutTime = getDataHoraHojeString();
            
            try {
                await db.loginSessions.update(currentSession.value.uuid, { logoutTime });
            } catch (error) {
                console.error("Erro ao atualizar log de logout no Dexie:", error);
            }

            currentSession.value.logoutTime = logoutTime;
            
            const index = sessionLogs.value.findIndex(log => log.uuid === currentSession.value!.uuid);
            if (index !== -1) {
                sessionLogs.value[index] = { ...currentSession.value };
            }

            currentSession.value = null;
            userStore.clearCurrentUser();
        }
    }

    return {
        currentSession,
        sessionLogs,
        login,
        logout,
        loadSessionLogs 
    };
}, {
    ...( {
        persist: {
            storage: localStorage,
            paths: ['currentSession'],
        },
    } as const as { persist: PersistedStateOptions } )
});