import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(req) {
  console.log('GET request received at /auth/callback')
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ 
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  })
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const returnTo = searchParams.get('returnTo')

  if (code) {
    console.log('code:', code)
    try {
      await supabase.auth.exchangeCodeForSession(code)
    } catch (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(new URL('/error', req.url))
    }

    if (returnTo) {
      return NextResponse.redirect(new URL(returnTo, req.url))
    }

    if (type === 'user' || !type) {
      // Store OAuth tokens in the database for users
      const { error: insertError } = await supabase
        .from('oauth_tokens')
        .upsert({
          user_id: data.user.id,
          access_token: data.session.provider_token,
          refresh_token: data.session.provider_refresh_token,
          expires_at: new Date(data.session.expires_at * 1000).toISOString(),
        }, {
          onConflict: 'user_id',
        })

      if (insertError) {
        console.error('Error storing OAuth tokens:', insertError)
      }

      // Redirect to the returnTo URL or home page
      return NextResponse.redirect(returnTo ? new URL(returnTo, process.env.NEXT_PUBLIC_SITE_URL) : new URL('/', process.env.NEXT_PUBLIC_SITE_URL))
    } else if (type === 'admin') {
      // Check if the user is an admin
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('id')
        .eq('user_id', data.user.id)
        .single()

      if (adminError || !adminData) {
        // If not an admin, sign out and redirect to admin login
        await supabase.auth.signOut()
        return NextResponse.redirect(new URL('/admin/login', req.url))
      }

      // If admin, redirect to admin/new
      return NextResponse.redirect(new URL('/admin/new', req.url))
    }
  }

  // If no type is specified or something goes wrong, redirect to the home page
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL))
}