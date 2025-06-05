// import node module libraries
import { FC, useState } from "react";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import axios from "axios";

// import widget/custom components
import { PageHeading } from "widgets";

interface ApiResponse {
  message: string;
}

const WebPush: FC = () => {
  const [checkResult, setCheckResult] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const checkServiceWorker = async () => {
    if (!baseUrl) {
      setCheckResult("[!] Lütfen bir Base URL giriniz");
      return;
    }

    setIsLoading(true);
    setCheckResult(""); // Önceki sonucu temizle
    try {
      const { data } = await axios.post<ApiResponse>(
        "http://localhost:5000/api/service-worker/check",
        { baseUrl }
      );
      setCheckResult(data.message);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Bir hata oluştu";
      setCheckResult(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container fluid className="p-6">
      <PageHeading heading="Web Push Integration" />
      <Row>
        <Col lg={12} md={12} sm={12}>
          <Card>
            <Card.Header>
              <h4 className="mb-0">Web Push Integration Settings</h4>
            </Card.Header>
            <Card.Body>
              <p className="mb-3">
                Configure your web push notification settings here. This allows you to send push notifications to your users.
              </p>
              <Form.Group className="mb-3">
                <Form.Label>Base URL</Form.Label>
                <Form.Control
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://example.com"
                  disabled={isLoading}
                />
                <Form.Text className="text-muted">
                  Service Worker'ın kontrol edileceği sitenin Base URL'ini giriniz
                </Form.Text>
              </Form.Group>
              <Button
                variant="primary"
                onClick={checkServiceWorker}
                className="mb-3"
                disabled={!baseUrl || isLoading}
              >
                {isLoading ? "Kontrol Ediliyor..." : "Service Worker'ı Kontrol Et"}
              </Button>
              {checkResult && (
                <div className="mt-2">
                  <p className="mb-0">{checkResult}</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default WebPush;
