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

    const apiKey = env.ODOO_API_KEY;
    const ODOO_URL = 'https://event-1o1.odoo.com';
    const ODOO_DB = 'event-1o1';
    const ODOO_LOGIN = 'event10one@gmail.com';

    // Step 1: Authenticate with API key to get session
    const authRes = await fetch(`${ODOO_URL}/web/session/authenticate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        id: 1,
        params: {
          db: ODOO_DB,
          login: ODOO_LOGIN,
          password: apiKey
        }
      })
    });

    const authData = await authRes.json();
    const uid = authData.result?.uid;

    if (!uid) {
      // Auth failed - return error  
      const errDetail = authData.error?.data?.message || authData.result?.reason || 'Auth failed';
      return new Response(JSON.stringify({
        success: false,
        error: 'Auth: ' + errDetail
      }), { status: 500, headers: corsHeaders });
    }

    // Get session cookie from auth response
    const setCookie = authRes.headers.get('set-cookie') || '';
    const sessionMatch = setCookie.match(/session_id=([^;]+)/);
    const sessionId = sessionMatch ? sessionMatch[1] : null;

    // Step 2: Create lead using session
    const leadRes = await fetch(`${ODOO_URL}/web/dataset/call_kw`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(sessionId ? { 'Cookie': `session_id=${sessionId}` } : {})
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
      return new Response(JSON.stringify({
        success: true,
        lead_id: leadData.result
      }), { headers: corsHeaders });
    }

    const errMsg = leadData.error?.data?.message || leadData.error?.message || 'Lead creation failed';
    return new Response(JSON.stringify({
      success: false,
      error: errMsg
    }), { status: 500, headers: corsHeaders });

  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: err.message
    }), { status: 500, headers: corsHeaders });
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
