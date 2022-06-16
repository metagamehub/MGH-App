import React, { useEffect, useState } from 'react'
import { typedKeys } from '../../lib/utilities'
import { Metaverse } from '../../lib/metaverse'
import axios from 'axios'
import { RiLoader3Fill } from 'react-icons/ri'
import { BiSort } from 'react-icons/bi'

interface Props {
  metaverse: Metaverse
}

const TopPicksLands = ({ metaverse }: Props) => {
  const [loading, setLoading] = useState(true)

  const [picks, setPicks] = useState({})

  const [sorted, setSorted] = useState(false);

  useEffect(() => {
    const setData = async () => {
      setLoading(true)
      setSorted(false)
      await axios
        .get('https://services.itrmachines.com/val-analytics/topPicks', {
          params: { metaverse: metaverse },
        })
        .then((response) => {
          setPicks(response.data)
          setLoading(false)
        })
    }
    setData().catch((e) => console.log(e))
  }, [metaverse])

  const handleGapSort = () => {
    try {
      console.log(sorted);
      if (sorted) {
        setPicks(typedKeys(picks).map((key) => {
          return picks[key];
        }).sort((a ,b) => {
          return a["gap"] - b["gap"]
        }))
        setSorted(false);
      } else {
        setPicks(typedKeys(picks).map((key) => {
          return picks[key];
        }).sort((a ,b) => {
          return b["gap"] - a["gap"]
        }))
        setSorted(true);
      }      
    } catch (error) {
      console.log(error)
    } 
  }

  return (
    <div className='flex flex-col items-start gray-box'>
      {loading ? (
        <p className='text-gray-300 flex gap-2'>
          Loading Lands{' '}
          <RiLoader3Fill className='animate-spin-slow h-5 w-5 xs:h-6 xs:w-6' />
        </p>
      ) : (
        <table className='w-full table-fixed border-collapse'>
          <thead className='bg-transparent text-white w-full'>
            <tr className='flex w-full mb-4 text-left'>
              <th className='p-4 w-1/5  bg-slate-800 text-xs lg:text-lg md:text-base '>
                Land
              </th>
              <th className='p-4 w-1/5  bg-slate-800 text-xs lg:text-lg md:text-base '>
                Coord
              </th>
              <th className='p-4 w-1/5  bg-slate-800 text-xs lg:text-lg md:text-base '>
                Current price
              </th>
              <th className='p-4 w-1/5  bg-slate-800 text-xs lg:text-lg md:text-base '>
                Predicted price
              </th>
              <th className='p-4 w-1/5  bg-slate-800 text-xs lg:text-lg md:text-base'>
                <label className='mr-4'>Gap</label>
                <button onClick={()=>handleGapSort()}>
                  <BiSort color={sorted ? "cyan" : "white"}></BiSort>
                </button>
              </th>
            </tr>
          </thead>
          <tbody className='bg-transparent flex flex-col items-center justify-between overflow-y-scroll w-full h-52 scrollbar'>
            {typedKeys(picks).map((key) => {
              return (
                <tr key={key} className='flex w-full mb-4'>
                  <td className='flex justify-start px-4 content-center w-1/5'>
                    <img
                      src={picks[key]['images']['image_url']}
                      className='lg:h-12 lg:w-12 md:h-8 md:w-8 bg-white rounded-full border mb-4 mt-4 w-6 h-6'
                    />
                  </td>
                  <td className='flex justify-start px-4 content-center items-center text-sky-400 pt-0.5 w-1/5 hover:underline'>
                    <a
                      className='text-sm lg:text-2xl font-medium md:text-base'
                      href={picks[key]['external_link']}
                    >
                      X:{picks[key]['coords']['x']}, Y:
                      {picks[key]['coords']['y']}
                    </a>
                  </td>
                  <td className='flex justify-start px-4 content-center items-center text-sm lg:text-2xl font-medium md:text-base text-gray-300 pt-0.5 w-1/5'>
                    <span>
                      {parseFloat(picks[key]['current_price_eth']).toFixed(2)}
                    </span>
                  </td>
                  <td className='flex justify-start px-4 content-center items-center text-sm lg:text-2xl font-medium md:text-base text-gray-300 pt-0.5 w-1/5'>
                    <span>
                      {parseFloat(picks[key]['eth_predicted_price']).toFixed(2)}
                    </span>
                  </td>
                  <td className='flex justify-start px-4 content-center items-center text-sm lg:text-2xl font-medium md:text-base text-gray-300 pt-0.5 w-1/5'>
                    <span>{parseFloat(picks[key]['gap']).toFixed()}%</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default TopPicksLands
