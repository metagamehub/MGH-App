import { NextPage } from "next";
import React, { useEffect, useRef, useState } from "react";
import { Fade } from "react-awesome-reveal";
import {
  Atlas,
  AtlasTile,
  HeatmapSize,
  LandCoords,
  Layer,
  LegendFilter,
  MapFilter,
  PercentFilter,
} from "../lib/heatmap/heatmapCommonTypes";
import { useVisible } from "../lib/hooks";
import { formatName, getState, typedKeys } from "../lib/utilities";
import { ICoinPrices } from "../lib/valuation/valuationTypes";
import {
  decentralandAPILayer,
  filteredLayer,
} from "../lib/heatmap/heatmapLayers";
import {
  fetchDecentralandAtlas,
  fetchITRMAtlas,
} from "../lib/heatmap/fetchAtlas";
import { setColours } from "../lib/heatmap/valuationColoring";
import { getHeatmapSize } from "../lib/heatmap/getHeatmapSize";

import { IAPIData, IPredictions, UserData } from "../lib/types";
import {
  FloorPriceTracker,
  SalesVolumeDaily,
  TopPicksLands,
} from "../components/Valuation";
import Link from "next/link";
import {
  ColorGuide,
  HeatmapLoader,
  MapCard,
  MapChooseFilter,
  MapChooseMetaverse,
  MapLegend,
  MapInitMvChoice,
  MapLandSummary,
  MapMobileFilters,
  MapSearch,
  TileMap,
} from "../components/Heatmap";
import { getUserInfo } from "../lib/FirebaseUtilities";
import { useAppSelector } from "../state/hooks";
import { getUserNFTs } from "../lib/nftUtils";
import useConnectWeb3 from "../backend/connectWeb3";
import { Chains } from "../lib/chains";
import { FullScreenButton } from "../components/General";
import { Metaverse } from "../lib/metaverse";
import { getLandSummary } from "../lib/heatmap/getLandSummary";
import { findHeatmapLand } from "../lib/heatmap/findHeatmapLand";
import Head from "next/head";

// Making this state as an object in order to iterate easily through it
export const VALUATION_STATE_OPTIONS = [
  "loading",
  "loaded",
  "error",
  "loadingQuery",
  "loadedQuery",
  "errorQuery",
] as const;
export type ValuationState = typeof VALUATION_STATE_OPTIONS[number];

interface CardData {
  apiData: IAPIData;
  predictions: IPredictions;
  landCoords: { x: string | number; y: string | number };
}

interface Hovered {
  name?: string;
  coords: { x: number; y: number };
  owner?: string;
}

const Valuation: NextPage<{ prices: ICoinPrices }> = ({ prices }) => {
  const { address, chainId } = useAppSelector((state) => state.account);
  const { web3Provider } = useConnectWeb3();

  const [mapState, setMapState] = useState<ValuationState>("loading");
  const [loading] = getState(mapState, ["loading"]);

  const [selected, setSelected] = useState<LandCoords>();
  const [hovered, setHovered] = useState<Hovered>({
    coords: { x: NaN, y: NaN },
  });
  // Hook for Popup
  const { ref, isVisible, setIsVisible } = useVisible(false);
  const [metaverse, setMetaverse] = useState<Metaverse>();
  const [filterBy, setFilterBy] = useState<MapFilter>("basic");
  const [percentFilter, setPercentFilter] = useState<PercentFilter>();
  const [legendFilter, setLegendFilter] = useState<LegendFilter>();
  const [atlas, setAtlas] = useState<Atlas>();
  const [landsLoaded, setLandsLoaded] = useState<number>(0);
  const [heatmapSize, setHeatmapSize] = useState<HeatmapSize>();
  const [cardData, setCardData] = useState<CardData>();
  function isSelected(x: number, y: number) {
    return selected?.x === x && selected?.y === y;
  }
  const selectedStrokeLayer: Layer = (x, y) => {
    return isSelected(x, y) ? { color: "#ff0044", scale: 1.4 } : null;
  };

  const hoverLayer: Layer = (x, y) => {
    return hovered?.coords?.x === x && hovered?.coords?.y === y
      ? { color: "#db2777", scale: 1.4 }
      : null;
  };

  const selectedFillLayer: Layer = (x, y) => {
    return isSelected(x, y) ? { color: "#ff9990", scale: 1.2 } : null;
  };

  const mapDivRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({
    height: mapDivRef.current?.offsetWidth,
    width: mapDivRef.current?.offsetWidth,
  });

  // Function for resizing heatmap
  const resize = () => {
    if (!mapDivRef.current) return;
    setDims({
      height: mapDivRef.current.offsetHeight,
      width: mapDivRef.current.offsetWidth,
    });
  };

  const handleHover = (x: number, y: number) => {
    if (!atlas) return;
    const map = metaverse === "decentraland" ? atlas.decentraland : atlas.ITRM;
    const { name, owner, coords } = getLandSummary(atlas, { x, y }, metaverse);
    setHovered({ coords, owner, name });
  };

  // Main Search Function through Clicks,Form inputs.
  const handleMapSelection = async (
    x?: number,
    y?: number,
    tokenId?: string
  ) => {
    if (!atlas || !atlas?.ITRM || !metaverse) return;
    x && y && setSelected({ x: x, y: y });
    setCardData(undefined);
    setMapState("loadingQuery");
    setIsVisible(true);
    const landData = findHeatmapLand(atlas.ITRM, prices, metaverse, tokenId, {
      x: x,
      y: y,
    });
    if (!landData) {
      setMapState("errorQuery");
      return setTimeout(() => setIsVisible(false), 1100);
    }
    const id = landData?.landCoords.x + "," + landData?.landCoords.y;
    if (
      !(id in atlas.ITRM) ||
      (atlas.decentraland &&
        (!(id in atlas.decentraland) ||
          [5, 6, 7, 8, 12].includes(atlas.decentraland[id].type)))
    ) {
      setMapState("errorQuery");
      return setTimeout(() => setIsVisible(false), 1100);
    }
    setSelected({ x: landData.landCoords.x, y: landData.landCoords.y });
    setMapState("loadedQuery");
    setCardData(landData);
  };

  // Use Effect for Metaverse Fetching and Map creation
  useEffect(() => {
    const setData = async () => {
      if (!metaverse) return;
      setLandsLoaded(0);
      setSelected(undefined);
      setMapState("loading");
      const ITRMAtlas = await fetchITRMAtlas(metaverse, setLandsLoaded);

      if (address && web3Provider) {
        // Lands in User's Watchlist
        const watchlistData = await getUserInfo(address);
        // Lands Owned by user
        let userNFTs: string[] | undefined;
        chainId === Chains.ETHEREUM_MAINNET.chainId &&
          (userNFTs = await getUserNFTs(web3Provider, address, metaverse));
        const userLands: UserData = {
          portfolio: userNFTs,
          watchlist: watchlistData && watchlistData[metaverse + "-watchlist"],
        };
        // Iterating through User's Portfolio and Watchlist
        for (let key of typedKeys(userLands)) {
          // Iterating through Map
          typedKeys(ITRMAtlas).forEach((land) => {
            // For each Land in user's Portfolio/Watchlist
            userLands[key]?.forEach((stateLandId) => {
              ITRMAtlas[land].land_id === stateLandId &&
                (ITRMAtlas[land][key] = true);
            });
          });
        }
      }
      let decentralandAtlas: Record<string, AtlasTile> | undefined;
      if (metaverse === "decentraland") {
        decentralandAtlas = await fetchDecentralandAtlas();
      }
      const atlasWithColours = await setColours(ITRMAtlas, filterBy);
      const heatmapSize = getHeatmapSize({ ITRM: ITRMAtlas });
      setHeatmapSize(heatmapSize);
      setAtlas({ ITRM: atlasWithColours, decentraland: decentralandAtlas });
      setMapState("loaded");
    };
    setData();
    resize();
    window.addEventListener("resize", resize);

    return () => window.removeEventListener("resize", resize);
  }, [metaverse, address]);

  // Use Effect for changing filters
  useEffect(() => {
    if (!atlas) return;
    const changeColours = async () => {
      const atlasWithColours = await setColours(atlas.ITRM, filterBy);
      setAtlas({ ...atlas, ITRM: atlasWithColours });
    };
    changeColours();
  }, [filterBy, percentFilter]);

  return (
    <>
      <Head>
        <title>MGH | Valuation</title>
        <meta
          name="description"
          content="Land Valuation with our Custom Heatmap"
        />
      </Head>
      <section className="w-full h-full relative">
        {/* Main Header */}
        <div className="gray-box flex flex-col lg:flex-row justify-between items-center mb-8">
          <h1 className="text-transparent bg-clip-text lg:text-5xl text-3xl bg-gradient-to-br from-blue-500 via-green-400 to-green-500 mb-0 sm:mb-2">
            LAND Valuation
          </h1>
          {/* Links Wrapper */}
          <div className="flex gap-5">
            {/* Links */}
            {["portfolio", "watchlist", "analytics"].map((option) => (
              <Link key={option} href={`/${option}`}>
                <a className="hover:scale-105 font-medium text-white px-5 py-3 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/30 to-green-500/30 transition-all duration-300">
                  <span className="pt-1 text-xl">{formatName(option)}</span>
                </a>
              </Link>
            ))}
          </div>
        </div>

        {/* Heatmap */}
        <div className="relative mb-8 h-[55vh]" ref={mapDivRef}>
          {!metaverse && (
            <MapInitMvChoice
              metaverse={metaverse}
              setMetaverse={setMetaverse}
            />
          )}
          {loading && metaverse && (
            <HeatmapLoader landsLoaded={landsLoaded} metaverse={metaverse} />
          )}
          {atlas && heatmapSize && !loading && metaverse && (
            <>
              <div className="absolute top-0 z-20 flex gap-4 p-2 md:w-fit w-full">
                <div>
                  {/* Top left Coordinates */}
                  <div className="mb-2 w- hidden md:block w-[190px]">
                    <MapLandSummary
                      owner={hovered.owner}
                      name={hovered.name}
                      coordinates={hovered.coords}
                      metaverse={metaverse}
                    />
                  </div>
                  {/* 'Search By' Forms */}
                  <MapSearch
                    mapState={mapState}
                    handleMapSelection={handleMapSelection}
                  />
                </div>
                {/* Main Filter Button. Only for small screens  */}
                <div className="md:hidden w-2/4">
                  <MapMobileFilters
                    metaverse={metaverse}
                    setMetaverse={setMetaverse}
                    filterBy={filterBy}
                    setFilterBy={setFilterBy}
                  />
                </div>
                <div className="md:flex gap-2 md:gap-4 hidden">
                  {/* Metaverse Selection */}
                  <MapChooseMetaverse
                    metaverse={metaverse}
                    setMetaverse={setMetaverse}
                  />
                  {/* Filter Selection */}
                  <MapChooseFilter
                    filterBy={filterBy}
                    setFilterBy={setFilterBy}
                  />
                </div>
              </div>
              {/* Color Guide - Hides when MapCard is showing (only mobile) */}
              {filterBy !== "basic" && (
                <div
                  className={
                    (isVisible && "hidden") +
                    " md:block absolute z-20 bottom-2 left-2"
                  }
                >
                  <ColorGuide
                    filterBy={filterBy}
                    percentFilter={percentFilter}
                    setPercentFilter={setPercentFilter}
                  />
                </div>
              )}

              {/* Full screen button - Hides when MapCard is showing (all screens) */}
              {!isVisible && (
                <div className="absolute z-20 top-2 right-2 gray-box bg-opacity-100 w-fit h-15">
                  <FullScreenButton
                    fullScreenRef={mapDivRef}
                    className="text-lg text-gray-200 hover:text-white"
                  />
                </div>
              )}
              {/*  Map */}
              <TileMap
                // min and max values for x and y
                minX={heatmapSize.minX}
                maxX={heatmapSize.maxX}
                minY={heatmapSize.minY}
                maxY={heatmapSize.maxY}
                // starting position of the map
                x={Number(selected?.x || heatmapSize.initialY)}
                y={Number(selected?.y || heatmapSize.initialX)}
                // map filter (predicted_price, transfers, etc..)
                filter={filterBy}
                // Filter lands by percentage. On bottom left
                percentFilter={percentFilter}
                // Filter lands by utility (watchlist, portfolio, etc..). On bottom right
                legendFilter={legendFilter}
                atlas={atlas}
                className="atlas"
                width={dims.width}
                height={dims.height}
                layers={[
                  decentralandAPILayer,
                  filteredLayer,
                  selectedStrokeLayer,
                  selectedFillLayer,
                  hoverLayer,
                ]}
                onHover={(x, y) => {
                  handleHover(x, y);
                }}
                onClick={(x, y) => {
                  if (isSelected(x, y)) {
                    setSelected(undefined);
                  } else {
                    handleMapSelection(x, y);
                  }
                }}
              />
              {/* Selected Land Card */}
              {isVisible && (
                <div
                  ref={ref}
                  className="absolute bottom-2 right-8 flex flex-col gap-4"
                >
                  <Fade duration={300}>
                    <MapCard
                      setIsVisible={setIsVisible}
                      metaverse={metaverse}
                      apiData={cardData?.apiData}
                      predictions={cardData?.predictions}
                      landCoords={cardData?.landCoords}
                      mapState={mapState}
                    />
                  </Fade>
                </div>
              )}

              {/* Map Legend - Hides when MapCard is showing (all screens) */}
              {!isVisible && (
                <MapLegend
                  className="absolute bottom-2 right-2"
                  legendFilter={legendFilter}
                  setLegendFilter={setLegendFilter}
                  metaverse={metaverse}
                />
              )}
            </>
          )}
        </div>

        {/* Daily Volume and Floor Price Wrapper */}
        {metaverse && (
          <Fade duration={600} className="w-full">
            <div className="flex flex-col sm:flex-row space-y-5 sm:space-y-0 space-x-0 sm:space-x-5 md:space-x-10 items-stretch justify-between w-full mb-8">
              {/* Daily Volume */}
              <SalesVolumeDaily metaverse={metaverse} coinPrices={prices} />
              {/* Floor Price */}
              <div className="flex flex-col justify-between w-full space-y-5 md:space-y-10 lg:space-y-5">
                <FloorPriceTracker metaverse={metaverse} coinPrices={prices} />
              </div>
            </div>
            <h3 className="text-transparent bg-clip-text lg:text-3xl text-2xl bg-gradient-to-br from-blue-500 via-green-400 to-green-500 mb-0 sm:mb-2">
              Our Top Picks
            </h3>
            <TopPicksLands metaverse={metaverse} />
            <div className="flex flex-col items-start shadow-blck rounded-xl py-3 px-4 w-full bg-grey-dark bg-opacity-20 text-left mb-8">
              <p className="text-xs sm:text-sm text-gray-400">
                The MGH DAO does not provide, personalized investment
                recommendations or advisory services. Any information provided
                through the land evaluation tool and others is not, and should
                not be, considered as advice of any kind and is for information
                purposes only. That land is “valuated” does not mean, that it is
                in any way approved, checked audited, and/or has a real or
                correct value. In no event shall the MGH DAO be liable for any
                special, indirect, or consequential damages, or any other
                damages of any kind, including but not limited to loss of use,
                loss of profits, or loss of data, arising out of or in any way
                connected with the use of or inability to use the Service,
                including without limitation any damages resulting from reliance
                by you on any information obtained from using the Service.
              </p>
            </div>
          </Fade>
        )}
      </section>
    </>
  );
};

export async function getServerSideProps() {
  const coin = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=ethereum%2Cthe-sandbox%2Cdecentraland%2Caxie-infinity&vs_currencies=usd"
  );
  const prices = await coin.json();
  return {
    props: {
      prices,
    },
  };
}
export default Valuation;
