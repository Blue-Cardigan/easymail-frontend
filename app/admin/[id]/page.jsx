import CampaignPromptDesigner from '@/components/CampaignPromptDesigner'

export default function AdminCampaignPage({ params }) {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Design Campaign: {params.id}</h1>
      <CampaignPromptDesigner campaignId={params.id} initialData={{}} />
    </div>
  )
}