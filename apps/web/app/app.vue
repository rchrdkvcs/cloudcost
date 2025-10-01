<script setup lang="ts">
const tuyau = useTuyau();
const { data } = await tuyau.$route("health").$get();

console.log(data?.hello);
</script>

<template>
  <UApp>
    <h1 class="text-3xl font-bold underline">Hello world!</h1>

    <UButton label="Click me" />
  </UApp>
</template>
