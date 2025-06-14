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
  // Enhanced sanitization for common XML issues
  return (
    xml
      // Replace '>' in tag contents that are not part of tags
      .replace(/>([^<]*?)>([^<]*?)</g, (match, p1, p2) => `>${p1}&gt;${p2}<`)
      // Fix self-closing tags that are malformed
      .replace(/([^/]>)\s*</g, "$1\n<")
      // Remove invalid characters
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, "")
      // Fix double closing tags
      .replace(/<\/([^>]*)><\/\1>/g, "</$1>")
      // Normalize whitespace
      .replace(/\s+/g, " ")
      .trim()
  );
}

function processXMLContent(content, customTag = "") {
  return new Promise((resolve, reject) => {
    const parser = sax.parser(true, {
      trim: true,
      normalize: true,
      lowercase: false,
      xmlns: true,
      position: true,
    });

    let currentProduct = null;
    let currentTag = "";
    let nestedLevel = 0;
    let nestedTags = [];
    let foundFirstProduct = false;
    let hasFinishedFirstProduct = false;
    let errorCount = 0;
    const MAX_ERRORS = 10;

    const productTags = getProductTags(customTag);

    // Enhanced error handling
    parser.onerror = (error) => {
      errorCount++;
      console.warn(`XML parsing warning at line ${parser.line}, column ${parser.column}: ${error.message}`);

      if (errorCount > MAX_ERRORS) {
        reject(new Error(`Too many XML parsing errors (${errorCount}). The XML file may be severely malformed.`));
        return;
      }

      // Try to continue parsing despite errors
      parser.resume();
    };

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

    try {
      const sanitizedContent = sanitizeXML(content);
      parser.write(sanitizedContent).close();
    } catch (error) {
      reject(new Error(`XML processing failed: ${error.message}\nLine: ${parser.line}, Column: ${parser.column}`));
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

    console.log(`Processing URL: ${url}`);
    const xmlContent = await fetchAndProcessXML(url);

    if (!xmlContent) {
      return res.status(400).json({
        success: false,
        error: "Empty XML content received",
      });
    }

    const result = await processXMLContent(xmlContent, customTag);
    res.json(result);
  } catch (error) {
    console.error("Validation failed:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: {
        message: "The XML file appears to be malformed. Common issues include:",
        possibleSolutions: ["Mismatched opening/closing tags", "Invalid characters in the XML", "Improper nesting of elements"],
      },
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

// --- XML Validation Logic Ported from Frontend ---

// Helper: Extract currency from price string
function extractCurrency(price) {
  const currencyAtEnd = price.trim().split(/\s+/).pop();
  if (currencyAtEnd && /^[A-Z]{3}$/.test(currencyAtEnd)) {
    return currencyAtEnd;
  }
  const isoMatch = price.match(/[A-Z]{3}/);
  if (isoMatch) return isoMatch[0];
  const symbolMatch = price.match(/[$€£¥₺]/);
  if (symbolMatch) {
    const symbolToCode = { $: "USD", "€": "EUR", "£": "GBP", "¥": "JPY", "₺": "TRY" };
    return symbolToCode[symbolMatch[0]] || symbolMatch[0];
  }
  return null;
}

function isValidUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
}

const CATEGORY_SEPARATORS = [">", ";", "/", "|", ">>", ">>>"];
const MANDATORY_TAGS = [
  { tag: "product_code", altTag: "", label: "Product Code" },
  { tag: "product_name", altTag: "", label: "Product Name" },
  { tag: "category_code", altTag: "", label: "Category Code" },
  { tag: "category_name", altTag: "", label: "Category Name" },
  { tag: "original_price", altTag: "", label: "Original Price" },
  { tag: "discounted_price", altTag: "", label: "Discounted Price" },
  { tag: "original_price_currency", altTag: "", label: "Price Currency" },
  { tag: "is_active", altTag: "", label: "Is Active" },
  { tag: "product_url", altTag: "", label: "Product URL" },
  { tag: "medium_image", altTag: "", label: "Image URL" },
];

function getTagContent(xmlContent, tagName) {
  if (!tagName) return [];
  const patterns = [tagName, `g:${tagName}`, tagName.replace("g:", "")];
  if (tagName === "original_price") patterns.push("price", "g:price");
  else if (tagName === "discounted_price") patterns.push("sale_price", "g:sale_price");
  for (const pattern of patterns) {
    const regex = new RegExp(`<${pattern}[^>]*>([^<]+)</${pattern}>`, "g");
    const matches = [...xmlContent.matchAll(regex)];
    if (matches.length > 0) {
      return matches.map((match) => match[1].trim());
    }
  }
  return [];
}

function validateMandatoryTags(xmlContent, currentMappings) {
  const errors = [];
  const originalPriceContent = getTagContent(xmlContent, "original_price");
  const discountedPriceContent = getTagContent(xmlContent, "discounted_price");
  const originalPriceCurrencies = originalPriceContent.map(extractCurrency).filter(Boolean);
  const discountedPriceCurrencies = discountedPriceContent.map(extractCurrency).filter(Boolean);
  const originalPriceHasCurrency = originalPriceCurrencies.length > 0;
  const discountedPriceHasCurrency = discountedPriceCurrencies.length > 0;
  if (originalPriceHasCurrency && discountedPriceHasCurrency) {
    const uniqueCurrencies = new Set([...originalPriceCurrencies, ...discountedPriceCurrencies]);
    if (uniqueCurrencies.size > 1) {
      errors.push({ field: "currency", message: `Currency mismatch: Found different currencies in prices (${Array.from(uniqueCurrencies).join(", ")})` });
    }
  }
  if ((originalPriceHasCurrency && !discountedPriceHasCurrency) || (!originalPriceHasCurrency && discountedPriceHasCurrency)) {
    errors.push({ field: "currency", message: "Inconsistent currency usage: Currency found in only one of the price fields" });
  }
  MANDATORY_TAGS.forEach(({ tag, altTag, label }) => {
    const mappedTag = currentMappings[`text_${tag}`];
    const content = mappedTag ? getTagContent(xmlContent, mappedTag) : getTagContent(xmlContent, tag);
    if (tag === "original_price_currency" && originalPriceHasCurrency && discountedPriceHasCurrency) {
      const uniqueCurrencies = new Set([...originalPriceCurrencies, ...discountedPriceCurrencies]);
      if (uniqueCurrencies.size === 1) return;
    }
    if (content.length === 0) {
      const tagDisplay = tag;
      const altTagDisplay = altTag ? ` or ${altTag}` : "";
      errors.push({ field: tag, message: `Missing mandatory field: ${label} (${tagDisplay}${altTagDisplay})` });
    }
  });
  return errors;
}

function validateFieldContents(xmlContent, currentMappings) {
  const errors = [];
  MANDATORY_TAGS.forEach(({ tag, label }) => {
    const mappedTag = currentMappings[`text_${tag}`] || tag;
    const content = getTagContent(xmlContent, mappedTag);
    if (content.length === 0) {
      errors.push({ field: tag, message: `Missing value for mandatory field: ${label}` });
      return;
    }
    content.forEach((value) => {
      if (!value || value.trim() === "" || value.toLowerCase() === "null" || value.toLowerCase() === "undefined") {
        errors.push({ field: tag, message: `Invalid value found for ${label}: Value cannot be empty, null, or undefined` });
      }
    });
    if (tag === "product_url" || tag === "medium_image") {
      content.forEach((url) => {
        if (!isValidUrl(url)) {
          errors.push({ field: tag, message: `Invalid URL format in <${mappedTag}>. URL must start with http:// or https://` });
        }
      });
    }
  });
  const priceFields = [
    { tag: "original_price", label: "Original Price" },
    { tag: "discounted_price", label: "Discounted Price" },
  ];
  priceFields.forEach(({ tag, label }) => {
    const mappedTag = currentMappings[`text_${tag}`] || tag;
    const content = getTagContent(xmlContent, mappedTag);
    content.forEach((price) => {
      const cleanPrice = price.replace(/[$€£¥₺]/g, "").trim();
      if (!/^\d+(\.\d+)?$/.test(cleanPrice)) {
        errors.push({ field: tag, message: `Invalid price format for ${label}: "${price}". Price must be a numerical value.` });
      }
    });
  });
  return errors;
}

function validateCategoryHierarchy(xmlContent, categoryCodeTag, categoryNameTag) {
  const errors = [];
  function getTagContentLocal(tagName, alternativeTag = "") {
    if (!tagName) return [];
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const escapedTagName = escapeRegex(tagName);
    const pattern = new RegExp(`<${escapedTagName}[^>]*>([^<]*)</${escapedTagName}>`, "g");
    const matches = xmlContent.match(pattern);
    const values = matches
      ? matches.map((match) =>
          match
            .replace(new RegExp(`^<${escapedTagName}[^>]*>`), "")
            .replace(new RegExp(`</${escapedTagName}>$`), "")
            .trim()
        )
      : [];
    if (values.length === 0 && alternativeTag) {
      return getTagContentLocal(alternativeTag);
    }
    return values.filter((v) => v !== "");
  }
  const categoryCodes = getTagContentLocal(categoryCodeTag, "category_id");
  const categoryNames = getTagContentLocal(categoryNameTag, "category_desc");
  if (categoryCodes.length === 0) {
    errors.push({ field: "category", message: `Category codes are missing in the XML file (looking for <${categoryCodeTag}> tag)` });
    return errors;
  }
  if (categoryNames.length === 0) {
    errors.push({ field: "category", message: `Category names are missing in the XML file (looking for <${categoryNameTag}> tag)` });
    return errors;
  }
  if (categoryCodes.length !== categoryNames.length) {
    errors.push({ field: "category", message: "The number of category codes does not match the number of category names" });
    return errors;
  }
  function findSeparator(value) {
    for (const separator of CATEGORY_SEPARATORS) {
      if (value.includes(separator)) return separator;
    }
    return null;
  }
  categoryCodes.forEach((code, index) => {
    const name = categoryNames[index];
    const codeSeparator = findSeparator(code);
    const nameSeparator = findSeparator(name);
    if (!codeSeparator && !nameSeparator) return;
    if ((codeSeparator && !nameSeparator) || (!codeSeparator && nameSeparator)) {
      errors.push({ field: "category", message: "Category hierarchy mismatch: One value has hierarchy separator but the other doesn't" });
      return;
    }
    if (codeSeparator !== nameSeparator) {
      errors.push({ field: "category", message: `Category hierarchy mismatch: Different separators used (${codeSeparator} vs ${nameSeparator})` });
      return;
    }
    if (codeSeparator) {
      const codeLevels = code.split(codeSeparator).length;
      const nameLevels = name.split(codeSeparator).length;
      if (codeLevels !== nameLevels) {
        errors.push({ field: "category", message: `Category hierarchy mismatch: Different number of levels (${codeLevels} vs ${nameLevels})` });
      }
    }
  });
  return errors;
}

// --- END XML Validation Logic ---

// New endpoint for XML validation
app.post("/validate-xml-content", (req, res) => {
  try {
    const { xmlContent, currentMappings } = req.body;
    if (!xmlContent) {
      return res.status(400).json({ success: false, error: "xmlContent is required" });
    }
    // Use mappings or fallback to default tags
    const mappedCategoryCode = currentMappings?.text_category_code || "category_code";
    const mappedCategoryName = currentMappings?.text_category_name || "category_name";
    const errors = [];
    errors.push(...validateMandatoryTags(xmlContent, currentMappings || {}));
    errors.push(...validateFieldContents(xmlContent, currentMappings || {}));
    errors.push(...validateCategoryHierarchy(xmlContent, mappedCategoryCode, mappedCategoryName));
    if (errors.length === 0) {
      return res.json({ success: true, validation: [{ field: "success", message: "✓ All validations passed successfully" }] });
    } else {
      return res.json({ success: false, validation: errors });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Server initialization
app.listen(CONFIG.PORT, () => {
  console.log(`✅ XML Parser running at: http://localhost:${CONFIG.PORT}`);
  console.log(`Frontend URL: ${CONFIG.URLS.FRONTEND}`);
  console.log(`Supported product tags: ${CONFIG.DEFAULT_PRODUCT_TAGS.join(", ")}`);
});
