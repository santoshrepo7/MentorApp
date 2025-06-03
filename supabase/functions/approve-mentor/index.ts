import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'npm:@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const mentorId = url.searchParams.get('id');
    const token = url.searchParams.get('token');

    if (!mentorId || !token) {
      throw new Error('Missing required parameters');
    }

    if (token !== Deno.env.get("APPROVAL_TOKEN")) {
      throw new Error('Invalid approval token');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error } = await supabase
      .from('professionals')
      .update({ 
        is_verified: true,
        approval_status: 'approved',
        approval_date: new Date().toISOString()
      })
      .eq('id', mentorId);

    if (error) throw error;

    return new Response(
      JSON.stringify({ message: 'Mentor approved successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});