const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer");

const app = express();
app.use(cors());
app.use(bodyParser.json());

/**
 * Belirtilen URL'de ilgili script var mı kontrol eder (puppeteer ile)
 * @param {string} baseUrl
 * @returns {Promise<{ found: boolean, message: string }>}
 */
async function checkWebPushScriptWithPuppeteer(baseUrl) {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: false, args: ["--no-sandbox"] });
    const page = await browser.newPage();

    // Gerçek bir tarayıcı gibi davran
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    let scriptRequested = false;
    page.on('request', (request) => {
      console.log("Request URL:", request.url()); // TÜM istekleri logla
      if (request.url().includes("relatedpush")) {
        scriptRequested = true;
      }
    });

    await page.goto(baseUrl, { waitUntil: "networkidle2", timeout: 30000 });
    await page.waitForTimeout(15000);

    await browser.close();

    if (scriptRequested) {
      return { found: true, message: "Script network üzerinden yüklendi: Web Push entegrasyonu doğru." };
    } else {
      return { found: false, message: "Script network üzerinden yüklenmedi: Lütfen entegrasyonu kontrol edin." };
    }
  } catch (err) {
    if (browser) await browser.close();
    return { found: false, message: "Siteye erişilemedi veya bir hata oluştu." };
  }
}

app.post("/api/webpush-script/check", async (req, res) => {
  const { baseUrl } = req.body;
  if (!baseUrl) {
    return res.status(400).json({
      found: false,
      message: "Base URL gerekli",
    });
  }
  const result = await checkWebPushScriptWithPuppeteer(baseUrl);
  if (!result.found) {
    return res.status(404).json(result);
  }
  res.json(result);
});

const PORT = 5003;
app.listen(PORT, () => {
  console.log(`WebPushScriptChecker API ${PORT} portunda çalışıyor`);
});
