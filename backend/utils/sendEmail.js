const nodemailer = require('nodemailer');
const dns = require('dns');

// Force IPv4 resolution to prevent ENETUNREACH errors on certain local networks
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const sendEmail = async (toEmail, subject, htmlContent) => {
  // If BREVO_API_KEY is configured, use the HTTP API (avoids SMTP IP blocking entirely)
  if (process.env.BREVO_API_KEY) {
    try {
      console.log(`Attempting to send email via Brevo HTTP API to ${toEmail}...`);
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': process.env.BREVO_API_KEY,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: { 
            name: "GramSuvidha", 
            email: process.env.SENDER_EMAIL || process.env.SMTP_USER || "gramsuvidha.ai@gmail.com"
          },
          to: [{ email: toEmail }],
          subject: subject,
          htmlContent: htmlContent
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`Email successfully sent via Brevo API to ${toEmail}. Message ID: ${data.messageId}`);
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || response.statusText);
      }
    } catch (error) {
      console.error(`Failed to send email via Brevo API to ${toEmail}:`, error.message);
      console.log('Falling back to SMTP configuration...');
    }
  }

  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = process.env.SMTP_PORT || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    console.error('SMTP credentials (SMTP_USER and SMTP_PASS) not configured in the backend environment variables.');
    return false;
  }

  try {
    console.log(`Attempting to send email via SMTP (${smtpHost}) to ${toEmail}...`);

    // Resolve host to IPv4 to prevent ENETUNREACH IPv6 errors
    let resolvedHost = smtpHost;
    try {
      const address = await new Promise((resolve, reject) => {
        dns.lookup(smtpHost, { family: 4 }, (err, addr) => {
          if (err) reject(err);
          else resolve(addr);
        });
      });
      resolvedHost = address;
      console.log(`Resolved SMTP host ${smtpHost} to IPv4 address: ${resolvedHost}`);
    } catch (dnsErr) {
      console.warn(`DNS lookup failed for ${smtpHost}, falling back to default:`, dnsErr.message);
    }

    const senderEmail = process.env.SENDER_EMAIL || smtpUser;

    const transporter = nodemailer.createTransport({
      host: resolvedHost,
      port: parseInt(smtpPort),
      secure: parseInt(smtpPort) === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass
      },
      tls: {
        rejectUnauthorized: false,
        servername: smtpHost // Required when using IP address as host to match certificate
      }
    });

    const info = await transporter.sendMail({
      from: `"GramSuvidha" <${senderEmail}>`,
      to: toEmail,
      subject: subject,
      html: htmlContent
    });

    console.log(`Email successfully sent via SMTP to ${toEmail}. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`Failed to send email via SMTP to ${toEmail}:`, error.message);
    return false;
  }
};

module.exports = sendEmail;
