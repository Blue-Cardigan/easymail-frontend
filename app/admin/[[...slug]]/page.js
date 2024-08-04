import { notFound } from 'next/navigation'
import AdminNotFound from '../not-found'

// This is a simplified check. You might need to adjust this based on your actual admin routes.
const validAdminRoutes = ['new', 'share']

export default function AdminCatchAll({ params }) {
  // Check if the route is valid
  if (!params.slug || (params.slug.length === 1 && validAdminRoutes.includes(params.slug[0]))) {
    // This is a valid route, so we should render the actual page
    // You might need to import and render the correct component based on the route
    return <div>Valid Admin Page</div>
  }

  // If we reach here, it's an invalid route
  return <AdminNotFound />
}