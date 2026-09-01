export async function onRequestPost(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://www.event1o1.com',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    const body = await request.json();
    const { name, phone, email, eventType, date, guests, source, msg } = body;

    if (!name || !phone || !eventType) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), {
        status: 400, headers: corsHeaders
      });
    }

    const description = [
      eventType ? `Event Type: ${eventType}` : '',
      date ? `Event Date: ${date}` : '',
      guests ? `Guests: ${guests}` : '',
      source ? `How did you hear: ${source}` : '',
      msg ? `Message: ${msg}` : '',
      'Source: Website Contact Form'
    ].filter(Boolean).join('\n');

    // Odoo JSON-RPC with API key authentication
    // Login first to get session
    const loginRes = await fetch('https://event-1o1.odoo.com/web/session/authenticate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        id: 1,
        params: {
          db: 'event-1o1',
          login: 'event10one@gmail.com',
          password: env.ODOO_API_KEY
        }
      })
    });

    const loginData = await loginRes.json();
    const sessionCookie = loginRes.headers.get('set-cookie');

    if (!loginData.result?.uid) {
      console.error('Auth failed:', JSON.stringify(loginData.error || loginData.result));
      return new Response(JSON.stringify({ success: false, error: 'Auth failed' }), {
        status: 500, headers: corsHeaders
      });
    }

    // Create lead using session cookie
    const leadRes = await fetch('https://event-1o1.odoo.com/web/dataset/call_kw', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': sessionCookie || ''
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        id: 2,
        params: {
          model: 'crm.lead',
          method: 'create',
          args: [{
            name: `Website Enquiry — ${eventType} — ${name}`,
            contact_name: name,
            phone: phone,
            email_from: email || '',
            description: description,
            type: 'lead'
          }],
          kwargs: {}
        }
      })
    });

    const leadData = await leadRes.json();

    if (leadData.result) {
      return new Response(JSON.stringify({ success: true, lead_id: leadData.result }), {
        headers: corsHeaders
      });
    }

    console.error('Lead creation failed:', JSON.stringify(leadData.error));
    return new Response(JSON.stringify({ success: false, error: 'Lead creation failed' }), {
      status: 500, headers: corsHeaders
    });

  } catch (err) {
    console.error('Function error:', err.message, err.stack);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500, headers: corsHeaders
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': 'https://www.event1o1.com',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
