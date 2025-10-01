<script setup lang="ts">
const tuyau = useTuyau();
const { data } = await tuyau.$route("health").$get();

console.log(data?.hello);
</script>

<template>
  <NuxtPage> </NuxtPage>
</template>
