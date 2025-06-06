const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const filePath = "/relatedpush_sw.js";

async function checkFile(url, path) {
  const cleanUrl = url.replace(/\/+$/, '');
  const fullUrl = cleanUrl + path;
  try {
    const response = await axios.head(fullUrl, { timeout: 5000 });
    if (response.status === 200) {
      return {
        success: true,
        message: `Service worker dosyası bulundu! (${fullUrl})`,
        status: response.status
      };
    } else {
      return {
        success: false,
        message: `Service worker dosyasına ulaşılamadı. (Durum: ${response.status})`,
        status: response.status
      };
    }
  } catch (error) {
    if (error.response) {
      return {
        success: false,
        message: `Service worker dosyasına ulaşılamadı. (Durum: ${error.response.status})`,
        status: error.response.status
      };
    } else {
      return {
        success: false,
        message: `Bir hata oluştu, lütfen adresi ve bağlantınızı kontrol edin.`,
        status: 500
      };
    }
  }
}

app.post('/api/service-worker/check', async (req, res) => {
  const { baseUrl } = req.body;
  if (!baseUrl) {
    return res.status(400).json({
      success: false,
      message: "Base URL gerekli"
    });
  }
  const result = await checkFile(baseUrl, filePath);
  res.json(result);
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`ServiceWorkerChecker API ${PORT} portunda çalışıyor`);
});

