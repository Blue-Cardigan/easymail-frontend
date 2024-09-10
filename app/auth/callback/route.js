import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  const supabase = createRouteHandlerClient({ cookies })
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const redirectTo = searchParams.get('redirectTo')

  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect back to the original page
  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}${redirectTo || '/'}?fromLogin=true`)
}