// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from "https://deno.land/x/openai@v4.24.0/mod.ts";
import { corsHeaders } from "../_shared/cors.js";

const supabase = createClient(
  Deno.env.get('SB_URL') ?? '',
  Deno.env.get('SB_ANON_KEY') ?? ''  
)

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY') ?? ''
});


async function generateGPTSummary(data: any) {
  const prompt = `Summarize the following campaign information:
    Details: ${data.details}
    Campaign Name: ${data.campaign_name}
    Name: ${data.name}
    Campaign Objectives: ${data.campaign_objectives}
    Evidence Data: ${data.evidence_data}
    Desired Response: ${data.desired_response}
    Local Relevance: ${data.local_relevance}
    Current Status: ${data.current_status}
  `
  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 150
  })
  return chatCompletion.choices[0].message.content.trim()
}


serve(async (req) => {
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from "https://deno.land/x/openai@v4.24.0/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";

const supabase = createClient(
  Deno.env.get('SB_URL') ?? '',
  Deno.env.get('SB_ANON_KEY') ?? ''  
)

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY') ?? ''
});


async function generateGPTSummary(data: any) {
  const prompt = `Summarize the following campaign information:
    Details: ${data.details}
    Campaign Name: ${data.campaign_name}
    Name: ${data.name}
    Campaign Objectives: ${data.campaign_objectives}
    Evidence Data: ${data.evidence_data}
    Desired Response: ${data.desired_response}
    Local Relevance: ${data.local_relevance}
    Current Status: ${data.current_status}
  `
  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 150
  })
  return chatCompletion.choices[0].message.content.trim()
}


serve(async (req) => {
  
   if (req.method === 'POST') {
      try {
        const data = await req.json()
        data.gpt_summary = await generateGPTSummary(data)

        const { data: insertedData, error } = await supabase
          .from('campaigns')
          .insert(data)
          .select()
        
        if (error) throw error
        
        return new Response(JSON.stringify(insertedData), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 201
      })} catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400
        })
      }
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 405
  })
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/createTask' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
