<script setup lang="ts">
const data = ref([
  {
    Serveur: "4600",
    CPU: "2024-03-11T15:30:00",
    RAM: "paid",
    Bandwith: "james.anderson@example.com",
    Region: 594,
    OS: Linux,
    Type: VM,
    Stockage: 1tb,
    Prix Mensuel: 100€,
    Prix horaire: 0.01€,
    Type d instance: Partagé,
  },
  {
    Serveur: "4600",
    CPU: "2024-03-11T15:30:00",
    RAM: "paid",
    Bandwith: "james.anderson@example.com",
    Region: 594,
  },
  {
    Serveur: "4600",
    CPU: "2024-03-11T15:30:00",
    RAM: "paid",
    Bandwith: "james.anderson@example.com",
    Region: 594,
  },
  {
    Serveur: "4600",
    CPU: "2024-03-11T15:30:00",
    RAM: "paid",
    Bandwith: "james.anderson@example.com",
    Region: 594,
  },
  {
    Serveur: "4600",
    CPU: "2024-03-11T15:30:00",
    RAM: "paid",
    Bandwith: "james.anderson@example.com",
    Region: 594,
  },
]);
</script>

<template>
  <UTable :data="data" class="flex-1" />
</template>
