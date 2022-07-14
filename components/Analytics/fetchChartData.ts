import { Metaverse } from '../../lib/metaverse'

export interface ChartInfo {
  data: number
  time: string
}

export interface RichList {
  topOne: { owner: string; parcels: number }[]
  parcelsOwnByTopOne: number
  totalParcels: number
  pctParcels: number
  pctParcelsWithOwners: number
}

export const fetchChartData = async (metaverse: Metaverse, route: string) => {
  const response = await fetch(
    'https://services.itrmachines.com/val-analytics/' +
      route +
      '?metaverse=' +
      metaverse
  )
  const data = (await response.json()) as ChartInfo[] | number | RichList
  return data
}
