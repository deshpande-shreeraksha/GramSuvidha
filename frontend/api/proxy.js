// Vercel Serverless Function Proxy
// Forwards all request methods, headers, and streams (including image uploads) to BACKEND_URL

module.exports = async (req, res) => {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    return res.status(500).json({ 
      error: 'BACKEND_URL environment variable is not configured', 
      message: 'Please set BACKEND_URL in Vercel project settings to your Render backend URL.' 
    });
  }

  // Construct target URL (req.url starts with /api/... or /uploads/...)
  const targetUrl = `${backendUrl.replace(/\/$/, '')}${req.url}`;
  
  try {
    const headers = { ...req.headers };
    // Remove host to prevent SSL/hostname mismatch errors on Render
    delete headers.host;

    const response = await (async () => {
      const fetchOptions = {
        method: req.method,
        headers
      };

      if (req.method !== 'GET' && req.method !== 'HEAD') {
        const chunks = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        fetchOptions.body = Buffer.concat(chunks);
      }

      return fetch(targetUrl, fetchOptions);
    })();

    // Copy all response headers to the client
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    res.status(response.status);
    
    // Read response body as Buffer and return to client
    const arrayBuffer = await response.arrayBuffer();
    res.end(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error('Vercel dynamic proxy error:', error);
    res.status(500).json({ error: 'Dynamic proxy failed', message: error.message });
  }
};

module.exports.config = {
  api: {
    bodyParser: false, // Disable body parsing so binary files (profile photos) stream through unchanged
  },
};
