// import node module libraries
import { Fragment } from "react";
import { Link } from "react-router-dom";
import { Container, Col, Row } from "react-bootstrap";
import { Card, Button } from "react-bootstrap";

// import JSON data
import dashboardIntegrations from "../../data/JSONFiles/DashBoardItegrations.json";

// Define types for our integrations
interface Integration {
  title: string;
  description: string;
  button: string;
  image: string;
}

const Dashboard = () => {
  // Function to render an integration card
  const renderIntegrationCard = (key: string, integration: Integration) => (
    <Card key={key} className='mb-4 mt-4 p-1' style={{ width: "18rem" }}>
      <Card.Img variant='top' className='p-1' src={integration.image} />
      <Card.Body>
        <Card.Title>{integration.title}</Card.Title>
        <Card.Text>{integration.description}</Card.Text>
        <Link to={integration.button}>
          <Button variant='primary'>Start</Button>
        </Link>
      </Card.Body>
    </Card>
  );

  return (
    <Fragment>
      <Container fluid className=' p-6'>
        <Row>
          <Col lg={12} md={12} sm={12}>
            <div className='border-bottom pb-4 mb-4 d-md-flex align-items-center justify-content-between'>
              <div className='mb-3 mb-md-0'>
                <h1 className='mb-1 h2 fw-bold'>Integrations</h1>
                <p className='mb-0 '>Complete your data collection with the following integrations.</p>
              </div>
            </div>
          </Col>
        </Row>
        <Row className='d-flex gap-4'>
          {/* Render event integrations */}
          {Object.entries(dashboardIntegrations.event).map(([key, integration]) => renderIntegrationCard(key, integration as Integration))}

          {/* Render other top-level integrations */}
          {Object.entries(dashboardIntegrations)
            .filter(([key]) => key !== "event") // Skip 'event' as it's handled separately
            .map(([key, integration]) => renderIntegrationCard(key, integration as Integration))}
        </Row>
      </Container>
    </Fragment>
  );
};
export default Dashboard;
