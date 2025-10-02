import CloudPlan from '#prices/models/cloud_plan'

export type CloudPlanType = 'VM' | 'Serverless' | 'Static' | 'Container'
export type OperatingSystem = 'Linux' | 'Windows' | 'All'

export interface CloudPlanDto {
  provider: string
  name: string
  region: string
  operating_system?: OperatingSystem
  cpu: number
  ram_gb: number
  storage_gb?: number
  bandwidth_tb?: number
  price_hourly: number
  price_monthly: number
  type: CloudPlanType
}

export interface FetchOptions {
  providers?: string[]
  regions?: string[]
  operatingSystem?: OperatingSystem
  instanceTypes?: string[]
  minCpu?: number
  maxCpu?: number
  minRam?: number
  maxRam?: number
  includeGpu?: boolean
}

export default class PricingService {
  /**
   * Récupère les plans depuis la base de données
   */
  public async getPlans(options: FetchOptions = {}): Promise<CloudPlan[]> {
    const { providers, regions, minCpu, maxCpu, minRam, maxRam } = options

    const query = CloudPlan.query()

    if (providers && providers.length > 0) {
      query.whereIn('provider', providers)
    }

    if (regions && regions.length > 0) {
      query.whereIn('region', regions)
    }

    if (minCpu !== undefined) {
      query.where('cpu', '>=', minCpu)
    }

    if (maxCpu !== undefined) {
      query.where('cpu', '<=', maxCpu)
    }

    if (minRam !== undefined) {
      query.where('ram_gb', '>=', minRam)
    }

    if (maxRam !== undefined) {
      query.where('ram_gb', '<=', maxRam)
    }

    return await query.exec()
  }

  /**
   * Récupère les plans depuis les APIs externes (utilisé par la commande sync:pricing)
   */
  public async fetchAll(options: FetchOptions = {}): Promise<CloudPlanDto[]> {
    const {
      providers = ['AWS', 'DigitalOcean', 'Hetzner', 'Scaleway', 'Azure'],
      regions,
      operatingSystem = 'Linux',
      instanceTypes,
      minCpu,
      maxCpu,
      minRam,
      maxRam,
      includeGpu = false,
    } = options

    const promises: Promise<CloudPlanDto[]>[] = []

    if (providers.includes('AWS')) {
      promises.push(
        this.fetchAWS({
          regions,
          operatingSystem,
          instanceTypes,
        })
      )
    }

    if (providers.includes('DigitalOcean')) {
      promises.push(
        this.fetchDigitalOcean({
          includeGpu,
        })
      )
    }

    if (providers.includes('Hetzner')) {
      promises.push(this.fetchHetzner())
    }

    if (providers.includes('Scaleway')) {
      promises.push(
        this.fetchScaleway({
          regions,
          includeGpu,
        })
      )
    }

    if (providers.includes('Azure')) {
      promises.push(
        this.fetchAzure({
          regions,
          operatingSystem,
        })
      )
    }

    const results = await Promise.all(promises)
    let plans = results.flat()

    // Filtrer par CPU et RAM
    if (minCpu !== undefined) {
      plans = plans.filter((plan) => plan.cpu >= minCpu)
    }
    if (maxCpu !== undefined) {
      plans = plans.filter((plan) => plan.cpu <= maxCpu)
    }
    if (minRam !== undefined) {
      plans = plans.filter((plan) => plan.ram_gb >= minRam)
    }
    if (maxRam !== undefined) {
      plans = plans.filter((plan) => plan.ram_gb <= maxRam)
    }

    return plans
  }

  /** ================= AWS ================= */
  private async fetchAWS(
    options: {
      regions?: string[]
      operatingSystem?: OperatingSystem
      instanceTypes?: string[]
    } = {}
  ): Promise<CloudPlanDto[]> {
    try {
      const { regions, operatingSystem = 'All', instanceTypes } = options

      // Principales régions AWS si aucune spécifiée
      const targetRegions = regions || [
        'us-east-1',
        'us-west-2',
        'eu-west-1',
        'eu-central-1',
        'ap-southeast-1',
        'ap-northeast-1',
      ]

      // Instances par défaut si aucune spécifiée
      const allowedInstances = instanceTypes || [
        't3.micro',
        't3.small',
        't3.medium',
        't3.large',
        't3.xlarge',
        't3.2xlarge',
        'm5.large',
        'm5.xlarge',
        'm5.2xlarge',
        'm5.4xlarge',
        'c5.large',
        'c5.xlarge',
        'c5.2xlarge',
        'c5.4xlarge',
      ]

      const allResults: CloudPlanDto[] = []

      // Récupérer pour chaque région
      for (const region of targetRegions) {
        try {
          const regionUrl = `https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonEC2/current/${region}/index.json`
          const res = await fetch(regionUrl)
          const data = (await res.json()) as any

          // Traiter les deux OS si operatingSystem === 'All'
          const osToFetch: OperatingSystem[] =
            operatingSystem === 'All' ? ['Linux', 'Windows'] : [operatingSystem]

          for (const os of osToFetch) {
            for (const product of Object.values<any>(data.products || {})) {
              if (product.productFamily === 'Compute Instance') {
                const attrs = product.attributes
                const instanceType = attrs.instanceType

                // Filtrer par instance type
                if (!instanceType || !allowedInstances.includes(instanceType)) {
                  continue
                }

                // Filtrer par OS
                const osMatches =
                  (os === 'Linux' && attrs.operatingSystem === 'Linux') ||
                  (os === 'Windows' && attrs.operatingSystem === 'Windows')

                if (!osMatches || attrs.tenancy !== 'Shared' || attrs.preInstalledSw !== 'NA') {
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
                    allResults.push({
                      provider: 'AWS',
                      name: instanceType,
                      region: attrs.regionCode || region,
                      operating_system: os,
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
          }
        } catch (error) {
          console.error(`Error fetching AWS pricing for region ${region}:`, error)
        }
      }

      return allResults
    } catch (error) {
      console.error('Error fetching AWS pricing:', error)
      return []
    }
  }

  /** ================= DigitalOcean ================= */
  private async fetchDigitalOcean(options: { includeGpu?: boolean } = {}): Promise<CloudPlanDto[]> {
    try {
      const { includeGpu = false } = options
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
      const results: CloudPlanDto[] = []

      // Filtrer les tailles disponibles
      const sizes = (data.sizes || []).filter((size: any) => {
        if (!size.available) return false
        if (!includeGpu && size.slug.includes('gpu')) return false
        return true
      })

      // Créer un plan pour chaque combinaison taille + région
      for (const size of sizes) {
        const regions = size.regions || ['nyc1']

        for (const region of regions) {
          results.push({
            provider: 'DigitalOcean',
            name: size.slug,
            region,
            operating_system: 'Linux',
            cpu: size.vcpus,
            ram_gb: size.memory / 1024,
            storage_gb: size.disk,
            bandwidth_tb: size.transfer,
            price_monthly: size.price_monthly,
            price_hourly: size.price_hourly,
            type: 'VM' as const,
          })
        }
      }

      return results
    } catch (error) {
      console.error('Error fetching DigitalOcean pricing:', error)
      return []
    }
  }

  /** ================= Hetzner ================= */
  private async fetchHetzner(): Promise<CloudPlanDto[]> {
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
        .filter((plan: CloudPlanDto) => plan.price_hourly > 0)
    } catch (error) {
      console.error('Error fetching Hetzner pricing:', error)
      return []
    }
  }

  /** ================= Scaleway ================= */
  private async fetchScaleway(
    options: {
      regions?: string[]
      includeGpu?: boolean
    } = {}
  ): Promise<CloudPlanDto[]> {
    try {
      const { regions, includeGpu = false } = options

      // Principales zones Scaleway si aucune spécifiée
      const zones = regions || ['fr-par-1', 'fr-par-2', 'nl-ams-1', 'pl-waw-1']

      const allResults: CloudPlanDto[] = []

      for (const zone of zones) {
        try {
          const url = `https://api.scaleway.com/instance/v1/zones/${zone}/products/servers`
          const res = await fetch(url)

          if (!res.ok) {
            console.error(`Scaleway API error for zone ${zone}:`, res.status, res.statusText)
            continue
          }

          const data = (await res.json()) as any

          for (const [name, server] of Object.entries<any>(data.servers || {})) {
            if (!includeGpu && server.arch?.includes('arm')) continue

            const cpu = Number(server.ncpus) || 0
            const ramGb = server.ram ? Number(server.ram) / (1024 * 1024 * 1024) : 0
            const storageGb = server.volumes_constraint?.max_size
              ? Number(server.volumes_constraint.max_size) / (1024 * 1024 * 1024)
              : undefined
            const priceHourly = Number(server.hourly_price) || 0
            const priceMonthly = Number(server.monthly_price) || 0

            if (priceHourly > 0 && cpu > 0 && ramGb > 0) {
              allResults.push({
                provider: 'Scaleway',
                name,
                region: zone,
                operating_system: 'Linux',
                cpu,
                ram_gb: ramGb,
                storage_gb: storageGb,
                price_hourly: priceHourly,
                price_monthly: priceMonthly,
                type: 'VM',
              })
            }
          }
        } catch (error) {
          console.error(`Error fetching Scaleway pricing for zone ${zone}:`, error)
        }
      }

      return allResults
    } catch (error) {
      console.error('Error fetching Scaleway pricing:', error)
      return []
    }
  }

  /** ================= Azure ================= */
  private async fetchAzure(
    options: {
      regions?: string[]
      operatingSystem?: OperatingSystem
    } = {}
  ): Promise<CloudPlanDto[]> {
    try {
      const { regions, operatingSystem = 'All' } = options

      // Principales régions Azure si aucune spécifiée
      const targetRegions = regions || ['eastus', 'westeurope', 'southeastasia']

      // Traiter les deux OS si operatingSystem === 'All'
      const osToFetch: OperatingSystem[] =
        operatingSystem === 'All' ? ['Linux', 'Windows'] : [operatingSystem]

      const allResults: CloudPlanDto[] = []

      for (const region of targetRegions) {
        for (const os of osToFetch) {
          try {
            // API de base - filtrage OS fait en post-traitement
            const priceUrl = `https://prices.azure.com/api/retail/prices?$filter=serviceName eq 'Virtual Machines' and priceType eq 'Consumption' and armRegionName eq '${region}'`
            const priceRes = await fetch(priceUrl)

            if (!priceRes.ok) {
              console.error(
                `Azure pricing API error for region ${region}:`,
                priceRes.status,
                priceRes.statusText
              )
              continue
            }

            const data = (await priceRes.json()) as any

            const plans = (data.Items || [])
              .filter((item: any) => {
                if (!item.productName?.includes('Virtual Machines')) return false
                if (!item.skuName) return false
                if (item.skuName.includes('Low Priority')) return false

                // Filtrer par OS
                if (os === 'Linux' && item.skuName.includes('Windows')) return false
                if (os === 'Windows' && !item.skuName.includes('Windows')) return false

                return true
              })
              .slice(0, 50)
              .map((item: any) => {
                const match = item.armSkuName?.match(/Standard_([A-Z])(\d+)/)
                const cpu = match ? Number.parseInt(match[2], 10) : 1
                const ramGb = cpu * 4 // Estimation

                return {
                  provider: 'Azure',
                  name: item.armSkuName || item.skuName,
                  region: item.armRegionName || region,
                  operating_system: os,
                  cpu,
                  ram_gb: ramGb,
                  price_hourly: item.retailPrice || 0,
                  price_monthly: (item.retailPrice || 0) * 730,
                  type: 'VM' as const,
                }
              })
              .filter((plan: CloudPlanDto) => plan.price_hourly > 0)

            allResults.push(...plans)
          } catch (error) {
            console.error(`Error fetching Azure pricing for region ${region} and OS ${os}:`, error)
          }
        }
      }

      return allResults
    } catch (error) {
      console.error('Error fetching Azure pricing:', error)
      return []
    }
  }
}
