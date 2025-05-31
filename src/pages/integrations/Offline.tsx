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

const SAMPLE_CSV_ROW = "Time Stamp;Customer ID;Event Type;Category;Event Name;Num1;Num2;Var 1;Var 2;Var 3;Var 4;Var 5;EventName Attr1;EventName Attr2;EventName Attr3;EventName Attr4;EventName Attr5;EventName Attr6;EventName Attr7;EventName Attr8;EventName Attr9;Attr10;EventTransaction Attr1 - AttrN\n23.10.2024 03:10;ca0653e7-b7d9-4e6c-bc41-583fe2161708;7;888;0;1;2;;;;;;;;;;;;;;;;f51e5204-b66a-4716-85d6-7ee623956634";

const MIN_REQUIRED_ROWS = 3;

const Offline: FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [useSampleData, setUseSampleData] = useState(false);
  const [fileContent, setFileContent] = useState<string>("");
  const [minRowError, setMinRowError] = useState<string | null>(null);
  const [hasHeader, setHasHeader] = useState(false);

  const validateNumericalFields = (values: string[]): string[] => {
    const errors: string[] = [];

    // Check Event Type (index 2) - must be an integer
    if (values[2]) {
      const eventType = Number(values[2]);
      if (isNaN(eventType) || !Number.isInteger(eventType)) {
        errors.push("Event Type must be an integer value");
      }
    }

    // Check Num1 (index 5) - can be float
    if (values[5]) {
      const num1 = Number(values[5].replace(",", ".")); // Handle both comma and dot as decimal separator
      if (isNaN(num1)) {
        errors.push("Num1 must be a valid number (integer or decimal)");
      }
    }

    // Check Num2 (index 6) - can be float
    if (values[6]) {
      const num2 = Number(values[6].replace(",", ".")); // Handle both comma and dot as decimal separator
      if (isNaN(num2)) {
        errors.push("Num2 must be a valid number (integer or decimal)");
      }
    }

    return errors;
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setMinRowError(null);
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setValidationResult(null);
      setUseSampleData(false);

      // Read and validate rows
      const text = await file.text();
      const rows = text.split("\n").filter((row) => row.trim().length > 0);

      // Validate minimum rows
      if (rows.length < MIN_REQUIRED_ROWS) {
        setMinRowError(`File must contain at least ${MIN_REQUIRED_ROWS} rows. Current rows: ${rows.length}`);
        return;
      }

      // Get the row to validate (second row if has header, first row if no header)
      const rowToValidate = hasHeader ? rows[1]?.split(";") : rows[0]?.split(";");
      if (rowToValidate) {
        const numericalErrors = validateNumericalFields(rowToValidate);
        if (numericalErrors.length > 0) {
          setMinRowError(numericalErrors.join(", "));
        }
      }
    }
  };

  const handleContentChange = (newContent: string) => {
    setFileContent(newContent);
    const rows = newContent.split("\n").filter((row) => row.trim().length > 0);

    if (rows.length < MIN_REQUIRED_ROWS) {
      setMinRowError(`Sample must contain at least ${MIN_REQUIRED_ROWS} rows. Current rows: ${rows.length}`);
    } else {
      // Validate numerical fields in the second row
      const secondRow = rows[1]?.split(";") || [];
      const numericalErrors = validateNumericalFields(secondRow);
      if (numericalErrors.length > 0) {
        setMinRowError(numericalErrors.join(", "));
      } else {
        setMinRowError(null);
      }
    }
  };

  const createSampleFile = () => {
    const blob = new Blob([SAMPLE_CSV_ROW], { type: "text/csv" });
    const file = new File([blob], "sample.csv", { type: "text/csv" });
    setSelectedFile(file);
    setUseSampleData(true);
    setValidationResult(null);
    setFileContent(SAMPLE_CSV_ROW);
    const rows = SAMPLE_CSV_ROW.split("\n").filter((row) => row.trim().length > 0);
    setMinRowError(rows.length < MIN_REQUIRED_ROWS ? `Sample must contain at least ${MIN_REQUIRED_ROWS} rows. Current rows: ${rows.length}` : null);
  };

  const handleUpload = async () => {
    if (!selectedFile && !useSampleData) {
      alert("Please select a file or use sample data");
      return;
    }

    if (minRowError) {
      alert("Please fix the validation errors before proceeding");
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
    } catch (error) {
      console.error("Upload error:", error);
      setValidationResult({
        valid: false,
        errors: ["An error occurred during file upload"],
        hasHeader: false,
      });
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
                            <Button variant='outline-info' onClick={createSampleFile} disabled={isLoading}>
                              <i className='fe fe-file-text me-1'></i>
                              Use Sample
                            </Button>
                          </>
                        )}
                        <Form.Control id='csvFileInput' type='file' accept='.csv' onChange={handleFileChange} disabled={isLoading} className='d-none' />
                      </div>
                      {!selectedFile && (
                        <>
                          <Form.Check type='checkbox' id='headerCheckbox' label='First row contains column headers' className='mb-2 text-muted' checked={hasHeader} onChange={(e) => setHasHeader(e.target.checked)} />
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
                          {minRowError && (
                            <div className='text-danger mt-1'>
                              <small>{minRowError}</small>
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
                          <ul className='mb-3'>
                            {validationResult.errors.map((error, index) => (
                              <li key={index} className='text-danger'>
                                {error}
                              </li>
                            ))}
                          </ul>
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
