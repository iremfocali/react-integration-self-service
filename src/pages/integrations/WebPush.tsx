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
  const [swResult, setSwResult] = useState("");
  const [scriptResult, setScriptResult] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [isSwLoading, setIsSwLoading] = useState(false);
  const [isScriptLoading, setIsScriptLoading] = useState(false);

  const checkServiceWorker = async () => {
    if (!baseUrl) {
      setSwResult("[!] Lütfen bir Base URL giriniz");
      return;
    }
    setIsSwLoading(true);
    setSwResult("");
    try {
      const { data } = await axios.post<ApiResponse>(
        "http://localhost:5000/api/service-worker/check",
        { baseUrl }
      );
      setSwResult(data.message);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Bir hata oluştu";
      setSwResult(msg);
    } finally {
      setIsSwLoading(false);
    }
  };

  const checkWebPushScript = async () => {
    if (!baseUrl) {
      setScriptResult("[!] Lütfen bir Base URL giriniz");
      return;
    }
    setIsScriptLoading(true);
    setScriptResult("");
    try {
      const { data } = await axios.post<ApiResponse>(
        "http://localhost:5003/api/webpush-script/check",
        { baseUrl }
      );
      setScriptResult(data.message);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Bir hata oluştu";
      setScriptResult(msg);
    } finally {
      setIsScriptLoading(false);
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
                  disabled={isSwLoading || isScriptLoading}
                />
                <Form.Text className="text-muted">
                  Kontrol edilecek sitenin Base URL'ini giriniz
                </Form.Text>
              </Form.Group>
              <div className="d-flex gap-2 mb-3">
                <Button
                  variant="primary"
                  onClick={checkServiceWorker}
                  disabled={!baseUrl || isSwLoading}
                >
                  {isSwLoading ? "Kontrol Ediliyor..." : "Service Worker'ı Kontrol Et"}
                </Button>
                <Button
                  variant="success"
                  onClick={checkWebPushScript}
                  disabled={!baseUrl || isScriptLoading}
                >
                  {isScriptLoading ? "Kontrol Ediliyor..." : "Web Push Script'i Kontrol Et"}
                </Button>
              </div>
              <Row>
                <Col md={6}>
                  <h6>Service Worker Sonucu</h6>
                  {swResult && (
                    <div className="mt-2">
                      <p className="mb-0">{swResult}</p>
                    </div>
                  )}
                </Col>
                <Col md={6}>
                  <h6>Web Push Script Sonucu</h6>
                  {scriptResult && (
                    <div className="mt-2">
                      <p className="mb-0">{scriptResult}</p>
                    </div>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default WebPush;
