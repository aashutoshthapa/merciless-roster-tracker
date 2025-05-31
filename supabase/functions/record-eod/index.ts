import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all current players
    const { data: players, error: playersError } = await supabaseClient
      .from('legend_players')
      .select('*')

    if (playersError) {
      throw playersError
    }

    if (!players || players.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No players found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create EOD record
    const { error: recordError } = await supabaseClient
      .from('eod_records')
      .insert({
        records: players.map(player => ({
          player_tag: player.player_tag,
          trophies: player.trophies
        }))
      })

    if (recordError) {
      throw recordError
    }

    return new Response(
      JSON.stringify({ message: 'EOD record created successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}) 