//import node module libraries
import { Outlet } from "react-router";
import { Container } from "react-bootstrap";

const AuthenticationLayout = () => {
  return (
    <section className='bg-light'>
      <Container className='d-flex flex-column'>
        <Outlet />
      </Container>
    </section>
  );
};

export default AuthenticationLayout;
