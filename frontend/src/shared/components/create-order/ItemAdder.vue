<script setup lang="ts">
import { computed, ref } from 'vue'
import { type ItemManagementLogic } from '@/shared/helpers/create-order/itemManagementLogic.helper'

const props = defineProps<{
  itemLogica: ItemManagementLogic
}>()

// Busca dos serviços
const serviceSearch = ref('')

// Forma de ordenação
const serviceSort = ref<'name' | 'priceAsc' | 'priceDesc'>('name')

// Serviços filtrados e ordenados
const filteredServices = computed(() => {
  const search = serviceSearch.value
    .trim()
    .toLocaleLowerCase('pt-BR')

  const services = [...props.itemLogica.services.value].filter((service) =>
    service.name.toLocaleLowerCase('pt-BR').includes(search),
  )

  if (serviceSort.value === 'priceAsc') {
    return services.sort((a, b) => a.defaultPrice - b.defaultPrice)
  }

  if (serviceSort.value === 'priceDesc') {
    return services.sort((a, b) => b.defaultPrice - a.defaultPrice)
  }

  return services.sort((a, b) =>
    a.name.localeCompare(b.name, 'pt-BR', {
      sensitivity: 'base',
    }),
  )
})

// Agrupa visualmente por primeira letra
const groupedServices = computed(() => {
  if (serviceSort.value !== 'name') {
    return [{ letter: '', services: filteredServices.value }]
  }

  const groups: Record<string, typeof filteredServices.value> = {}

  filteredServices.value.forEach((service) => {
    const letter = service.name.charAt(0).toLocaleUpperCase('pt-BR')

    if (!groups[letter]) {
      groups[letter] = []
    }

    groups[letter].push(service)
  })

  return Object.entries(groups).map(([letter, services]) => ({
    letter,
    services,
  }))
})
</script>

<template>
  <div class="space-y-3 p-4 rounded-lg border border-gray-400">

    <!-- TÍTULO -->
    <h3 class="font-bold flex items-center text-lg text-white">
      <i class="fi fi-rr-hanger mr-2"></i>
      Itens do Pedido
    </h3>

    <!-- PASSO 1 -->
    <div class="p-3 rounded-lg space-y-2 border border-gray-500 pb-4">
      <label class="block text-sm font-medium text-gray-200">
        Passo 1: Adicionar Peça
      </label>

      <div class="flex space-x-2">
        <select
          v-model="itemLogica.selectedGarmentTypeUuid.value"
          class="flex-1 p-2 bg-gray-800 border border-gray-600 rounded text-sm"
        >
          <option :value="null" disabled>
            Selecione o Tipo de Peça
          </option>

          <option
            v-for="garment in [...itemLogica.garmentTypes.value].sort((a, b) =>
              a.name.localeCompare(b.name, 'pt-BR', {
                sensitivity: 'base',
              }),
            )"
            :key="garment.uuid"
            :value="garment.uuid"
          >
            {{ garment.name }}
          </option>
        </select>

        <button
          @click="itemLogica.adicionarPecaAoPedido"
          :disabled="!itemLogica.selectedGarmentTypeUuid.value"
          class="w-1/4 bg-purple-600 p-2 rounded text-sm hover:bg-purple-500 disabled:opacity-50 transition"
        >
          Adicionar Peça
        </button>
      </div>

      <p
        v-if="itemLogica.pecaSelecionadaParaServico.value"
        class="text-sm text-white mt-2"
      >
        Peça Ativa:
        <strong class="text-purple-400">
          {{ itemLogica.pecaSelecionadaParaServico.value.garmentName }}
        </strong>.

        Adicione serviços abaixo.

        <button
          @click="itemLogica.pecaSelecionadaParaServico.value = null"
          class="text-xs text-red-400 ml-3 hover:text-red-300"
        >
          Limpar seleção
        </button>
      </p>
    </div>

    <!-- PASSO 2 -->
    <div
      class="p-3 border border-gray-500 rounded-lg space-y-3"
      :class="{
        'opacity-50 pointer-events-none':
          !itemLogica.pecaSelecionadaParaServico.value,
      }"
    >
      <label class="block text-sm font-medium text-gray-200">
        Passo 2: Adicionar Serviço
      </label>

      <!-- BUSCA + ORDENAÇÃO -->
      <div class="flex gap-2">

        <!-- BUSCA -->
        <div class="relative flex-1">
          <i
            class="fi fi-rr-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"
          ></i>

          <input
            v-model="serviceSearch"
            type="text"
            placeholder="Buscar serviço..."
            class="w-full pl-8 pr-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <!-- ORDENAÇÃO -->
        <select
          v-model="serviceSort"
          class="w-48 p-2 bg-gray-800 border border-gray-600 rounded text-sm text-white"
        >
          <option value="name">
            Nome A → Z
          </option>

          <option value="priceAsc">
            Menor preço
          </option>

          <option value="priceDesc">
            Maior preço
          </option>
        </select>
      </div>

      <!-- SELECT DE SERVIÇOS -->
      <div class="relative">
        <select
          v-model="itemLogica.selectedServiceUuid.value"
          class="w-full p-2 bg-gray-800 border border-gray-600 rounded text-sm text-white"
        >
          <option :value="null" disabled>
            Selecione o Serviço
          </option>

          <!-- MODO ALFABÉTICO COM SEÇÕES -->
          <template
            v-for="group in groupedServices"
            :key="group.letter || 'price'"
          >
            <optgroup
              v-if="group.letter"
              :label="`── ${group.letter} ──`"
            >
              <option
                v-for="service in group.services"
                :key="service.uuid"
                :value="service.uuid"
              >
                {{ service.name }} — R$ {{ service.defaultPrice.toFixed(2) }}
              </option>
            </optgroup>

            <!-- MODO POR PREÇO -->
            <template v-else>
              <option
                v-for="service in group.services"
                :key="service.uuid"
                :value="service.uuid"
              >
                {{ service.name }} — R$ {{ service.defaultPrice.toFixed(2) }}
              </option>
            </template>
          </template>

          <option
            v-if="filteredServices.length === 0"
            disabled
          >
            Nenhum serviço encontrado
          </option>
        </select>
      </div>

      <!-- QUANTIDADE + TOTAL + BOTÃO -->
      <div class="flex space-x-2 items-center">

        <input
          type="number"
          v-model.number="itemLogica.itemQuantity.value"
          min="1"
          class="w-1/4 p-2 bg-gray-800 border border-gray-600 rounded text-sm text-center"
        />

        <span
          class="flex-1 text-sm font-semibold text-right text-purple-400"
        >
          Total Serviço:
          R$
          {{ itemLogica.currentItemPrice.value.toFixed(2) }}
        </span>

        <button
          @click="itemLogica.adicionarServicoAItemExistente"
          :disabled="
            !itemLogica.selectedServiceUuid.value ||
            itemLogica.itemQuantity.value <= 0
          "
          class="w-1/4 bg-blue-600 p-2 rounded text-sm hover:bg-blue-500 disabled:opacity-50 transition"
        >
          Adicionar Serviço
        </button>
      </div>
    </div>

    <!-- ITENS DO PEDIDO -->
    <div class="mt-3 max-h-48 overflow-y-auto space-y-2">

      <div
        v-if="itemLogica.itensDoPedido.value.length === 0"
        class="text-gray-500 text-center text-sm p-4"
      >
        Nenhum item adicionado ao pedido.
      </div>

      <div
        v-for="item in itemLogica.itensDoPedido.value"
        :key="item.uuid"
        class="bg-gray-800 p-3 rounded text-sm border-l-4"
        :class="{
          'border-l-purple-500':
            itemLogica.pecaSelecionadaParaServico.value?.uuid === item.uuid,

          'border-l-transparent':
            itemLogica.pecaSelecionadaParaServico.value?.uuid !== item.uuid,
        }"
      >
        <div
          class="flex justify-between items-center font-bold text-base text-gray-200 mb-2"
        >
          <span>
            {{ item.garmentName }}
            (Linha {{ item.lineNumber }})
          </span>

          <div>
            <button
              @click="itemLogica.pecaSelecionadaParaServico.value = item"
              class="text-xs text-purple-300 hover:text-purple-400 mr-2"
            >
              Selecionar para Serviço
            </button>

            <button
              @click="itemLogica.removerItem(item.uuid)"
              class="text-red-400 hover:text-red-300 transition"
            >
              <i class="fi fi-rr-trash text-sm"></i>
            </button>
          </div>
        </div>

        <ul class="ml-2 border-l border-gray-500 pl-3 space-y-1">

          <li
            v-for="servico in item.servicos"
            :key="servico.uuid"
            class="flex justify-between items-center text-white"
          >
            <span class="text-xs">
              {{ servico.quantidade }}x {{ servico.name }}
            </span>

            <div>
              <span class="text-xs font-semibold text-green-400">
                R$
                {{
                  (
                    servico.quantidade * servico.unitPrice
                  ).toFixed(2)
                }}
              </span>

              <button
                @click="
                  itemLogica.removerServico(item.uuid, servico.uuid)
                "
                class="text-red-400 hover:text-red-300 transition ml-2"
              >
                <i class="fi fi-rr-cross-small text-xs"></i>
              </button>
            </div>
          </li>

          <li
            v-if="item.servicos.length === 0"
            class="text-xs italic text-gray-200"
          >
            Nenhum serviço adicionado.
          </li>

        </ul>
      </div>
    </div>
  </div>
</template>