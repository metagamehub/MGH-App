export interface TopSellingDataTable {
  asset: string,
  date: string,
  external_link: string,
  from: string,
  to: string,
  image: string,
  owner: string,
  price: string,
  symbol: string
  landId: number,
  coords: {
    x: number,
    y: number
  }
}

export interface TopSellingRequestItem {
  position: any,
  dataTable: TopSellingDataTable,
}

export interface TopSellings{
  totalTop: {}[],
  yesterdayTop: {}[],
  monthTop: {}[],
  yearTop: {}[]
}