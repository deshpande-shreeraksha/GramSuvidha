const dns = require('dns');

// Helper to translate text using Google's public translation endpoint
const translateText = async (text, targetLang, sourceLang = 'auto') => {
  if (!text || targetLang === sourceLang) return text;
  
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Translate responded with status ${response.status}`);
    }
    const data = await response.json();
    if (data && data[0]) {
      return data[0].map(segment => segment[0]).join('');
    }
    return text;
  } catch (error) {
    console.error(`Translation from ${sourceLang} to ${targetLang} failed:`, error.message);
    return text; // Fallback
  }
};

module.exports = translateText;
