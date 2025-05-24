import { FC, useState, useMemo } from "react";
import { Table, Form, Badge, Button } from "react-bootstrap";

interface MappingTableProps {
  onCustomMappingChange?: (name: string, value: string) => void;
  xmlData?: string | null;
  onMappingChange?: (mappings: Record<string, string>) => void;
  onValidateXML?: () => void;
}

interface XMLMapping {
  defaultTag: string;
  alternativeTag: string;
  csvHeader: string;
  customMapping: string;
  name: string;
  csvName: string;
  isOptionalIfPriceHasCurrency?: boolean;
}

// Helper function to check if a price string contains a currency code
const extractCurrencyFromPrice = (price: string): string | null => {
  // Common currency codes and symbols
  const currencyPatterns = [
    /[A-Z]{3}\s*$/, // ISO currency codes like USD, EUR, TRY at the end
    /[$€£¥₺]/, // Common currency symbols
    /\s+[A-Z]{3}/, // Currency codes with space before
  ];

  for (const pattern of currencyPatterns) {
    const match = price.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }
  return null;
};

// Helper function to check if XML content has prices with embedded currencies
export const hasPricesWithCurrency = (xmlContent: string, priceTag: string, alternativeTag?: string): boolean => {
  const getTagContent = (tagName: string) => {
    // Match exact tag name without automatically handling g: prefix
    const regex = new RegExp(`<${tagName}[^>]*>([^<]+)</${tagName}>`, "g");
    const matches = [...xmlContent.matchAll(regex)];
    return matches.map((match) => match[1].trim());
  };

  const prices = [...getTagContent(priceTag), ...(alternativeTag ? getTagContent(alternativeTag) : [])];

  return prices.some((price) => extractCurrencyFromPrice(price) !== null);
};

// Mandatory mappings
const mandatoryMappings: XMLMapping[] = [
  {
    defaultTag: "product_code",
    alternativeTag: "id",
    csvHeader: "ProductCode",
    customMapping: "",
    name: "text_product_code",
    csvName: "text_ProductCode",
  },
  {
    defaultTag: "product_name",
    alternativeTag: "title",
    csvHeader: "ProductName",
    customMapping: "",
    name: "text_product_name",
    csvName: "text_ProductName",
  },
  {
    defaultTag: "category_code",
    alternativeTag: "product_type",
    csvHeader: "CategoryCode",
    customMapping: "",
    name: "text_category_code",
    csvName: "text_CategoryCode",
  },
  {
    defaultTag: "category_name",
    alternativeTag: "",
    csvHeader: "CategoryName",
    customMapping: "",
    name: "text_category_name",
    csvName: "text_CategoryName",
  },
  {
    defaultTag: "original_price",
    alternativeTag: "price",
    csvHeader: "OriginalPrice",
    customMapping: "",
    name: "text_original_price",
    csvName: "text_OriginalPrice",
  },
  {
    defaultTag: "discounted_price",
    alternativeTag: "sale_price",
    csvHeader: "DiscountedPrice",
    customMapping: "",
    name: "text_discounted_price",
    csvName: "text_DiscountedPrice",
  },
  {
    defaultTag: "original_price_currency",
    alternativeTag: "",
    csvHeader: "Currency",
    customMapping: "",
    name: "text_original_price_currency",
    csvName: "text_Currency",
    isOptionalIfPriceHasCurrency: true,
  },
  {
    defaultTag: "is_active",
    alternativeTag: "",
    csvHeader: "IsActive",
    customMapping: "",
    name: "text_is_active",
    csvName: "text_IsActive",
  },
  {
    defaultTag: "product_url",
    alternativeTag: "link",
    csvHeader: "ProductURL",
    customMapping: "",
    name: "text_product_url",
    csvName: "text_ProductURL",
  },
  {
    defaultTag: "medium_image",
    alternativeTag: "image_link",
    csvHeader: "MediumImageURL",
    customMapping: "",
    name: "text_medium_image",
    csvName: "text_MediumImageURL",
  },
];

// Attribute mappings
const attributeMappings: XMLMapping[] = [
  { defaultTag: "attribute1", alternativeTag: "custom_label_0", csvHeader: "Attribute1", customMapping: "", name: "text_attribute1", csvName: "text_Attribute1" },
  { defaultTag: "attribute2", alternativeTag: "custom_label_1", csvHeader: "Attribute2", customMapping: "", name: "text_attribute2", csvName: "text_Attribute2" },
  { defaultTag: "attribute3", alternativeTag: "custom_label_2", csvHeader: "Attribute3", customMapping: "", name: "text_attribute3", csvName: "text_Attribute3" },
  { defaultTag: "attribute4", alternativeTag: "custom_label_3", csvHeader: "Attribute4", customMapping: "", name: "text_attribute4", csvName: "text_Attribute4" },
  { defaultTag: "attribute5", alternativeTag: "custom_label_4", csvHeader: "Attribute5", customMapping: "", name: "text_attribute5", csvName: "text_Attribute5" },
  { defaultTag: "attribute6", alternativeTag: "custom_label_5", csvHeader: "Attribute6", customMapping: "", name: "text_attribute6", csvName: "text_Attribute6" },
  { defaultTag: "attribute7", alternativeTag: "custom_label_6", csvHeader: "Attribute7", customMapping: "", name: "text_attribute7", csvName: "text_Attribute7" },
  { defaultTag: "attribute8", alternativeTag: "custom_label_7", csvHeader: "Attribute8", customMapping: "", name: "text_attribute8", csvName: "text_Attribute8" },
  { defaultTag: "attribute9", alternativeTag: "custom_label_8", csvHeader: "Attribute9", customMapping: "", name: "text_attribute9", csvName: "text_Attribute9" },
  { defaultTag: "attribute10", alternativeTag: "custom_label_9", csvHeader: "Attribute10", customMapping: "", name: "text_attribute10", csvName: "text_Attribute10" },
];

// Optional mappings
const optionalMappings: XMLMapping[] = [
  { defaultTag: "discount_price_currency", alternativeTag: "discount_price_currency_try", csvHeader: "DiscountCurrency", customMapping: "", name: "text_discount_price_currency", csvName: "text_DiscountCurrency", isOptionalIfPriceHasCurrency: true },
  { defaultTag: "itemgroupid", alternativeTag: "item_group_id", csvHeader: "ItemGroupID", customMapping: "", name: "text_itemgroupid", csvName: "text_ItemGroupID" },
  { defaultTag: "agegroup", alternativeTag: "age_group", csvHeader: "AgeGroup", customMapping: "", name: "text_agegroup", csvName: "text_AgeGroup" },
  { defaultTag: "brand", alternativeTag: "", csvHeader: "Brand", customMapping: "", name: "text_brand", csvName: "text_Brand" },
  { defaultTag: "color", alternativeTag: "", csvHeader: "Color", customMapping: "", name: "text_color", csvName: "text_Color" },
  { defaultTag: "gender", alternativeTag: "", csvHeader: "Gender", customMapping: "", name: "text_gender", csvName: "text_Gender" },
  { defaultTag: "material", alternativeTag: "", csvHeader: "Material", customMapping: "", name: "text_material", csvName: "text_Material" },
  { defaultTag: "large_image", alternativeTag: "", csvHeader: "LargeImageURL", customMapping: "", name: "text_large_image", csvName: "text_LargeImageURL" },
  { defaultTag: "small_image", alternativeTag: "additional_image_link", csvHeader: "SmallImageURL", customMapping: "", name: "text_small_image", csvName: "text_SmallImageURL" },
  { defaultTag: "inventory", alternativeTag: "availability", csvHeader: "Inventory", customMapping: "", name: "text_inventory", csvName: "text_Inventory" },
  { defaultTag: "free_delivery", alternativeTag: "shipping", csvHeader: "FreeShipping", customMapping: "", name: "text_free_delivery", csvName: "text_FreeShipping" },
  { defaultTag: "same_day_delivery", alternativeTag: "", csvHeader: "ShippingOnSameDay", customMapping: "", name: "text_same_day_delivery", csvName: "text_ShippingOnSameDay" },
  { defaultTag: "discount_rate", alternativeTag: "", csvHeader: "DiscountRatio", customMapping: "", name: "text_discount_rate", csvName: "text_DiscountRatio" },
  { defaultTag: "rating", alternativeTag: "", csvHeader: "Rating", customMapping: "", name: "text_rating", csvName: "text_Rating" },
  { defaultTag: "comment", alternativeTag: "", csvHeader: "Comment", customMapping: "", name: "text_comment", csvName: "text_Comment" },
  { defaultTag: "commentator", alternativeTag: "", csvHeader: "Commentator", customMapping: "", name: "text_commentator", csvName: "text_Commentator" },
  { defaultTag: "number_of_comments", alternativeTag: "", csvHeader: "CommentCount", customMapping: "", name: "text_number_of_comments", csvName: "text_CommentCount" },
  { defaultTag: "gifts", alternativeTag: "", csvHeader: "Gifts", customMapping: "", name: "text_gifts", csvName: "text_Gifts" },
  { defaultTag: "default_product", alternativeTag: "", csvHeader: "DefaultProduct", customMapping: "", name: "text_default_product", csvName: "text_DefaultProduct" },
  { defaultTag: "product", alternativeTag: "item", csvHeader: "", customMapping: "", name: "text_product", csvName: "text_" },
  { defaultTag: "sub_category_code", alternativeTag: "sub_category", csvHeader: "", customMapping: "", name: "text_sub_category_code", csvName: "text_" },
];

const MappingTable: FC<MappingTableProps> = ({ onCustomMappingChange, onMappingChange, onValidateXML, xmlData }): JSX.Element => {
  const [mappingValues, setMappingValues] = useState<Record<string, string>>({});

  // Extract all tags from XML
  const xmlTags = useMemo(() => {
    if (!xmlData) return [];

    const tagRegex = /<([^/\s>]+)[^>]*>/g;
    const matches = [...xmlData.matchAll(tagRegex)];
    const uniqueTags = new Set<string>();

    matches.forEach((match) => {
      const fullTag = match[1].trim();
      if (fullTag && !fullTag.includes("/")) {
        uniqueTags.add(fullTag);
      }
    });

    return Array.from(uniqueTags).sort();
  }, [xmlData]);

  // Helper function to check if a tag exists in XML
  const isTagPresent = (tag: string) => {
    if (!xmlData || !tag) return false;

    // Try both with and without g: prefix
    const patterns = [
      tag.replace("g:", ""), // without g: prefix if it had one
    ];

    for (const pattern of patterns) {
      const tagPattern = new RegExp(`<${pattern}[^>]*>.*?</${pattern}>`, "i");
      if (tagPattern.test(xmlData)) {
        return true;
      }
    }
    return false;
  };

  const handleCustomMappingChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;
    const newMappings = {
      ...mappingValues,
      [name]: value,
    };
    setMappingValues(newMappings);
    if (onCustomMappingChange) {
      onCustomMappingChange(name, value);
    }
    if (onMappingChange) {
      onMappingChange(newMappings);
    }
  };

  const renderTableSection = (mappings: XMLMapping[], title: string, variant: string = "light") => (
    <>
      <tr className={`table-${variant}`}>
        <th colSpan={3} className='text-center py-2'>
          <h6 className='mb-0'>{title}</h6>
        </th>
      </tr>
      {mappings.map((mapping, index) => {
        const customValue = mappingValues[mapping.name] || "";
        const isCustomMatching = isTagPresent(customValue);
        const isDefaultMatching = isTagPresent(mapping.defaultTag) || isTagPresent(`g:${mapping.defaultTag}`);
        const isAlternativeMatching = mapping.alternativeTag && (mapping.alternativeTag.startsWith("g:") ? isTagPresent(mapping.alternativeTag) : isTagPresent(mapping.alternativeTag) || isTagPresent(`g:${mapping.alternativeTag}`));

        let isCurrencyOptional = false;
        if (mapping.isOptionalIfPriceHasCurrency && xmlData) {
          if (mapping.defaultTag.includes("original_price_currency")) {
            isCurrencyOptional = hasPricesWithCurrency(xmlData, "original_price", "price");
          } else if (mapping.defaultTag.includes("discount_price_currency")) {
            isCurrencyOptional = hasPricesWithCurrency(xmlData, "discounted_price", "sale_price");
          }
        }

        const isMandatory = mandatoryMappings.includes(mapping) && !isCurrencyOptional;
        const needsMapping = isMandatory && !isDefaultMatching && !isAlternativeMatching && !isCustomMatching;

        return (
          <tr key={index}>
            <td className='align-middle' style={{ width: "30%" }}>
              <Form.Control type='text' value={mapping.defaultTag} size='sm' disabled className={`bg-light ${isDefaultMatching ? "matching-tag-input" : ""}`} />
            </td>
            <td className='align-middle' style={{ width: "30%" }}>
              <Form.Control type='text' value={mapping.alternativeTag} size='sm' disabled className={`bg-light ${isAlternativeMatching ? "matching-tag-input" : ""}`} />
            </td>
            <td className='align-middle' style={{ width: "40%" }}>
              <Form.Select
                size='sm'
                name={mapping.name}
                value={customValue}
                onChange={handleCustomMappingChange}
                className={`
                  ${isCustomMatching ? "matching-tag-input" : ""} 
                  ${needsMapping && !isAlternativeMatching ? "unmapped-tag-input" : ""}
                `}
                disabled={isCurrencyOptional}>
                <option value=''>Select XML tag</option>
                {xmlTags.map((tag: string) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </Form.Select>
            </td>
          </tr>
        );
      })}
    </>
  );

  return (
    <div style={{ height: "calc(100vh - 200px)", position: "sticky", top: "20px" }}>
      <div style={{ overflowY: "auto", height: "calc(100% - 60px)" }}>
        <Table id='XMLMappingTable' size='sm' className='table table-hover mb-0' bordered>
          <thead style={{ position: "sticky", top: 0, backgroundColor: "white", zIndex: 1 }}>
            <tr>
              <th style={{ width: "30%" }}>1. Default XML Tag</th>
              <th style={{ width: "30%" }}>2. Alternative XML Tag</th>
              <th style={{ width: "40%" }}>Custom XML Tag</th>
            </tr>
          </thead>
          <tbody>
            {renderTableSection(mandatoryMappings, "Mandatory Fields", "warning")}
            {renderTableSection(optionalMappings, "Optional Fields", "light")}
            {renderTableSection(attributeMappings, "Product Attributes", "info")}
          </tbody>
        </Table>
      </div>
      <div className='d-flex justify-content-end mt-3'>
        <Button variant='secondary' onClick={onValidateXML}>
          Validate XML
        </Button>
      </div>
    </div>
  );
};

export default MappingTable;
