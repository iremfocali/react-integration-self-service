// import node module libraries
import { FC } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";

// import widget/custom components
import { PageHeading } from "widgets";

const Product: FC = () => {
  return (
    <Container fluid className='p-6'>
      <PageHeading heading='Product Integration' />
      <Row>
        <Col lg={12} md={12} sm={12}>
          <Card>
            <Card.Header>
              <h4 className='mb-0'>Product Integration Settings</h4>
            </Card.Header>
            <Card.Body>
              <p className='mb-0'>Configure your product integration settings here. This allows you to manage and sync your product data.</p>
              {/* Add your product integration specific content here */}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Product;
