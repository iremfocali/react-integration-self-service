import { Dropdown, Image } from "react-bootstrap";
import { Link } from "react-router-dom";

export const DesktopNotifications = () => {
  return (
    <Dropdown as="li" className="ms-2">
      <Dropdown.Toggle
        as="a"
        bsPrefix=" "
        className="rounded-circle"
        id="dropdownUser"
      >
        <div className="avatar avatar-md avatar-indicators avatar-online">
          <Image
            alt="avatar"
            src="/images/avatar/yuba.jpg"
            className="rounded-circle"
          />
        </div>
      </Dropdown.Toggle>
      <Dropdown.Menu
        className="dropdown-menu dropdown-menu-end "
        align="end"
        aria-labelledby="dropdownUser"
        show
      >
        <Dropdown.Item as="div" className="px-4 pb-0 pt-2" bsPrefix=" ">
          <div className="lh-1 ">
            <h5 className="mb-1"> Yusuf Salih Bakırcı</h5>
          </div>
          <div className=" dropdown-divider mt-3 mb-2"></div>
        </Dropdown.Item>
        <Dropdown.Item as={Link} to="/pages/settings">
          <i className="fe fe-settings me-2"></i> Account Settings
        </Dropdown.Item>
        <Dropdown.Item as={Link} to="/auth/sign-in">
          <i className="fe fe-power me-2"></i>Sign Out
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};
