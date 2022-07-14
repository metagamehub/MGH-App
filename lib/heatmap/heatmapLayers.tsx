import { Layer } from "./heatmapCommonTypes";
import {
  DECENTRALAND_API_COLORS,
  LEGEND_COLORS,
  FILTER_COLORS,
  getTileColor,
} from "./valuationColoring";

export const filteredLayer: Layer = (
  x,
  y,
  atlas,
  mapFilter,
  percentFilter,
  legendFilter
) => {
  const id = x + "," + y;
  if (!atlas || !atlas.ITRM || !(id in atlas.ITRM)) return null;
  /** This second Statement checks that in Decentraland
   * the land is an actual land and not a Road, Plaza, etc...
   */
  if (
    atlas.decentraland &&
    (!(id in atlas.decentraland) ||
      new Set([5, 6, 7, 8, 12]).has(atlas.decentraland[id].type))
  )
    return null;
  /* Don't show a layer if user is tier0 and metaverse is decentraland. (we already have decentralands Map for that)  */
  let color!: string;
  const scaleOptions = {
    big: 1.4,
    mid: 1.2,
    base: 1,
  };
  let scale!: number;
  // If the legend filter is on Sale (the one on the bottom right)
  if (legendFilter === "on-sale") {
    // If land is on sale (therefore having the current_price_eth)
    atlas.ITRM[id].current_price_eth
      ? mapFilter === "basic" // If map filter is basic
        ? (color = LEGEND_COLORS["on-sale"]) // If filter is basic then return color purple
        : // If filter is not basic, it means we should calculate color based on percetage with getTileColor()
          (color = getTileColor(
            atlas.ITRM[id].percent ?? 0,
            percentFilter,
            mapFilter
          ))
      : (color = FILTER_COLORS[0]); // if land is not on sale make color to gray

    // If legend filter on bottom right is set on watchlist
  } else if (legendFilter === "watchlist") {
    //if the land is on users watchlist it will have a .watchlist attribute
    atlas.ITRM[id].watchlist
      ? mapFilter === "basic"
        ? // If its in users watchlist and the filter is basic change color to fixed color and scale to big
          (color = LEGEND_COLORS.watchlist) && (scale = scaleOptions.big)
        : // If its in users watchlist and filter is not basic then generate a proper color and set scale to big.
          (color = getTileColor(
            atlas.ITRM[id].percent ?? 0,
            percentFilter,
            mapFilter
          )) && (scale = scaleOptions.big)
      : // If its not on users watchlist set color to gray
        (color = FILTER_COLORS[0]);
    // If legend filter on bottom right is on portfolio
  } else if (legendFilter === "portfolio") {
    // If its on users portolio the land will have a .portfolio
    atlas.ITRM[id].portfolio
      ? mapFilter === "basic"
        ? // if on our portfolio and filter basic, set color to fixed color and scale to big
          (color = LEGEND_COLORS.portfolio) && (scale = scaleOptions.big)
        : // if on our portfolio but filter is not basic then generate proper color
          (color = getTileColor(
            atlas.ITRM[id].percent ?? 0,
            percentFilter,
            mapFilter
          )) && (scale = scaleOptions.big)
      : (color = FILTER_COLORS[0]);
    // If there's no legend filter and mapFilter is on basic
  } else if (mapFilter === "basic") {
    // If we are on decentraland and we land isnt on sale or on watchlist or on portfolio then return null
    if (
      atlas.decentraland &&
      !atlas.ITRM[id].portfolio &&
      !atlas.ITRM[id].watchlist &&
      !atlas.ITRM[id].current_price_eth
    ) {
      return null;
      // if mapFilter is basic and land is on portfolio set color to fixedcolor and scale to mid
    } else if (atlas.ITRM[id].portfolio) {
      color = LEGEND_COLORS.portfolio;
      scale = scaleOptions.mid;
      // if mapFilter is basic and land is on watchlist set color to fixed color and scale to mid
    } else if (atlas.ITRM[id].watchlist) {
      color = LEGEND_COLORS.watchlist;
      scale = scaleOptions.mid;
      // if mapFilter is basic and land is on sale set color to fixed color and scale to mid
    } else if (atlas.ITRM[id].current_price_eth) {
      color = LEGEND_COLORS["on-sale"];
    } else {
      color = "#43ba58"; //'#12b630' // Green color for basic view with no filters and lands that are not on sale or watchlist or portfolio
    }
    // If there is no legend filter. And mapFilter is not on basic then generate a color based on percentage.
  } else {
    color = getTileColor(atlas.ITRM[id].percent ?? 0, percentFilter, mapFilter);
  }

  const top = undefined;
  const left = undefined;
  const topLeft = undefined;
  return {
    scale,
    color,
    top,
    left,
    topLeft,
  };
};

export const decentralandAPILayer: Layer = (x, y, atlas) => {
  const id = x + "," + y;
  if (atlas && atlas.decentraland && id in atlas.decentraland) {
    const tile = atlas.decentraland[id];
    const color = DECENTRALAND_API_COLORS[tile.type];

    const top = !!tile.top;
    const left = !!tile.left;
    const topLeft = !!tile.topLeft;

    return {
      color,
      top,
      left,
      topLeft,
    };
  } else {
    return {
      color:
        (x + y) % 2 === 0
          ? DECENTRALAND_API_COLORS[12]
          : DECENTRALAND_API_COLORS[13],
    };
  }
};
