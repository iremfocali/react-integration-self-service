// import node module libraries
import { FC } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";

// import widget/custom components
import { PageHeading } from "widgets";

const Event: FC = () => {
  return (
    <Container fluid className='p-6'>
      <PageHeading heading='Event Integration' />
      <Row>
        <Col lg={12} md={12} sm={12}>
          <Card>
            <Card.Header>
              <h4 className='mb-0'>Direct Integration Settings</h4>
            </Card.Header>
            <Card.Body>
              <p className='mb-0'>Configure your event integration settings here. This allows you to track and manage events in your application.</p>
              {/* Add your event integration specific content here */}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Event;
