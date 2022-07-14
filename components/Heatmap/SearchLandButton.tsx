import React from 'react'
import { MdAddLocationAlt } from 'react-icons/md'
import { RiLoader3Fill } from 'react-icons/ri'
import { getState } from '../../lib/utilities'
import { ValuationState } from '../../pages/valuation'

interface Props {
  mapState: ValuationState
  searchBy: 'id' | 'coordinates'
}

const SearchLandButton = ({ mapState, searchBy }: Props) => {
  const options = {
    id: { success: 'successId', loading: 'loadingQueryId' },
    coordinates: {
      success: 'successCoordinates',
      loading: 'loadingQueryCoordinates',
    },
  }
  const [loadingQuery] = getState(mapState, ['loadingQuery'])

  return (
    <button
      className={
        (mapState === options[searchBy].success
          ? 'bg-green-500 text-white'
          : 'bg-gray-200  text-gray-800') +
        ' items-center justify-center font-medium text-center transition-all flex grow gap-2 ease-in hover:shadow-subtleWhite z-10 p-2 rounded-xl md:hover:bg-white'
      }
    >
      {/* Loading Icon */}
      {loadingQuery ? (
        <RiLoader3Fill className='animate-spin-slow h-5 w-5 xs:h-6 xs:w-6' />
      ) : (
        <MdAddLocationAlt className='h-5 w-5 relative bottom-[0.2rem]' />
      )}

      {/* Button Text */}
      <span className='whitespace-nowrap'>
        {loadingQuery ? 'Calculating' : 'Search'}
      </span>
    </button>
  )
}

export default SearchLandButton
