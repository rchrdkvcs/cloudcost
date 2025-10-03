<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { h, resolveComponent } from "vue";
import type { Column } from "@tanstack/vue-table";

const UButton = resolveComponent("UButton");

const tuyau = useTuyau();
const { data } = await tuyau.$route("pricing").$get({
  query: {
    cpu: 4,
    ramGb: 16,
  },
});

const columns: TableColumn<any>[] = [
  {
    accessorKey: "provider",
    header: ({ column }) => getHeader(column, "Provider"),
    enableGrouping: true,
  },
  {
    accessorKey: "name",
    header: ({ column }) => getHeader(column, "Serveur"),
  },
  {
    accessorKey: "region",
    header: ({ column }) => getHeader(column, "Région"),
  },
  {
    accessorKey: "storageGb",
    header: ({ column }) => getHeader(column, "Stockage"),
  },
  {
    accessorKey: "cpu",
    header: ({ column }) => getHeader(column, "CPU"),
  },
  {
    accessorKey: "ramGb",
    header: ({ column }) => getHeader(column, "RAM"),
  },
  {
    accessorKey: "priceHourly",
    header: ({ column }) => getHeader(column, "Prix / heure"),
  },
  {
    accessorKey: "priceMonthly",
    header: ({ column }) => getHeader(column, "Prix / mois"),
  },
];
function getHeader(column: Column<any>, label: string) {
  return h(UButton, {
    color: "neutral",
    variant: "ghost",
    label: `${label}`,
    icon:
      column.getIsSorted() === "asc"
        ? "lucide:arrow-up-narrow-wide"
        : column.getIsSorted() === "desc"
          ? "lucide:arrow-down-wide-narrow"
          : "lucide:arrow-down-up",
    onClick: () => column.toggleSorting(),
  });
}
function printPage() {
  window.print();
}
</script>

<template>
  <UContainer class="py-4 flex justify-between">
    <h1 class="text-xl font-semibold">Détails de la comparaison</h1>
    <UButton
      icon="i-lucide-download"
      size="md"
      color="primary"
      variant="solid"
      @click="printPage"
      >Exporter en PDF</UButton
    >
  </UContainer>

  <UContainer class="py-4">
    <UTable
      ref="table"
      :data="data?.plans ?? []"
      :columns="columns"
      class="mt-4 rounded-lg border border-default bg-muted"
    />
  </UContainer>
</template>
