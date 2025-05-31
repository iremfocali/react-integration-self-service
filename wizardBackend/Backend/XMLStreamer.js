/**
 * XML Parser Service
 * This service provides XML parsing capabilities with a focus on extracting product information.
 * It uses a streaming approach for memory efficiency.
 */

const express = require("express");
const fs = require("fs");
const sax = require("sax");
const cors = require("cors");
const https = require("https");
const http = require("http");

const app = express();

// Configuration
const CONFIG = {
  URLS: {
    DEFYA: "https://www.defya.com.tr/XMLExport/30C05A9154B14A65AF058F8CF7403661",
    FRONTEND: "http://localhost:5173",
  },
  DEFAULT_PRODUCT_TAGS: ["item", "product", "Article", "Product", "Item"],
  PORT: process.env.PORT || 3001,
  // TEST_XML_PATH: "../../src/data/pcardin.xml",
  TEST_XML_PATH: "../../src/data/sample.xml",
};

app.use(cors({ origin: CONFIG.URLS.FRONTEND }));
app.use("/parse-local", express.raw({ type: "application/xml", limit: "50mb" }));
app.use(express.json());

/**
 * Get product tags including custom tag if provided
 */
function getProductTags(customTag) {
  const tags = [...CONFIG.DEFAULT_PRODUCT_TAGS];
  if (customTag && typeof customTag === "string" && customTag.trim()) {
    tags.push(customTag.trim());
  }
  return tags;
}

/**
 * Fetches XML content from a URL
 */
async function fetchAndProcessXML(url) {
  try {
    console.log("Fetching XML from URL:", url);
    const client = url.startsWith("https") ? https : http;

    return new Promise((resolve, reject) => {
      client
        .get(url, (response) => {
          if (response.statusCode === 301 || response.statusCode === 302) {
            const redirectUrl = response.headers.location;
            if (redirectUrl) {
              console.log(`Following redirect to: ${redirectUrl}`);
              return fetchAndProcessXML(redirectUrl).then(resolve).catch(reject);
            }
          }

          if (response.statusCode !== 200) {
            reject(new Error(`Failed to fetch. Status code: ${response.statusCode}`));
            return;
          }

          response.setEncoding("utf8");
          let data = "";
          response.on("data", (chunk) => (data += chunk));
          response.on("end", () => resolve(data.trim()));
        })
        .on("error", (err) => reject(new Error(`Request failed: ${err.message}`)));
    });
  } catch (error) {
    throw new Error(`Failed to fetch XML: ${error.message}`);
  }
}

/**
 * Process XML content using SAX parser
 */
function sanitizeXML(xml) {
  // This regex replaces '>' in tag contents that are not part of tags
  return xml.replace(/>([^<]*?)>([^<]*?)</g, (match, p1, p2) => {
    return `>${p1}&gt;${p2}<`;
  });
}

function processXMLContent(content, customTag = "") {
  return new Promise((resolve, reject) => {
    const parser = sax.parser(true); // strict mode
    let currentProduct = null;
    let currentTag = "";
    let nestedLevel = 0;
    let nestedTags = [];
    let foundFirstProduct = false;
    let hasFinishedFirstProduct = false;

    const productTags = getProductTags(customTag);

    // ✅ Sanitize malformed characters
    const sanitizedContent = sanitizeXML(content);

    parser.onopentag = (node) => {
      if (hasFinishedFirstProduct) return;

      currentTag = node.name;

      if (productTags.includes(currentTag)) {
        if (!foundFirstProduct) {
          currentProduct = {
            tag: currentTag,
            content: "",
            children: [],
          };
          foundFirstProduct = true;
          currentProduct.content += `<${currentTag}${Object.entries(node.attributes)
            .map(([key, value]) => ` ${key}="${value}"`)
            .join("")}>`;
        }
        nestedLevel = 0;
      } else if (currentProduct) {
        nestedLevel++;
        if (nestedLevel > 1) {
          nestedTags.push({
            tag: currentTag,
            path: `${currentProduct.tag} > ${currentTag}`,
            level: nestedLevel,
          });
        }
        currentProduct.content += `<${currentTag}${Object.entries(node.attributes)
          .map(([key, value]) => ` ${key}="${value}"`)
          .join("")}>`;
      }
    };

    parser.onclosetag = (tagName) => {
      if (hasFinishedFirstProduct) return;

      if (productTags.includes(tagName)) {
        if (currentProduct && currentProduct.tag === tagName) {
          currentProduct.content += `</${tagName}>`;
          hasFinishedFirstProduct = true;
        }
      } else if (currentProduct) {
        currentProduct.content += `</${tagName}>`;
        nestedLevel--;
      }
    };

    parser.ontext = (text) => {
      if (hasFinishedFirstProduct) return;

      if (currentProduct) {
        currentProduct.content += text;
      }
    };

    parser.onend = () => {
      if (!currentProduct) {
        resolve({
          success: false,
          error: "No product elements found in XML",
          nestedTags: [],
          isValid: false,
          fileType: "xml",
          supportedTags: productTags,
        });
        return;
      }

      const formattedXML = currentProduct.content
        .replace(/></g, ">\n<")
        .replace(/>\s+</g, ">\n<")
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .join("\n");

      resolve({
        success: true,
        xmlString: formattedXML,
        nestedTags,
        isValid: nestedTags.length === 0,
        hasProblematicNesting: nestedTags.length > 0,
        fileType: "xml",
        supportedTags: productTags,
      });
    };

    parser.onerror = (error) => {
      reject(new Error(`XML parsing failed: ${error.message}`));
    };

    try {
      parser.write(sanitizedContent).close(); // 🔁 Use sanitized XML
    } catch (error) {
      reject(new Error(`XML processing failed: ${error.message}`));
    }
  });
}

// Main endpoint for XML validation
app.post("/validate", async (req, res) => {
  try {
    console.log("Handling /validate request");
    const { url, customTag } = req.body;

    if (!url || !url.trim()) {
      return res.status(400).json({
        success: false,
        error: "URL is required",
      });
    }

    const xmlContent = await fetchAndProcessXML(url);
    const result = await processXMLContent(xmlContent, customTag);
    res.json(result);
  } catch (error) {
    console.error("Validation failed:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Modified endpoint for parsing local XML files
app.post("/parse-local", async (req, res) => {
  try {
    console.log("Handling /parse-local request");
    const customTag = req.query.customTag || "";

    // Read from hardcoded test file
    const xmlContent = fs.readFileSync(CONFIG.TEST_XML_PATH, "utf-8");

    const result = await processXMLContent(xmlContent, customTag);
    res.json(result);
  } catch (error) {
    console.error("Local parsing failed:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Server initialization
app.listen(CONFIG.PORT, () => {
  console.log(`✅ XML Parser running at: http://localhost:${CONFIG.PORT}`);
  console.log(`Frontend URL: ${CONFIG.URLS.FRONTEND}`);
  console.log(`Supported product tags: ${CONFIG.DEFAULT_PRODUCT_TAGS.join(", ")}`);
});
