import React from 'react'

const Progress_bar = ({ progress }: { progress: number }) => {
  return (
    <div className='h-4 rounded-lg w-[90%] overflow-hidden m-auto bg-gray-400'>
      <div
        style={{ width: progress + '%' }}
        className='h-full transition-all bg-[#db2777]'
      ></div>
    </div>
  )
}

export default Progress_bar
