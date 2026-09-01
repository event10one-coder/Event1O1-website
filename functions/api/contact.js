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

    // Odoo API key — Bearer token auth (confirmed working)
    const leadRes = await fetch('https://event-1o1.odoo.com/web/dataset/call_kw', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.ODOO_API_KEY}`
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
            type: 'lead'
          }],
          kwargs: {}
        }
      })
    });

    const leadData = await leadRes.json();

    if (leadData.result) {
      return new Response(JSON.stringify({
        success: true,
        lead_id: leadData.result
      }), { headers: corsHeaders });
    }

    const errMsg = leadData.error?.data?.message || leadData.error?.message || 'CRM error';
    console.error('Odoo error:', errMsg);
    return new Response(JSON.stringify({ success: false, error: errMsg }), {
      status: 500, headers: corsHeaders
    });

  } catch (err) {
    console.error('Function error:', err.message);
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
