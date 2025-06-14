// import node module libraries
import { FC } from "react";
import { Container, Row, Col, Card, Button, Accordion } from "react-bootstrap";

// import widget/custom components
import { PageHeading } from "widgets";

type EventType = "pageView" | "cart" | "login" | "signup" | "addToFav" | "removeFromFav" | "productDetail" | "purchase";

const Event: FC = () => {
  const eventCodes: Record<EventType, string> = {
    pageView: `function pageView(){
    var VL = new Visilabs();
    VL.Collect();
    VL.SuggestActions();
}
pageView();`,
    cart: `function rdCartView(){
    var VL = new Visilabs();
    VL.AddParameter("OM.pbid","Cart Code");
    VL.AddParameter("OM.pb","1st product code;2nd product code");
    VL.AddParameter("OM.pu" ,"1st product quantity;2nd product quantity")
    VL.AddParameter("OM.ppr" ,"1st product price*1st product quantity;2nd product price*2nd product quantity");
    VL.Collect();
    VL.SuggestActions();
}
rdCartView();`,
    login: `function rdLogin() {
    var VL = new Visilabs();
    VL.AddParameter("OM.exVisitorID", "User Code");
    VL.AddParameter("OM.b_login", "1");
    VL.Collect();
}
rdLogin();`,
    signup: `function rdSignup() {
    var VL = new Visilabs();
    VL.AddParameter("OM.exVisitorID", "User Code");
    VL.AddParameter("OM.b_sgnp", "1");
    VL.Collect();
}
rdSignup();`,
    addToFav: `function rdAddtoFav(){
    var vl = new Visilabs();
    vl.AddParameter("OM.pf","Product Code");
    vl.AddParameter("OM.pfu","1");
    vl.AddParameter("OM.ppr","Price of the product");
    vl.Collect();
}
rdAddtoFav();`,
    removeFromFav: `function rdRemoveFromFav(){
    var vl = new Visilabs();
    vl.AddParameter("OM.pf","Product Code");
    vl.AddParameter("OM.pfu","-1");
    vl.AddParameter("OM.ppr","Price of the product");
    vl.Collect();
}
rdRemoveFromFav();`,
    productDetail: `function OnVisilabsLoaded(){
    var vl = new Visilabs();
    vl.AddParameter("OM.pv","Product ID");
    vl.AddParameter("OM.pn","Product Name");
    vl.AddParameter("OM.inv" , "Product Stock Count");
    vl.AddParameter("OM.ppr", "Product Price");
    vl.AddParameter("OM.pv.1", "Product Brand");
    vl.Collect();
    vl.SuggestActions();
}`,
    purchase: `function rdPurchase(){
    var VL = new Visilabs();
    VL.AddParameter("OM.tid","Payment Transaction Code");
    VL.AddParameter("OM.pp","1st product code;2nd product code");
    VL.AddParameter("OM.pu","1st product quantity;2nd product quantity");
    VL.AddParameter("OM.ppr","1st product price*1st product quantity;2nd product price*2nd product quantity");
    VL.AddParameter("OM.exVisitorID","User Code");
    VL.Collect();
    VL.SuggestActions();
}
rdPurchase();`,
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
    const allCode = Object.entries(eventCodes)
      .map(([eventName, code]) => `// ${eventName.toUpperCase()} EVENT\n${code}\n\n`)
      .join("");

    const blob = new Blob([allCode], { type: "text/javascript" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "all-event-codes.js";
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
                {Object.entries(eventCodes).map(([eventName, code]) => (
                  <Col lg={6} md={6} sm={12} className='mb-4' key={eventName}>
                    <Card className='h-100 shadow-sm'>
                      <Card.Header className='d-flex justify-content-between align-items-center'>
                        <h5 className='mb-0 text-capitalize'>{eventName.replace(/([A-Z])/g, " $1").trim()}</h5>
                        <Button variant='outline-primary' size='sm' onClick={() => handleDownload(code, eventName)}>
                          <i className='fe fe-download'></i>
                        </Button>
                      </Card.Header>
                      <Card.Body>
                        <p className='text-muted mb-3'>{eventDescriptions[eventName as EventType]}</p>
                        <Accordion>
                          <Accordion.Item eventKey='0'>
                            <Accordion.Header>
                              <i className='fe fe-code me-2'></i>
                              View Code
                            </Accordion.Header>
                            <Accordion.Body>
                              <pre className='bg-light p-3 rounded' style={{ maxHeight: "300px", overflow: "auto" }}>
                                <code>{code}</code>
                              </pre>
                            </Accordion.Body>
                          </Accordion.Item>
                        </Accordion>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Event;
