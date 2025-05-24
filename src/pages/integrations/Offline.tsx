// import node module libraries
import { FC } from "react";
import { Container, Row, Col, Card, Form } from "react-bootstrap";

// import widget/custom components
import { PageHeading } from "widgets";

const Offline: FC = () => {
  return (
    <Container fluid className='p-6'>
      <PageHeading heading='Offline Integration' />
      <Row>
        <Col lg={12} md={12} sm={12}>
          <Card>
            <Card.Header>
              <h4 className='mb-0'>Offline Integration Settings</h4>
            </Card.Header>
            <Card.Body>{/* Add your offline integration specific content here */}</Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Offline;
