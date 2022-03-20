import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { Metaverse } from '../../lib/enums'
import { addLandToWatchList, getUserInfo } from '../../lib/FirebaseUtilities'
import { useAppSelector } from '../../state/hooks'

interface Props {
  landId: string
  metaverse: Metaverse
}

interface UserWatchlist {
  'decentraland-watchlist': string[]
  'sandbox-watchlist': string[]
}

type WatchlistButtonState =
  | 'alreadyInWatchlist'
  | 'metaverseLimit'
  | 'canAddToWatchlist'
  | 'landAdded'
  | 'loading'

const AddToWatchlistButton = ({ landId, metaverse }: Props) => {
  const { push } = useRouter()
  const { address } = useAppSelector((state) => state.account)
  const [state, setState] = useState<WatchlistButtonState>()
  const [refetch, setRefetch] = useState(false)
  type Key = 'decentraland-watchlist' | 'sandbox-watchlist'

  const addToWatchList = async () => {
    if (state === 'alreadyInWatchlist') return push('/watchlist')
    if (address && state === 'canAddToWatchlist') {
      setState('loading')
      // Adding Land to Database
      await addLandToWatchList(landId, address, metaverse)

      setState('landAdded')
      // Giving Feedback to user for Good Query
      setTimeout(() => {
        // Retrigger useEffect
        setRefetch(!refetch)
      }, 1100)
    }
  }

  const loadingDots = () => {
    const dots = 0
  }

  useEffect(() => {
    const fetchData = async () => {
      if (address) {
        const user = (await getUserInfo(address)) as Record<Key, string[]>
        const metaverseKey = Object.keys(user).find((key) =>
          key.includes(metaverse)
        ) as Key
        console.log()
        if (user[metaverseKey].includes(landId))
          return setState('alreadyInWatchlist')
        if (user[metaverseKey].length === 10) return setState('metaverseLimit')
        setState('canAddToWatchlist')
      }
    }
    fetchData()
  }, [address, refetch, landId, metaverse])

  return (
    <button
      className='flex text-left items-center text-gray-200 text-sm hover:text-pink-500 transition duration-300 font-medium ease-in-out'
      onClick={addToWatchList}
    >
      {state === 'alreadyInWatchlist'
        ? 'In Watchlist'
        : state === 'landAdded'
        ? 'Added!'
        : state === 'loading'
        ? 'Loading..'
        : state === 'metaverseLimit'
        ? 'Limit Reached'
        : 'Add to Watchlist'}
    </button>
  )
}

export default AddToWatchlistButton
