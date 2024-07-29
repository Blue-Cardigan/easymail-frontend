import { ConstituentForm } from '@/components/ConstituentForm'

export default function LetterGeneratorPage({ params }) {
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