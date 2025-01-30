import { UserButton } from '@clerk/nextjs'
import React from 'react'
import AddNewInterview from './_components/AddNewInterview'

function page() {
  return (
    <div className="p-10">
      <h2 className="font-bold text-2xl">Dashboard</h2>
      <h2 className="text-gray-600">Create and start your AI Mockup Interview</h2>
      <div className="grid sm:grid-cols-1 lg:grid-cols-3 my-5">
        {/* <div className="col-span-1"> */}
          <AddNewInterview/>
          {/* </div> */}
      </div>
    </div>
  )
}

export default page
