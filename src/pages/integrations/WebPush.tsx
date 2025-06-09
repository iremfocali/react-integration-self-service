// import node module libraries
import { FC, useState } from "react";
import { Container, Row, Col, Card, Button, Form, Alert } from "react-bootstrap";
import axios from "axios";
import type { AxiosError } from "axios";

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
  const [copySuccess, setCopySuccess] = useState(false);
  const [swError, setSwError] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const [swCodeCopied, setSwCodeCopied] = useState(false);

  const serviceWorkerCode = `importScripts('https://wps.relateddigital.com/relatedpush_sw.js');`;

  const scriptCode = `<script>(function(d,t){
var e = d.createElement(t),
    s = d.getElementsByTagName(t)[0];
    e.src = "https://wps.relateddigital.com/relatedpush_sdk.js?ckey=74C9BB1BBC5D4AB89DFCFDA808111C2E&aid=5e42f28c-f2d9-4249-b55b-2e8eb1a3fc09";
    e.async = true;
    s.parentNode.insertBefore(e,s);
}(document,"script"));</script>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(scriptCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleSwCodeCopy = async () => {
    try {
      await navigator.clipboard.writeText(serviceWorkerCode);
      setSwCodeCopied(true);
      setTimeout(() => setSwCodeCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy service worker code: ", err);
    }
  };

  const handleSwDownload = () => {
    const blob = new Blob([serviceWorkerCode], { type: "text/javascript" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "relatedpush_sw.js";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const checkServiceWorker = async () => {
    if (!baseUrl) {
      setSwResult("[!] Lütfen bir Base URL giriniz");
      setSwError(true);
      return;
    }
    setIsSwLoading(true);
    setSwResult("");
    setSwError(false);
    try {
      const { data } = await axios.post<ApiResponse>("http://localhost:5000/api/service-worker/check", { baseUrl });
      setSwResult(data.message);
      setSwError(false);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      const msg = axiosError.response?.data?.message || axiosError.message || "Bir hata oluştu";
      setSwResult(msg);
      setSwError(true);
    } finally {
      setIsSwLoading(false);
    }
  };

  const checkWebPushScript = async () => {
    if (!baseUrl) {
      setScriptResult("[!] Lütfen bir Base URL giriniz");
      setScriptError(true);
      return;
    }
    setIsScriptLoading(true);
    setScriptResult("");
    setScriptError(false);
    try {
      const { data } = await axios.post<ApiResponse>("http://localhost:5003/api/webpush-script/check", { baseUrl });
      setScriptResult(data.message);
      setScriptError(false);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      const msg = axiosError.response?.data?.message || axiosError.message || "Bir hata oluştu";
      setScriptResult(msg);
      setScriptError(true);
    } finally {
      setIsScriptLoading(false);
    }
  };

  const handleServiceWorkerClick = () => {
    if (swError) {
      handleSwDownload();
    } else {
      checkServiceWorker();
    }
  };

  const handleWebPushScriptClick = () => {
    if (scriptError) {
      handleCopy();
    } else {
      checkWebPushScript();
    }
  };

  return (
    <Container fluid className='p-6'>
      <PageHeading heading='Web Push Integration' />
      <Row>
        <Col lg={12} md={12} sm={12}>
          <Card>
            <Card.Header>
              <h4 className='mb-0'>Web Push Integration Settings</h4>
            </Card.Header>
            <Card.Body>
              <p className='mb-3'>Configure your web push notification settings here. This allows you to send push notifications to your users.</p>
              <Form.Group className='mb-3'>
                <Form.Label>Base URL</Form.Label>
                <Form.Control type='text' value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder='https://example.com' disabled={isSwLoading || isScriptLoading} />
                <Form.Text className='text-muted'>Kontrol edilecek sitenin Base URL'ini giriniz</Form.Text>
              </Form.Group>
              <div className='d-flex gap-2 mb-3'>
                <Button variant={swError ? "danger" : "primary"} onClick={handleServiceWorkerClick} disabled={!baseUrl || isSwLoading}>
                  {isSwLoading ? "Kontrol Ediliyor..." : swError ? "Service Worker'ı İndir" : "Service Worker'ı Kontrol Et"}
                </Button>
                <Button variant='success' onClick={handleWebPushScriptClick} disabled={!baseUrl || isScriptLoading}>
                  {isScriptLoading ? "Kontrol Ediliyor..." : scriptError ? "Web Push Script'i Kopyala" : "Web Push Script'i Kontrol Et"}
                </Button>
              </div>
              <Row>
                <Col md={6}>
                  <h6>Service Worker Sonucu</h6>
                  {swResult && (
                    <>
                      <Alert variant={swError ? "danger" : "success"} className='mt-2'>
                        {swResult}
                      </Alert>
                      {swError && (
                        <div className='mt-3'>
                          <h6>Service Worker Dosyası</h6>
                          <pre className='bg-light p-3 rounded position-relative'>
                            {serviceWorkerCode}
                            <div className='position-absolute top-0 end-0 m-2'>
                              <Button variant={swCodeCopied ? "success" : "primary"} size='sm' onClick={handleSwCodeCopy} className='me-2'>
                                {swCodeCopied ? "Copied!" : "Copy"}
                              </Button>
                              <Button variant='primary' size='sm' onClick={handleSwDownload}>
                                Download
                              </Button>
                            </div>
                          </pre>
                        </div>
                      )}
                    </>
                  )}
                </Col>
                <Col md={6}>
                  <h6>Web Push Script Sonucu</h6>
                  {scriptResult && (
                    <>
                      <Alert variant={scriptError ? "danger" : "success"} className='mt-2'>
                        {scriptResult}
                      </Alert>
                      {scriptError && (
                        <div className='mt-3'>
                          <h6>Web Push Script</h6>
                          <pre className='bg-light p-3 rounded position-relative'>
                            {scriptCode}
                            <div className='position-absolute top-0 end-0 m-2'>
                              <Button variant={copySuccess ? "success" : "primary"} size='sm' onClick={handleCopy} className='me-2'>
                                {copySuccess ? "Copied!" : "Copy"}
                              </Button>
                              <Button
                                variant='primary'
                                size='sm'
                                onClick={() => {
                                  const blob = new Blob([scriptCode], { type: "text/javascript" });
                                  const url = window.URL.createObjectURL(blob);
                                  const a = document.createElement("a");
                                  a.href = url;
                                  a.download = "webpush-script.js";
                                  document.body.appendChild(a);
                                  a.click();
                                  window.URL.revokeObjectURL(url);
                                  document.body.removeChild(a);
                                }}>
                                Download
                              </Button>
                            </div>
                          </pre>
                        </div>
                      )}
                    </>
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
