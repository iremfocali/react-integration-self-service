/* eslint-disable @typescript-eslint/no-unused-vars */
// import node module libraries
import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Offcanvas, Badge, Accordion, Table, InputGroup } from "react-bootstrap";

// import widget/custom components
import { PageHeading } from "widgets";

// import standardized GTM tags
import { CartViewTag, LoginTag, PageViewTag, SearchViewTag, AddFavTag, RemoveFavTag, SignUpTag, PurchaseTag, CategoryViewTag, ProductViewTag } from "./GTMExports/StandardizedTags";

import SampleGTMExport from "../../data/JSONFiles/SampleGTMExport.json";

interface GTMExport {
  exportFormatVersion: number;
  exportTime: string;
  containerVersion: {
    path: string;
    accountId: string;
    containerId: string;
    containerVersionId: string;
    container: {
      path: string;
      accountId: string;
      containerId: string;
      name: string;
      publicId: string;
      usageContext: string[];
      fingerprint: string;
      tagManagerUrl: string;
      features: {
        [key: string]: boolean;
      };
      tagIds: string[];
    };
    tagManagerUrl: string;
    tag: GTMTags[];
    trigger: GTMTags[];
    variable: GTMTags[];
    builtInVariable: GTMTags[];
  };
}

interface GTMTags {
  accountId: string;
  containerId: string;
  tagId: string;
  name: string;
  type: string;
  parameter: Array<{
    type: string;
    key: string;
    value: string;
  }>;
  fingerprint: string;
  firingTriggerId: string[];
  tagFiringOption: string;
  monitoringMetadata: {
    type: string;
  };
  consentSettings: {
    consentStatus: string;
  };
}

interface GTMTriggers {
  name: string;
  type: string;
  triggerId: string;
  accountId: string;
  containerId: string;
  fingerprint: string;
  filter: Array<{
    type: string;
    parameter: Array<{
      type: string;
      key: string;
      value: string;
    }>;
  }>;
  customEventFilter: Array<{
    type: string;
    parameter: Array<{
      type: string;
      key: string;
      value: string;
    }>;
  }>;
}

interface GTMVariables {
  name: string;
  type: string;
  fingerprint: string;
  accountId: string;
  parameter: Array<{
    type: string;
    key: string;
    value: string;
  }>;
}

interface GTMBuiltInVariables {
  accountId: string;
  containerId: string;
  name: string;
  type: string;
}

// Define type for standardized tag
interface StandardizedTag {
  name: string;
  html: string;
}

// Define type for standardized tags map
type StandardizedTags = {
  [key in "RMC-CartView" | "RMC-Login" | "RMC-PageView" | "RMC-SearchView" | "RMC-AddFav" | "RMC-RemoveFav" | "RMC-SignUp" | "RMC-Purchase" | "RMC-CategoryView" | "RMC-ProductView"]: StandardizedTag;
};

// Map of standardized tags
const standardizedTags: StandardizedTags = {
  "RMC-CartView": CartViewTag,
  "RMC-Login": LoginTag,
  "RMC-PageView": PageViewTag,
  "RMC-SearchView": SearchViewTag,
  "RMC-AddFav": AddFavTag,
  "RMC-RemoveFav": RemoveFavTag,
  "RMC-SignUp": SignUpTag,
  "RMC-Purchase": PurchaseTag,
  "RMC-CategoryView": CategoryViewTag,
  "RMC-ProductView": ProductViewTag,
};

const EventGTM = () => {
  const sid = "756B5036644F706C4F6A4D3D";
  const oid = "504E6F37515941744B34633D";
  // State for controlling the offcanvas
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<GTMTags | null>(null);
  const [offcanvasWidth, setOffcanvasWidth] = useState("40%");

  // Update offcanvas width based on screen size
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

    // Set initial width
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup event listener
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleShowCode = (event: GTMTags) => {
    // If there's a standardized version of the tag, use it
    if (standardizedTags[event.name]) {
      setSelectedEvent({
        ...event,
        parameter: [
          {
            type: "TEMPLATE",
            key: "html",
            value: standardizedTags[event.name].html,
          },
          {
            type: "BOOLEAN",
            key: "supportDocumentWrite",
            value: "false",
          },
        ],
      });
    } else {
      setSelectedEvent(event);
    }
    setShowOffcanvas(true);
  };

  const handleCloseOffcanvas = () => {
    setShowOffcanvas(false);
  };

  const renderEventCard = (event: GTMTags) => {
    return (
      <Col key={event.tagId} xs={16} md={12} lg={8} xl={6} className='mb-3'>
        <Card className='h-100 shadow-sm'>
          <Card.Body>
            <Row>
              <Card.Title className='d-flex justify-content-between align-items-center flex-wrap'>
                <span className='me-2 text-truncate'>{event.name}</span>
                <div className='d-flex gap-2 flex-wrap mt-2 mt-sm-0'>
                  <Button size='sm' variant='danger'>
                    <i className='fe fe-trash-2 me-1 d-none d-sm-inline'></i>
                    Remove
                  </Button>

                  <Button size='sm' variant='outline-info' onClick={() => handleShowCode(event)}>
                    <i className='fe fe-code me-1 d-none d-sm-inline'></i>Code
                  </Button>
                </div>
              </Card.Title>
            </Row>
            <Row>
              <Col className='relative inline-block'>
                <InputGroup className='my-2'>
                  <input type='text' className='form-control' placeholder='Link for the event page' />
                  <Button size='sm' variant='outline-info'>
                    <i className='fe fe-link me-1 d-none d-sm-inline'></i>Visit
                  </Button>
                </InputGroup>
              </Col>
            </Row>
            {event.firingTriggerId.map((triggerId) => renderTriggerAccordion(triggerId))}
            <Row>
              <Col>
                <>{renderVariablesAccordion(event)}</>
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
                    <td>Name</td>
                    <td>{trigger?.name}</td>
                  </tr>
                  <tr>
                    <td>Type</td>
                    <td>{trigger?.type}</td>
                  </tr>
                  <tr>
                    <td>Filter</td>
                    <td>
                      {trigger?.filter?.map((filter, index) => (
                        <div key={index}>
                          {filter.type}: {filter.parameter[0].value} {filter.parameter[1].value}
                        </div>
                      ))}
                    </td>
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
    const variables = findVariables(eventCode.parameter[0].value);
    return (
      <Accordion className='mb-2'>
        <Accordion.Item eventKey='0'>
          <Accordion.Header>Variables used in this event</Accordion.Header>
          <Accordion.Body>
            <Row>
              <Table size='sm' bordered hover>
                <tbody>
                  {variables.map((variable, index) => (
                    <tr key={index}>
                      <td>{variable}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Row>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    );
  };

  function findVariables(code: string) {
    const regex = /{{([^}]+)}}/g;
    const matches = code.match(regex);
    return matches ? matches.map((match) => match.slice(2, -2)) : [];
  }

  return (
    <Container fluid className='p-6'>
      <Row>
        <Col>
          <PageHeading heading='GTM Events' />
        </Col>
      </Row>
      <Row>{SampleGTMExport.containerVersion.tag.map((event) => renderEventCard(event))}</Row>

      <Offcanvas show={showOffcanvas} onHide={handleCloseOffcanvas} placement='end' style={{ width: offcanvasWidth }}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Event Code</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {selectedEvent && (
            <pre>
              <code>{selectedEvent.parameter[0].value}</code>
            </pre>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </Container>
  );
};

export default EventGTM;
