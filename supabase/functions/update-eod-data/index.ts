
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
    console.log('Starting EOD data collection process...')

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all current players from the database
    const { data: currentPlayers, error: playersError } = await supabaseClient
      .from('legend_players')
      .select('*')

    if (playersError) {
      console.error('Error fetching players:', playersError)
      throw playersError
    }

    if (!currentPlayers || currentPlayers.length === 0) {
      console.log('No players found in database')
      return new Response(
        JSON.stringify({ message: 'No players found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${currentPlayers.length} players to collect EOD data for`)

    // Fetch fresh data for each player from the API and create EOD records
    const eodRecords = []

    for (const player of currentPlayers) {
      try {
        console.log(`Fetching fresh API data for EOD: ${player.player_name} (${player.player_tag})`)
        
        // Format the player tag for the API call
        const formattedTag = player.player_tag.startsWith('#') ? player.player_tag.substring(1) : player.player_tag
        
        // Make API call to get fresh player data for EOD recording
        const apiResponse = await fetch(`https://api.clashofclans.com/v1/players/%23${formattedTag}`, {
          headers: {
            'Authorization': `Bearer ${Deno.env.get('COC_API_TOKEN')}`,
            'Accept': 'application/json',
          },
        })

        if (!apiResponse.ok) {
          console.error(`API request failed for player ${player.player_name}: ${apiResponse.status}`)
          // Use existing data if API call fails
          eodRecords.push({
            player_tag: player.player_tag,
            trophies: player.trophies
          })
          continue
        }

        const apiData = await apiResponse.json()
        console.log(`Fresh EOD data collected for ${player.player_name}: ${apiData.trophies} trophies`)

        // Add the fresh API data to EOD records
        eodRecords.push({
          player_tag: player.player_tag,
          trophies: apiData.trophies
        })

      } catch (error) {
        console.error(`Error processing player ${player.player_name} for EOD:`, error)
        // Use existing data if there's an error
        eodRecords.push({
          player_tag: player.player_tag,
          trophies: player.trophies
        })
      }
    }

    // Create EOD record with the fresh API data
    console.log('Creating EOD record with fresh API data...')
    const { error: recordError } = await supabaseClient
      .from('eod_records')
      .insert({
        records: eodRecords
      })

    if (recordError) {
      console.error('Error creating EOD record:', recordError)
      throw recordError
    }

    console.log('EOD record created successfully with fresh API data')

    return new Response(
      JSON.stringify({ 
        message: 'EOD data recorded successfully with fresh API data',
        recordsCreated: eodRecords.length,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in EOD recording process:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
