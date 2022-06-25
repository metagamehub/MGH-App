import { TopSellingDataTable, TopSellingRequestItem } from "../../../types/TopSelling"

const TableItem = ({ item } : { item: TopSellingRequestItem }) => {
  let dataTable: TopSellingDataTable | any = item.dataTable || null
    
  const priceLoader = () => {
    const price = Number(dataTable.price).toFixed(2)
    if(dataTable.price == 0)
      return <span className="mr-2">Loading...</span>
    return <span className="mr-2">{`${price} ${dataTable.symbol}`}</span>
  }

  return (
    <tr>
      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">{item.position}</td>
      <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left flex items-center">
        <img src={dataTable.image} className="h-12 w-12 bg-white rounded-full border" alt={`Land ${dataTable.asset} image`}/>
        <span className="ml-3 font-bold text-white">
          Land: <a className="hover:underline text-sky-600" href={dataTable.external_link} target='_blank'>
            { dataTable.asset }
          </a> 
        </span>
      </th>
      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
        {
          priceLoader()
        }
      </td>
      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
        <span className="mr-2">{dataTable.from || 'anonymous'}</span>
      </td>
      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
        <span className="mr-2">{dataTable.to || 'anonymous'}</span>
      </td>
      <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
        <span className="mr-2">{dataTable.date}</span>
      </td>
    </tr>
  )
}

export default TableItem