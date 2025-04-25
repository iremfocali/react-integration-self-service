// import node module libraries
import { FC, useEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";

// import widget/custom components
import { PageHeading } from "widgets";

import SampleGTMExport from "../../data/JSONFiles/SampleGTMExport.json";

interface GTMIntegration {
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
  };
  tag: Array<{
    accountId: string;
    containerId: string;
    tagId: string;
    name: string;
    type: string;
    parameter: Array<{
      type?: string;
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
  }>;
  trigger: Array<{
    accountId: string;
    containerId: string;
    triggerId: string;
    name: string;
    type: string;
    customEventFilter?: Array<{
      type: string;
      parameter: Array<{
        type: string;
        key: string;
        value: string;
      }>;
    }>;
    firingTriggerId?: string[];
    triggerFiringOption?: string;
    monitoringMetadata: {
      type: string;
    };
    consentSettings: {
      consentStatus: string;
    };
  }>;
}

const EventGTM: FC = () => {
  const [gtmIntegration, setGTMIntegration] = useState<GTMIntegration | null>(null);

  useEffect(() => {
    setGTMIntegration(SampleGTMExport as unknown as GTMIntegration);
  }, []);

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
              {/* Add your event integration specific content here */}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col lg={12} md={12} sm={12}>
          {gtmIntegration && (
            <Card className='mt-4'>
              <Card.Header>
                <h4 className='mb-0'>GTM Integration Data</h4>
              </Card.Header>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default EventGTM;
