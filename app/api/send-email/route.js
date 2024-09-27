Copyimport { google } from 'googleapis'
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req) {
  const supabase = createRouteHandlerClient({ cookies })
  const { to, subject, body } = await req.json()

  try {
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
      .single()

    if (tokensError) throw tokensError
    if (!tokens || !tokens.refresh_token) {
      console.error('No tokens or refresh token found for user:', session.user.id)
      return NextResponse.json({ error: 'OAuth tokens not found' }, { status: 400 })
    }

    console.log('Tokens retrieved:', tokens)

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/callback`
    )

    oauth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: new Date(tokens.expires_at).getTime(),
    })

    // Force token refresh
    const { credentials } = await oauth2Client.refreshAccessToken()
    console.log('Tokens refreshed:', credentials)

    // Update tokens in Supabase
    await supabase
      .from('oauth_tokens')
      .update({
        access_token: credentials.access_token,
        refresh_token: credentials.refresh_token,
        expires_at: new Date(credentials.expiry_date).toISOString(),
      })
      .eq('user_id', session.user.id)

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

    try {
      await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      })
      console.log('Email sent successfully')
    } catch (gmailError) {
      console.error('Error sending email via Gmail API:', gmailError)
      throw gmailError
    }

    return NextResponse.json({ message: 'Email sent successfully' })
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
