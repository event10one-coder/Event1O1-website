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
    const UID = 2;

    // Step 1: Create opportunity (type=opportunity shows in Pipeline)
    const createRes = await fetch(`${ODOO_URL}/jsonrpc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', method: 'call', id: 1,
        params: {
          service: 'object', method: 'execute_kw',
          args: [
            ODOO_DB, UID, apiKey,
            'crm.lead', 'create',
            [{
              name: `Website Enquiry — ${eventType} — ${name}`,
              contact_name: name,
              phone: phone,
              email_from: email || '',
              description: description,
              type: 'opportunity'
            }]
          ]
        }
      })
    });

    const createData = await createRes.json();
    const leadId = createData.result;

    if (!leadId) {
      const errMsg = createData.error?.data?.message || 'Creation failed';
      return new Response(JSON.stringify({ success: false, error: errMsg }), {
        status: 500, headers: corsHeaders
      });
    }

    // Step 2: Send email notification via Odoo mail
    const emailBody = `
<p>New website enquiry received on Event 1O1:</p>
<table style="border-collapse:collapse;width:100%">
  <tr><td style="padding:6px;border:1px solid #ddd;font-weight:bold">Name</td><td style="padding:6px;border:1px solid #ddd">${name}</td></tr>
  <tr><td style="padding:6px;border:1px solid #ddd;font-weight:bold">Phone</td><td style="padding:6px;border:1px solid #ddd">${phone}</td></tr>
  <tr><td style="padding:6px;border:1px solid #ddd;font-weight:bold">Email</td><td style="padding:6px;border:1px solid #ddd">${email || 'Not provided'}</td></tr>
  <tr><td style="padding:6px;border:1px solid #ddd;font-weight:bold">Event Type</td><td style="padding:6px;border:1px solid #ddd">${eventType}</td></tr>
  ${date ? `<tr><td style="padding:6px;border:1px solid #ddd;font-weight:bold">Event Date</td><td style="padding:6px;border:1px solid #ddd">${date}</td></tr>` : ''}
  ${guests ? `<tr><td style="padding:6px;border:1px solid #ddd;font-weight:bold">Guests</td><td style="padding:6px;border:1px solid #ddd">${guests}</td></tr>` : ''}
  ${source ? `<tr><td style="padding:6px;border:1px solid #ddd;font-weight:bold">Source</td><td style="padding:6px;border:1px solid #ddd">${source}</td></tr>` : ''}
  ${msg ? `<tr><td style="padding:6px;border:1px solid #ddd;font-weight:bold">Message</td><td style="padding:6px;border:1px solid #ddd">${msg}</td></tr>` : ''}
</table>
<p><a href="https://event-1o1.odoo.com/odoo/crm/${leadId}">View in Odoo CRM →</a></p>
    `.trim();

    await fetch(`${ODOO_URL}/jsonrpc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', method: 'call', id: 2,
        params: {
          service: 'object', method: 'execute_kw',
          args: [
            ODOO_DB, UID, apiKey,
            'mail.mail', 'create',
            [{
              subject: `New Enquiry: ${eventType} — ${name} | Event 1O1 Website`,
              email_to: 'contact@event1o1.com',
              email_from: 'contact@event1o1.com',
              body_html: emailBody,
              auto_delete: true
            }]
          ]
        }
      })
    });

    // Step 3: Send mail immediately
    const mailRes = await fetch(`${ODOO_URL}/jsonrpc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', method: 'call', id: 3,
        params: {
          service: 'object', method: 'execute_kw',
          args: [
            ODOO_DB, UID, apiKey,
            'mail.mail', 'process_email_queue',
            []
          ]
        }
      })
    });

    return new Response(JSON.stringify({
      success: true,
      lead_id: leadId
    }), { headers: corsHeaders });

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
