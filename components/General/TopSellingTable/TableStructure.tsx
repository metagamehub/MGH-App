import { useEffect, useState } from "react"
import TableItem from "./TableItem"
import { handleOrder, handleOrderAsset, handleOrderRank, handleOrderPrice } from "./Order"
import { TopSellingRequestItem } from "../../../types/TopSelling"

interface filterBy {
  element: String,
  data: [key: TopSellingRequestItem]
}

const TableStructure = ({filterby} : {filterby: filterBy}) => {
  const filterData = (data: any) => {
    let result: any = []
    data.map((value: any) => value.position ? result.push(value) : false)
    return result
  }

  const [response, setResponse] = useState<[key: TopSellingRequestItem]>(filterData(filterby.data))
  const [sortDir, setSortDir] = useState<boolean>(false)

  const thStyle = "px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left bg-slate-800 text-slate-300 border-slate-700 cursor-pointer"

  useEffect(() => {
    setResponse(filterData(filterby.data))
  }, [filterby])
  
  return(
    <>
      {
        response[0] ?
        <table className="items-center w-full bg-transparent border-collapse">
          <thead>
            <tr>
              <th className={thStyle} onClick={() => handleOrderRank(sortDir, setSortDir, response, setResponse)} >RANK</th>
              <th className={thStyle} onClick={() => handleOrderAsset(sortDir, setSortDir, response, setResponse)}>ASSET</th>
              <th className={thStyle} onClick={() => handleOrderPrice(sortDir, setSortDir, response, setResponse)}>PRICE</th>
              <th className={thStyle} onClick={() => handleOrder('from', sortDir, setSortDir, response, setResponse)}>FROM</th>
              <th className={thStyle} onClick={() => handleOrder('to', sortDir, setSortDir, response, setResponse)}>TO</th>
              <th className={thStyle} onClick={() => handleOrder('date', sortDir, setSortDir, response, setResponse)}>PURCHASED </th>
            </tr>
          </thead>
          <tbody>
            {
              response.map((value) =><TableItem key={value.position} item={value}/>)
            }
          </tbody>
        </ table> :
        <h3 className="px-6 text-lg text-white">NO LANDS</h3>
      }
    </>
  )
}

export default TableStructure