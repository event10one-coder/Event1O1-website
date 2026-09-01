export async function onRequestPost(context) {
  const { request, env } = context;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://www.event1o1.com',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await request.json();
    const { name, phone, email, eventType, date, guests, source, msg } = body;

    // Validate required fields
    if (!name || !phone || !eventType) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), {
        status: 400, headers: corsHeaders
      });
    }

    // Build lead description
    const description = [
      eventType ? `Event Type: ${eventType}` : '',
      date ? `Event Date: ${date}` : '',
      guests ? `Guests: ${guests}` : '',
      source ? `How did you hear: ${source}` : '',
      msg ? `Message: ${msg}` : '',
      `Source: Website Contact Form`
    ].filter(Boolean).join('\n');

    // Create lead in Odoo CRM via JSON-RPC using API key
    const odooRes = await fetch('https://event-1o1.odoo.com/web/dataset/call_kw', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa('event10one@gmail.com:' + env.ODOO_API_KEY)}`
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        id: 1,
        params: {
          model: 'crm.lead',
          method: 'create',
          args: [{
            name: `Website Enquiry — ${eventType} — ${name}`,
            contact_name: name,
            phone: phone,
            email_from: email || '',
            description: description,
            type: 'lead',
            source_id: false
          }],
          kwargs: {}
        }
      })
    });

    const odooData = await odooRes.json();

    if (odooData.result) {
      return new Response(JSON.stringify({
        success: true,
        lead_id: odooData.result
      }), { headers: corsHeaders });
    } else {
      console.error('Odoo error:', JSON.stringify(odooData.error));
      return new Response(JSON.stringify({
        success: false,
        error: 'CRM submission failed'
      }), { status: 500, headers: corsHeaders });
    }

  } catch (err) {
    console.error('Function error:', err.message);
    return new Response(JSON.stringify({
      success: false,
      error: 'Server error'
    }), { status: 500, headers: corsHeaders });
  }
}

export async function onRequestOptions(context) {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': 'https://www.event1o1.com',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
