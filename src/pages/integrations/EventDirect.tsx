// import node module libraries
import { Container, Row, Col, Card, Button, Accordion, Modal } from "react-bootstrap";
import { useState } from "react";

// import widget/custom components
import { PageHeading } from "widgets";

type EventType = "pageView" | "cart" | "login" | "signup" | "addToFav" | "removeFromFav" | "productDetail" | "purchase";

type EventParameter = {
  key: string;
  value: string;
  isDefault: boolean;
};

type EventConfig = {
  functionName: string;
  parameters: EventParameter[];
  suggestActions?: boolean;
  isDefault: boolean;
  description?: string;
};

const Event = () => {
  const [customParameters, setCustomParameters] = useState<Record<EventType, EventParameter[]>>({
    pageView: [],
    cart: [],
    login: [],
    signup: [],
    addToFav: [],
    removeFromFav: [],
    productDetail: [],
    purchase: [],
  });

  const handleAddParameter = (eventType: EventType, key: string, value: string) => {
    if (!key || !value) return;

    // Add OM. prefix if not already present
    const formattedKey = key.startsWith("OM.") ? key : `OM.${key}`;

    setCustomParameters((prev) => ({
      ...prev,
      [eventType]: [...prev[eventType], { key: formattedKey, value, isDefault: false }],
    }));
  };

  const handleRemoveParameter = (eventType: EventType, index: number) => {
    setCustomParameters((prev) => ({
      ...prev,
      [eventType]: prev[eventType].filter((_, i) => i !== index),
    }));
  };

  const eventConfigs: Record<EventType, EventConfig> = {
    pageView: {
      functionName: "rdPageView",
      parameters: [],
      suggestActions: true,
      isDefault: true,
    },
    cart: {
      functionName: "rdCartView",
      parameters: [
        { key: "OM.pbid", value: "Cart Code", isDefault: true },
        { key: "OM.pb", value: "1st product code;2nd product code", isDefault: true },
        { key: "OM.pu", value: "1st product quantity;2nd product quantity", isDefault: true },
        { key: "OM.ppr", value: "1st product price*1st product quantity;2nd product price*2nd product quantity", isDefault: true },
      ],
      suggestActions: true,
      isDefault: true,
    },
    login: {
      functionName: "rdLogin",
      parameters: [
        { key: "OM.exVisitorID", value: "User Code", isDefault: true },
        { key: "OM.b_login", value: "1", isDefault: true },
      ],
      isDefault: true,
    },
    signup: {
      functionName: "rdSignup",
      parameters: [
        { key: "OM.exVisitorID", value: "User Code", isDefault: true },
        { key: "OM.b_sgnp", value: "1", isDefault: true },
      ],
      isDefault: true,
    },
    addToFav: {
      functionName: "rdAddtoFav",
      parameters: [
        { key: "OM.pf", value: "Product Code", isDefault: true },
        { key: "OM.pfu", value: "1", isDefault: true },
        { key: "OM.ppr", value: "Price of the product", isDefault: true },
      ],
      isDefault: true,
    },
    removeFromFav: {
      functionName: "rdRemoveFromFav",
      parameters: [
        { key: "OM.pf", value: "Product Code", isDefault: true },
        { key: "OM.pfu", value: "-1", isDefault: true },
        { key: "OM.ppr", value: "Price of the product", isDefault: true },
      ],
      isDefault: true,
    },
    productDetail: {
      functionName: "OnVisilabsLoaded",
      parameters: [
        { key: "OM.pv", value: "Product ID", isDefault: true },
        { key: "OM.pn", value: "Product Name", isDefault: true },
        { key: "OM.inv", value: "Product Stock Count", isDefault: true },
        { key: "OM.ppr", value: "Product Price", isDefault: true },
        { key: "OM.pv.1", value: "Product Brand", isDefault: true },
      ],
      suggestActions: true,
      isDefault: true,
    },
    purchase: {
      functionName: "rdPurchase",
      parameters: [
        { key: "OM.tid", value: "Payment Transaction Code", isDefault: true },
        { key: "OM.pp", value: "1st product code;2nd product code", isDefault: true },
        { key: "OM.pu", value: "1st product quantity;2nd product quantity", isDefault: true },
        { key: "OM.ppr", value: "1st product price*1st product quantity;2nd product price*2nd product quantity", isDefault: true },
        { key: "OM.exVisitorID", value: "User Code", isDefault: true },
      ],
      suggestActions: true,
      isDefault: true,
    },
  };

  // State for creating new events
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [newEventName, setNewEventName] = useState("");
  const [newEventParameters, setNewEventParameters] = useState<{ key: string; value: string }[]>([]);
  const [newParamKey, setNewParamKey] = useState("");
  const [newParamValue, setNewParamValue] = useState("");
  const [newEventDescription, setNewEventDescription] = useState("");

  // Add parameter to new event
  const handleAddNewEventParameter = () => {
    if (!newParamKey || !newParamValue) return;
    const formattedKey = newParamKey.startsWith("OM.") ? newParamKey : `OM.${newParamKey}`;
    setNewEventParameters((params) => [...params, { key: formattedKey, value: newParamValue }]);
    setNewParamKey("");
    setNewParamValue("");
  };

  // Remove parameter from new event
  const handleRemoveNewEventParameter = (index: number) => {
    setNewEventParameters((params) => params.filter((_, i) => i !== index));
  };

  // Add new event to eventConfigs and customParameters
  const [userEvents, setUserEvents] = useState<Record<string, EventConfig>>({});
  const [userCustomParameters, setUserCustomParameters] = useState<Record<string, EventParameter[]>>({});

  // Helper to check for invalid event names
  const isEventNameInvalid = !newEventName || /\s/.test(newEventName);

  const handleCreateNewEvent = () => {
    if (isEventNameInvalid || newEventParameters.length === 0) return;
    const eventKey = newEventName.trim();
    setUserEvents((prev) => ({
      ...prev,
      [eventKey]: {
        functionName: `rd${eventKey.charAt(0).toUpperCase() + eventKey.slice(1)}`,
        parameters: newEventParameters.map((p) => ({ key: p.key, value: p.value, isDefault: false })),
        isDefault: false,
        description: newEventDescription.trim(),
      },
    }));
    setUserCustomParameters((prev) => ({ ...prev, [eventKey]: [] }));
    setNewEventName("");
    setNewEventDescription("");
    setNewEventParameters([]);
    setNewParamKey("");
    setNewParamValue("");
    setShowNewEventModal(false);
  };

  // Merge default and user events for rendering
  const allEventConfigs: Record<string, EventConfig> = { ...eventConfigs, ...userEvents };
  const allCustomParameters: Record<string, EventParameter[]> = { ...customParameters, ...userCustomParameters };

  // State to control visibility of custom parameter input for each event
  const [showCustomParamInput, setShowCustomParamInput] = useState<Record<string, boolean>>({});

  const generateEventCode = (config: EventConfig, eventType: string): string => {
    const allParameters = [...config.parameters, ...(allCustomParameters[eventType] || [])];
    const parameterLines = allParameters.map((param) => `    VL.AddParameter("${param.key}","${param.value}");`).join("\n");
    const parameterBlock = parameterLines ? `${parameterLines}\n` : "";
    const suggestActionsBlock = config.suggestActions ? `    VL.SuggestActions();\n` : "";
    return `<script>\nfunction ${config.functionName}(){\n    var VL = new Visilabs();\n${parameterBlock}    VL.Collect();\n${suggestActionsBlock}}\n${config.functionName === "OnVisilabsLoaded" ? "" : `${config.functionName}();`}\n</script>`;
  };

  const eventDescriptions: Record<EventType, string> = {
    pageView: "Tracks when a user views a page. This is the most basic event type and should be implemented on all pages where other events are not applicable.",
    cart: "Tracks when a user views their shopping cart. Includes product codes, quantities, and prices.",
    login: "Tracks when a user successfully logs in to their account.",
    signup: "Tracks when a new user signs up for an account.",
    addToFav: "Tracks when a user adds a product to their favorites list.",
    removeFromFav: "Tracks when a user removes a product from their favorites list.",
    productDetail: "Tracks when a user views a product's detail page. Includes product information like ID, name, stock, price, and brand.",
    purchase: "Tracks when a user completes a purchase. Includes transaction ID, product details, quantities, and prices.",
  };

  const handleDownload = (code: string, eventName: string) => {
    const blob = new Blob([code], { type: "text/javascript" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${eventName}.js`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleDownloadAll = () => {
    const allCode = Object.entries(allEventConfigs)
      .map(([eventName, config]) => {
        const code = generateEventCode(config, eventName);
        return `// ${eventName.toUpperCase()} EVENT\n${code}\n\n`;
      })
      .join("");

    // Generate timestamp in YYYYMMDD_HHMMSS format
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const filename = `All_Event_Codes_${timestamp}.txt`;

    const blob = new Blob([allCode], { type: "text/javascript" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <Container fluid className='p-6'>
      <PageHeading heading='Event Integration' />
      <Row>
        <Col lg={12} md={12} sm={12}>
          <Card>
            <Card.Header className='d-flex justify-content-between align-items-center'>
              <h4 className='mb-0'>Direct Integration Settings</h4>
              <Button variant='primary' size='sm' onClick={handleDownloadAll}>
                <i className='fe fe-download me-2'></i>
                Download All Codes
              </Button>
            </Card.Header>
            <Card.Body>
              <p className='mb-4'>Configure your event integration settings here. This allows you to track and manage events in your application.</p>

              <Row>
                {Object.entries(allEventConfigs).map(([eventName, config]) => (
                  <Col lg={6} md={6} sm={12} className='mb-4' key={eventName}>
                    <Card className='h-100 shadow-sm'>
                      <Card.Header className='d-flex justify-content-between align-items-center'>
                        <h5 className='mb-0 text-capitalize'>{eventName.replace(/([A-Z])/g, " $1").trim()}</h5>
                        <Button variant='outline-primary' size='sm' onClick={() => handleDownload(generateEventCode(config, eventName), eventName)}>
                          <i className='fe fe-download'></i>
                        </Button>
                      </Card.Header>
                      <Card.Body>
                        <p className='text-muted mb-3'>{config.description || eventDescriptions[eventName as EventType] || "Custom event."}</p>
                        <Accordion>
                          <Accordion.Item eventKey='0'>
                            <Accordion.Header>
                              <i className='fe fe-code me-2'></i>
                              View Code
                            </Accordion.Header>
                            <Accordion.Body>
                              <pre className='bg-light p-3 rounded' style={{ maxHeight: "300px", overflow: "auto" }}>
                                <code>{generateEventCode(config, eventName)}</code>
                              </pre>
                              {/* Add Custom Parameter Form for all events */}
                              <div className='mt-4'>
                                <h6 className='mb-3'>Custom Parameters</h6>
                                {!showCustomParamInput[eventName] ? (
                                  <Button variant='primary' size='sm' onClick={() => setShowCustomParamInput((prev) => ({ ...prev, [eventName]: true }))}>
                                    Add Custom Parameter
                                  </Button>
                                ) : (
                                  <>
                                    <div className='row g-3 mb-2'>
                                      <div className='col-12'>
                                        <input type='text' className='form-control form-control-sm' placeholder='Parameter Name (e.g., OM.pbid)' id={`${eventName}-param-name`} />
                                      </div>
                                      <div className='col-12'>
                                        <input type='text' className='form-control form-control-sm' placeholder='Parameter Description' id={`${eventName}-param-desc`} />
                                      </div>
                                      <div className='col-12 d-flex'>
                                        <Button
                                          variant='primary'
                                          size='sm'
                                          className='me-2'
                                          onClick={() => {
                                            const nameInput = document.getElementById(`${eventName}-param-name`) as HTMLInputElement;
                                            const descInput = document.getElementById(`${eventName}-param-desc`) as HTMLInputElement;
                                            if (nameInput.value.trim()) {
                                              if (eventConfigs[eventName as EventType]) {
                                                handleAddParameter(eventName as EventType, nameInput.value.trim(), descInput.value.trim());
                                              } else {
                                                // user event
                                                setUserCustomParameters((prev) => ({
                                                  ...prev,
                                                  [eventName]: [...(prev[eventName] || []), { key: nameInput.value.trim().startsWith("OM.") ? nameInput.value.trim() : `OM.${nameInput.value.trim()}`, value: descInput.value.trim(), isDefault: false }],
                                                }));
                                              }
                                              nameInput.value = "";
                                              descInput.value = "";
                                              setShowCustomParamInput((prev) => ({ ...prev, [eventName]: false }));
                                            }
                                          }}>
                                          Add Parameter
                                        </Button>
                                        <Button variant='outline-secondary' size='sm' onClick={() => setShowCustomParamInput((prev) => ({ ...prev, [eventName]: false }))}>
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  </>
                                )}
                                {/* Custom Parameters List for all events */}
                                {allCustomParameters[eventName] && allCustomParameters[eventName].length > 0 && (
                                  <div className='mt-3'>
                                    <h6 className='mb-2'>Parameters</h6>
                                    {allCustomParameters[eventName].map((param, index) => (
                                      <div key={index} className='d-flex align-items-center mb-2'>
                                        <div className='flex-grow-1'>
                                          <strong>{param.key}</strong>: {param.value}
                                        </div>
                                        <Button
                                          variant='outline-danger'
                                          size='sm'
                                          onClick={() => {
                                            if (eventConfigs[eventName as EventType]) {
                                              handleRemoveParameter(eventName as EventType, index);
                                            } else {
                                              setUserCustomParameters((prev) => ({
                                                ...prev,
                                                [eventName]: prev[eventName].filter((_, i) => i !== index),
                                              }));
                                            }
                                          }}>
                                          <i className='fe fe-trash-2'></i>
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </Accordion.Body>
                          </Accordion.Item>
                        </Accordion>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>

              {/* New Event Creation Modal Trigger at the bottom */}
              <div className='d-flex justify-content-center mt-4'>
                <Button variant='primary' onClick={() => setShowNewEventModal(true)}>
                  Add New Event
                </Button>
              </div>
              {/* Modal for New Event Creation */}
              <Modal
                show={showNewEventModal}
                onHide={() => {
                  setShowNewEventModal(false);
                  setNewEventName("");
                  setNewEventDescription("");
                  setNewEventParameters([]);
                  setNewParamKey("");
                  setNewParamValue("");
                }}>
                <Modal.Header closeButton>
                  <Modal.Title>Create New Event</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <div className='row g-3 align-items-end'>
                    <div className='col-md-12 mb-2'>
                      <label htmlFor='new-event-name' className='form-label'>
                        Event Name
                      </label>
                      <input id='new-event-name' type='text' className='form-control form-control-sm' placeholder='Event Name (e.g., customEvent)' value={newEventName} onChange={(e) => setNewEventName(e.target.value)} />
                    </div>
                    <div className='col-md-12 mb-2'>
                      <label htmlFor='new-event-description' className='form-label'>
                        Event Description
                      </label>
                      <textarea id='new-event-description' className='form-control form-control-sm' placeholder='Describe what this event tracks or when it should be used.' value={newEventDescription} onChange={(e) => setNewEventDescription(e.target.value)} rows={2} style={{ resize: "vertical" }} />
                    </div>
                    <div className='col-md-5'>
                      <label htmlFor='new-param-key' className='form-label'>
                        Parameter Name
                      </label>
                      <input id='new-param-key' type='text' className='form-control form-control-sm' placeholder='Parameter Name (e.g., OM.pbid)' value={newParamKey} onChange={(e) => setNewParamKey(e.target.value)} />
                    </div>
                    <div className='col-md-5'>
                      <label htmlFor='new-param-value' className='form-label'>
                        Parameter Description
                      </label>
                      <input id='new-param-value' type='text' className='form-control form-control-sm' placeholder='Parameter Description' value={newParamValue} onChange={(e) => setNewParamValue(e.target.value)} />
                    </div>
                    <div className='col-md-2'>
                      <Button variant='secondary' size='sm' onClick={handleAddNewEventParameter} disabled={!newParamKey || !newParamValue}>
                        Add
                      </Button>
                    </div>
                  </div>
                  {/* List of parameters for new event */}
                  {newEventParameters.length > 0 && (
                    <div className='mt-3'>
                      <h6 className='mb-2'>Parameters</h6>
                      {newEventParameters.map((param, idx) => (
                        <div key={idx} className='d-flex align-items-center mb-2'>
                          <div className='flex-grow-1'>
                            <strong>{param.key}</strong>: {param.value}
                          </div>
                          <Button variant='outline-danger' size='sm' onClick={() => handleRemoveNewEventParameter(idx)}>
                            <i className='fe fe-trash-2'></i>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  {isEventNameInvalid && <div className='text-danger mt-2'>Event name cannot be empty or contain spaces.</div>}
                </Modal.Body>
                <Modal.Footer>
                  <Button
                    variant='secondary'
                    onClick={() => {
                      setShowNewEventModal(false);
                      setNewEventName("");
                      setNewEventDescription("");
                      setNewEventParameters([]);
                      setNewParamKey("");
                      setNewParamValue("");
                    }}>
                    Cancel
                  </Button>
                  <Button variant='primary' disabled={isEventNameInvalid || newEventParameters.length === 0} onClick={handleCreateNewEvent}>
                    Create Event
                  </Button>
                </Modal.Footer>
              </Modal>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Event;
