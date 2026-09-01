export async function onRequestPost(context) {
  // API key is server-side only — never exposed to browser
  const ODOO_API_KEY = context.env.ODOO_API_KEY;
  const ODOO_URL = 'https://event-1o1.odoo.com';
  const ODOO_LOGIN = 'event10one@gmail.com';

  // CORS — only allow from event1o1.com
  const allowedOrigins = ['https://www.event1o1.com', 'https://event1o1.com', 'https://event1o1.pages.dev'];
  const origin = context.request.headers.get('Origin') || '';
  const corsOrigin = allowedOrigins.includes(origin) ? origin : 'https://www.event1o1.com';

  const corsHeaders = {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // Parse form data from browser
    const body = await context.request.json();
    const { name, phone, email, eventType, date, guests, source, message } = body;

    // Validate required fields
    if (!name || !phone) {
      return new Response(JSON.stringify({ success: false, error: 'Name and phone required' }), {
        status: 400, headers: corsHeaders
      });
    }

    // Build description
    const description = [
      eventType ? `Event Type: ${eventType}` : '',
      date      ? `Event Date: ${date}` : '',
      guests    ? `Guests: ${guests}` : '',
      source    ? `How they found us: ${source}` : '',
      message   ? `Message: ${message}` : '',
      `Submitted from: www.event1o1.com`
    ].filter(Boolean).join('\n');

    // Create lead in Odoo via JSON-RPC using API key
    const odooRes = await fetch(`${ODOO_URL}/web/dataset/call_kw`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ODOO_API_KEY}`
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        id: 1,
        params: {
          model: 'crm.lead',
          method: 'create',
          args: [{
            name: `Website Enquiry — ${eventType || 'Event'} — ${name}`,
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
      return new Response(JSON.stringify({ success: true, lead_id: odooData.result }), {
        status: 200, headers: corsHeaders
      });
    } else {
      console.error('Odoo error:', JSON.stringify(odooData.error));
      return new Response(JSON.stringify({ success: false, error: 'Odoo rejected request' }), {
        status: 500, headers: corsHeaders
      });
    }
  } catch (err) {
    console.error('Function error:', err.message);
    return new Response(JSON.stringify({ success: false, error: 'Server error' }), {
      status: 500, headers: corsHeaders
    });
  }
}

export async function onRequestOptions(context) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
