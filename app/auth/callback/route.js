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
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Error exchanging code for session:', error)
    } else if (data?.session) {
      const { access_token, refresh_token, expires_in } = data.session.provider_token
      console.log('Access token:', access_token)
      console.log('Refresh token:', refresh_token)
      console.log('Expires in:', expires_in)
      
      // Store the tokens in your oauth_tokens table
      const { error: insertError } = await supabase
        .from('oauth_tokens')
        .upsert({
          user_id: data.session.user.id,
          access_token: access_token,
          refresh_token: refresh_token,
          expires_at: new Date(Date.now() + expires_in * 1000).toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (insertError) {
        console.error('Error storing tokens:', insertError)
      }
    }
  }

  // Redirect back to the original page
  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}${redirectTo || '/'}?fromLogin=true`)
}