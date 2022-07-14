import { renderTile } from './tile'
import {
  Atlas,
  Coord,
  Layer,
  LegendFilter,
  MapFilter,
  PercentFilter,
} from '../../lib/heatmap/heatmapCommonTypes'

export function renderMap(args: {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  size: number
  pan: Coord
  nw: Coord
  se: Coord
  center: Coord
  layers: Layer[]
  atlas: Atlas
  filter: MapFilter
  percentFilter: PercentFilter
  legendFilter: LegendFilter
}) {
  const {
    ctx,
    width,
    height,
    size,
    pan,
    nw,
    se,
    center,
    layers,
    atlas,
    filter,
    percentFilter,
    legendFilter,
  } = args

  ctx.clearRect(0, 0, width, height)

  const halfWidth = width / 2
  const halfHeight = height / 2

  for (const layer of layers) {
    for (let x = nw.x; x < se.x; x++) {
      for (let y = se.y; y < nw.y; y++) {
        const offsetX = (center.x - x) * size + (pan ? pan.x : 0)
        const offsetY = (y - center.y) * size + (pan ? pan.y : 0)

        const tile = layer(x, y, atlas, filter, percentFilter, legendFilter)
        if (!tile) {
          continue
        }
        const { color, top, left, topLeft, scale } = tile

        const halfSize = scale ? (size * scale) / 2 : size / 2

        renderTile({
          ctx,
          x: halfWidth - offsetX + halfSize,
          y: halfHeight - offsetY + halfSize,
          size,
          padding: size < 7 ? 0.5 : size < 12 ? 1 : size < 18 ? 1.5 : 2,
          offset: 1,
          color,
          left,
          top,
          topLeft,
          scale,
        })
      }
    }
  }
}
