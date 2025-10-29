<script setup lang="ts">
import _ from 'lodash';
import { ref, onMounted } from 'vue';
import loadEnv from '@/shared/services/config/environment.config';

const shouldShow = ref<boolean>(false);
const env = ref<Environment>('');

onMounted(() => {
  env.value = loadEnv();
  shouldShow.value = !_.isEmpty(env.value);
});
</script>

<template>
  <div
    v-if="shouldShow"
    class="fixed bottom-0 left-0 z-[99999] m-4 bg-blue-100 text-blue-800 font-semibold py-2 px-4 rounded-lg shadow-md border border-blue-200"
  >
    Ambiente de <span class="capitalize">{{ env }}</span>
  </div>
</template>
