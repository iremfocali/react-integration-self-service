// import node module libraries
import { FC, useState } from "react";
import { Container, Row, Col, Card, Button, Form, InputGroup, Alert } from "react-bootstrap";
import "../../styles/_user.scss";

// import widget/custom components
import { PageHeading } from "widgets";
import FileValidation from "./Product/FileValidation";

interface NestedTag {
  tag: string;
  path: string;
  level: number;
}

const Product: FC = () => {
  const defaultTags = ["item", "product", "Article", "Product", "Item"];

  // State Management
  const [loading, setLoading] = useState<boolean>(false);
  const [xmlData, setXmlData] = useState<string | null>(null);
  const [nestedTags, setNestedTags] = useState<NestedTag[]>([]);
  const [showNestedWarning, setShowNestedWarning] = useState<boolean>(false);
  const [xmlUrl, setXmlUrl] = useState<string>("");
  const [customTag, setCustomTag] = useState<string>("");
  const [hasAddedCustomTag, setHasAddedCustomTag] = useState<boolean>(false);
  const [supportedTags, setSupportedTags] = useState<string[]>(defaultTags);
  const [error, setError] = useState<string | null>(null);

  const handleAddToDefaultTags = () => {
    if (customTag.trim() && !hasAddedCustomTag) {
      setSupportedTags([...supportedTags, customTag.trim()]);
      setHasAddedCustomTag(true);
    }
  };

  const handleParseXML = async () => {
    setError(null); // Clear previous errors

    if (!xmlUrl.trim()) {
      setError("Please enter a valid XML URL");
      return;
    }

    // Basic URL validation
    try {
      new URL(xmlUrl);
    } catch {
      setError("Please enter a valid URL format (e.g., https://example.com/feed.xml)");
      return;
    }

    setLoading(true);
    try {
      console.log("Sending request to validate endpoint with URL:", xmlUrl);

      const requestBody = {
        url: xmlUrl,
        customTag: customTag.trim(),
      };

      const response = await fetch("http://localhost:3001/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Received response:", data);

      if (data.success && data.xmlString) {
        console.log("Setting XML data, length:", data.xmlString.length);
        setXmlData(data.xmlString);

        if (data.hasProblematicNesting) {
          setNestedTags(data.nestedTags);
          setShowNestedWarning(true);
        } else {
          setNestedTags([]);
          setShowNestedWarning(false);
        }
      } else {
        throw new Error(data.error || "Failed to parse XML");
      }
    } catch (error) {
      console.error("Error parsing XML:", error);
      setError(error instanceof Error ? error.message : "Failed to parse XML file. Please check the console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className='p-6'>
      <PageHeading heading='Product Integration' />
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h4 className='mb-0'>Product Integration Settings</h4>
            </Card.Header>
            <Card.Body className='d-flex gap-3'>
              {/* Left Section (URL Input + XML Preview) */}
              <div className='d-flex flex-column gap-3' style={{ width: "50%" }}>
                {/* URL Input */}
                <div className='d-flex flex-column gap-2'>
                  <InputGroup>
                    <Form.Control
                      type='text'
                      className='form-control rounded-start'
                      placeholder='Enter your XML URL'
                      value={xmlUrl}
                      onChange={(e) => {
                        setXmlUrl(e.target.value);
                        setError(null); // Clear error when user types
                      }}
                    />
                    <InputGroup.Text className='p-0 rounded-end'>
                      <Button variant={xmlData ? "outline-success" : "outline-info"} className='border-0 h-100' onClick={handleParseXML} disabled={loading || !xmlUrl.trim()}>
                        {loading ? (
                          <>
                            <span className='spinner-border spinner-border-sm me-1' />
                            Parsing...
                          </>
                        ) : (
                          <>
                            <i className='fe fe-file-text me-1'></i>
                            Parse XML
                          </>
                        )}
                      </Button>
                    </InputGroup.Text>
                  </InputGroup>

                  {/* Error Alert */}
                  {error && (
                    <Alert variant='danger' className='mb-0 mt-2'>
                      <div className='d-flex align-items-center'>
                        <i className='fe fe-alert-circle me-2'></i>
                        {error}
                      </div>
                    </Alert>
                  )}
                </div>

                {/* Warning Alerts */}
                {showNestedWarning && nestedTags.length > 0 && (
                  <Alert variant='danger' className='mb-0'>
                    <Alert.Heading>Invalid XML Structure Detected</Alert.Heading>
                    <p>Your XML contains deeply nested tags. Only one level of nesting is allowed within product tags. Please fix the following nested structures:</p>
                    <ul className='mb-0'>
                      {nestedTags.map((tag, index) => (
                        <li key={index}>
                          <strong>{tag.tag}</strong> (Depth: {tag.level})
                          <br />
                          <small className='text-muted'>Path: {tag.path}</small>
                        </li>
                      ))}
                    </ul>
                  </Alert>
                )}

                {/* Documentation */}
                <div
                  className='p-3 rounded flex-grow-1'
                  style={{
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #e9ecef",
                    minHeight: "calc(100vh - 400px)",
                  }}>
                  {/* XML Preview */}
                  {xmlData ? (
                    <pre
                      className='mb-0'
                      style={{
                        fontSize: "14px",
                        lineHeight: "1.5",
                        overflowY: "auto",
                        overflowX: "auto",
                        backgroundColor: "#f8f9fa",
                        border: "1px solid #e9ecef",
                        padding: "15px",
                        borderRadius: "4px",
                      }}>
                      {xmlData}
                    </pre>
                  ) : (
                    <>
                      <pre
                        style={{
                          fontFamily: 'Consolas, Monaco, "Andale Mono", monospace',
                          fontSize: "14px",
                          lineHeight: "1.5",
                          whiteSpace: "pre",
                          overflowY: "auto",
                          overflowX: "auto",
                          tabSize: 2,
                          marginBottom: "15px",
                        }}>
                        <small>
                          * Your XML file will appear here
                          <br />
                          * Once you parse the XML file, you can map the XML tags to default tags for RMC
                          <br />* Supported product container elements: {supportedTags.join(", ")}
                        </small>
                      </pre>

                      <div className='mt-3'>
                        <label className='form-label small text-muted mb-1'>Custom Product Tag</label>
                        <div className='d-flex gap-2'>
                          <InputGroup size='sm' className='w-50'>
                            <Form.Control type='text' placeholder='Enter your custom product tag' value={customTag} onChange={(e) => setCustomTag(e.target.value)} className='bg-white' disabled={hasAddedCustomTag} />
                            <Button variant='outline-success' size='sm' onClick={handleAddToDefaultTags} disabled={!customTag.trim() || hasAddedCustomTag} title={hasAddedCustomTag ? "Custom tag already added" : !customTag.trim() ? "Please enter a tag" : "Add to supported tags"}>
                              <i className='fe fe-plus-circle'></i>
                            </Button>
                          </InputGroup>
                        </div>
                        <small className='text-muted mt-1 d-block'>{hasAddedCustomTag ? "Custom tag added to supported tags" : "Enter a custom product tag if your XML uses a different tag name"}</small>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Right Section (Mapping Table) */}
              <div style={{ width: "50%" }}>{xmlData && <FileValidation xmlContent={xmlData} />}</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Product;
