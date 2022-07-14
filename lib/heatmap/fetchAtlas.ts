import { Metaverse } from '../metaverse'
import { typedKeys } from '../utilities'
import { AtlasTile, ValuationTile } from './heatmapCommonTypes'
import { heatmapMvOptions } from './heatmapMvOptions'

export const fetchITRMAtlas = async (
  metaverse: Metaverse,
  setLandsLoaded: React.Dispatch<React.SetStateAction<number>>
) => {
  const valuationAtlas: Record<string, ValuationTile> = {}
  const LANDS_PER_REQUEST = 2000
  await Promise.all(
    [
      ...Array(
        Math.ceil(heatmapMvOptions[metaverse].lands / LANDS_PER_REQUEST)
      ),
    ].map(async (_, i) => {
      try {
        // Getting valuations from ITRM
        const valuationRes = await fetch(
          `https://services.itrmachines.com/${metaverse}/requestMap?from=${
            i * LANDS_PER_REQUEST
          }&size=${LANDS_PER_REQUEST}`
        )
        const valuations = (await valuationRes.json()) as Record<
          string,
          ValuationTile | undefined
        >
        // Mapping through those valuations
        typedKeys(valuations).map((key) => {
          {
            // Making a name to fit with our tile map
            const name =
              valuations[key]?.coords.x + ',' + valuations[key]?.coords.y
            // // Setting the land info in the valuation atlas
            valuationAtlas[name] = valuations[key]!
            valuationAtlas[name].land_id = key
          }
        })
      } catch (e) {
        console.log('error', e)
      }
      setLandsLoaded((prev) =>
        heatmapMvOptions[metaverse].lands < prev + LANDS_PER_REQUEST
          ? heatmapMvOptions[metaverse].lands
          : prev + LANDS_PER_REQUEST
      )
    })
  )
  return valuationAtlas
}

export const fetchDecentralandAtlas = async () => {
  const resp = await fetch('https://api.decentraland.org/v1/tiles')
  const json = await resp.json()
  return json.data as Record<string, AtlasTile> | undefined
}
