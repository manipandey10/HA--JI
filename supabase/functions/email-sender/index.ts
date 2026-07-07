import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json().catch(() => ({}));
    const action = body.action || "process_queue";

    // Action: send_direct — send a single email immediately via Resend
    if (action === "send_direct" && body.to && body.subject && body.body) {
      if (!resendApiKey) {
        // No Resend key — queue the email instead so it can be sent later
        const { error: qErr } = await supabase.from("email_queue").insert({
          to_email: body.to,
          subject: body.subject,
          body: body.body,
          status: "pending",
        });
        if (qErr) {
          return new Response(
            JSON.stringify({ error: "Failed to queue email: " + qErr.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        return new Response(
          JSON.stringify({ success: true, message: "Email queued (Resend not configured)", queued: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: Deno.env.get("EMAIL_FROM") || "onboarding@resend.dev",
            to: body.to,
            subject: body.subject,
            html: body.body,
          }),
        });

        const result = await response.json();

        if (response.ok) {
          return new Response(
            JSON.stringify({ success: true, sent: true, result }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } else {
          return new Response(
            JSON.stringify({ error: "Resend API error", details: result }),
            { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } catch (err) {
        return new Response(
          JSON.stringify({ error: "Failed to send email: " + err.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Default action: process_queue — send all pending emails
    const { data: pendingEmails, error: fetchError } = await supabase
      .from("email_queue")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(10);

    if (fetchError) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch emails: " + fetchError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No pending emails", processed: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If no Resend key, mark as failed with a clear message
    if (!resendApiKey) {
      for (const email of pendingEmails) {
        await supabase
          .from("email_queue")
          .update({ status: "failed", error_message: "RESEND_API_KEY not configured" })
          .eq("id", email.id);
      }
      return new Response(
        JSON.stringify({ success: false, error: "RESEND_API_KEY not configured", processed: pendingEmails.length }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = [];

    for (const email of pendingEmails) {
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: Deno.env.get("EMAIL_FROM") || "onboarding@resend.dev",
            to: email.to_email,
            subject: email.subject,
            html: email.body,
          }),
        });

        const result = await response.json();

        if (response.ok) {
          await supabase
            .from("email_queue")
            .update({ status: "sent", sent_at: new Date().toISOString() })
            .eq("id", email.id);
          results.push({ id: email.id, status: "sent", result });
        } else {
          await supabase
            .from("email_queue")
            .update({ status: "failed", error_message: JSON.stringify(result) })
            .eq("id", email.id);
          results.push({ id: email.id, status: "failed", error: result });
        }
      } catch (err) {
        await supabase
          .from("email_queue")
          .update({ status: "failed", error_message: err.message })
          .eq("id", email.id);
        results.push({ id: email.id, status: "failed", error: err.message });
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: results.length, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
