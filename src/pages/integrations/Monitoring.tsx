// import node module libraries
import { FC } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";

// import widget/custom components
import { PageHeading } from "widgets";

const Monitoring: FC = () => {
  return (
    <Container fluid className='p-6'>
      <PageHeading heading='System Monitoring' />
      <Row>
        <Col lg={12} md={12} sm={12}>
          <Card>
            <Card.Header>
              <h4 className='mb-0'>System Status</h4>
            </Card.Header>
            <Card.Body>
              <p className='mb-0'>Monitor your system's performance, health, and status here. This dashboard provides real-time insights into your application's operations.</p>
              {/* Add your monitoring specific content here */}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Monitoring;
