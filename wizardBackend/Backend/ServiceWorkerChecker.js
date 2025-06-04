const axios = require("axios");

const baseUrl = "https://www.relateddigital.com";
const filePath = "/relatedpush_sw.js";

async function checkFile(url, path) {
  const fullUrl = url + path;
  try {
    const response = await axios.head(fullUrl, { timeout: 5000 });
    if (response.status === 200) {
      console.log(`[✓] Dosya bulundu: ${fullUrl}`);
    } else {
      console.log(`[✗] Dosya erişilemedi: ${fullUrl} - Durum: ${response.status}`);
    }
  } catch (error) {
    if (error.response) {
      console.log(`[✗] ${fullUrl} - HTTP Durumu: ${error.response.status}`);
    } else {
      console.log(`[!] Hata oluştu: ${fullUrl} - ${error.message}`);
    }
  }
}

checkFile(baseUrl, filePath);
