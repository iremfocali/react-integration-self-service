import React, { useState } from "react";
import { Container, Row, Col, Card, Button, Accordion, Table, Form, Alert, OverlayTrigger, Tooltip } from "react-bootstrap";
import { eventTemplates, defaultEvents, eventDescriptions, DEFAULT_COOKIE_ID } from "./data/eventData";

const VISILABS_BASE = "http://ssrlgr.visilabs.net/Logging.svc/SendRequest/2F46336C6A3036533961343D";

interface EventParameter {
  key: string;
  value: string;
  description?: string;
  default?: boolean;
  defaultValue?: string;
}

export default function EventRequestBuilder() {
  const [eventList, setEventList] = useState<string[]>([...defaultEvents]);
  const [eventParams, setEventParams] = useState<Record<string, EventParameter[]>>({ ...eventTemplates });
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({});
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<EventParameter>({ key: "", value: "", description: "" });
  const [requestUrl, setRequestUrl] = useState("");
  const [result, setResult] = useState<{ status: number; data: any } | { error: string } | null>(null);
  const [showNewEventForm, setShowNewEventForm] = useState(false);
  const [customEventName, setCustomEventName] = useState("");
  const [userDomain, setUserDomain] = useState("");

  const handleAccordionToggle = (eventName: string) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [eventName]: !prev[eventName],
    }));
    setSelectedEvent(eventName);
    if (!openAccordions[eventName]) {
      setResult(null);
      setRequestUrl("");
    }
  };

  const handleDomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const domain = e.target.value;
    console.log("Domain entered:", domain);
    setUserDomain(domain);
  };

  const showAddForm = (index: number | null = null) => {
    setShowForm(true);
    setEditIndex(index);
    if (index !== null && selectedEvent) {
      const param = eventParams[selectedEvent][index];
      setFormData({
        key: param.key,
        value: param.value,
        description: param.description || "",
      });
    } else {
      setFormData({ key: "", value: "", description: "" });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    const newParam: EventParameter = {
      key: formData.key,
      value: formData.value,
      description: formData.description,
    };

    setEventParams((prev) => {
      const updatedParams = { ...prev };
      const eventKey = selectedEvent as keyof typeof updatedParams;
      const currentParams = updatedParams[eventKey];

      if (editIndex !== null && currentParams) {
        const existingParam = currentParams[editIndex];
        if (existingParam?.default) {
          // For default parameters, only update the value
          currentParams[editIndex] = {
            ...existingParam,
            value: formData.value,
          };
        } else {
          // For custom parameters, update everything
          currentParams[editIndex] = newParam;
        }
      } else if (currentParams) {
        // Adding new parameter (always non-default)
        updatedParams[eventKey] = [...currentParams, { ...newParam, default: false }];
      }
      return updatedParams;
    });

    setShowForm(false);
    setEditIndex(null);
    setFormData({ key: "", value: "", description: "" });
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditIndex(null);
    setFormData({ key: "", value: "", description: "" });
  };

  const handleDelete = (index: number) => {
    if (!selectedEvent) return;
    const paramToDelete = eventParams[selectedEvent][index];

    // Prevent deletion of default parameters
    if (paramToDelete.default) {
      console.log("Cannot delete default parameter:", paramToDelete.key);
      return;
    }

    setEventParams({
      ...eventParams,
      [selectedEvent]: eventParams[selectedEvent].filter((_, i) => i !== index),
    });
  };

  const handleDeleteEvent = (eventName: string) => {
    setEventList((prev) => prev.filter((e) => e !== eventName));
    setEventParams((prev) => {
      const newParams = { ...prev };
      delete newParams[eventName];
      return newParams;
    });
  };

  const handleAddCustomEvent = () => {
    if (!customEventName || eventList.includes(customEventName)) return;
    setEventList((prev) => [...prev, customEventName]);
    setEventParams((prev) => ({
      ...prev,
      [customEventName]: [],
    }));
    setCustomEventName("");
    setShowNewEventForm(false);
  };

  const buildRequestUrl = () => {
    if (!selectedEvent || !userDomain) return "";
    console.log("Building request URL with domain:", userDomain);

    // Get the cookie ID from parameters or use default
    const cookieParam = eventParams[selectedEvent].find((p) => p.key === "cookieid");
    const cookieId = cookieParam?.value || DEFAULT_COOKIE_ID;

    // Clean up domain (remove trailing slashes)
    const cleanDomain = userDomain.replace(/\/+$/, "");

    // Build base URL with domain and cookieId
    const baseUrl = `${VISILABS_BASE}/${cleanDomain}/${cookieId}`;

    // Filter out cookieid from parameters and build query string
    const queryParams = eventParams[selectedEvent]
      .filter((p) => p.key !== "cookieid")
      .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
      .join("&");

    const finalUrl = queryParams ? `${baseUrl}?${queryParams}` : baseUrl;
    console.log("Final Request URL:", finalUrl);
    return finalUrl;
  };

  const sendRequest = async () => {
    const url = buildRequestUrl();
    if (!url) return;

    console.log("Sending request to:", url);
    setRequestUrl(url);

    try {
      // Using your proxy server to handle CORS
      const response = await fetch(`http://localhost:5004/serverside-request?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      console.log("Response received:", data);
      setResult({ status: response.status, data: "Request successful" });
    } catch (error) {
      console.error("Request failed:", error);
      setResult({ error: error instanceof Error ? error.message : "An error occurred" });
    }
  };

  return (
    <Container fluid className='p-6'>
      <Row>
        <Col lg={12} md={12} sm={12}>
          <Card>
            <Card.Header>
              <h4 className='mb-0'>Event Request Builder</h4>
            </Card.Header>
            <Card.Body>
              <p className='mb-0'>Configure your event request settings here. This allows you to test and manage event requests in your application.</p>
              <p className='mb-0'>
                <a href='https://relateddigital.atlassian.net/wiki/spaces/RMCKBT/pages/2163507226/Web+Event+Request+Integration' target='_blank' rel='noopener noreferrer'>
                  Please see first steps for this integration type here.
                </a>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className='mt-4'>
        <Col lg={12} md={12} sm={12}>
          <Card>
            <Card.Body>
              <Form.Group>
                <Form.Label className='fw-bold'>Domain</Form.Label>
                <Form.Control type='text' placeholder='Enter domain (e.g. www.example.com.tr)' value={userDomain} onChange={handleDomainChange} size='lg' />
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className='mt-4'>
        <Col lg={12} md={12} sm={12}>
          <Card>
            <Card.Header>
              <h4 className='mb-0'>Event Configuration</h4>
            </Card.Header>
            <Card.Body>
              <Row>
                {eventList.map((ev) => (
                  <Col xs={12} md={6} lg={6} className='mb-4' key={ev}>
                    <Card className={`h-100 shadow-sm ${selectedEvent === ev ? "border-primary" : ""}`}>
                      <Card.Body>
                        <Card.Title className='d-flex justify-content-between align-items-center mb-3'>
                          <span>
                            <i className='fe fe-user text-primary me-2'></i>
                            {ev}
                          </span>
                          {!defaultEvents.includes(ev) && (
                            <i
                              className='fe fe-x-circle text-danger'
                              style={{ cursor: "pointer" }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteEvent(ev);
                              }}></i>
                          )}
                        </Card.Title>
                        <Card.Text className='text-muted mb-3'>{eventDescriptions[ev]}</Card.Text>

                        <Accordion activeKey={openAccordions[ev] ? ev : ""}>
                          <Accordion.Item eventKey={ev}>
                            <Accordion.Header onClick={() => handleAccordionToggle(ev)}>
                              <i className='fe fe-settings text-primary me-2'></i>
                              Event Details
                            </Accordion.Header>
                            <Accordion.Body>
                              <Table size='sm' bordered hover responsive>
                                <thead>
                                  <tr>
                                    <th className='fw-bold'>Parameter</th>
                                    <th className='fw-bold'>Value</th>
                                    <th className='fw-bold' style={{ width: "150px" }}>
                                      Actions
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {eventParams[ev].map((param, index) => (
                                    <tr key={index}>
                                      <td>
                                        <div className='d-flex align-items-center'>
                                          {param.key}
                                          {param.description && (
                                            <OverlayTrigger placement='right' overlay={<Tooltip>{param.description}</Tooltip>}>
                                              <i className='fe fe-info text-muted ms-2' style={{ cursor: "help" }}></i>
                                            </OverlayTrigger>
                                          )}
                                        </div>
                                      </td>
                                      <td>{param.value}</td>
                                      <td>
                                        <div className='d-flex gap-2 justify-content-center'>
                                          <Button variant='outline-primary' size='sm' onClick={() => showAddForm(index)}>
                                            <i className='fe fe-edit'></i>
                                          </Button>
                                          {!param.default && (
                                            <Button variant='outline-danger' size='sm' onClick={() => handleDelete(index)}>
                                              <i className='fe fe-trash-2'></i>
                                            </Button>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>

                              {showForm && (
                                <div className='mt-2 p-2 border rounded bg-light'>
                                  <Row className='g-2'>
                                    <Col>
                                      <Form.Control type='text' size='sm' placeholder='Parameter name' value={formData.key} onChange={(e) => setFormData((prev) => ({ ...prev, key: e.target.value }))} disabled={editIndex !== null && eventParams[selectedEvent]?.[editIndex]?.default} required />
                                    </Col>
                                    <Col>
                                      <Form.Control type='text' size='sm' placeholder='Description (optional)' value={formData.description} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} disabled={editIndex !== null && eventParams[selectedEvent]?.[editIndex]?.default} />
                                    </Col>
                                    <Col>
                                      <Form.Control type='text' size='sm' placeholder='Parameter value' value={formData.value} onChange={(e) => setFormData((prev) => ({ ...prev, value: e.target.value }))} required />
                                    </Col>
                                  </Row>
                                  <div className='d-flex justify-content-end gap-2 mt-2'>
                                    <Button variant='outline-secondary' size='sm' onClick={handleFormCancel}>
                                      Cancel
                                    </Button>
                                    <Button variant='outline-success' size='sm' onClick={handleFormSubmit}>
                                      {editIndex !== null ? "Update" : "Add"}
                                    </Button>
                                  </div>
                                </div>
                              )}

                              <div className='d-flex justify-content-between align-items-center mt-3 mb-3'>
                                <Button variant='primary' onClick={() => showAddForm(null)}>
                                  <i className='fe fe-plus me-1'></i>
                                  Add Parameter
                                </Button>
                                <Button variant='primary' onClick={sendRequest} disabled={!userDomain}>
                                  <i className='fe fe-send me-1'></i>
                                  Send Request
                                </Button>
                              </div>

                              <div className='mt-3'>
                                <h5>Generated Request URL</h5>
                                <Form.Control as='textarea' rows={3} value={buildRequestUrl()} readOnly className='bg-light' />
                              </div>

                              {result && (
                                <Alert variant={"error" in result ? "danger" : "success"} className='mt-3'>
                                  {"error" in result ? result.error : result.data}
                                </Alert>
                              )}
                            </Accordion.Body>
                          </Accordion.Item>
                        </Accordion>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>

              <div className='mt-4 d-flex justify-content-center'>
                {showNewEventForm ? (
                  <Card className='shadow-sm' style={{ maxWidth: "400px" }}>
                    <Card.Body>
                      <Form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleAddCustomEvent();
                        }}>
                        <Form.Group className='mb-3'>
                          <Form.Label>New Event Name</Form.Label>
                          <Form.Control type='text' placeholder='Enter event name' value={customEventName} onChange={(e) => setCustomEventName(e.target.value)} autoFocus />
                        </Form.Group>
                        <div className='d-flex gap-2'>
                          <Button
                            variant='secondary'
                            onClick={() => {
                              setShowNewEventForm(false);
                              setCustomEventName("");
                            }}>
                            Cancel
                          </Button>
                          <Button type='submit' variant='primary' disabled={!customEventName || eventList.includes(customEventName)}>
                            Add
                          </Button>
                        </div>
                      </Form>
                    </Card.Body>
                  </Card>
                ) : (
                  <Button variant='primary' size='lg' onClick={() => setShowNewEventForm(true)}>
                    <i className='fe fe-plus me-2'></i>
                    Add New Event
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
