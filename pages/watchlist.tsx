import { NextPage } from 'next'
import Head from 'next/head'
import { AddLandForm, LandList } from '../components/Watchlist'
import { useCallback, useEffect, useState } from 'react'
import {
  LandsKey,
  ICoinPrices,
  IWatchListCard,
} from '../lib/valuation/valuationTypes'
import {
  convertETHPrediction,
  convertMANAPrediction,
  getBoundaryPrices,
  getLandData,
} from '../lib/valuation/valuationUtils'
import { Metaverse } from '../lib/enums'
import {
  addLandToWatchList,
  createUser,
  getUserInfo,
  removeLandFromWatchList,
} from '../lib/FirebaseUtilities'
import { useAppSelector } from '../state/hooks'
import { Contracts } from '../lib/contracts'
import { Fade } from 'react-awesome-reveal'

export type WatchListState =
  | 'loadingFirst'
  | 'loading'
  | 'loaded'
  | 'badQueryId'
  | 'badQueryCoordinates'
  | 'limitIdSandbox'
  | 'limitCoordinatesSandbox'
  | 'limitIdDecentraland'
  | 'limitCoordinatesDecentraland'
  | 'loadingQueryId'
  | 'loadingQueryCoordinates'
  | 'noWallet'
  | 'successId'
  | 'successCoordinates'

const WatchListPage: NextPage<{ prices: ICoinPrices }> = ({ prices }) => {
  const [reFetch, setRefetch] = useState(false)
  const [state, setState] = useState<WatchListState>('loadingFirst')
  const [sandboxLands, setSandboxLands] = useState<IWatchListCard[]>([])
  const [decentralandLands, setDecentralandLands] = useState<IWatchListCard[]>(
    []
  )
  const [ids, setIds] = useState<string[]>([])
  const { address } = useAppSelector((state) => state.account)

  // Creating object so we don't have to do 10000 if statements
  const landOptions = {
    // LAND contract address might have to be changed once Sandbox && OpenSea finish migration
    sandbox: {
      contract: Contracts.LAND.ETHEREUM_MAINNET.newAddress,
      firebase: 'sandbox-watchlist',
      landList: sandboxLands,
      setList: setSandboxLands,
      limitIdState: 'limitIdSandbox',
      limitCoordinatesState: 'limitCoordinatesSandbox',
      convert: convertETHPrediction,
    },
    decentraland: {
      contract: Contracts.PARCEL.ETHEREUM_MAINNET.address,
      firebase: 'decentraland-watchlist',
      landList: decentralandLands,
      setList: setDecentralandLands,
      limitIdState: 'limitIdDecentraland',
      limitCoordinatesState: 'limitCoordinatesDecentraland',
      convert: convertMANAPrediction,
    },
  }

  // Creating Array for looping through Metaverses Options
  const landKeys = Object.keys(landOptions) as LandsKey[]

  const addToWatchList = async (
    metaverse: Metaverse,
    landId?: string,
    coordinates?: { X: string; Y: string }
  ) => {
    // If Sandbox or Decentraland limit give Feedback to user
    if (landOptions[metaverse].landList.length === 10) {
      landId && setState(landOptions[metaverse].limitIdState as WatchListState)
      coordinates &&
        setState(landOptions[metaverse].limitCoordinatesState as WatchListState)
      return setTimeout(() => {
        // Retrigger useEffect
        setState('loaded')
      }, 2000)
    }

    if (address) {
      landId && setState('loadingQueryId')
      coordinates && setState('loadingQueryCoordinates')
      // Checking whether land exists
      const landData = await getLandData(metaverse, landId, coordinates)
      // If Land returns a result from our API
      if (landData.name) {
        // Adding Land to Database
        await addLandToWatchList(landData.tokenId, address, metaverse)
        // Giving Feedback to user for Good Query
        landId && setState('successId')
        coordinates && setState('successCoordinates')
        setTimeout(() => {
          // Retrigger useEffect
          setRefetch(!reFetch)
        }, 1100)
      } else {
        landId && setState('badQueryId')
        coordinates && setState('badQueryCoordinates')
        return setTimeout(() => {
          // Retrigger useEffect
          setState('loaded')
        }, 2000)
      }
    }
  }

  const removeFromWatchList = useCallback(
    async (landId: string, metaverse: Metaverse) => {
      // Removing Land from Database
      await removeLandFromWatchList(landId, address!, metaverse)
      let filteredLands = landOptions[metaverse].landList.filter((land) => {
        return land.apiData?.tokenId !== landId
      })
      // Updating Lands for selected Metaverse
      landOptions[metaverse].setList(filteredLands)

      // Updating Ids
      setIds((previous) => previous.filter((id) => id !== landId))
    },
    [sandboxLands, decentralandLands]
  )

  useEffect(() => {
    const getLands = async () => {
      try {
        // getting user watchlist data
        const userData = await getUserInfo(address!)
        // If no User Data but user is logged in create them a watchlist
        if (!userData) {
          setState('loaded')
          return await createUser(address!)
        }

        userData &&
          (await Promise.all(
            landKeys.map(async (landKey) => {
              await Promise.all(
                // Mapping through all Assets in Watchlist from User
                userData[landOptions[landKey].firebase].map(
                  async (land: string) => {
                    // If we already fetched Item, do not refetch it
                    if (!ids.includes(land)) {
                      // Retrieving Data from our API for each Asset
                      const landData = await getLandData(
                        landKey as Metaverse,
                        land
                      )
                      // Retrieving data from OpenSea (Comes in ETH)
                      const res = await fetch(
                        `/api/fetchSingleAsset/${landOptions[landKey].contract}/${landData.tokenId}`
                      )

                      // Retrieving Latest Orders for each Asset
                      const orders = (await res.json()).orders
                      // Getting Current Price for each Asset
                      const result = getBoundaryPrices(orders)
                      // Formatting Price to USD
                      const currentPriceUSD = Number(
                        (result.current_price! * prices.ethereum.usd).toFixed(2)
                      )
                      // Converting Predictions
                      const predictions = landOptions[landKey].convert(
                        prices,
                        landData.prices.predicted_price
                      )
                      // Creating FormattedLand Instance
                      const formattedLand = {
                        apiData: landData,
                        predictions: predictions,
                        currentPrice: currentPriceUSD,
                      }
                      // Pushing it to State Array
                      landOptions[landKey].setList((previous) => [
                        formattedLand,
                        ...previous,
                      ])
                      setIds((previous) => [
                        ...previous,
                        formattedLand.apiData.tokenId,
                      ])
                    }
                  }
                )
              )
            })
          ))
        setState('loaded')
      } catch (e) {
        console.log(e)
      }
    }

    if (address) {
      if (state === 'noWallet') {
        setState('loadingFirst')
      } else if (state !== 'loadingFirst') {
        setState('loading')
      }
      getLands()
    } else {
      landKeys.map((landKey) => {
        landOptions[landKey].setList([])
      })
      setIds([])
      setState('noWallet')
    }
  }, [reFetch, address])

  return (
    <>
      <Head>
        <title>MGH - Watchlist</title>
        <meta
          name='description'
          content='Governance of metaverse related items, fair valuation and minting of NFT backed tokens and provision of metaverse market data.'
        />
      </Head>
      <section className='pt-12 xl:pt-0 animate-fade-in-slow flex flex-col items-center max-w-3xl text-white w-full'>
        {/* Title */}
        <div className='sm:gray-box mb-8'>
          <h1 className='md:text-5xl lg:text-6xl text-4xl green-text-gradient'>Your Watchlist</h1>
        </div>
        {/* Add Land Form */}
        <AddLandForm
          landKeys={landKeys}
          ids={ids}
          state={state}
          addToWatchList={addToWatchList}
        />
        {/* Lands List */}
        {ids.length > 0 &&
          state !== 'loadingFirst' &&
          landKeys.map(
            (key) =>
              landOptions[key].landList.length > 0 && (
                <article key={key} className='mb-8 w-full'>
                  <Fade>
                    <h3 className='gray-box xs:w-[22rem] sm:w-fit mx-auto  sm:ml-0 green-text-gradient mb-4'>
                      {key.toUpperCase()}
                    </h3>
                  </Fade>
                  <LandList
                    lands={landOptions[key].landList}
                    removeFromWatchList={removeFromWatchList}
                  />
                </article>
              )
          )}
      </section>
    </>
  )
}

export async function getServerSideProps() {
  const coin = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=ethereum%2Cthe-sandbox%2Cdecentraland&vs_currencies=usd'
  )
  const prices: ICoinPrices = await coin.json()

  return {
    props: {
      prices,
    },
  }
}
export default WatchListPage
