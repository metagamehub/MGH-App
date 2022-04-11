import React, { useEffect, useState, useRef } from 'react'
import { Metaverse } from '../../lib/enums'
import { createChart, UTCTimestamp } from 'lightweight-charts'
import { typedKeys } from '../../lib/utilities'

interface SymbolProperties {
  key: string
  [key: string]: any
}

interface Symbol {
  [key: string]: SymbolProperties
}

interface Props {
  metaverse: Metaverse
  data: any[]
  symbolOptions?: Symbol
  defaultSymbol?: string
  label:string
}

const FloorAndVolumeChart = ({
  metaverse,
  data,
  symbolOptions,
  defaultSymbol,
  label
}: Props) => {
  const chartElement = useRef<HTMLDivElement>(null)
  if (symbolOptions)
    var [symbol, setSymbol] = useState<keyof typeof symbolOptions>(defaultSymbol?defaultSymbol:'ETH') //Supposing price is always eth

  useEffect(() => {
    if (!chartElement.current) return
    const chart = createChart(chartElement.current, {
      width: chartElement.current.clientWidth,
      height: 197,
      timeScale: {
        fixLeftEdge: true,
        fixRightEdge: true,
        timeVisible: true,
      },
      rightPriceScale: {
        scaleMargins: {
          top: 0.3,
          bottom: 0.25,
        },
        borderVisible: false,
      },
      layout: {
        backgroundColor: '#131722',
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: {
          color: 'rgba(42, 46, 57, 0)',
        },
        horzLines: {
          color: 'rgba(42, 46, 57, 0.6)',
        },
      },
    })
    const areaSeries = chart.addAreaSeries({
      topColor: 'rgba(38,198,218, 0.56)',
      bottomColor: 'rgba(38,198,218, 0.04)',
      lineColor: 'rgba(38,198,218, 1)',
      lineWidth: 2,
      title: label,
    })

if(symbolOptions)areaSeries.setData(
      data.map((currentData) => {
        return {
          time: (currentData.time / 1000) as UTCTimestamp,
          value: symbolOptions
            ? currentData.dailyVolume[symbolOptions[symbol].key]
            : null,
        }
      }),
    )
    else
    areaSeries.setData(
      data.map((currentData) => {
        return {
          time: (currentData.time / 1000) as UTCTimestamp,
          value: currentData,
        }
      }),
    )
    const resizeGraph = () =>
      chart.applyOptions({ width: chartElement.current?.clientWidth })
    window.addEventListener('resize', resizeGraph)
    return () => {
      window.removeEventListener('resize', resizeGraph)
      chart.remove()
    }
  }, [data, symbol])

  return (
    <div className="flex flex-col shadow-blck rounded-xl py-3 px-4 w-full bg-grey-dark bg-opacity-20 ">
      <div className="max-w-full h-full relative" ref={chartElement}>
        <div className="absolute top-1 left-1 z-10 flex gap-2">
          {symbolOptions &&
            typedKeys(symbolOptions).map((arrSymbol) => (
              <button
                key={arrSymbol}
                className={
                  'gray-box font-semibold rounded-lg p-2 text-xs text-gray-400' +
                  (symbol === arrSymbol
                    ? ' text-gray-300 bg-opacity-80 '
                    : ' hover:text-gray-300 hover:bg-opacity-80')
                }
                onClick={() => setSymbol(arrSymbol)}
              >
                {arrSymbol === 'METAVERSE'
                  ? symbolOptions[arrSymbol][metaverse]
                  : arrSymbol}
              </button>
            ))}
        </div>
      </div>
    </div>
  )
}
export default FloorAndVolumeChart
