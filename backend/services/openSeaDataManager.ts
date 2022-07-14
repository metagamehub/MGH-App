import { Contracts } from '../../lib/contracts'
import { Metaverse } from '../../lib/metaverse'

async function getCollectionStats(collectionName: string) {
  if (collectionName === 'axie-infinity') {
    collectionName = 'axie'
  }
  const data = await fetch(
    `https://api.opensea.io/api/v1/collection/${collectionName}`
  )
  const data_json = await data.json()
  return data_json
}

async function getEthExchangePrice() {
  const data = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=ethereum%2Cthe-sandbox%2Cdecentraland%2Caxie-infinity&vs_currencies=usd`
  )
  const data_json = await data.json()
  return data_json
}

export async function getCollectionData(collectionName: string) {
  if (!collectionName) {
    return {}
  }
  try {
    const collectionData = await getCollectionStats(collectionName)
    return collectionData['collection']['stats']
  } catch (error) {
    console.log('problem getting collection ' + collectionName + ' ', error)
    return {}
  }
}

export async function getETHExchangeValue() {
  try {
    const collectionData = await getEthExchangePrice()
    return collectionData
  } catch (error) {
    console.log('problem getting exchange rate for eth', error)
    return {}
  }
}

export const createOpenSeaLink = (metaverse: Metaverse, landId: string) => {
  if (metaverse === 'axie-infinity') return
  const contracts = {
    decentraland: Contracts.PARCEL.ETHEREUM_MAINNET.address,
    sandbox: Contracts.LAND.ETHEREUM_MAINNET.newAddress,
  }

  return `https://opensea.io/assets/${contracts[metaverse]}/${landId}`
}