export type CloudProvider =
  | 'AWS'
  | 'DigitalOcean'
  | 'GCP'
  | 'Azure'
  | 'Hetzner'
  | 'Scaleway'
  | 'OVH'
  | 'Linode'
export type CloudPlanType = 'VM' | 'Serverless' | 'Static' | 'Container'

export interface CloudPlan {
  provider: CloudProvider
  name: string
  region: string
  cpu: number
  ram_gb: number
  storage_gb?: number
  bandwidth_tb?: number
  price_hourly: number
  price_monthly: number
  type: CloudPlanType
}

export default class PricingService {
  public async fetchAll(): Promise<CloudPlan[]> {
    const [aws, digitalocean, hetzner, scaleway, azure] = await Promise.all([
      this.fetchAWS(),
      this.fetchDigitalOcean(),
      this.fetchHetzner(),
      this.fetchScaleway(),
      this.fetchAzure(),
    ])

    return [...aws, ...digitalocean, ...hetzner, ...scaleway, ...azure]
  }

  /** ================= AWS ================= */
  private async fetchAWS(): Promise<CloudPlan[]> {
    try {
      // Limiter à une région pour simplifier (us-east-1)
      const regionUrl =
        'https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonEC2/current/us-east-1/index.json'
      const res = await fetch(regionUrl)
      const data = (await res.json()) as any

      const results: CloudPlan[] = []

      // Filtrer uniquement les instances les plus courantes
      const allowedInstances = [
        // T3 (burstable, économique)
        't3.micro',
        't3.small',
        't3.medium',
        't3.large',
        't3.xlarge',
        't3.2xlarge',
        // M5 (usage général)
        'm5.large',
        'm5.xlarge',
        'm5.2xlarge',
        'm5.4xlarge',
        // C5 (compute optimized)
        'c5.large',
        'c5.xlarge',
        'c5.2xlarge',
        'c5.4xlarge',
      ]

      for (const product of Object.values<any>(data.products || {})) {
        if (product.productFamily === 'Compute Instance') {
          const attrs = product.attributes
          const instanceType = attrs.instanceType

          // Filtrer par liste exacte d'instances
          if (
            !instanceType ||
            !allowedInstances.includes(instanceType) ||
            attrs.operatingSystem !== 'Linux' ||
            attrs.tenancy !== 'Shared' ||
            attrs.preInstalledSw !== 'NA'
          ) {
            continue
          }

          const cpu = attrs.vcpu ? Number.parseInt(attrs.vcpu, 10) : undefined
          const ramGb = attrs.memory
            ? Number.parseFloat(attrs.memory.replace(/ GiB/, ''))
            : undefined

          if (cpu && ramGb) {
            let priceHourly: number | undefined
            const sku = product.sku
            const terms = data.terms?.OnDemand?.[sku]

            if (terms) {
              const firstTerm = Object.values<any>(terms)[0]
              if (firstTerm?.priceDimensions) {
                const priceDim = Object.values<any>(firstTerm.priceDimensions)[0]
                priceHourly = Number.parseFloat(priceDim.pricePerUnit?.USD || '0')
              }
            }

            if (priceHourly && priceHourly > 0) {
              results.push({
                provider: 'AWS',
                name: instanceType,
                region: attrs.regionCode || 'us-east-1',
                cpu,
                ram_gb: ramGb,
                type: 'VM',
                price_hourly: priceHourly,
                price_monthly: priceHourly * 730,
              })
            }
          }
        }
      }

      return results
    } catch (error) {
      console.error('Error fetching AWS pricing:', error)
      return []
    }
  }

  /** ================= DigitalOcean ================= */
  private async fetchDigitalOcean(): Promise<CloudPlan[]> {
    try {
      const token = process.env.DIGITALOCEAN_API_TOKEN

      if (!token) {
        console.warn('DIGITALOCEAN_API_TOKEN not set, skipping DigitalOcean pricing')
        return []
      }

      const url = 'https://api.digitalocean.com/v2/sizes'
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        console.error('DigitalOcean API error:', res.status, res.statusText)
        return []
      }

      const data = (await res.json()) as any

      return (data.sizes || [])
        .filter((size: any) => size.available && !size.slug.includes('gpu'))
        .map((size: any) => ({
          provider: 'DigitalOcean',
          name: size.slug,
          region: size.regions?.[0] || 'nyc1',
          cpu: size.vcpus,
          ram_gb: size.memory / 1024,
          storage_gb: size.disk,
          bandwidth_tb: size.transfer,
          price_monthly: size.price_monthly,
          price_hourly: size.price_hourly,
          type: 'VM' as const,
        }))
    } catch (error) {
      console.error('Error fetching DigitalOcean pricing:', error)
      return []
    }
  }

  /** ================= Hetzner ================= */
  private async fetchHetzner(): Promise<CloudPlan[]> {
    try {
      const token = process.env.HETZNER_API_TOKEN

      if (!token) {
        console.warn('HETZNER_API_TOKEN not set, skipping Hetzner pricing')
        return []
      }

      const url = 'https://api.hetzner.cloud/v1/server_types'
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        console.error('Hetzner API error:', res.status, res.statusText)
        return []
      }

      const data = (await res.json()) as any

      return (data.server_types || [])
        .filter((type: any) => !type.deprecated)
        .map((type: any) => ({
          provider: 'Hetzner',
          name: type.name,
          region: 'eu-central',
          cpu: type.cores,
          ram_gb: type.memory,
          storage_gb: type.disk,
          price_hourly: type.prices[0]?.price_hourly?.gross
            ? Number.parseFloat(type.prices[0].price_hourly.gross)
            : 0,
          price_monthly: type.prices[0]?.price_monthly?.gross
            ? Number.parseFloat(type.prices[0].price_monthly.gross)
            : 0,
          type: 'VM' as const,
        }))
        .filter((plan: CloudPlan) => plan.price_hourly > 0)
    } catch (error) {
      console.error('Error fetching Hetzner pricing:', error)
      return []
    }
  }

  /** ================= Scaleway ================= */
  private async fetchScaleway(): Promise<CloudPlan[]> {
    try {
      const url = 'https://api.scaleway.com/instance/v1/zones/fr-par-1/products/servers'
      const res = await fetch(url)

      if (!res.ok) {
        console.error('Scaleway API error:', res.status, res.statusText)
        return []
      }

      const data = (await res.json()) as any

      const results: CloudPlan[] = []

      for (const [name, server] of Object.entries<any>(data.servers || {})) {
        if (server.arch?.includes('arm')) continue

        const cpu = Number(server.ncpus) || 0
        const ramGb = server.ram ? Number(server.ram) / (1024 * 1024 * 1024) : 0
        const storageGb = server.volumes_constraint?.max_size
          ? Number(server.volumes_constraint.max_size) / (1024 * 1024 * 1024)
          : undefined
        const priceHourly = Number(server.hourly_price) || 0
        const priceMonthly = Number(server.monthly_price) || 0

        if (priceHourly > 0 && cpu > 0 && ramGb > 0) {
          results.push({
            provider: 'Scaleway',
            name,
            region: 'fr-par-1',
            cpu,
            ram_gb: ramGb,
            storage_gb: storageGb,
            price_hourly: priceHourly,
            price_monthly: priceMonthly,
            type: 'VM',
          })
        }
      }

      return results
    } catch (error) {
      console.error('Error fetching Scaleway pricing:', error)
      return []
    }
  }

  /** ================= Azure ================= */
  private async fetchAzure(): Promise<CloudPlan[]> {
    try {
      // API Retail Prices (publique, pas besoin d'authentification)
      const priceUrl =
        "https://prices.azure.com/api/retail/prices?$filter=serviceName eq 'Virtual Machines' and priceType eq 'Consumption' and armRegionName eq 'eastus'"
      const priceRes = await fetch(priceUrl)

      if (!priceRes.ok) {
        console.error('Azure pricing API error:', priceRes.status, priceRes.statusText)
        return []
      }

      const data = (await priceRes.json()) as any

      return (data.Items || [])
        .filter(
          (item: any) =>
            item.productName?.includes('Virtual Machines') &&
            item.skuName &&
            !item.skuName.includes('Windows') &&
            !item.skuName.includes('Low Priority')
        )
        .slice(0, 50)
        .map((item: any) => {
          const match = item.armSkuName?.match(/Standard_([A-Z])(\d+)/)
          const cpu = match ? Number.parseInt(match[2], 10) : 1
          const ramGb = cpu * 4 // Estimation

          return {
            provider: 'Azure',
            name: item.armSkuName || item.skuName,
            region: item.armRegionName || 'eastus',
            cpu,
            ram_gb: ramGb,
            price_hourly: item.retailPrice || 0,
            price_monthly: (item.retailPrice || 0) * 730,
            type: 'VM' as const,
          }
        })
        .filter((plan: CloudPlan) => plan.price_hourly > 0)
    } catch (error) {
      console.error('Error fetching Azure pricing:', error)
      return []
    }
  }
}
