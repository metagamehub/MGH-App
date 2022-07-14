import React from 'react'
import { typedKeys } from '../../../lib/utilities'

export type TopSellingFilterBy = keyof typeof filterOptions
interface Props {
  filterBy: TopSellingFilterBy
  setFilterBy: Function
}

// Had to put this object outside to use it on the Props. If not, would usually keep it inside function
const filterOptions = { 
  yesterdayTop :{ title: 'TOP LANDS FILTERED BY LAST 24 HOURS', label: '1D' },
  monthTop: { title: 'TOP LANDS FILTERED BY LAST MOUNTH', label: '1M' },
  yearTop:{ title: 'TOP LANDS FILTERED BY LAST YEAR', label: '1Y' },
  totalTop:{ title: 'TOP LANDS', label: 'Max' }
 }


const TopSellingFilter = ({ filterBy, setFilterBy }: Props) => {

  return (
    <div className="w-full rounded-t mb-0 px-8 py-3 border-0">
      <div className="w-full flex flex-wrap items-center justify-between">
          <div className="w-fit inline-flex">
            {
              typedKeys(filterOptions).map((filter) =>
                <button
                  key={filter}
                  type="button"
                  className="py-2.5 px-5 mr-2 mb-2 text-sm font-small focus:outline-none rounded-lg border bg-gray-800 text-gray-200 border-gray-600 hover:text-white hover:bg-gray-700"
                  onClick={() => setFilterBy(filter)}
                >
                  {filterOptions[filter].label}
                </button>)
            }
          </div>
          <h3 className="text-lg text-white">{filterOptions[filterBy].title}</h3>
      </div>
    </div>
  )
}

export default TopSellingFilter
