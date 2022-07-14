import React, { useEffect, useState } from 'react'
import { NextPage } from 'next'
import Head from 'next/head'
import 'animate.css'
import { HiOutlineSearch } from 'react-icons/hi'
import { BsQuestionCircle } from 'react-icons/bs'
import Link from 'next/link'
import { IAPIData, IPredictions } from '../lib/types'
import FloorPriceTracker from '../components/Valuation/FloorPriceTracker'
import SalesVolumeDaily from '../components/Valuation/SalesVolumeDaily'
import { MostUnderValuedLand } from '../components/Valuation'
import { convertETHPrediction } from '../lib/valuation/valuationUtils'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import { Metaverse } from '../lib/metaverse'
const FloorAndVolumeChart = dynamic(
  () => import('../components/Valuation/FloorAndVolumeChart'),
  {
    ssr: false,
  }
)

const ValuationPage: NextPage = ({ prices }: any) => {
  const { query } = useRouter()
  const [apiData, setAPIData] = useState<IAPIData>()
  const [predictions, setPredictions] = useState<IPredictions>()

  const [idProcessing, setIdProcessing] = useState(false)
  const [coordinatesProcessing, setCoordinatesProcessing] = useState(false)
  const [showCard, setShowCard] = useState(false)
  const [idError, setIdError] = useState('')
  const [coordinatesError, setCoordinatesError] = useState('')
  const [tokenId, setTokenId] = useState('')
  const [comingFromLink, setComingFromLink] = useState<Boolean>()

  const [metaverse, setMetaverse] = useState<Metaverse>('sandbox')

  const handleAPIData = (data: any) => {
    setAPIData(data)

    const ethPrediction = data.prices.eth_predicted_price
    const predictions = convertETHPrediction(
      prices,
      ethPrediction,
      data.metaverse
    )
    setPredictions(predictions)

    setShowCard(true)
  }

  const handleCoordinatesSubmit = async (ev: any) => {
    ev.preventDefault()

    const X = (document.getElementById('X') as HTMLInputElement).value
    const Y = (document.getElementById('Y') as HTMLInputElement).value

    setCoordinatesProcessing(true)

    try {
      const res = await fetch('/api/getLandData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ X: X, Y: Y, metaverse: metaverse }),
      })
      const data = await res.json()
      if (data.err) {
        setCoordinatesError("LAND doesn't exist")
        setShowCard(false)
      } else {
        handleAPIData(data)
      }

      setCoordinatesProcessing(false)
    } catch (e) {
      setCoordinatesError('Something went wrong, please try again later')
      setShowCard(false)
      setCoordinatesProcessing(false)
    }
  }

  const handleIDSubmit = async (
    ev?: React.FormEvent<HTMLFormElement>,
    fromQuery?: boolean
  ) => {
    console.log('handling')
    ev?.preventDefault()
    console.log('passed prevent')
    setIdProcessing(true)
    console.log('passed ID Processing')

    const tokenID = fromQuery ? query.land : tokenId
    const chosenMetaverse = fromQuery ? query.metaverse : metaverse
    try {
      const res = await fetch('/api/getLandData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tokenID: tokenID, metaverse: chosenMetaverse }),
      })
      const data = await res.json()
      if (data.err) {
        setIdError("LAND doesn't exist")
        setShowCard(false)
      } else {
        handleAPIData(data)
      }

      setIdProcessing(false)
    } catch (e) {
      setIdError('Something went wrong, please try again later')
      setShowCard(false)
      setIdProcessing(false)
    }
  }

  useEffect(() => {
    if (comingFromLink === false) return
    if (!query.land || !query.metaverse) return
    // If coming from Outside Link then show land in link
    handleIDSubmit(undefined, true)
    // Change this to not retrigger
    setComingFromLink(false)
  }, [query])

  return (
    <>
      <Head>
        <title>MGH - LAND valuation</title>
        <meta
          name='description'
          content='Governance of metaverse related items, fair valuation and minting of NFT backed tokens and provision of metaverse market data.'
        />
      </Head>

      <div className='w-full flex flex-col items-center xs:w-[22rem] sm:w-full justify-start space-y-10 max-w-4xl mt-8 xl:mt-0'>
        Main Header
        <div className='gray-box flex flex-col sm:flex-row justify-between items-center'>
          <h1 className='text-transparent bg-clip-text lg:text-5xl text-3xl bg-gradient-to-br from-blue-500 via-green-400 to-green-500 pb-0 sm:pb-2'>
            LAND Valuation
          </h1>
          {/* Watchlist and Portfolio Button's wrapper */}
          <div className='flex space-x-5 mt-5 sm:mt-0'>
            {/* Portfolio */}
            <Link href={'/portfolio'}>
              <a className='hover:scale-105 font-medium text-white px-5 py-3 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/30 to-green-500/30 transition-all duration-300'>
                <span className='pt-1 text-xl'>Portfolio</span>
              </a>
            </Link>
            {/*  Watchlist */}
            <Link href={'/watchlist'}>
              <a className='hover:scale-105 font-medium text-white px-5 py-3 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/30 to-green-500/30 transition duration-300'>
                <span className='pt-1 text-xl'>Watchlist</span>
              </a>
            </Link>
          </div>
        </div>
        {/* Metaverse Form and ScoreBox Wrapper */}
        <div className='flex flex-col sm:flex-row space-y-5 sm:space-y-0 space-x-0 sm:space-x-5 md:space-x-10 items-stretch justify-between w-full'>
          {/* Left Side */}
          <div className='flex flex-col w-full gap-10'>
            {/* Choose Metaverse */}
            <div className='flex flex-col items-start gray-box text-left'>
              <p className='font-medium text-gray-300 mb-3 pl-1'>
                Choose Metaverse
              </p>

              <div className='flex space-x-5'>
                <div
                  onClick={() => setMetaverse('sandbox')}
                  className={`flex flex-col items-center justify-center space-y-2 rounded-xl cursor-pointer p-2 px-3 pt-4 w-24 md:w-30 h-24 md:h-30 group focus:outline-none ${
                    metaverse === 'sandbox'
                      ? 'border-opacity-100 text-gray-200'
                      : 'border-opacity-40 hover:border-opacity-100 text-gray-400 hover:text-gray-200'
                  } border border-gray-400 focus:border-opacity-100 transition duration-300 ease-in-out`}
                >
                  <img
                    src='/images/the-sandbox-sand-logo.png'
                    className={`h-12 md:h-14 ${
                      metaverse === 'sandbox' ? 'grayscale-0' : 'grayscale'
                    } group-hover:grayscale-0 transition duration-300 ease-in-out`}
                  />
                  <p className='font-medium text-xs md:text-sm pt-1'>Sandbox</p>
                </div>
                <div
                  onClick={() => setMetaverse('decentraland')}
                  className={`flex flex-col items-center justify-center space-y-2 rounded-xl cursor-pointer p-2 px-3 pt-4 w-24 md:w-30 h-24 md:h-30 group focus:outline-none ${
                    metaverse === 'decentraland'
                      ? 'border-opacity-100 text-gray-200'
                      : 'text-gray-400 hover:text-gray-200 border-opacity-40 hover:border-opacity-100'
                  } border border-gray-400 focus:border-opacity-100 transition duration-300 ease-in-out`}
                >
                  <img
                    src='/images/decentraland-mana-logo.png'
                    className={`h-12 md:h-14 ${
                      metaverse === 'decentraland' ? 'grayscale-0' : 'grayscale'
                    } group-hover:grayscale-0 transition duration-300 ease-in-out`}
                  />
                  <p className='font-medium text-xs md:text-sm pt-1'>
                    Decentraland
                  </p>
                </div>
                <div
                  onClick={() => setMetaverse('axie-infinity')}
                  className={`flex flex-col items-center justify-center space-y-2 rounded-xl cursor-pointer p-2 px-3 pt-4 w-24 md:w-30 h-24 md:h-30 group focus:outline-none ${
                    metaverse === 'axie-infinity'
                      ? 'border-opacity-100 text-gray-200'
                      : 'text-gray-400 hover:text-gray-200 border-opacity-40 hover:border-opacity-100'
                  } border border-gray-400 focus:border-opacity-100 transition duration-300 ease-in-out`}
                >
                  <img
                    src='/images/axie-infinity-axs-logo.png'
                    className={`h-12 md:h-14 ${
                      metaverse === 'axie-infinity'
                        ? 'grayscale-0'
                        : 'grayscale'
                    } group-hover:grayscale-0 transition duration-300 ease-in-out`}
                  />
                  <p className='font-medium text-xs md:text-sm pt-1'>
                    Axie Infinity
                  </p>
                </div>
              </div>
            </div>

            {/* Valuation Form */}
            <div className='flex flex-col items-start gray-box'>
              {/* Find by Token ID */}
              <div className='relative flex flex-wrap items-center mb-3 pl-1 text-left w-full max-w-sm'>
                <p className='font-medium text-gray-300'>Find by Token ID</p>
                <BsQuestionCircle className='text-gray-300 cursor-pointer peer ml-3 -mt-1' />
                <p className='absolute -top-7 -left-6 xs:left-0 pl-2 px-2 py-1 rounded-lg bg-black bg-opacity-10 backdrop-filter backdrop-blur font-medium text-xs text-gray-400 hidden peer-hover:block w-70'>
                  Find LAND on Opensea &gt; Details &gt; Token ID
                </p>
              </div>
              <form
                onSubmit={handleIDSubmit}
                onInput={() => {
                  setIdError('')
                  setCoordinatesError('')
                }}
                className='relative flex items-stretch justify-between space-x-3 lg:space-x-5 w-full rounded-xl max-w-sm'
              >
                <input
                  required
                  id='tokenID'
                  value={tokenId}
                  onChange={(e) => setTokenId(e.target.value)}
                  type='text'
                  placeholder='e.g. 72792'
                  className={`bg-transparent w-full text-white font-medium p-4 focus:outline-none border border-white/40 hover:border-white/100 focus:border-white/100 ${
                    idError && 'border-red-500/100'
                  } transition duration-300 ease-in-out rounded-xl placeholder-white placeholder-opacity-75`}
                />

                <button
                  type='submit'
                  className='flex flex-none items-center justify-around bg-gray-200 hover:bg-white transition ease-in-out duration-500 rounded-xl m-1 ml-2 lg:ml-1 shadow-dark hover:shadow-button w-12 xs:w-16 sm:w-12 lg:w-28'
                >
                  <svg
                    className={`${
                      idProcessing ? 'block' : 'hidden'
                    } animate-spin-slow h-6 w-6 border-4 border-t-gray-300 border-l-gray-300 border-gray-800 rounded-full " viewBox="0 0 24 24`}
                  />
                  <span className='text-black font-medium pt-1 hidden lg:block'>
                    Search
                  </span>
                  <HiOutlineSearch
                    className={`${
                      idProcessing ? 'hidden' : 'block'
                    } lg:hidden text-2xl`}
                  />
                </button>
              </form>
              <p className='font-medium text-xs text-red-500 mt-1 pl-2 text-left w-full max-w-sm'>
                {idError}
              </p>

              {/* Find by Coordinatess */}
              <p className='font-medium  text-gray-300 mb-3 pl-1 text-left w-full max-w-sm mt-8'>
                Find by Coordinates
              </p>
              <form
                onSubmit={handleCoordinatesSubmit}
                onInput={() => {
                  setIdError('')
                  setCoordinatesError('')
                }}
                className='relative flex items-stretch justify-between space-x-3 lg:space-x-5 w-full rounded-xl max-w-sm'
              >
                <input
                  required
                  id='X'
                  type='text'
                  placeholder='X'
                  className={`bg-transparent w-full text-white font-medium p-4 focus:outline-none border border-white/40 hover:border-white/100 focus:border-white/100 ${
                    idError && 'border-red-500/100'
                  } transition duration-300 ease-in-out rounded-xl placeholder-white placeholder-opacity-75`}
                />
                <input
                  required
                  id='Y'
                  type='text'
                  placeholder='Y'
                  className={`bg-transparent w-full text-white font-medium p-4 focus:outline-none border border-white/40 hover:border-white/100 focus:border-white/100 ${
                    idError && 'border-red-500/100'
                  } transition duration-300 ease-in-out rounded-xl placeholder-white placeholder-opacity-75`}
                />

                <button
                  type='submit'
                  className='flex flex-none items-center justify-around bg-gray-200 hover:bg-white transition ease-in-out duration-500 rounded-xl m-1 ml-2 lg:ml-1 shadow-dark hover:shadow-button w-12 xs:w-16 sm:w-12 lg:w-28'
                >
                  <svg
                    className={`${
                      coordinatesProcessing ? 'block' : 'hidden'
                    } animate-spin-slow h-6 w-6 border-4 border-t-gray-300 border-l-gray-300 border-gray-800 rounded-full " viewBox="0 0 24 24`}
                  />
                  <span className='text-black font-medium pt-1 hidden lg:block'>
                    Search
                  </span>
                  <HiOutlineSearch
                    className={`${
                      coordinatesProcessing ? 'hidden' : 'block'
                    } lg:hidden text-2xl`}
                  />
                </button>
              </form>
              <p className='font-medium text-xs text-red-500 mt-1 pl-2 text-left w-full max-w-sm'>
                {coordinatesError}
              </p>
            </div>
          </div>

          {/* Price Card */}
          <div className='flex flex-col items-start gray-box max-w-full sm:max-w-sm text-left'></div>
        </div>
        {/* Tier 1 - Most Undervalued Land */}
        {/* <MostUnderValuedLand verticalUnder="sm" predictions={undefined} processing={false} showCard={true} apiData={undefined} /> */}
        {/* Daily Volume and Floor Price Wrapper */}
        <div className='flex flex-col sm:flex-row space-y-5 sm:space-y-0 space-x-0 sm:space-x-5 md:space-x-10 items-stretch justify-between w-full'>
          {/* Daily Volume */}
          <SalesVolumeDaily metaverse={metaverse} coinPrices={prices} />
          {/* Floor Price */}
          <div className='flex flex-col justify-between w-full space-y-5 md:space-y-10 lg:space-y-5'>
            <FloorPriceTracker metaverse={metaverse} coinPrices={prices} />
          </div>
        </div>
        {/*Graph*/}
        <div className='flex flex-col shadow-blck rounded-xl py-3 px-4 w-full bg-grey-dark bg-opacity-20 '>
          <FloorAndVolumeChart metaverse={metaverse} />
        </div>
        <div className='flex flex-col items-start shadow-blck rounded-xl py-3 px-4 w-full bg-grey-dark bg-opacity-20 text-left'>
          <p className={`text-xs sm:text-sm text-gray-400`}>
            The MGH DAO does not provide, personalized investment
            recommendations or advisory services. Any information provided
            through the land evaluation tool and others is not, and should not
            be, considered as advice of any kind and is for information purposes
            only. That land is “valuated” does not mean, that it is in any way
            approved, checked audited, and/or has a real or correct value. In no
            event shall the MGH DAO be liable for any special, indirect, or
            consequential damages, or any other damages of any kind, including
            but not limited to loss of use, loss of profits, or loss of data,
            arising out of or in any way connected with the use of or inability
            to use the Service, including without limitation any damages
            resulting from reliance by you on any information obtained from
            using the Service.
          </p>
        </div>
      </div>
    </>
  )
}

export async function getStaticProps() {
  const res = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=ethereum%2Cthe-sandbox%2Cdecentraland%2Caxie-infinity&vs_currencies=usd'
  )
  const prices = await res.json()

  return {
    props: {
      prices,
    },
  }
}

export default ValuationPage
