import { ValueOf } from '../types'
import { typedKeys } from '../utilities'
import {
  MapFilter,
  PercentFilter,
  PERCENT_FILTER_ARRAY,
  ValuationTile,
} from './heatmapCommonTypes'

/* We were using Math.max(), but it can take up to 100k arguments only and we are inputting more, therefore we
  make this simple loop instead 
*/
export const getMax = (array: (number | undefined)[]) => {
  let max = 0
  array.forEach((number) => {
    number && number > max && (max = number)
  })
  return max
}

export const getPercentage = (
  partialValue: number | undefined,
  totalValue: number | undefined
) => {
  if (!partialValue || !totalValue) return 0
  return Math.ceil((partialValue * 100) / totalValue)
}

// Calculating Percentages depending on the current chosen filter.
export const setColours = async (
  valuationAtlas: Record<string, ValuationTile>,
  element: MapFilter
) => {
  /**
   * Some Lands are listed for way too high prices.
   * To keep the price_difference filter consistent, we will consider
   that have a price difference of less than the number below
   */
  const MAX_DIFF = 400


  // GENERATE MAX
  const elementOptions = {
    transfers: {
      predictions: typedKeys(valuationAtlas).map(
        (valuation) => valuationAtlas[valuation].history?.length
      ),
    },
    price_difference: {
      predictions: typedKeys(valuationAtlas).map((valuation) => {
        if (typeof valuationAtlas[valuation].current_price_eth === 'undefined')
          return
        const landPercentage = getPercentage(
          valuationAtlas[valuation].current_price_eth,
          valuationAtlas[valuation].eth_predicted_price
        )
        if (landPercentage < MAX_DIFF) {
          return landPercentage
        }
      }),
    },
    listed_lands: {
      predictions: typedKeys(valuationAtlas).map(
        (valuation) => valuationAtlas[valuation].eth_predicted_price
      ),
    },
    basic: { predictions: [] },
  }
  // Making an Array of Numbers to get the Max and use that for Percentages on lower Iteration
  let predictions: (number | undefined)[]

  // I would prefer to use typedKeys(elementOptions) here but typescript complains so using Object.keys instead
  if (Object.keys(elementOptions).includes(element)) {
    predictions =
      elementOptions[element as keyof typeof elementOptions].predictions
  } else {
    predictions = typedKeys(valuationAtlas).map(
      (valuation) =>
        valuationAtlas[valuation][
          element as keyof ValueOf<typeof valuationAtlas> & MapFilter
        ]
    )
  }
  let max = NaN

  max = getMax(predictions)
  // Adding Percent to each land depending on the max number from previous iteration.

  // GENERATE PERCENTAGE FOR EACH TILE.
  typedKeys(valuationAtlas).map((valuation) => {
    const priceDiffPercentage = getPercentage(
      valuationAtlas[valuation].current_price_eth,
      valuationAtlas[valuation].eth_predicted_price
    )
    const valuationOptions = {
      transfers: getPercentage(valuationAtlas[valuation].history?.length, max),
      price_difference:
        typeof valuationAtlas[valuation].current_price_eth !== 'number'
          ? 0
          : priceDiffPercentage < MAX_DIFF
          ? getPercentage(priceDiffPercentage, max)
          : 101, // If land's price difference is higher than MAX_DIFF make their percentage 101, this will show them as dark red.
      basic: 20,
      listed_lands: valuationAtlas[valuation].current_price_eth
        ? getPercentage(valuationAtlas[valuation].eth_predicted_price, max)
        : NaN,
    }

    let percent = NaN
    if (Object.keys(valuationOptions).includes(element)) {
      percent = valuationOptions[element as keyof typeof valuationOptions]
    } else {
      percent = getPercentage(
        valuationAtlas[valuation][
          element as keyof ValueOf<typeof valuationAtlas> & MapFilter
        ],
        max
      )
    }
    valuationAtlas[valuation] = {
      ...valuationAtlas[valuation],
      percent: percent,
    }
  })
  return valuationAtlas
}

// Calculate if number is within a certain range
const between = (x: number, max: number, min: number) => {
  return x <= max && x > min
}

// Using this to display those 5 squares on the map to use as filter buttons
export const FILTER_COLORS = {
  5: 'rgb(255,0,0)', //RED - Max
  4: 'rgb(255,137,0)', // ORANGE
  3: 'rgb(255,255,0)', // YELLOW
  2: 'rgb(0,255,0)', // GREEN
  1: 'rgb(0,255,255)', // BLUE -  Min
  0: 'rgb(61,58,70)', // GRAY - None
}

// Colors for dictionary filters
export const LEGEND_COLORS = {
  watchlist: 'rgb(255,255,255)', // On User's Watchlist
  portfolio: 'rgb(30,94,255)', // Owned by User (On their portfolio)
  'on-sale': 'rgb(248, 66, 201)', // On sale

  // Decentraland Only
  roads: '#716C7A', // roads
  plazas: '#70AC76', // plazas
  districts: '#584D6D', // districts
}

// Colors for Tiles in Decentraland Api Basic Map
export const DECENTRALAND_API_COLORS: Record<number, string> = Object.freeze({
  0: '#ff9990', // my parcels
  1: 'rgb(255,50,202)', // my parcels on sale
  2: '#ff9990', // my estates
  3: '#ff4053', // my estates on sale
  4: '#ffbd33', // parcels/estates where I have permissions
  5: '#584D6D', // districts
  6: '#563db8', // contributions
  7: '#716C7A', // roads
  8: '#70AC76', // plazas
  9: '#3D3A46', // owned parcel/estate
  10: '#3D3A46', // parcels on sale (we show them as owned parcels)
  11: '#09080A', // unowned pacel/estate
  12: '#18141a', // background
  13: '#110e13', // loading odd
  14: '#0d0b0e', // loading even
})
/*
 * Sadly, some prices on the eth_predicted_price are super high, making all the other lands very low
 * priced in % compared to them. If we were to divide lands into colors by percentage,
 * the high lands would be on 100% and the rest of them would end up on the lower 30/20%.
 * If we used normal percentages, most lands would be blue the higher ones red, defeating the purpose of the map since there would barely be
 * any yellow/orange or green.
 * To balance this out and make the map have more contrast between the lower lands we write that
 * lands using RED color are the ones that spawn from 100% til 30% .ORANGE from 30% to 12% YELLOW from 12% til 8%. GREEN from 8% til 4%
 * and Light-Blue from 4% till 0% THIS MIGHT CHANGE IN THE FUTURE, so change the percentages if needed. For the other filters we just use normal percentage, but with any case were the high numbers
 * are way too high compared to the other ones it might make the map more worthy of using to switch the % like we are doing with
 * eth_predicted_price.
 */
const filterPercentages = {
  predictedPricePercentage: [0, 3, 7, 12, 30, 100],
  normal: [0, 20, 40, 60, 80, 100],
}

const filterKey = (mapFilter: MapFilter | undefined) => {
  return mapFilter &&
    ['eth_predicted_price', 'listed_lands'].includes(mapFilter)
    ? 'predictedPricePercentage'
    : 'normal'
}

/*
 *  We calculate percentages within a range with the formula ((X−Min%)/(Max%−Min%)) × 100
 * so If max number was 20 and min was 5 and we wanted to calculate what % is 10
 * we would do ((10-5)/(20-5)) * 100 = colorFromPercentage
 * we multiply by 255 if we wanted the result to be a number between 0 and 255 for RGB colors
 * and if we want it to end up being a number between Y = 255 and Z = 170 to fit a certain color,
 *              ((X−Min%)/(Max%−Min%)) * (Y - Z) + Z = colorFromPercentage
 * we could do  ((10-5)/(20-5)) * (255 - 170) + 170 = colorFromPercentage. The higher the number the closer to 255.
 * If we want to do it so that the lower the number the closer to 255 and the higher the closer to 170
 *                     Y - ((X−Min%)/(Max%−Min%)) * (Y - Z) = colorFromReversePercentage
 *  then we can do: 255 - ((10-5)/ (20-5)) * (255 - 170) = colorFromReversePercentage
 * */
export const generateColor = (percent: number, mapFilter?: MapFilter) => {
  if (percent === 0 || !mapFilter) return 'rgb(50,50,50)'
  const colors = [
    // CAREFUL WITH FORGETTING THE COMAS BETWEEN NUMBERS ON THE RGB!!!

    // LIGHT-BLUE: rgb(0, 255, 160..255)
    `rgb(0,255,${
      255 -
      Math.ceil(
        (percent / filterPercentages[filterKey(mapFilter)][1]) * (255 - 160)
      )
    })`,

    // GREEN: rgb(0..170, 255, 0)
    `rgb(${Math.ceil(
      ((percent - filterPercentages[filterKey(mapFilter)][1]) /
        (filterPercentages[filterKey(mapFilter)][2] -
          filterPercentages[filterKey(mapFilter)][1])) *
        170
    )},255,0)`,

    // YELLOW: rgb(255, 190..255, 0)
    `rgb(255,${
      255 -
      Math.ceil(
        ((percent - filterPercentages[filterKey(mapFilter)][2]) /
          (filterPercentages[filterKey(mapFilter)][3] -
            filterPercentages[filterKey(mapFilter)][2])) *
          (255 - 190)
      )
    },0)`,

    // ORANGE: rgb(255, 100..170, 0)
    `rgb(255,${
      170 -
      Math.ceil(
        ((percent - filterPercentages[filterKey(mapFilter)][3]) /
          (filterPercentages[filterKey(mapFilter)][4] -
            filterPercentages[filterKey(mapFilter)][3])) *
          (170 - 100)
      )
    },0)`,

    // RED: rgb(255, 0..70, 0)
    `rgb(255, ${
      70 -
      Math.ceil(
        ((percent - filterPercentages[filterKey(mapFilter)][4]) /
          (100 - filterPercentages[filterKey(mapFilter)][4])) *
          70
      )
    },0)`,
  ]
  let color!: string
  if (between(percent, 100, 0)) {
    colors.map((_, i) => {
      if (
        between(
          percent,
          filterPercentages[filterKey(mapFilter)][i + 1],
          filterPercentages[filterKey(mapFilter)][i]
        )
      )
        color = colors[i]
    })
  } else color = FILTER_COLORS[0] // GRAY
  return color
}

// Checking if A) the filter corresponds to the current range/color. B) if there is any filter at all
const filterIs = (number: PercentFilter, percentFilter: PercentFilter) => {
  return percentFilter === number || !percentFilter
}

export const getTileColor = (
  percent: number,
  percentFilter: PercentFilter,
  mapFilter?: MapFilter
) => {
  let color!: string

  // If land's percent is more than 100 then show dark-red
  if (percent > 100) {
    color = filterIs(100, percentFilter) ? 'rgb(120,0,0)' : generateColor(0)
  } else if (between(percent, 100, 0)) {
    PERCENT_FILTER_ARRAY.map((percentFromArray, i) => {
      if (
        between(
          percent,
          filterPercentages[filterKey(mapFilter)][i + 1],
          filterPercentages[filterKey(mapFilter)][i]
        )
      )
        color = filterIs(percentFromArray, percentFilter)
          ? generateColor(percent, mapFilter)
          : generateColor(0)
    })
  } else color = generateColor(0)

  return color
}
