import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Get the redirectTo parameter
  const redirectTo = requestUrl.searchParams.get('redirectTo') || '/'
  
  // Append a query parameter to indicate the user is returning from login
  const redirectUrl = new URL(redirectTo, requestUrl.origin)
  redirectUrl.searchParams.set('fromLogin', 'true')

  return NextResponse.redirect(redirectUrl)
}