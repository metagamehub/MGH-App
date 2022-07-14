import React, { useState } from 'react'
import { Fade } from 'react-awesome-reveal'
import { BiTargetLock, BiTransferAlt } from 'react-icons/bi'
import { FiMap } from 'react-icons/fi'
import { IoIosArrowDown } from 'react-icons/io'
import { MdAttachMoney } from 'react-icons/md'
import { VscGraphLine } from 'react-icons/vsc'
import { MapFilter } from '../../lib/heatmap/heatmapCommonTypes'
import { typedKeys } from '../../lib/utilities'
import { useAppSelector } from '../../state/hooks'

interface Props {
  filterBy: MapFilter
  setFilterBy: React.Dispatch<React.SetStateAction<MapFilter>>
}

const MapChooseFilter = ({ filterBy, setFilterBy }: Props) => {
  const { role } = useAppSelector((state) => state.account)
  const isPremium = true // This will be replaced with role when we release this feature.

  const [opened, setOpened] = useState(false)
  const filterOptions = {
    basic: { name: 'Basic', shortName: undefined, icon: <FiMap /> },
    eth_predicted_price: {
      name: 'Predicted Price',
      shortName: undefined,
      icon: <BiTargetLock />,
    },
    listed_lands: {
      name: 'Listed Lands',
      shortName: undefined,
      icon: <VscGraphLine />,
    },
    price_difference: {
      name: 'Price Difference',
      shortName: undefined,
      icon: <MdAttachMoney />,
    },
    transfers: {
      name: 'Transfers',
      shortName: undefined,
      icon: <BiTransferAlt />,
    },

    // Not using this filters for now..Will delete if decision is permanent
    // variation_last_week: {
    //   name: 'Weekly Price Variation',
    //   shortName: 'W.P.V.',
    //   icon: <VscGraphLine />,
    // },
    // variation_last_four_weeks: {
    //   name: 'Monthly Price Variation',
    //   shortName: 'M.P.V.',
    //   icon: <VscGraphLine />,
    // },
    // variation_last_six_months: {
    //   name: 'Semestral Price Variation',
    //   shortName: 'S.P.V.',
    //   icon: <VscGraphLine />,
    // },
  }
  return (
    <div>
      {/* Filter Button + Name */}
      <button
        onClick={() => setOpened(!opened)}
        className='h-16 gray-box bg-opacity-100 mb-2 items-center w-70 tracking-wider font-semibold text-gray-200 hover:text-white flex justify-between cursor-pointer transition-all'
      >
        {/* Icon */}
        <span className='hidden sm:block text-lg'>
          {filterOptions[filterBy].icon}
        </span>

        {/* Name */}
        <p className='hidden sm:block'>
          {filterOptions[filterBy].shortName ?? filterOptions[filterBy].name}
        </p>
        {/* Mobile Name */}
        <p className='block sm:hidden'>Stats</p>
        {/* Down/Up Arrow */}

        <IoIosArrowDown
          className={
            (isPremium ? '' : 'opacity-0 ') +
            (opened ? 'rotate-180 ' : '') +
            'transition-all duration-500 relative bottom-[1px]'
          }
        />
      </button>
      {/* FilterOptions */}
      <div
        className={
          (opened && 'mb-1 md:mb-0') + 'md:absolute flex flex-col gap-2'
        }
      >
        {opened &&
          isPremium &&
          typedKeys(filterOptions).map(
            (filter) =>
              filter !== filterBy && (
                <Fade duration={500} key={filter} direction='down'>
                  <button
                    className='flex gray-box gap-4 bg-opacity-100 items-center text-gray-200 hover:text-white font-semibold w-70 text-sm md:text-base'
                    onClick={() => {
                      setFilterBy(filter)
                      setOpened(false)
                    }}
                  >
                    {filterOptions[filter].icon}
                    <span className='whitespace-nowrap'>
                      {filterOptions[filter].name}
                    </span>
                  </button>
                </Fade>
              )
          )}
      </div>
    </div>
  )
}

export default MapChooseFilter
