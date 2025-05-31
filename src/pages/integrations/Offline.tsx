// import node module libraries
import { FC, useState } from "react";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";

// import widget/custom components
import { PageHeading } from "widgets";

const Offline: FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hasHeader, setHasHeader] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors: string[];
    rowData?: any;
    rowNumber?: number;
    totalRows?: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setValidationResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Lütfen bir dosya seçin");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("csv", selectedFile);
    formData.append("rowNumber", "2");
    formData.append("hasHeader", hasHeader ? "true" : "false");

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
        errors: ["Dosya yükleme sırasında bir hata oluştu"],
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container fluid className="p-6">
      <PageHeading heading="Offline Integration" />
      <Row>
        <Col lg={12} md={12} sm={12}>
          <Card>
            <Card.Header>
              <h4 className="mb-0">Offline Integration Settings</h4>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>CSV Dosyası Seçin</Form.Label>
                  <Form.Control
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    disabled={isLoading}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="İlk satır başlık (header) içeriyor"
                    checked={hasHeader}
                    onChange={(e) => setHasHeader(e.target.checked)}
                    disabled={isLoading}
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  onClick={handleUpload}
                  disabled={!selectedFile || isLoading}
                >
                  {isLoading ? "Kontrol Ediliyor..." : "Dosyayı Kontrol Et"}
                </Button>
              </Form>

              {validationResult && (
                <div className="mt-4">
                  <Alert variant={validationResult.valid ? "success" : "danger"}>
                    <Alert.Heading>
                      {validationResult.valid
                        ? "✅ Dosya Geçerli"
                        : "❌ Dosya Geçersiz"}
                    </Alert.Heading>
                    {validationResult.errors.length > 0 && (
                      <>
                        <p>Bulunan Hatalar:</p>
                        <ul>
                          {validationResult.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </>
                    )}
                    {validationResult.rowData && (
                      <div className="mt-3">
                        <h5>Satır Verileri:</h5>
                        <pre className="bg-light p-3 rounded">
                          {JSON.stringify(validationResult.rowData, null, 2)}
                        </pre>
                        <p className="mt-2">
                          <small>
                            Satır {validationResult.rowNumber}
                          </small>
                        </p>
                      </div>
                    )}
                  </Alert>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Offline;
