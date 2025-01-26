import { UserButton } from '@clerk/nextjs'
import React from 'react'

function page() {
  return (
    <div>
      Dashboard
      <UserButton/>
    </div>
  )
}

export default page
