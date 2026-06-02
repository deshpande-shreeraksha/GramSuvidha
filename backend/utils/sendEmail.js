const nodemailer = require('nodemailer');
const dns = require('dns');

// Force IPv4 resolution to prevent ENETUNREACH errors on certain local networks
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const sendEmail = async (toEmail, subject, htmlContent) => {
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
      from: `"GramSuvidha" <${smtpUser}>`,
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
