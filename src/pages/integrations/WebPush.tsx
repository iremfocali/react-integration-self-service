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
  const [swError, setSwError] = useState(false);
  const [scriptError, setScriptError] = useState(false);

  const serviceWorkerCode = `importScripts('https://wps.relateddigital.com/relatedpush_sw.js');`;
  const manifestJSONCode = `
  
  {
  "name":"Add Name Here",
  "gcm_sender_id": ""
}
  `;

  const scriptCode = `<script>(function(d,t){
var e = d.createElement(t),
    s = d.getElementsByTagName(t)[0];
    e.src = "https://wps.relateddigital.com/relatedpush_sdk.js?ckey=74C9BB1BBC5D4AB89DFCFDA808111C2E&aid=5e42f28c-f2d9-4249-b55b-2e8eb1a3fc09";
    e.async = true;
    s.parentNode.insertBefore(e,s);
}(document,"script"));</script>`;

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

  return (
    <Container fluid className='p-6'>
      <PageHeading heading='Web Push Integration' />
      <Row>
        <Col lg={12} md={12} sm={12}>
          <Card>
            <Card.Header>
              <h4 className='mb-0'>Web Push Integration</h4>
            </Card.Header>
            <Card.Body className='d-flex gap-5'>
              <div className='w-50'>
                <h6>Service Worker Code</h6>
                <pre className='bg-light p-3 rounded position-relative mb-4'>
                  <div className='d-flex flex-column gap-2'>
                    <div className='d-flex justify-content-between align-items-center'>
                      <span>Files needed:</span>
                      <Button
                        variant='primary'
                        size='sm'
                        onClick={() => {
                          // Create text files with content
                          const manifestFile = new File([manifestJSONCode], "manifest.json", { type: "application/json" });
                          const swFile = new File([serviceWorkerCode], "relatedpush_sw.js", { type: "application/javascript" });

                          // Create download links
                          const manifestLink = URL.createObjectURL(manifestFile);
                          const swLink = URL.createObjectURL(swFile);

                          // Create container div for downloads
                          const container = document.createElement("div");
                          container.style.display = "none";

                          // Create and trigger manifest.json download
                          const aManifest = document.createElement("a");
                          aManifest.href = manifestLink;
                          aManifest.download = "manifest.json";
                          container.appendChild(aManifest);

                          // Create and trigger sw.js download
                          const aSw = document.createElement("a");
                          aSw.href = swLink;
                          aSw.download = "relatedpush_sw.js";
                          container.appendChild(aSw);

                          // Add container to body
                          document.body.appendChild(container);

                          // Trigger downloads
                          aManifest.click();
                          setTimeout(() => {
                            aSw.click();

                            // Cleanup
                            URL.revokeObjectURL(manifestLink);
                            URL.revokeObjectURL(swLink);
                            document.body.removeChild(container);
                          }, 100);
                        }}>
                        Download All Files
                      </Button>
                    </div>
                    <div className='ps-3'>
                      <div>• manifest.json</div>
                      <div>• relatedpush_sw.js</div>
                    </div>
                  </div>
                </pre>

                <h6>Web Push Script</h6>
                <pre className='bg-light p-3 rounded position-relative' style={{ whiteSpace: "pre-wrap" }}>
                  {scriptCode}
                </pre>
              </div>
              <div className='w-50'>
                <h5 className='mb-3'>Test Your Integration</h5>
                <p className='mb-3'>Configure your web push notification settings here. This allows you to send push notifications to your users.</p>
                <Form.Group className='mb-3'>
                  <Form.Label>Base URL</Form.Label>
                  <Form.Control type='text' value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder='https://example.com' disabled={isSwLoading || isScriptLoading} />
                  <Form.Text className='text-muted'>Kontrol edilecek sitenin Base URL'ini giriniz</Form.Text>
                </Form.Group>
                <div className='d-flex gap-2 mb-3'>
                  <Button variant='primary' onClick={checkServiceWorker} disabled={!baseUrl || isSwLoading}>
                    {isSwLoading ? "Kontrol Ediliyor..." : "Service Worker'ı Kontrol Et"}
                  </Button>
                  <Button variant='primary' onClick={checkWebPushScript} disabled={!baseUrl || isScriptLoading}>
                    {isScriptLoading ? "Kontrol Ediliyor..." : "Web Push Script'i Kontrol Et"}
                  </Button>
                </div>
                <Row className='d-flex flex-column gap-2 align-items-baseline'>
                  <div className='d-flex gap-5'>
                    <span>Service Worker Sonucu: </span>
                    <Alert className='py-0 m-0' variant={swError ? "danger" : "success"}>
                      {swResult}
                    </Alert>
                  </div>
                  <div className='d-flex gap-5'>
                    <span>Web Push Script Sonucu: </span>
                    <Alert variant={scriptError ? "danger" : "success"} className='py-0 m-0'>
                      {scriptResult}
                    </Alert>
                  </div>
                </Row>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default WebPush;
