// import node module libraries
import { FC, useState } from "react";
import { Container, Row, Col, Card, Form, Button, Alert, Table } from "react-bootstrap";
import "../../styles/_user.scss";

// import widget/custom components
import { PageHeading } from "widgets";

interface ValidationResult {
  valid: boolean;
  errors: string[];
  rowData?: string[];
  rowNumber?: number;
  totalRows?: number;
  hasHeader: boolean;
  headers?: string[];
}

const MIN_REQUIRED_ROWS = 3;

const Offline: FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [useSampleData, setUseSampleData] = useState(false);
  const [fileContent, setFileContent] = useState<string>("");
  const [minRowError, setMinRowError] = useState<string | null>(null);
  const [hasHeader, setHasHeader] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        // Optional: Show a success message
        console.log("Text copied to clipboard");
      },
      (err) => {
        console.error("Failed to copy text: ", err);
      }
    );
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setValidationResult(null);
      setUseSampleData(false);
      setMinRowError(null);
    }
  };

  const handleContentChange = (newContent: string) => {
    setFileContent(newContent);
    setMinRowError(null);
  };

  const createSampleFile = async () => {
    // Check if text area has content
    if (!fileContent.trim()) {
      setMinRowError("Please enter or paste your CSV data in the text area first");
      return;
    }

    const blob = new Blob([fileContent], { type: "text/csv" });
    const file = new File([blob], "sample.csv", { type: "text/csv" });
    setSelectedFile(file);
    setUseSampleData(true);
    setValidationResult(null);
    setMinRowError(null);

    // Automatically start validation
    setIsLoading(true);
    const formData = new FormData();
    formData.append("csv", file);
    formData.append("rowNumber", "2"); // Always validate second row
    formData.append("hasHeader", hasHeader.toString());

    try {
      const response = await fetch("http://localhost:3002/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      setValidationResult(result);
      if (!result.valid) {
        setMinRowError(result.errors.join(", "));
      }
    } catch (error) {
      console.error("Upload error:", error);
      setValidationResult({
        valid: false,
        errors: ["An error occurred during file upload"],
        hasHeader: false,
      });
      setMinRowError("An error occurred during file upload");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile && !useSampleData) {
      alert("Please select a file or use sample data");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("csv", selectedFile!);
    formData.append("rowNumber", "2"); // Always validate second row
    formData.append("hasHeader", hasHeader.toString());

    try {
      const response = await fetch("http://localhost:3002/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      setValidationResult(result);
      if (!result.valid) {
        setMinRowError(result.errors.join(", "));
      }
    } catch (error) {
      console.error("Upload error:", error);
      setValidationResult({
        valid: false,
        errors: ["An error occurred during file upload"],
        hasHeader: false,
      });
      setMinRowError("An error occurred during file upload");
    } finally {
      setIsLoading(false);
    }
  };

  const renderMappingTable = (rowData: string[]): JSX.Element => {
    const columnMappings = [
      { name: "Time Stamp", required: true },
      { name: "Customer ID", required: true },
      { name: "Event Type", required: true },
      { name: "Category", required: false },
      { name: "Event Name", required: true },
      { name: "Num1", required: true },
      { name: "Num2", required: true },
      { name: "Var 1", required: false },
      { name: "Var 2", required: false },
      { name: "Var 3", required: false },
      { name: "Var 4", required: false },
      { name: "Var 5", required: false },
      { name: "EventName Attr1", required: false },
      { name: "EventName Attr2", required: false },
      { name: "EventName Attr3", required: false },
      { name: "EventName Attr4", required: false },
      { name: "EventName Attr5", required: false },
      { name: "EventName Attr6", required: false },
      { name: "EventName Attr7", required: false },
      { name: "EventName Attr8", required: false },
      { name: "EventName Attr9", required: false },
      { name: "EventName Attr10", required: false },
      { name: "EventTransaction Attr1 - AttrN", required: false },
    ];

    return (
      <Table striped bordered hover size='sm' className='mt-4'>
        <thead>
          <tr className='bg-light'>
            <th style={{ width: "8%" }}>#</th>
            <th style={{ width: "52%" }}>Parameter Type</th>
            <th style={{ width: "40%" }}>Value</th>
          </tr>
        </thead>
        <tbody>
          {columnMappings.map((column, index) => (
            <tr key={index}>
              <td className='text-center'>{index + 1}</td>
              <td>
                <div className='d-flex justify-content-between align-items-center'>
                  <div>
                    <span className='small'>{column.name}</span>
                    {validationResult?.hasHeader && validationResult.headers && validationResult.headers[index] && <span className='text-muted ms-2 fst-italic small'>({validationResult.headers[index]})</span>}
                  </div>
                  <span className={`badge ${column.required ? "bg-success" : "bg-warning"} rounded-pill ms-2`}>{column.required ? "REQUIRED" : "OPTIONAL"}</span>
                </div>
              </td>
              <td className='font-monospace'>{rowData[index] || <span className='text-muted'>(empty)</span>}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };

  return (
    <Container fluid className='p-6'>
      <PageHeading heading='Offline Integration' />
      <Row>
        <Col lg={12} md={12} sm={12}>
          <Card>
            <Card.Header>
              <h4 className='mb-0'>CSV File Validation</h4>
            </Card.Header>
            <Card.Body>
              <p className='mb-4'>Test your CSV file before uploading it to the offline integration.</p>

              <Form>
                <Row className='mb-4'>
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Upload CSV File</Form.Label>
                      <div className='d-flex gap-2 mb-2'>
                        {selectedFile ? (
                          <>
                            <Button variant='outline-success' onClick={handleUpload} disabled={isLoading || !!minRowError}>
                              {isLoading ? (
                                <>
                                  <span className='spinner-border spinner-border-sm me-1' />
                                  Validating...
                                </>
                              ) : (
                                <>
                                  <i className='fe fe-check-circle me-1'></i>
                                  Use File
                                </>
                              )}
                            </Button>
                            <span className='text-muted align-self-center'>{selectedFile.name}</span>
                            <Button
                              variant='outline-danger'
                              size='sm'
                              onClick={() => {
                                setSelectedFile(null);
                                setFileContent("");
                                setMinRowError(null);
                                setValidationResult(null);
                              }}
                              disabled={isLoading}>
                              <i className='fe fe-x me-1'></i>
                              Clear
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button variant='outline-primary' onClick={() => document.getElementById("csvFileInput")?.click()} disabled={isLoading}>
                              <i className='fe fe-upload me-1'></i>
                              Choose File
                            </Button>
                          </>
                        )}
                        <Form.Control id='csvFileInput' type='file' accept='.csv' onChange={handleFileChange} disabled={isLoading} className='d-none' />
                      </div>
                      {selectedFile && <Form.Check type='checkbox' id='headerCheckbox' label='First row contains column headers' className='mb-2 text-muted' checked={hasHeader} onChange={(e) => setHasHeader(e.target.checked)} />}
                      {!selectedFile && (
                        <>
                          <div className='d-flex justify-content-between align-items-start mb-2'>
                            <Form.Label className='text-muted mb-0'>
                              <small>No file selected. You can use the sample data below:</small>
                            </Form.Label>
                          </div>
                          <Form.Control
                            as='textarea'
                            rows={6}
                            value={fileContent}
                            onChange={(e) => handleContentChange(e.target.value)}
                            disabled={isLoading}
                            style={{
                              fontFamily: "monospace",
                              fontSize: "12px",
                              whiteSpace: "pre",
                              overflowX: "auto",
                            }}
                          />
                          <div className='mt-2'>
                            <Button variant='outline-info' onClick={createSampleFile} disabled={isLoading}>
                              <i className='fe fe-file-text me-1'></i>
                              Use Sample
                            </Button>
                          </div>
                          {minRowError && (
                            <div className='text-danger mt-1'>
                              <div className='d-flex justify-content-between align-items-center'>
                                <small>{minRowError}</small>
                                <Button variant='outline-secondary' size='sm' className='ms-2' onClick={() => copyToClipboard(minRowError)}>
                                  <i className='fe fe-copy me-1'></i>
                                  Copy
                                </Button>
                              </div>
                            </div>
                          )}
                          <Form.Text className='text-muted mt-2'>File must be in CSV format with semicolon (;) as delimiter and contain at least {MIN_REQUIRED_ROWS} rows</Form.Text>
                        </>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                {validationResult && (
                  <div className='mt-4'>
                    <Alert variant={validationResult.valid ? "success" : "danger"}>
                      <Alert.Heading>{validationResult.valid ? "✅ File is Valid" : "❌ Validation Failed"}</Alert.Heading>

                      {validationResult.totalRows !== undefined && <p className='mb-2'>Total rows in file: {validationResult.totalRows}</p>}

                      {validationResult.errors.length > 0 && (
                        <>
                          <p className='mb-2'>The following errors were found:</p>
                          <div className='d-flex justify-content-between align-items-start mb-3'>
                            <ul className='mb-0'>
                              {validationResult.errors.map((error, index) => (
                                <li key={index} className='text-danger'>
                                  {error}
                                </li>
                              ))}
                            </ul>
                            <Button variant='outline-secondary' size='sm' className='ms-2' onClick={() => copyToClipboard(validationResult.errors.join("\n"))}>
                              <i className='fe fe-copy me-1'></i>
                              Copy
                            </Button>
                          </div>
                        </>
                      )}

                      {validationResult.valid && validationResult.rowData && (
                        <div className='mt-3'>
                          <h6 className='mb-2'>Validated Row Data:</h6>
                          {renderMappingTable(validationResult.rowData)}
                          <p className='mt-2 mb-0'>
                            <small className='text-muted'>Row 2 of {validationResult.totalRows}</small>
                          </p>
                        </div>
                      )}
                    </Alert>
                  </div>
                )}
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Offline;
