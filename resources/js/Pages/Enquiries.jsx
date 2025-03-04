import MasterLayout from '@/Layouts/MasterLayout'
import { Head } from '@inertiajs/react'
import React from 'react'

const Enquiries = () => {
  return (
    <MasterLayout>
      <Head title="Enquiries" />

      <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="bg-white p-6 text-gray-900">
          Enquiries
        </div>
      </div>
    </MasterLayout>
  )
}

export default Enquiries