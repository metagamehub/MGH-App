import React, { useState } from 'react'
import { Fade } from 'react-awesome-reveal'
import { IoIosArrowDown } from 'react-icons/io'
import { Metaverse } from '../../lib/metaverse'
import { formatName, typedKeys } from '../../lib/utilities'
import { OptimizedImage } from '../General'

interface Props {
  metaverse: Metaverse
  setMetaverse: React.Dispatch<React.SetStateAction<Metaverse | undefined>>
}

const MapChooseMetaverse = ({ metaverse, setMetaverse }: Props) => {
  const [opened, setOpened] = useState(false)
  const mvOptions = {
    sandbox: { src: '/images/the-sandbox-sand-logo.png' },
    decentraland: { src: '/images/decentraland-mana-logo.png' },
    'axie-infinity': { src: '/images/axie-infinity-axs-logo.png' },
  }

  return (
    <div className='relative z-50'>
      <button
        onClick={() => setOpened(!opened)}
        className='h-16 gray-box bg-opacity-100 mb-2 items-center w-70  md:w-56 tracking-wider font-semibold text-gray-200 hover:text-white flex justify-between cursor-pointer transition-all'
      >
        <div className='hidden sm:block'>
          <OptimizedImage
            height={25}
            width={25}
            src={mvOptions[metaverse].src}
          />
        </div>
        <span className='text-base hidden sm:block'>
          {formatName(metaverse)}
        </span>
        <span className='text-base block sm:hidden'>Metaverse</span>
        <IoIosArrowDown
          className={
            (opened ? 'rotate-180' : '') +
            ' transition-all duration-500 relative bottom-[1px]'
          }
        />
      </button>
      <div className='flex flex-col gap-2 md:absolute w-full'>
        {opened &&
          typedKeys(mvOptions).map(
            (mv) =>
              mv !== metaverse && (
                <Fade duration={500} key={mv} direction='down'>
                  <button
                    className='flex gray-box gap-2 md:gap-4 bg-opacity-100 items-center text-gray-200 hover:text-white font-semibold whitespace-nowrap w-70 md:w-56'
                    onClick={() => {
                      setMetaverse(mv)
                      setOpened(false)
                    }}
                  >
                    <OptimizedImage
                      height={25}
                      width={25}
                      src={mvOptions[mv].src}
                    />
                    <span className='text-sm md:text-base'>
                      {formatName(mv)}
                    </span>
                  </button>
                </Fade>
              )
          )}
      </div>
    </div>
  )
}

export default MapChooseMetaverse
