import { ConstituentForm } from '@/components/ConstituentForm'

export default function CampaignPage({ params }) {
  const defaultCampaignData = {
    name: 'Default Campaign',
    description: 'This is a default campaign description.'
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Generate Letter for Campaign: {params.id}</h1>
      <ConstituentForm campaignId={params.id} campaignData={defaultCampaignData} />
    </div>
  )
}

// import Link from 'next/link'

// export default function Home() {
//   return (
//     <div className="min-h-screen bg-background flex flex-col items-center justify-center">
//       <h1 className="text-4xl font-bold mb-8">Campaign Management</h1>
//       <div className="space-y-4">
//       <Link href="/admin/new" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-block">
//         Create New Campaign
//       </Link>
//       <Link href="/campaign/new" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded inline-block">
//         Generate Letter for Existing Campaign
//       </Link>
//       </div>
//     </div>
//   )
// }