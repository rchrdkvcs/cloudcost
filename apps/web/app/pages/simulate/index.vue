<script setup lang="ts">
import { ref, computed } from "vue";
const router = useRouter();

type ProviderType = "VM" | "Container" | "Serverless";

const operatingSystems = [
  "Ubuntu 22.04",
  "Debian 12",
  "AlmaLinux 9",
  "RockyLinux 9",
  "Windows Server 2022",
] as const;

const regions = ["ams3", "nyc3", "fra1", "lon1", "sfo3"] as const;

const form = ref({
  name: "s-4vcpu-8gb",
  region: "ams3",
  os: "Ubuntu 22.04" as (typeof operatingSystems)[number],
  cpu: 4,
  ram_gb: 8,
  storage_gb: 160,
  bandwidth_tb: 5,
  bandwidth_mbps: 100,
  price_monthly: 48,
  price_hourly: 0.07143,
  price_target: 0,
  instance_class: "partagé" as "dédié" | "partagé" | "host dédié",
  type: "VM" as ProviderType,
});

const errors = ref<Record<string, string>>({});
const submitted = ref(false);

function validate() {
  errors.value = {};
  if (!form.value.name) errors.value.name = "Nom requis";
  if (!form.value.region) errors.value.region = "Région requise";
  if (!form.value.os) errors.value.os = "OS requis";
  if (form.value.cpu <= 0) errors.value.cpu = "CPU > 0 requis";
  if (form.value.ram_gb <= 0) errors.value.ram_gb = "RAM > 0 requise";
  if (form.value.storage_gb < 0)
    errors.value.storage_gb = "Stockage >= 0 requis";
  if (form.value.bandwidth_tb < 0)
    errors.value.bandwidth_tb = "Bande passante >= 0 requise";
  if (form.value.bandwidth_mbps < 0)
    errors.value.bandwidth_mbps = "Débit Mbps >= 0 requis";
  if (form.value.price_monthly < 0)
    errors.value.price_monthly = "Prix mensuel >= 0 requis";
  if (form.value.price_hourly < 0)
    errors.value.price_hourly = "Prix horaire >= 0 requis";
  if (form.value.price_target < 0)
    errors.value.price_target = "Budget (€/mois) >= 0 requis";
  if (!form.value.instance_class)
    errors.value.instance_class = "Type d'instance requis";
  if (!form.value.type) errors.value.type = "Type requis";
  return Object.keys(errors.value).length === 0;
}

const priceHourlyHint = computed(() =>
  form.value.price_hourly > 0
    ? `~ ${(form.value.price_hourly * 730).toFixed(2)} €/mois`
    : "",
);

function onSubmit(e: Event) {
  e.preventDefault();
  submitted.value = true;
  if (!validate()) return;
  const data = encodeURIComponent(JSON.stringify(form.value));
  router.push({ path: '/compare', query: { data } });
}
</script>

<template>
  <div class="max-w-3xl mx-auto p-6">
    <h1 class="text-2xl font-semibold mb-4">Comparer le coût: Configuration</h1>

    <form class="space-y-4" @submit="onSubmit">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1"
            >Système d'exploitation (OS)</label
          >
          <select v-model="form.os" class="w-full border rounded px-3 py-2">
            <option disabled value="">Sélectionner</option>
            <option v-for="os in operatingSystems" :key="os" :value="os">
              {{ os }}
            </option>
          </select>
          <p v-if="submitted && errors.os" class="text-red-600 text-sm mt-1">
            {{ errors.os }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Nom de l’offre</label>
          <UInput v-model="form.name" placeholder="ex: s-4vcpu-8gb" />
          <p v-if="submitted && errors.name" class="text-red-600 text-sm mt-1">
            {{ errors.name }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Région</label>
          <select v-model="form.region" class="w-full border rounded px-3 py-2">
            <option disabled value="">Sélectionner</option>
            <option v-for="r in regions" :key="r" :value="r">{{ r }}</option>
          </select>
          <p
            v-if="submitted && errors.region"
            class="text-red-600 text-sm mt-1"
          >
            {{ errors.region }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Type</label>
          <select v-model="form.type" class="w-full border rounded px-3 py-2">
            <option disabled value="">Sélectionner</option>
            <option value="VM">VM</option>
            <option value="Container">Container</option>
            <option value="Serverless">Serverless</option>
          </select>
          <p v-if="submitted && errors.type" class="text-red-600 text-sm mt-1">
            {{ errors.type }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">CPU (vCPU)</label>
          <UInput type="number" v-model.number="form.cpu" min="1" />
          <p v-if="submitted && errors.cpu" class="text-red-600 text-sm mt-1">
            {{ errors.cpu }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">RAM (GB)</label>
          <UInput type="number" v-model.number="form.ram_gb" step="1" min="1" />
          <p
            v-if="submitted && errors.ram_gb"
            class="text-red-600 text-sm mt-1"
          >
            {{ errors.ram_gb }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Stockage (GB)</label>
          <UInput
            type="number"
            v-model.number="form.storage_gb"
            step="10"
            min="0"
          />
          <p
            v-if="submitted && errors.storage_gb"
            class="text-red-600 text-sm mt-1"
          >
            {{ errors.storage_gb }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1"
            >Bande passante (TB)</label
          >
          <UInput
            type="number"
            v-model.number="form.bandwidth_tb"
            step="0.5"
            min="0"
          />
          <p
            v-if="submitted && errors.bandwidth_tb"
            class="text-red-600 text-sm mt-1"
          >
            {{ errors.bandwidth_tb }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1"
            >Bande passante (Mbps)</label
          >
          <UInput
            type="number"
            v-model.number="form.bandwidth_mbps"
            step="10"
            min="0"
          />
          <p
            v-if="submitted && errors.bandwidth_mbps"
            class="text-red-600 text-sm mt-1"
          >
            {{ errors.bandwidth_mbps }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Prix mensuel (€)</label>
          <UInput
            type="number"
            v-model.number="form.price_monthly"
            step="0.01"
            min="0"
          />
          <p
            v-if="submitted && errors.price_monthly"
            class="text-red-600 text-sm mt-1"
          >
            {{ errors.price_monthly }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Prix horaire (€)</label>
          <UInput
            type="number"
            v-model.number="form.price_hourly"
            step="0.00001"
            min="0"
          />
          <p v-if="priceHourlyHint" class="text-xs text-gray-500 mt-1">
            {{ priceHourlyHint }}
          </p>
          <p
            v-if="submitted && errors.price_hourly"
            class="text-red-600 text-sm mt-1"
          >
            {{ errors.price_hourly }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1"
            >Budget cible (€/mois)</label
          >
          <UInput
            type="number"
            v-model.number="form.price_target"
            step="0.01"
            min="0"
          />
          <p
            v-if="submitted && errors.price_target"
            class="text-red-600 text-sm mt-1"
          >
            {{ errors.price_target }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Type d'instance</label>
          <select
            v-model="form.instance_class"
            class="w-full border rounded px-3 py-2"
          >
            <option value="partagé">Partagé</option>
            <option value="dédié">Dédié</option>
            <option value="host dédié">Host dédié</option>
          </select>
          <p
            v-if="submitted && errors.instance_class"
            class="text-red-600 text-sm mt-1"
          >
            {{ errors.instance_class }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3 pt-2">
        <UButton type="submit" color="primary" label="Comparer" />
        <UButton
          variant="soft"
          color="neutral"
          label="Réinitialiser"
          @click.prevent="
            submitted = false;
            errors = {};
            form = {
              ...form,
              name: 's-4vcpu-8gb',
              region: 'ams3',
              os: 'Ubuntu 22.04',
              cpu: 4,
              ram_gb: 8,
              storage_gb: 160,
              bandwidth_tb: 5,
              bandwidth_mbps: 100,
              price_monthly: 48,
              price_hourly: 0.07143,
              price_target: 0,
              instance_class: 'partagé',
              type: 'VM',
            };
          "
        />
      </div>
    </form>

    <div class="mt-6">
      <h2 class="text-lg font-medium mb-2">Aperçu</h2>
      <pre class="bg-gray-50 p-3 rounded border text-sm overflow-x-auto">{{
        form
      }}</pre>
    </div>
  </div>
</template>
