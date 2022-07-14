import React, { useEffect, useState } from 'react'
import { Fade } from 'react-awesome-reveal'
import { BsQuestionCircle } from 'react-icons/bs'
import { IoIosArrowDown } from 'react-icons/io'
import { getState, typedKeys } from '../../lib/utilities'
import { ValuationState } from '../../pages/valuation'
import SearchLandButton from './SearchLandButton'

interface Props {
  mapState: ValuationState
  handleMapSelection: (
    x?: number | undefined,
    y?: number | undefined,
    tokenId?: string | undefined
  ) => Promise<NodeJS.Timeout | undefined>
}

const MapSearch = ({ mapState, handleMapSelection }: Props) => {
  const [landId, setLandId] = useState('')
  const [coordinates, setCoordinates] = useState({ X: '', Y: '' })
  const [mobile, setMobile] = useState(false)
  const [opened, setOpened] = useState(window.innerWidth > 768)
  const [loadingQuery] = getState(mapState, ['loadingQuery'])

  const [searchBy, setSearchBy] = useState<'coordinates' | 'id'>('coordinates')
  const searchById = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    handleMapSelection(undefined, undefined, landId)
  }
  const searchByCoordinates = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    handleMapSelection(Number(coordinates.X), Number(coordinates.Y))
  }
  const searchOptions = {
    coordinates: {
      search: searchByCoordinates,
      text: 'Go by Coordinates',
      hasGuide: false,
    },
    id: {
      search: searchById,
      text: 'Go by ID',
      hasGuide: true,
    },
  }
  const checkMobile = () => {
    // not sure why setMobile(window.innerWidth <= 768) isn't working..
    window.innerWidth <= 768 ? setMobile(true) : setMobile(false)
    if (window.innerWidth > 768) {
      setOpened(true)
    }
  }

  useEffect(() => {
    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  return (
    <div className='flex flex-col gap-6 md:absolute h-16 md:h-auto w-[190px]'>
      {/* Search */}
      <form
        className='gray-box bg-opacity-100'
        onSubmit={(e) => searchOptions[searchBy].search(e)}
      >
        <div
          className={
            (opened ? 'items-center' : 'items-end') +
            ' flex gap-2 md:cursor-text cursor-pointer'
          }
          onClick={() => mobile && setOpened(!opened)}
        >
          <p
            className={
              (opened && 'mb-4') +
              ' font-semibold text-gray-200 md:text-lg md:pt-1 whitespace-nowrap'
            }
          >
            Search by
          </p>
          {mobile && (
            <IoIosArrowDown
              className={
                (opened ? 'rotate-180' : '') +
                ' transition-all duration-500 relative bottom-[6px] text-gray-200'
              }
            />
          )}
        </div>
        {opened && (
          <Fade duration={400}>
            <div className='flex flex-col gap-2 mb-4'>
              {/* Mapping through search options */}
              {typedKeys(searchOptions).map((filter) => (
                <span key={filter} className='flex gap-2 items-center relative'>
                  <input
                    type='radio'
                    name={filter}
                    value={filter}
                    checked={searchBy === filter}
                    onChange={() => setSearchBy(filter)}
                  />
                  <label className='text-gray-200 text-sm font-semibold'>
                    {filter[0].toLocaleUpperCase() + filter.substring(1)}
                  </label>
                  {searchOptions[filter].hasGuide && (
                    <>
                      <BsQuestionCircle className='text-gray-300 cursor-pointer peer relative bottom-[2px]' />
                      <p className='absolute -top-7 border border-gray-500 -left-6 xs:left-0 p-2 rounded-lg bg-black bg-opacity-10 backdrop-filter backdrop-blur font-medium text-xs text-gray-200 hidden peer-hover:block w-70'>
                        Find LAND on Opensea &gt; Details &gt; Token ID
                      </p>
                    </>
                  )}
                </span>
              ))}
            </div>
          </Fade>
        )}

        {/* Inputs */}
        {opened && (
          <Fade duration={400}>
            <div className='flex flex-col gap-4 relative'>
              <div className='flex gap-2'>
                {searchBy === 'coordinates' ? (
                  // Coordinates Input
                  typedKeys(coordinates).map((coord) => (
                    <input
                      disabled={loadingQuery}
                      key={coord}
                      required
                      type='number'
                      onChange={(e) =>
                        setCoordinates({
                          ...coordinates,
                          [coord]: e.target.value,
                        })
                      }
                      value={coordinates[coord]}
                      placeholder={coord}
                      className='font-semibold border-gray-300 placeholder-gray-300 bg-transparent block w-16  text-white p-3 focus:outline-none border border-opacity-40 hover:border-opacity-100 focus:border-opacity-100 transition duration-300 ease-in-out rounded-xl placeholder-opacity-75'
                    />
                  ))
                ) : (
                  // Id Input
                  <input
                    disabled={loadingQuery}
                    required
                    type='number'
                    onChange={(e) => setLandId(e.target.value)}
                    value={landId}
                    placeholder='14271'
                    className='font-semibold border-gray-300 placeholder-gray-300 bg-transparent block w-[8.5rem] text-white p-3 focus:outline-none border border-opacity-40 hover:border-opacity-100 focus:border-opacity-100 transition duration-300 ease-in-out rounded-xl placeholder-opacity-75'
                  />
                )}
              </div>
              {/* Add land Button */}
              <SearchLandButton searchBy={searchBy} mapState={mapState} />
            </div>
          </Fade>
        )}
      </form>
    </div>
  )
}

export default MapSearch
