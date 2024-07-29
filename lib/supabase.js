import { createClient } from '@supabase/supabase-js'

const apiUrl = process.env.URL
const apiKey = process.env.ANON_KEY

if (!apiUrl || !apiKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(apiUrl, apiKey)
//Log when the supabase client is created successfully
if (supabase) {
  console.log('Supabase client created successfully')
}

// Helper function to handle Supabase errors
export const handleSupabaseError = (error) => {
  console.error('Supabase error:', error)
  // You can add more error handling logic here
  throw error
}

export const updateCampaign = async (updates) => {
  console.log('Update data:', updates)
  try {
    const payload = {
      campaign_name: updates.campaign_name || '',
      name: updates.name || '',
      campaign_objectives: updates.campaign_objectives || '',
      evidence_data: updates.evidence_data || '',
      current_status: updates.current_status || '',
      desired_response: updates.desired_response || '',
      local_relevance: updates.local_relevance || '',
      details: updates.details || ''
    }

    console.log('Payload being sent:', payload)

    const response = await fetch(apiUrl + '/functions/v1/updateCampaigns', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    // if (error) {
    //   console.error('Supabase function error:', error)
    //   throw error
    // }

    console.log('Response status:', response.status);
    const responseData = await response.json()
    console.log('Response data:', responseData)

    return { response }
  } catch (error) {
    console.error('Error in updateCampaign:', error)
    if (error.message) console.error('Error message:', error.message)
    if (error.response) {
      try {
        const responseText = await error.response.text()
        console.error('Error response:', responseText)
      } catch (e) {
        console.error('Error getting response text:', e)
      }
    }
    handleSupabaseError(error)
  }
}