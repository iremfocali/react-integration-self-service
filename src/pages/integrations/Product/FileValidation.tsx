import { FC, useState, useEffect } from "react";
import { Alert, Modal, Button } from "react-bootstrap";
import MappingTable from "./MappingTable";

interface FileValidationProps {
  xmlContent?: string | null;
}

interface ValidationError {
  field: string;
  message: string;
}

interface XMLMapping {
  tag: string;
  altTag: string;
  label: string;
}

// Attribute mappings
const attributeMappings: XMLMapping[] = [
  { tag: "attribute1", altTag: "", label: "Attribute 1" },
  { tag: "attribute2", altTag: "", label: "Attribute 2" },
  { tag: "attribute3", altTag: "", label: "Attribute 3" },
  { tag: "attribute4", altTag: "", label: "Attribute 4" },
  { tag: "attribute5", altTag: "", label: "Attribute 5" },
  { tag: "attribute6", altTag: "", label: "Attribute 6" },
  { tag: "attribute7", altTag: "", label: "Attribute 7" },
  { tag: "attribute8", altTag: "", label: "Attribute 8" },
  { tag: "attribute9", altTag: "", label: "Attribute 9" },
  { tag: "attribute10", altTag: "", label: "Attribute 10" },
];

// Optional mappings
const optionalMappings: XMLMapping[] = [
  { tag: "itemgroupid", altTag: "", label: "Item Group ID" },
  { tag: "agegroup", altTag: "", label: "Age Group" },
  { tag: "brand", altTag: "", label: "Brand" },
  { tag: "color", altTag: "", label: "Color" },
  { tag: "gender", altTag: "", label: "Gender" },
  { tag: "material", altTag: "", label: "Material" },
  { tag: "inventory", altTag: "", label: "Inventory" },
  { tag: "free_delivery", altTag: "", label: "Free Shipping" },
  { tag: "same_day_delivery", altTag: "", label: "Same Day Shipping" },
  { tag: "discount_rate", altTag: "", label: "Discount Rate" },
  { tag: "rating", altTag: "", label: "Rating" },
  { tag: "comment", altTag: "", label: "Comment" },
  { tag: "commentator", altTag: "", label: "Commentator" },
  { tag: "number_of_comments", altTag: "", label: "Comment Count" },
  { tag: "gifts", altTag: "", label: "Gifts" },
  { tag: "default_product", altTag: "", label: "Default Product" },
  { tag: "product", altTag: "item", label: "Product" },
  { tag: "sub_category_code", altTag: "", label: "Sub Category" },
];

const CATEGORY_SEPARATORS = [">", ";", "/", "|", ">>", ">>>"]; // Add more if needed

const validateCategoryHierarchy = (xmlContent: string, categoryCodeTag: string, categoryNameTag: string): ValidationError[] => {
  const errors: ValidationError[] = [];

  console.log("Starting category validation with tags:", {
    categoryCodeTag,
    categoryNameTag,
    xmlContentPreview: xmlContent.substring(0, 200), // Show first 200 chars
  });

  // Create flexible regex patterns that can handle attributes and whitespace
  const getTagContent = (tagName: string, alternativeTag: string = ""): string[] => {
    if (!tagName) {
      console.log("Warning: Empty tag name received");
      return [];
    }

    // Escape special regex characters in tag names
    const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const escapedTagName = escapeRegex(tagName);

    // Create pattern and find matches
    const pattern = new RegExp(`<${escapedTagName}[^>]*>([^<]*)</${escapedTagName}>`, "g");
    const matches = xmlContent.match(pattern);
    const values = matches
      ? matches.map((match) => {
          const content = match.replace(new RegExp(`^<${escapedTagName}[^>]*>`), "").replace(new RegExp(`</${escapedTagName}>$`), "");
          return content.trim();
        })
      : [];

    console.log(`Searching for tag "${tagName}":`, {
      pattern: pattern.toString(),
      matchesFound: matches?.length || 0,
      values,
    });

    // If no matches and alternative tag exists, try that
    if (values.length === 0 && alternativeTag) {
      console.log(`No matches found, trying alternative tag "${alternativeTag}"`);
      const altValues: string[] = getTagContent(alternativeTag);
      return altValues;
    }

    return values.filter((v) => v !== "");
  };

  // Get category codes and names
  const categoryCodes: string[] = getTagContent(categoryCodeTag, "category_id");
  const categoryNames: string[] = getTagContent(categoryNameTag, "category_desc");

  console.log("Found categories:", {
    codes: categoryCodes,
    names: categoryNames,
  });

  if (categoryCodes.length === 0) {
    errors.push({
      field: "category",
      message: `Category codes are missing in the XML file (looking for <${categoryCodeTag}> tag)`,
    });
    return errors;
  }

  if (categoryNames.length === 0) {
    errors.push({
      field: "category",
      message: `Category names are missing in the XML file (looking for <${categoryNameTag}> tag)`,
    });
    return errors;
  }

  if (categoryCodes.length !== categoryNames.length) {
    errors.push({
      field: "category",
      message: "The number of category codes does not match the number of category names",
    });
    return errors;
  }

  const findSeparator = (value: string): string | null => {
    for (const separator of CATEGORY_SEPARATORS) {
      if (value.includes(separator)) {
        return separator;
      }
    }
    return null;
  };

  categoryCodes.forEach((code, index) => {
    const name = categoryNames[index];

    // Find separators in both code and name
    const codeSeparator = findSeparator(code);
    const nameSeparator = findSeparator(name);

    // Case 1: Neither has hierarchy
    if (!codeSeparator && !nameSeparator) {
      return; // Single level categories are valid
    }

    // Case 2: One has hierarchy but the other doesn't
    if ((codeSeparator && !nameSeparator) || (!codeSeparator && nameSeparator)) {
      errors.push({
        field: "category",
        message: "Category hierarchy mismatch: One value has hierarchy separator but the other doesn't",
      });
      return;
    }

    // Case 3: Both have hierarchy but different separators
    if (codeSeparator !== nameSeparator) {
      errors.push({
        field: "category",
        message: `Category hierarchy mismatch: Different separators used (${codeSeparator} vs ${nameSeparator})`,
      });
      return;
    }

    // Case 4: Both have same separator but different levels
    if (codeSeparator) {
      // Add null check for TypeScript
      const codeLevels = code.split(codeSeparator).length;
      const nameLevels = name.split(codeSeparator).length; // Use same separator since we know they match
      if (codeLevels !== nameLevels) {
        errors.push({
          field: "category",
          message: `Category hierarchy mismatch: Different number of levels (${codeLevels} vs ${nameLevels})`,
        });
      }
    }
  });

  return errors;
};

// Mandatory mappings
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

const extractCurrency = (price: string): string | null => {
  // Check for currency at the end of the string (like "100.00 TRY" or "100.00 USD")
  const currencyAtEnd = price.trim().split(/\s+/).pop();
  if (currencyAtEnd && /^[A-Z]{3}$/.test(currencyAtEnd)) {
    return currencyAtEnd;
  }

  // Check for ISO currency codes
  const isoMatch = price.match(/[A-Z]{3}/);
  if (isoMatch) return isoMatch[0];

  // Check for currency symbols
  const symbolMatch = price.match(/[$€£¥₺]/);
  if (symbolMatch) {
    // Map symbols to currency codes
    const symbolToCode: Record<string, string> = {
      $: "USD",
      "€": "EUR",
      "£": "GBP",
      "¥": "JPY",
      "₺": "TRY",
    };
    return symbolToCode[symbolMatch[0]] || symbolMatch[0];
  }

  return null;
};

const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
};

const validateMandatoryTags = (xmlContent: string, currentMappings: Record<string, string>): ValidationError[] => {
  const errors: ValidationError[] = [];

  const getTagContent = (tagName: string) => {
    if (!tagName) return [];

    // Try both with and without g: prefix
    const patterns = [
      tagName, // original tag
      `g:${tagName}`, // with g: prefix
      tagName.replace("g:", ""), // without g: prefix if it had one
    ];

    // Special handling for price and sale_price tags
    if (tagName === "original_price") {
      patterns.push("price", "g:price");
    } else if (tagName === "discounted_price") {
      patterns.push("sale_price", "g:sale_price");
    }

    for (const pattern of patterns) {
      const regex = new RegExp(`<${pattern}[^>]*>([^<]+)</${pattern}>`, "g");
      const matches = [...xmlContent.matchAll(regex)];
      if (matches.length > 0) {
        return matches.map((match) => match[1].trim());
      }
    }
    return [];
  };

  // Get price content
  const originalPriceContent = getTagContent("original_price");
  const discountedPriceContent = getTagContent("discounted_price");

  // Extract currencies from prices
  const originalPriceCurrencies = originalPriceContent.map((price) => extractCurrency(price)).filter((curr): curr is string => curr !== null);
  const discountedPriceCurrencies = discountedPriceContent.map((price) => extractCurrency(price)).filter((curr): curr is string => curr !== null);

  const originalPriceHasCurrency = originalPriceCurrencies.length > 0;
  const discountedPriceHasCurrency = discountedPriceCurrencies.length > 0;

  // Check if both prices have currencies and they match
  if (originalPriceHasCurrency && discountedPriceHasCurrency) {
    const uniqueCurrencies = new Set([...originalPriceCurrencies, ...discountedPriceCurrencies]);
    if (uniqueCurrencies.size > 1) {
      errors.push({
        field: "currency",
        message: `Currency mismatch: Found different currencies in prices (${Array.from(uniqueCurrencies).join(", ")})`,
      });
    }
  }

  // If only one price has currency, warn about inconsistency
  if ((originalPriceHasCurrency && !discountedPriceHasCurrency) || (!originalPriceHasCurrency && discountedPriceHasCurrency)) {
    errors.push({
      field: "currency",
      message: "Inconsistent currency usage: Currency found in only one of the price fields",
    });
  }

  MANDATORY_TAGS.forEach(({ tag, altTag, label }) => {
    // Try to get content with the mapped value first
    const mappedTag = currentMappings[`text_${tag}`];
    const content = mappedTag ? getTagContent(mappedTag) : getTagContent(tag);

    // Skip currency validation if both prices have matching currencies
    if (tag === "original_price_currency" && originalPriceHasCurrency && discountedPriceHasCurrency) {
      const uniqueCurrencies = new Set([...originalPriceCurrencies, ...discountedPriceCurrencies]);
      if (uniqueCurrencies.size === 1) {
        return; // Skip currency validation if both prices have the same currency
      }
    }

    if (content.length === 0) {
      const tagDisplay = tag;
      const altTagDisplay = altTag ? ` or ${altTag}` : "";
      errors.push({
        field: tag,
        message: `Missing mandatory field: ${label} (${tagDisplay}${altTagDisplay})`,
      });
    }
  });

  return errors;
};

const validateUnmappedTags = (xmlContent: string, currentMappings: Record<string, string>): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Extract all tags from XML
  const tagRegex = /<\/?([a-zA-Z0-9_:-]+)[^>]*>/g;
  const matches = [...xmlContent.matchAll(tagRegex)];
  const uniqueTags = new Set<string>();

  matches.forEach((match) => {
    const tag = match[1];
    if (tag && tag.trim() !== "") {
      uniqueTags.add(tag);
    }
  });

  // Get all known tags from mandatory and optional mappings
  const knownTags = new Set([...MANDATORY_TAGS.map((t) => [t.tag, t.altTag]), ...attributeMappings.map((t) => [t.tag, t.altTag]), ...optionalMappings.map((t) => [t.tag, t.altTag])].flat().filter(Boolean));

  // Get all mapped tags from currentMappings
  const mappedTags = new Set(Object.values(currentMappings).filter(Boolean));

  // Find unmapped tags
  const unmappedTags = Array.from(uniqueTags)
    .filter((tag) => !knownTags.has(tag) && !mappedTags.has(tag))
    .filter((tag) => tag.trim() !== "");

  if (unmappedTags.length > 0) {
    errors.push({
      field: "info",
      message: `Optional: Found ${unmappedTags.length} additional XML ${unmappedTags.length === 1 ? "tag" : "tags"} that can be mapped:\n\n${unmappedTags.map((tag) => `  • ${tag}\n`).join("")}\nYou can optionally map these to product attributes if needed.`,
    });
  }

  return errors;
};

const validateFieldContents = (xmlContent: string, currentMappings: Record<string, string>): ValidationError[] => {
  const errors: ValidationError[] = [];

  const getTagContent = (tagName: string): string[] => {
    if (!tagName) return [];

    // Try both with and without g: prefix
    const patterns = [tagName, `g:${tagName}`, tagName.replace("g:", "")];

    // Special handling for price tags
    if (tagName === "original_price") {
      patterns.push("price", "g:price");
    } else if (tagName === "discounted_price") {
      patterns.push("sale_price", "g:sale_price");
    }

    for (const pattern of patterns) {
      const regex = new RegExp(`<${pattern}[^>]*>([^<]+)</${pattern}>`, "g");
      const matches = [...xmlContent.matchAll(regex)];
      if (matches.length > 0) {
        return matches.map((match) => match[1].trim());
      }
    }
    return [];
  };

  // Check mandatory fields for empty, null, or undefined values
  MANDATORY_TAGS.forEach(({ tag, label }) => {
    const mappedTag = currentMappings[`text_${tag}`] || tag;
    const content = getTagContent(mappedTag);

    // Check if the field exists and has content
    if (content.length === 0) {
      errors.push({
        field: tag,
        message: `Missing value for mandatory field: ${label}`,
      });
      return;
    }

    // Check for empty, null, or undefined values
    content.forEach((value) => {
      if (!value || value.trim() === "" || value.toLowerCase() === "null" || value.toLowerCase() === "undefined") {
        errors.push({
          field: tag,
          message: `Invalid value found for ${label}: Value cannot be empty, null, or undefined`,
        });
      }
    });

    // URL validation for specific fields
    if (tag === "product_url" || tag === "medium_image") {
      content.forEach((url) => {
        if (!isValidUrl(url)) {
          errors.push({
            field: tag,
            message: `Invalid URL format in <${mappedTag}>. URL must start with http:// or https://`,
          });
        }
      });
    }
  });

  // Validate price fields are numerical
  const priceFields = [
    { tag: "original_price", label: "Original Price" },
    { tag: "discounted_price", label: "Discounted Price" },
  ];

  priceFields.forEach(({ tag, label }) => {
    const mappedTag = currentMappings[`text_${tag}`] || tag;
    const content = getTagContent(mappedTag);

    content.forEach((price) => {
      // Remove currency symbols and whitespace
      const cleanPrice = price.replace(/[$€£¥₺]/g, "").trim();
      // Check if the remaining string is a valid number
      if (!/^\d+(\.\d+)?$/.test(cleanPrice)) {
        errors.push({
          field: tag,
          message: `Invalid price format for ${label}: "${price}". Price must be a numerical value.`,
        });
      }
    });
  });

  return errors;
};

const FileValidation: FC<FileValidationProps> = ({ xmlContent }): JSX.Element => {
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [currentMappings, setCurrentMappings] = useState<Record<string, string>>({});
  const [isSaved, setIsSaved] = useState(false);

  // Initialize default mappings when XML content changes
  useEffect(() => {
    if (xmlContent) {
      // Set default mappings for mandatory fields that exist in the XML
      const defaultMappings: Record<string, string> = {
        text_category_code: "category_code",
        text_category_name: "category_name",
        text_product_code: "product_code",
        text_product_name: "product_name",
        text_original_price: "original_price",
        text_discounted_price: "discounted_price",
        text_original_price_currency: "original_price_currency",
        text_is_active: "is_active",
        text_product_url: "product_url",
        text_medium_image: "medium_image",
      };

      // Only set mappings for tags that exist in the XML
      const existingMappings = Object.entries(defaultMappings).reduce((acc, [key, value]) => {
        if (getTagContent(value).length > 0) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, string>);

      setCurrentMappings(existingMappings);
    }
  }, [xmlContent]);

  const getTagContent = (tagName: string): string[] => {
    if (!xmlContent || !tagName) return [];

    // Try both with and without g: prefix
    const patterns = [
      tagName, // original tag
      `g:${tagName}`, // with g: prefix
      tagName.replace("g:", ""), // without g: prefix if it had one
    ];

    // Special handling for price and sale_price tags
    if (tagName === "original_price") {
      patterns.push("price", "g:price");
    } else if (tagName === "discounted_price") {
      patterns.push("sale_price", "g:sale_price");
    }

    for (const pattern of patterns) {
      const regex = new RegExp(`<${pattern}[^>]*>([^<]+)</${pattern}>`, "g");
      const matches = [...xmlContent.matchAll(regex)];
      if (matches.length > 0) {
        return matches.map((match) => match[1].trim());
      }
    }
    return [];
  };

  const isSaveEnabled = () => {
    if (!xmlContent) return false;

    // Check if prices have embedded currencies
    const originalPriceContent = getTagContent("original_price");
    const discountedPriceContent = getTagContent("discounted_price");

    const originalPriceCurrencies = originalPriceContent.map((price: string) => extractCurrency(price)).filter((curr: string | null): curr is string => curr !== null);
    const discountedPriceCurrencies = discountedPriceContent.map((price: string) => extractCurrency(price)).filter((curr: string | null): curr is string => curr !== null);

    const originalPriceHasCurrency = originalPriceCurrencies.length > 0;
    const discountedPriceHasCurrency = discountedPriceCurrencies.length > 0;
    const hasSameCurrency = originalPriceHasCurrency && discountedPriceHasCurrency && new Set([...originalPriceCurrencies, ...discountedPriceCurrencies]).size === 1;

    // Check if all mandatory fields are properly mapped
    return MANDATORY_TAGS.every((mapping) => {
      const hasCustomMapping = !!currentMappings[`text_${mapping.tag}`];
      const hasDefaultTag = xmlContent.toLowerCase().includes(`<${mapping.tag.toLowerCase()}>`);
      const hasAlternativeTag = mapping.altTag && xmlContent.toLowerCase().includes(`<${mapping.altTag.toLowerCase()}>`);

      // Skip currency validation if both prices have the same currency
      if (mapping.tag === "original_price_currency" && hasSameCurrency) {
        return true;
      }

      return hasCustomMapping || hasDefaultTag || hasAlternativeTag;
    });
  };

  const handleValidateXML = () => {
    if (!xmlContent) {
      setValidationErrors([{ field: "xml", message: "No XML content to validate" }]);
      setShowModal(true);
      return;
    }

    // Use the raw XML content for validation
    const rawXML = xmlContent;
    console.log("Validating XML content:", rawXML.substring(0, 200)); // Log first 200 chars

    // Collect all validation results
    const errors: ValidationError[] = [];

    // 1. Validate mandatory tags
    const mandatoryTagErrors = validateMandatoryTags(rawXML, currentMappings);
    errors.push(...mandatoryTagErrors);

    // 2. Validate field contents (empty checks and numerical prices)
    const fieldContentErrors = validateFieldContents(rawXML, currentMappings);
    errors.push(...fieldContentErrors);

    // 3. Validate category hierarchy
    const mappedCategoryCode = currentMappings["text_category_code"];
    const mappedCategoryName = currentMappings["text_category_name"];

    // Use default tags if no mappings exist
    const categoryCodeTag = mappedCategoryCode || "category_code";
    const categoryNameTag = mappedCategoryName || "category_name";

    console.log("Category validation - Using tags:", {
      categoryCodeTag,
      categoryNameTag,
      hasMappings: !!mappedCategoryCode || !!mappedCategoryName,
    });

    const categoryErrors = validateCategoryHierarchy(rawXML, categoryCodeTag, categoryNameTag);
    errors.push(...categoryErrors);

    // 4. Check for unmapped tags
    const unmappedTagWarnings = validateUnmappedTags(rawXML, currentMappings);

    // Format final results
    const finalErrors: ValidationError[] = [];

    if (errors.length === 0 && unmappedTagWarnings.length === 0) {
      finalErrors.push({
        field: "success",
        message: "✓ All validations passed successfully",
      });
    } else {
      if (errors.length > 0) {
        // Combine all errors into a single message with header
        const errorMessages = errors.map((error) => error.message);
        finalErrors.push({
          field: "error",
          message: `Fix these issues to accept the XML file:\n\n${errorMessages.join("\n")}`,
        });
      }

      // Add warnings after errors
      finalErrors.push(...unmappedTagWarnings);
    }

    setValidationErrors(finalErrors);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsSaved(false);
  };

  const getAlertVariant = (field: string): string => {
    if (field === "success") return "success";
    if (field === "info") return "info";
    return "danger";
  };

  const handleSaveMappings = () => {
    if (!xmlContent) return;

    // Get the mapped tags for category code and name
    const categoryCodeTag = currentMappings["text_category_code"];
    const categoryNameTag = currentMappings["text_category_name"];

    // Validate category hierarchy
    const errors = validateCategoryHierarchy(xmlContent, categoryCodeTag, categoryNameTag);

    if (errors.length === 0) {
      setIsSaved(true);
      console.log("Mappings saved:", currentMappings);
    } else {
      setValidationErrors(errors);
    }
  };

  const hasOnlyUnmappedWarnings = () => {
    // Return true if there are no errors (only info messages or success)
    return !validationErrors.some((error) => error.field === "error");
  };

  const ValidationResults = ({ inModal = false }: { inModal?: boolean }) => {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopy = (message: string, index: number) => {
      navigator.clipboard
        .writeText(message)
        .then(() => {
          setCopiedIndex(index);
          setTimeout(() => {
            setCopiedIndex(null);
          }, 2000); // Reset after 2 seconds
        })
        .catch((err) => {
          console.error("Failed to copy message:", err);
        });
    };

    return (
      <div className={inModal ? "" : "mt-3 mb-2"}>
        {validationErrors.map((error, index) => (
          <Alert
            key={index}
            variant={getAlertVariant(error.field)}
            className='mb-2'
            style={{
              fontSize: "12px",
              padding: "10px",
              whiteSpace: "pre-line",
            }}>
            <div className='d-flex justify-content-between align-items-start'>
              <div>{error.message}</div>
              {error.field === "error" && (
                <Button
                  variant='outline-danger'
                  size='sm'
                  onClick={() => handleCopy(error.message, index)}
                  style={{
                    marginLeft: "10px",
                    padding: "2px 8px",
                    fontSize: "10px",
                  }}>
                  {copiedIndex === index ? "Copied!" : "Copy"}
                </Button>
              )}
            </div>
          </Alert>
        ))}
      </div>
    );
  };

  return (
    <div>
      <MappingTable xmlData={xmlContent} onMappingChange={setCurrentMappings} onValidateXML={handleValidateXML} />

      {/* Modal for validation results */}
      <Modal show={showModal} onHide={handleCloseModal} size='lg' centered aria-labelledby='contained-modal-title-vcenter'>
        <Modal.Header closeButton>
          <Modal.Title id='validation-results-modal'>Validation Results</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ValidationResults inModal={true} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={handleCloseModal}>
            Close
          </Button>
          {hasOnlyUnmappedWarnings() && (
            <Button variant='primary' onClick={handleSaveMappings} disabled={!isSaveEnabled()}>
              {isSaved ? "Mappings Saved ✓" : "Save Mappings"}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default FileValidation;
