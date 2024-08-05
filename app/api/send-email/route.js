import { google } from 'googleapis'
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req) {
  const supabase = createRouteHandlerClient({ cookies })
  const { to, subject, body } = await req.json()

  try {
    // Get the user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) throw sessionError

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Fetch OAuth tokens from Supabase
    const { data: tokens, error: tokensError } = await supabase
      .from('oauth_tokens')
      .select('access_token, refresh_token, expires_at')
      .eq('user_id', session.user.id)
      .maybeSingle()

    if (tokensError) throw tokensError

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
    )

    // Set credentials and check if token refresh is needed
    oauth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: new Date(tokens.expires_at).getTime(),
    })

    if (oauth2Client.isTokenExpiring()) {
      const { credentials } = await oauth2Client.refreshAccessToken()
      
      // Update tokens in Supabase
      await supabase
        .from('oauth_tokens')
        .update({
          access_token: credentials.access_token,
          refresh_token: credentials.refresh_token,
          expires_at: new Date(credentials.expiry_date).toISOString(),
        })
        .eq('user_id', session.user.id)
    }

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

    const message = [
      `From: ${session.user.email}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      '',
      body
    ].join('\n')

    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    })

    return NextResponse.json({ message: 'Email sent successfully' })
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}