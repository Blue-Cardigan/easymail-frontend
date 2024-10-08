import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Error exchanging code for session:', error)
      // Handle error appropriately
    } else if (data && data.session) {
      console.log('Session data:', JSON.stringify(data.session, null, 2))

      const { access_token, refresh_token, expires_in, provider_token } = data.session

      if (access_token && refresh_token) {
        const { error: insertError } = await supabase
          .from('oauth_tokens')
          .upsert({
            user_id: data.session.user.id,
            access_token,
            refresh_token,
            expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
            provider_token,
          }, {
            onConflict: 'user_id',
          })

        if (insertError) {
          console.error('Error storing OAuth tokens:', insertError)
        } else {
          console.log('OAuth tokens stored successfully')
        }
      } else {
        console.error('Missing access_token or refresh_token')
      }
    }
  }

  const redirectTo = requestUrl.searchParams.get('redirectTo') || '/'
  const redirectUrl = new URL(redirectTo, requestUrl.origin)
  redirectUrl.searchParams.set('fromLogin', 'true')

  return NextResponse.redirect(redirectUrl)
}