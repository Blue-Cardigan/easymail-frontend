import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminNotFound from '../not-found'
import ShareCampaignPage from '../share/[url]/page'
import CampaignDesignPage from '../new/page'

export default async function AdminCatchAll({ params }) {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  if (!params.slug) {
    // This is the /admin route
    return <div>Admin Dashboard</div>
  }

  if (params.slug[0] === 'new') {
    return <CampaignDesignPage params={params} />
  }

  if (params.slug[0] === 'share' && params.slug[1]) {
    return <ShareCampaignPage />
  }

  // If we reach here, it's an invalid route
  return <AdminNotFound />
}