//this is the best version
/* eslint-disable @typescript-eslint/no-unused-vars */
// import node module libraries
import { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Card, Button, Offcanvas, Badge, Accordion, Table, InputGroup, Modal, Form } from "react-bootstrap";

import CreateEvent from "./GTMExports/SampleEventCode";
// import widget/custom components
import { PageHeading } from "widgets";

import SampleGTMExport from "../../data/JSONFiles/SampleGTMExport.json";

// Types and Interfaces
interface GTMTags {
  tagId: string;
  name: string;
  type: string;
  parameter: Array<{
    value: string;
    [key: string]: unknown;
  }>;
  firingTriggerId: string[];
  [key: string]: unknown;
}

interface GTMTriggers {
  triggerId: string;
  name: string;
  type: string;
  customEventFilter?: Array<{
    type: string;
    parameter: Array<{
      value: string;
      [key: string]: unknown;
    }>;
  }>;
  filter?: Array<{
    type: string;
    parameter: Array<{
      value: string;
      [key: string]: unknown;
    }>;
  }>;
}

interface GTMVariables {
  variableId: string;
  name: string;
  type: string;
  parameter: Array<{
    value: string;
    [key: string]: unknown;
  }>;
}

interface DataLayerEvent {
  vl_label?: string;
  event?: string;
  ecommerce?: {
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface EventCheckResponse {
  success: boolean;
  message?: string;
  events?: DataLayerEvent[];
  allEvents?: DataLayerEvent[];
}

interface EventUrlState {
  url: string;
  isValid: boolean | null;
}

interface EventTestState {
  isLoading: boolean;
  response: EventCheckResponse | null;
  error: string | null;
}

interface EventCardProps {
  event: GTMTags;
  eventUrl: EventUrlState;
  eventTest: EventTestState;
  onUrlChange: (eventId: string, value: string) => void;
  onTestEvent: (url: string, eventId: string) => void;
  onShowCode: (event: GTMTags) => void;
  onEdit: (event: GTMTags) => void;
  onRemove: (event: GTMTags) => void;
}

// EventCard Component
const EventCard = ({ event, eventUrl, eventTest, onUrlChange, onTestEvent, onShowCode, onEdit, onRemove }: EventCardProps) => {
  const getUrlInputClass = () => {
    if (!eventUrl || eventUrl.isValid === null) return "form-control rounded-start";
    return `form-control ${eventUrl.isValid ? "is-valid" : "is-invalid"} rounded-start`;
  };

  const renderTriggerAccordion = (triggerId: string) => {
    const trigger = SampleGTMExport.containerVersion.trigger.find((t) => t.triggerId === triggerId);
    return (
      <Accordion className='mb-2' key={triggerId}>
        <Accordion.Item eventKey={triggerId}>
          <Accordion.Header>Trigger for this event</Accordion.Header>
          <Accordion.Body>
            <Row>
              <Table size='sm' bordered hover>
                <tbody>
                  <tr>
                    <td>Event Name</td>
                    <td>{trigger?.customEventFilter?.[0]?.type}</td>
                    <td>{trigger?.customEventFilter?.[0]?.parameter[1].value}</td>
                  </tr>
                  <tr>
                    <td>Label Variable</td>
                    <td>{trigger?.filter?.[0]?.type}</td>
                    <td>{trigger?.filter?.[0]?.parameter[1].value}</td>
                  </tr>
                </tbody>
              </Table>
            </Row>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    );
  };

  const renderVariables = () => {
    const extractedVars = extractVLParameters(event.parameter[0].value);

    return (
      <Accordion>
        <Accordion.Item eventKey={event.tagId}>
          <Accordion.Header>Variables for this event</Accordion.Header>
          <Accordion.Body>
            <Row>
              {extractedVars.length === 0 ? (
                <div className='text-center text-muted'>There are no parameters assigned to {event.name}</div>
              ) : (
                <Table size='sm' bordered hover responsive>
                  <thead>
                    <tr>
                      <th>VL Parameter</th>
                      <th>GTM Variable</th>
                      <th>Is Array?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extractedVars.map((v, index) => (
                      <tr key={index}>
                        <td>{v.vlParameter}</td>
                        <td>{v.gtmParameter}</td>
                        <td>{v.isArray ? "Yes" : "No"}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Row>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    );
  };

  const extractVLParameters = (code: string) => {
    const regex = /[Vv][Ll]\.AddParameter\(\s*["']([^"']+)["']\s*,\s*([^)]+)\)/g;
    const results: { vlParameter: string; gtmParameter: string; isArray: boolean }[] = [];

    let match;
    while ((match = regex.exec(code)) !== null) {
      const vlParameter = match[1].trim();
      let gtmRaw = match[2].trim();
      const isArray = gtmRaw.includes(".join(");

      if (vlParameter === "OM.VLEventException" || vlParameter === "OM.VLEventExceptionName") {
        continue;
      }

      // Clean up the GTM parameter
      gtmRaw = gtmRaw
        .replace(/\.join\([^)]*\)$/, "") // Remove .join() from the end
        .replace(/\}\}(?:\.[a-zA-Z]+)?$/, "") // Remove trailing }} and any property access after it
        .replace(/^\{\{/, "") // Remove leading {{
        .replace(/parseFloat\s*\(\s*(.*?)\s*\)/g, "$1") // Remove parseFloat() with its parentheses
        .trim();

      results.push({
        vlParameter,
        gtmParameter: gtmRaw,
        isArray,
      });
    }

    return results;
  };

  return (
    <Col xs={16} md={12} lg={8} xl={6} className='mb-3'>
      <Card className='h-100 shadow-sm'>
        <Card.Body>
          <Row>
            <Col>
              <Card.Title className='d-flex justify-content-between align-items-center flex-wrap'>
                <span className='me-2 text-truncate'>{event.name}</span>
                <div className='d-flex gap-2 flex-wrap mt-2 mt-sm-0'>
                  <Button size='sm' variant='outline-info' onClick={() => onEdit(event)}>
                    <i className='fe fe-edit me-1 d-none d-sm-inline'></i>Edit
                  </Button>
                  <Button size='sm' variant='outline-danger' onClick={() => onRemove(event)}>
                    <i className='fe fe-trash-2 me-1 d-none d-sm-inline'></i>Remove
                  </Button>
                  <Button size='sm' variant='outline-secondary' onClick={() => onShowCode(event)}>
                    <i className='fe fe-code me-1 d-none d-sm-inline'></i>Code
                  </Button>
                </div>
              </Card.Title>
            </Col>
          </Row>

          {event.firingTriggerId.map((triggerId: string) => renderTriggerAccordion(triggerId))}

          <Row>
            <Col>{renderVariables()}</Col>
          </Row>

          <Row>
            <Col className='relative inline-block'>
              <InputGroup className='my-2'>
                <Form.Control type='text' className={getUrlInputClass()} placeholder='Link for the event page (e.g., https://example.com)' value={eventUrl?.url || ""} onChange={(e) => onUrlChange(event.tagId, e.target.value)} />
                <InputGroup.Text className='p-0 rounded-end'>
                  <Button size='sm' variant='outline-info' onClick={() => onTestEvent(eventUrl?.url || "", event.tagId)} disabled={!eventUrl?.isValid || eventTest?.isLoading} className='border-0 h-100'>
                    {eventTest?.isLoading ? (
                      <>
                        <span className='spinner-border spinner-border-sm me-1' role='status' aria-hidden='true'></span>
                        Testing...
                      </>
                    ) : (
                      <>
                        <i className='fe fe-link me-1'></i>
                        Test Event
                      </>
                    )}
                  </Button>
                </InputGroup.Text>
                {eventUrl?.isValid === false && <div className='invalid-feedback'>Please enter a valid URL (e.g., https://example.com)</div>}
              </InputGroup>
              {eventTest?.error && (
                <div className='alert alert-danger mt-2' role='alert'>
                  <small>{eventTest.error}</small>
                </div>
              )}
              {eventTest?.response?.success && (
                <div className='alert alert-success mt-2' role='alert'>
                  <small>Event check successful! Found {(eventTest.response?.events || []).length} matching events.</small>
                </div>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Col>
  );
};

const EventGTM = () => {
  // Constants
  const sid = "756B5036644F706C4F6A4D3D";
  const oid = "504E6F37515941744B34633D";
  const urlRegex = /^(https?:\/\/)?(www\.)?([\w-]+\.)+[\w-]+([/\w-.~:?#[\]@!$&'()*+,;=]*)?$/i;

  // State Management
  const [selectedEvent, setSelectedEvent] = useState<GTMTags | null>(null);
  const [newTrigger, setNewTrigger] = useState<GTMTriggers | null>(null);
  const [newVariable, setNewVariable] = useState<GTMVariables | null>(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [offcanvasWidth, setOffcanvasWidth] = useState("40%");
  const [showAddTagModal, setShowAddTagModal] = useState(false);
  const [eventUrls, setEventUrls] = useState<Record<string, EventUrlState>>({});
  const [eventTests, setEventTests] = useState<Record<string, EventTestState>>({});
  const [newTag, setNewTag] = useState({
    name: "",
    type: "html",
    triggers: "",
    variables: "",
    code: "",
  });

  // URL Validation Handlers
  const handleUrlChange = (eventId: string, value: string) => {
    const newState = { ...eventUrls };
    if (value.trim() === "") {
      newState[eventId] = { url: value, isValid: null };
    } else {
      const isUrlValid = urlRegex.test(value.trim());
      newState[eventId] = {
        url: value,
        isValid: isUrlValid,
      };
    }
    setEventUrls(newState);
  };

  const getUrlInputClass = (eventId: string) => {
    const state = eventUrls[eventId];
    if (!state || state.isValid === null) return "form-control rounded-start";
    return `form-control ${state.isValid ? "is-valid" : "is-invalid"} rounded-start`;
  };

  // Modal Handlers
  const handleNewTagClose = () => setShowAddTagModal(false);
  const handleNewTagShow = () => setShowAddTagModal(true);

  // Offcanvas Handlers
  const handleShowCode = (event: GTMTags) => {
    setSelectedEvent(event);
    setShowOffcanvas(true);
  };
  const handleCloseOffcanvas = () => setShowOffcanvas(false);

  // Responsive Layout Effects
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setOffcanvasWidth("100%");
      } else if (window.innerWidth < 992) {
        setOffcanvasWidth("70%");
      } else {
        setOffcanvasWidth("40%");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // API Integration
  const checkEventIntegration = async (url: string, eventId: string) => {
    if (!url || !eventUrls[eventId]?.isValid) {
      setEventTests((prev) => ({
        ...prev,
        [eventId]: {
          isLoading: false,
          response: null,
          error: "Please enter a valid URL first",
        },
      }));
      return;
    }

    setEventTests((prev) => ({
      ...prev,
      [eventId]: {
        isLoading: true,
        response: null,
        error: null,
      },
    }));

    // Find the trigger for this event to get the expected label
    const currentEvent = SampleGTMExport.containerVersion.tag.find((t) => t.tagId === eventId);
    const trigger = currentEvent?.firingTriggerId ? SampleGTMExport.containerVersion.trigger.find((t) => currentEvent.firingTriggerId.includes(t.triggerId)) : null;
    const expectedLabel = trigger?.filter?.[0]?.parameter[1].value;

    if (!expectedLabel) {
      setEventTests((prev) => ({
        ...prev,
        [eventId]: {
          isLoading: false,
          response: null,
          error: "Could not find expected label for this event in GTM configuration",
        },
      }));
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/event-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url,
          expectedLabel: expectedLabel,
        }),
      });

      const data: EventCheckResponse = await response.json();

      if (data.success) {
        setEventTests((prev) => ({
          ...prev,
          [eventId]: {
            isLoading: false,
            response: data,
            error: null,
          },
        }));
      } else {
        // Format all captured events for display
        const allEvents = data.allEvents || [];

        // Group events by type
        const vlEvents = allEvents.filter((event) => event.vl_label).map((event) => event.vl_label);

        const gtmEvents = allEvents.filter((event) => event.event && !event.vl_label).map((event) => event.event);

        const otherEvents = allEvents.filter((event) => !event.event && !event.vl_label).map((event) => Object.keys(event).join(", "));

        // Build error message
        let errorMessage = `Expected event "${expectedLabel}" not found.\n`;

        if (allEvents.length === 0) {
          errorMessage += "No events were captured on the page.";
        } else {
          if (vlEvents.length > 0) {
            errorMessage += `\nVL Events found: ${vlEvents.join(", ")}`;
          }
          if (gtmEvents.length > 0) {
            errorMessage += `\nGTM Events found: ${gtmEvents.join(", ")}`;
          }
          if (otherEvents.length > 0) {
            errorMessage += `\nOther Events found: ${otherEvents.join(", ")}`;
          }
        }

        setEventTests((prev) => ({
          ...prev,
          [eventId]: {
            isLoading: false,
            response: null,
            error: errorMessage,
          },
        }));
      }
    } catch (error) {
      console.error("Error during event check:", error);
      setEventTests((prev) => ({
        ...prev,
        [eventId]: {
          isLoading: false,
          response: null,
          error: "An error occurred while checking the event",
        },
      }));
    }
  };

  // Event Handlers
  const handleEditEvent = (event: GTMTags) => {
    setSelectedEvent(event);
    setShowOffcanvas(true);
  };

  const handleRemoveEvent = (event: GTMTags) => {
    // TODO: Implement event removal logic
    console.log("Remove event:", event.name);
  };

  // Render Helper Functions
  const renderEventCard = (event: GTMTags) => {
    const eventTest = eventTests[event.tagId] || {
      isLoading: false,
      response: null,
      error: null,
    };

    return (
      <Col key={event.tagId} xs={16} md={12} lg={8} xl={6} className='mb-3'>
        <Card className='h-100 shadow-sm'>
          <Card.Body>
            <Row>
              <Col>
                <Card.Title className='d-flex justify-content-between align-items-center flex-wrap'>
                  <span className='me-2 text-truncate'>{event.name}</span>
                  <div className='d-flex gap-2 flex-wrap mt-2 mt-sm-0'>
                    <Button size='sm' variant='outline-info' onClick={() => handleShowCode(event)}>
                      <i className='fe fe-edit me-1 d-none d-sm-inline'></i>Edit
                    </Button>
                    <Button size='sm' variant='outline-danger'>
                      <i className='fe fe-trash-2 me-1 d-none d-sm-inline'></i>Remove
                    </Button>
                    <Button size='sm' variant='secondary' onClick={() => handleShowCode(event)}>
                      <i className='fe fe-code me-1 d-none d-sm-inline'></i>Code
                    </Button>
                  </div>
                </Card.Title>
              </Col>
            </Row>

            {event.firingTriggerId.map((triggerId: string) => renderTriggerAccordion(triggerId))}
            <Row>
              <Col>{renderVariablesAccordion(event)}</Col>
            </Row>
            <Row>
              <Col className='relative inline-block'>
                <InputGroup className='my-2'>
                  <Form.Control type='text' className={getUrlInputClass(event.tagId)} placeholder='Link for the event page (e.g., https://example.com)' value={eventUrls[event.tagId]?.url || ""} onChange={(e) => handleUrlChange(event.tagId, e.target.value)} />
                  <InputGroup.Text className='p-0 rounded-end'>
                    <Button size='sm' variant='outline-info' onClick={() => checkEventIntegration(eventUrls[event.tagId]?.url || "", event.tagId)} disabled={!eventUrls[event.tagId]?.isValid || eventTest.isLoading} className='border-0 h-100'>
                      {eventTest.isLoading ? (
                        <>
                          <span className='spinner-border spinner-border-sm me-1' role='status' aria-hidden='true'></span>
                          Testing...
                        </>
                      ) : (
                        <>
                          <i className='fe fe-link me-1'></i>
                          Test Event
                        </>
                      )}
                    </Button>
                  </InputGroup.Text>
                  {eventUrls[event.tagId]?.isValid === false && <div className='invalid-feedback'>Please enter a valid URL (e.g., https://example.com)</div>}
                </InputGroup>
                {eventTest.error && (
                  <div className='alert alert-danger mt-2' role='alert'>
                    <small>{eventTest.error}</small>
                  </div>
                )}
                {eventTest.response?.success && (
                  <div className='alert alert-success mt-2' role='alert'>
                    <small>Event check successful! Found {(eventTest.response?.events || []).length} matching events.</small>
                  </div>
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>
    );
  };

  const renderTriggerAccordion = (triggerId: string) => {
    const trigger = SampleGTMExport.containerVersion.trigger.find((trigger) => trigger.triggerId === triggerId);
    return (
      <Accordion className='mb-2' key={triggerId}>
        <Accordion.Item eventKey={triggerId}>
          <Accordion.Header>Trigger for this event</Accordion.Header>
          <Accordion.Body>
            <Row>
              <Table size='sm' bordered hover>
                <tbody>
                  <tr>
                    <td>Event Name</td>
                    <td>{trigger?.customEventFilter?.[0]?.type}</td>
                    <td>{trigger?.customEventFilter?.[0]?.parameter[1].value}</td>
                  </tr>
                  <tr>
                    <td>Label Variable</td>
                    <td>{trigger?.filter?.[0]?.type}</td>
                    <td>{trigger?.filter?.[0]?.parameter[1].value}</td>
                  </tr>
                </tbody>
              </Table>
            </Row>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    );
  };

  const renderVariablesAccordion = (eventCode: GTMTags) => {
    const extractedVars = extractVLParameters(eventCode.parameter[0].value);

    return (
      <Accordion>
        <Accordion.Item eventKey={eventCode.tagId}>
          <Accordion.Header>Variables for this event</Accordion.Header>
          <Accordion.Body>
            <Row>
              {extractedVars.length === 0 ? (
                <div className='text-center text-muted'>There are no parameters assigned to {eventCode.name}</div>
              ) : (
                <Table size='sm' bordered hover responsive>
                  <thead>
                    <tr>
                      <th>VL Parameter</th>
                      <th>GTM Variable</th>
                      <th>Is Array?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extractedVars.map((v, index) => (
                      <tr key={index}>
                        <td>{v.vlParameter}</td>
                        <td>{v.gtmParameter}</td>
                        <td>{v.isArray ? "Yes" : "No"}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Row>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    );
  };

  const renderNewTagModal = () => {
    return (
      <Modal show={showAddTagModal} onHide={handleNewTagClose} size='xl' aria-labelledby='contained-modal-title-vcenter' centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Tag</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className='mb-3 row align-items-center'>
              <Form.Label className='col-sm-3 mb-0'>Tag Name</Form.Label>
              <div className='col-sm-9'>
                <Form.Control type='text' onChange={(e) => setNewTag({ ...newTag, name: e.target.value })} placeholder='Enter tag name' />
              </div>
            </Form.Group>
            <Form.Group className='mb-3 row align-items-center'>
              <Form.Label className='col-sm-3 mb-0'>Trigger</Form.Label>
              <div className='col-sm-9 d-flex align-items-center justify-content-start'>
                <Form.Select className='me-2' value={newTag.triggers} onChange={(e) => setNewTag({ ...newTag, triggers: e.target.value })}>
                  {SampleGTMExport.containerVersion.trigger.map((trigger) => (
                    <option key={trigger.triggerId} value={trigger.name}>
                      {trigger.name}
                    </option>
                  ))}
                </Form.Select>
                <Button variant='secondary' className='text-nowrap'>
                  <i className='fe fe-plus me-1 d-none d-sm-inline'></i>
                  Add Triggers
                </Button>
              </div>
            </Form.Group>
            <Table size='sm' style={{ width: "100%" }} responsive bordered hover>
              <thead>
                <tr>
                  <th colSpan={4} className='text-center'>
                    Tag Variables
                  </th>
                </tr>
                <tr>
                  <th className='text-center'>RMC Parameter</th>
                  <th className='text-center'>GTM Variable</th>
                  <th className='text-center' style={{ width: "12%", padding: "0.75rem 0" }}>
                    Is Array?
                  </th>
                  <th className='text-center' style={{ width: "10px", padding: "0.75rem 0.5rem" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <Form.Select size='sm'>
                      <option data-row-id='0' value='0'>
                        First Option
                      </option>
                      <option data-row-id='1' value='1'>
                        Second Option
                      </option>
                      <option data-row-id='2' value='2'>
                        Third Option
                      </option>
                      <option data-row-id='3' value='3'>
                        Fourth Option
                      </option>
                    </Form.Select>
                  </td>
                  <td>
                    <Form.Select size='sm'>
                      <option data-row-id='0' value='0'>
                        First Option
                      </option>
                      <option data-row-id='1' value='1'>
                        Second Option
                      </option>
                      <option data-row-id='2' value='2'>
                        Third Option
                      </option>
                      <option data-row-id='3' value='3'>
                        Fourth Option
                      </option>
                    </Form.Select>
                  </td>
                  <td className='align-middle text-center'>
                    <Form.Check type='checkbox' className='custom-checkbox d-flex justify-content-center' style={{}} />
                  </td>
                  <td className='align-middle text-center'>
                    <Button size='sm' variant='danger'>
                      <i className='fe fe-trash-2   d-sm-inline'></i>
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className='text-center'>
                    <Button variant='secondary-outline' size='sm' onClick={addEventParameter} className='text-nowrap'>
                      <i className='fe fe-plus me-1 d-none d-sm-inline'></i>
                      Add Event Parameter
                    </Button>
                  </td>
                </tr>
              </tbody>
            </Table>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={handleNewTagClose}>
            Close
          </Button>
          <Button
            variant='primary'
            onClick={(e) => {
              e.preventDefault();
              // handleAddTag();
            }}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  // Form Handlers
  const addEventParameter = () => {
    console.log("addEventParameter");
    return (
      <tr>
        <td>
          <span>OM.</span>
          <Form.Control type='text' value={newTag.name} placeholder='Enter tag name' />
        </td>
      </tr>
    );
  };

  function extractVLParameters(code: string) {
    const regex = /[Vv][Ll]\.AddParameter\(\s*["']([^"']+)["']\s*,\s*([^)]+)\)/g;
    const results: { vlParameter: string; gtmParameter: string; isArray: boolean }[] = [];

    let match;
    while ((match = regex.exec(code)) !== null) {
      const vlParameter = match[1].trim();
      let gtmRaw = match[2].trim();
      const isArray = gtmRaw.includes(".join(");

      if (vlParameter === "OM.VLEventException" || vlParameter === "OM.VLEventExceptionName") {
        continue;
      }

      // Clean up the GTM parameter
      gtmRaw = gtmRaw
        .replace(/\.join\([^)]*\)$/, "") // Remove .join() from the end
        .replace(/\}\}(?:\.[a-zA-Z]+)?$/, "") // Remove trailing }} and any property access after it
        .replace(/^\{\{/, "") // Remove leading {{
        .replace(/parseFloat\s*\(\s*(.*?)\s*\)/g, "$1") // Remove parseFloat() with its parentheses
        .trim();

      results.push({
        vlParameter,
        gtmParameter: gtmRaw,
        isArray,
      });
    }

    return results;
  }

  // Main Component Render
  return (
    <Container fluid className='p-6'>
      <PageHeading heading='Event Integration' />
      <Row>
        <Col lg={12} md={12} sm={12}>
          <Card>
            <Card.Header>
              <h4 className='mb-0'>GTM Integration Settings</h4>
            </Card.Header>
            <Card.Body>
              <p className='mb-0'>Configure your event integration settings here. This allows you to track and manage events in your application.</p>
              <p className='mb-0'>
                <a href={"https://relateddigital.atlassian.net/wiki/spaces/RMCKBT/pages/2163507226/Web+DataLayer+Event+ablonu+Entegrasyonu"} target='_blank' rel='noopener noreferrer'>
                  Please see first steps for this integration type here.
                </a>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col lg={12} md={12} sm={12}>
          <Card className='mt-4'>
            <Card.Header>
              <h4 className='mb-0'>GTM Integration Data</h4>
            </Card.Header>
            <Card.Body>
              <Row>{SampleGTMExport.containerVersion.tag && SampleGTMExport.containerVersion.tag.filter((event) => event.name !== "RMC - ControlEventRequest").map((event) => <EventCard key={event.tagId} event={event} eventUrl={eventUrls[event.tagId]} eventTest={eventTests[event.tagId]} onUrlChange={handleUrlChange} onTestEvent={checkEventIntegration} onShowCode={handleShowCode} onEdit={handleEditEvent} onRemove={handleRemoveEvent} />)}</Row>

              <Button
                className='w-100'
                variant='primary'
                onClick={() => {
                  handleNewTagShow();
                }}>
                <i className='fe fe-plus me-1 d-none d-sm-inline'></i>Add Tag
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Offcanvas for displaying code */}
      <Offcanvas show={showOffcanvas} onHide={handleCloseOffcanvas} placement='end' style={{ width: offcanvasWidth }}>
        <Offcanvas.Header closeButton>
          <div className='d-flex align-items-center flex-wrap'>
            <Offcanvas.Title>{selectedEvent?.name} - Code</Offcanvas.Title>
            <Badge pill bg='light' text='dark' className='mx-2'>
              Read-only
            </Badge>
          </div>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {selectedEvent && (
            <pre className='p-3 bg-light rounded' style={{ overflowY: "auto", whiteSpace: "pre-wrap" }}>
              {selectedEvent.parameter[0].value}
            </pre>
          )}
        </Offcanvas.Body>
      </Offcanvas>

      {renderNewTagModal()}
      {/* burada yapilan islem her bir event kartinda Test Event butonunda calisacak */}
      <div className='d-grid gap-2 d-md-flex justify-content-md-end my-2'>
        <Button>Create GTM Export</Button>
      </div>
    </Container>
  );
};

export default EventGTM;
