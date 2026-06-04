const dns = require('dns');
const https = require('https');

// Helper to translate text using Google's public translation endpoint
const translateText = async (text, targetLang, sourceLang = 'auto') => {
  if (!text || targetLang === sourceLang) return text;
  
  return new Promise((resolve) => {
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
      
      https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed && parsed[0]) {
              resolve(parsed[0].map(segment => segment[0]).join(''));
            } else {
              resolve(text);
            }
          } catch (e) {
            resolve(text);
          }
        });
      }).on('error', (err) => {
        console.error(`Translation from ${sourceLang} to ${targetLang} failed:`, err.message);
        resolve(text);
      });
    } catch (error) {
      console.error(`Translation from ${sourceLang} to ${targetLang} failed:`, error.message);
      resolve(text); // Fallback
    }
  });
};

module.exports = translateText;
