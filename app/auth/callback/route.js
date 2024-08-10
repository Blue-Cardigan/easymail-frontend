import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  const supabase = createRouteHandlerClient({ cookies })
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const returnTo = searchParams.get('returnTo')

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect('/error')
    }

    if (returnTo) {
      return NextResponse.redirect(new URL(`${returnTo}?fromLogin=true`, req.url))
    }

    if (type === 'user') {
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

      return NextResponse.redirect(new URL('/', req.url))
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
  return NextResponse.redirect(new URL('/', req.url))
}