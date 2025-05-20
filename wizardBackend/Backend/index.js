const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");

const app = express();

// Configure CORS for development
const corsOptions = {
  origin: "*", // Allow requests from any origin
  methods: ["GET", "POST", "OPTIONS"], // Allowed methods
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  credentials: true, // Allow credentials
  maxAge: 86400, // Cache preflight requests for 24 hours
};

app.use(cors(corsOptions));
app.use(express.json());

const pdfEventLabels = ["VL-Login", "VL-Signup", "VL-SearchResultView", "VL-CategoryView", "VL-ProductDetailView", "VL-CartView", "VL-AddFav", "VL-RemoveFav", "VL-PurchaseView", "VL-PageView", "VL-CustomEventType1", "VL-CustomEventType2"];

app.post("/api/event-check", async (req, res) => {
  const { url, expectedLabel } = req.body;
  if (!url) {
    return res.status(400).json({ error: "URL is required." });
  }

  try {
    const result = await checkDataLayerEvents(url, expectedLabel);
    res.json(result);
  } catch (error) {
    console.error("Error during check:", error);
    res.status(500).json({ error: error.message || "An error occurred." });
  }
});

async function checkDataLayerEvents(url, expectedLabel) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-accelerated-2d-canvas", "--disable-gpu"],
  });

  try {
    const page = await browser.newPage();
    let capturedEvents = [];

    await page.exposeFunction("onDataLayerPush", (event) => {
      console.log("Received event:", event);
      capturedEvents.push(event);
    });

    await page.evaluateOnNewDocument(() => {
      window.dataLayer = window.dataLayer || [];
      const originalPush = window.dataLayer.push;
      window.dataLayer.push = function () {
        console.log("DataLayer push:", arguments[0]);
        window.onDataLayerPush(arguments[0]);
        return originalPush.apply(this, arguments);
      };
    });

    console.log("Navigating to:", url);
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    // Wait for 5 seconds
    await new Promise((r) => setTimeout(r, 5000));

    let filteredEvents = capturedEvents;
    if (expectedLabel) {
      filteredEvents = capturedEvents.filter((ev) => ev?.vl_label === expectedLabel);
    }

    if (!filteredEvents.length) {
      return { success: false, message: "Expected event(s) not found.", events: capturedEvents };
    }

    return { success: true, events: filteredEvents, allEvents: capturedEvents };
  } finally {
    await browser.close();
  }
}

// Endpoint to search for a specific event label
app.post("/api/event-search", async (req, res) => {
  const { url, eventLabel } = req.body;
  if (!url || !eventLabel) {
    return res.status(400).json({ error: "URL and eventLabel are required." });
  }

  try {
    const result = await searchEventInDataLayer(url, eventLabel);
    res.json(result);
  } catch (error) {
    console.error("Error during event search:", error);
    res.status(500).json({ error: error.message || "An error occurred." });
  }
});

async function searchEventInDataLayer(url, eventLabel) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-accelerated-2d-canvas", "--disable-gpu"],
  });
  try {
    const page = await browser.newPage();
    let capturedEvents = [];

    await page.exposeFunction("onDataLayerPush", (event) => {
      capturedEvents.push(event);
    });

    await page.evaluateOnNewDocument(() => {
      window.dataLayer = window.dataLayer || [];
      const originalPush = window.dataLayer.push;
      window.dataLayer.push = function () {
        window.onDataLayerPush(arguments[0]);
        return originalPush.apply(this, arguments);
      };
    });

    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
    await new Promise((r) => setTimeout(r, 5000));

    // Find events with the requested event label
    const foundEvents = capturedEvents.filter((ev) => ev?.vl_label === eventLabel);
    if (foundEvents.length === 0) {
      return { success: false, message: `Event not found: ${eventLabel}`, allEvents: capturedEvents };
    }
    return { success: true, count: foundEvents.length, events: foundEvents, allEvents: capturedEvents };
  } finally {
    await browser.close();
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at: http://localhost:${PORT}`));
