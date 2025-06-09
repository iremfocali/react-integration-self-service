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
    browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
    const page = await browser.newPage();
    await page.goto(baseUrl, { waitUntil: "networkidle2", timeout: 20000 });

    const found = await page.evaluate(() => {
      return Array.from(document.scripts).some((s) => s.src && s.src.includes("wps.relateddigital.com/relatedpush_sdk.js"));
    });

    await browser.close();

    if (found) {
      return { found: true, message: "Script bulundu: Web Push entegrasyonu doğru." };
    } else {
      return { found: false, message: "Script bulunamadı: Lütfen entegrasyonu kontrol edin." };
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
