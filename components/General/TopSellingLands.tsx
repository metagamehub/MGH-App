import { useEffect, useState } from "react"

import TableStructure from "./TopSellingTable/TableStructure"
import { TopSellings } from "../../types/TopSelling"
import { Metaverse } from "../../lib/metaverse"
import TopSellingFilter, { TopSellingFilterBy } from "./TopSellingTable/TopSellingFilter"
import { fetchChartData } from "../Analytics/fetchChartData"

const TopSellingLands = (props : {metaverse : Metaverse}) => {
  const [topSellings, setTopSellings] = useState<TopSellings | any>({})
  const [filterBy, setFilterBy] = useState<TopSellingFilterBy>('totalTop')
  
  async function waitingData(metaverse: Metaverse) {
    const data = await fetchChartData(metaverse, 'topSellingLands')
    setTopSellings(data)
  }

  useEffect(() => { waitingData(props.metaverse) }, [props.metaverse])

  return (
    <div className='flex flex-col items-start shadow-blck rounded-xl py-3 px-4 w-full bg-grey-dark bg-opacity-20 text-left'>
      {
        Object.entries(topSellings).length === 0 ?
        <p className={`text-xs sm:text-sm text-gray-400`}>LOADING TOP SELLINGS...</p> :
        <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded bg-slate-900 text-white">
          <div className="block w-full overflow-x-auto">
            <TopSellingFilter filterBy={filterBy} setFilterBy={setFilterBy}/>
          </div>
          <div className="block w-full overflow-x-auto">
            <TableStructure filterby={{element: filterBy, data: topSellings[filterBy]}}/>
          </div>
        </div>
      }
    </div>
  )
}

export default TopSellingLands