import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { mentorId, mentorName, mentorEmail } = await req.json();

    // Configure SMTP client
    const client = new SmtpClient();
    await client.connectTLS({
      hostname: "smtp.gmail.com",
      port: 465,
      username: Deno.env.get("SMTP_USERNAME") || "",
      password: Deno.env.get("SMTP_PASSWORD") || "",
    });

    // Send approval request email
    await client.send({
      from: Deno.env.get("SMTP_USERNAME") || "",
      to: "santosh.inbox8@gmail.com",
      subject: "New Mentor Approval Request",
      content: `
        A new mentor has registered and needs approval:
        
        Name: ${mentorName}
        Email: ${mentorEmail}
        ID: ${mentorId}
        
        To approve this mentor, use the following link:
        ${Deno.env.get("SUPABASE_URL")}/functions/v1/approve-mentor?id=${mentorId}&token=${Deno.env.get("APPROVAL_TOKEN")}
      `,
    });

    await client.close();

    return new Response(
      JSON.stringify({ message: 'Approval request sent successfully' }),
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