// import node module libraries
import { Fragment } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { ListGroup, Card, Image, Badge, Accordion } from "react-bootstrap";
import { CustomToggle } from "./CustomToggle";
import { CustomToggleLevelTwo } from "./CustomToggleLevelTwo";

// import simple bar scrolling used for notification item scrolling
import SimpleBar from "simplebar-react";

// import routes file
import { DashboardMenu } from "routes/DashboardRoutes";
import { DashboardMenuProps, ChildrenItemProps } from "types";

interface SidebarProps {
  showMenu: boolean;
  toggleMenu: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ showMenu, toggleMenu }) => {
  const location = useLocation();
  const isMobile = useMediaQuery({ maxWidth: 767 });

  const generateLink = (item: ChildrenItemProps) => {
    return (
      <Link to={item.link} className={`nav-link ${location.pathname === item.link ? "active" : ""}`} onClick={() => (isMobile ? toggleMenu() : showMenu)}>
        {item.name}
        {item.badge && (
          <Badge className='ms-1' bg={item.badgecolor || "primary"}>
            {item.badge}
          </Badge>
        )}
      </Link>
    );
  };

  return (
    <Fragment>
      <SimpleBar style={{ maxHeight: "100vh" }}>
        <div className='nav-scroller' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Link to='/' className='navbar-brand'>
            <Image src='/images/brand/logo/wizard.jpg' style={{ width: '100px', height: '100px' }} alt='' />
          </Link>
        </div>
        {/* Dashboard Menu */}
        <Accordion defaultActiveKey='0' as='ul' className='navbar-nav flex-column'>
          {DashboardMenu.map(function (menu: DashboardMenuProps, index: number) {
            if (menu.hidden) return null;

            if (menu.grouptitle) {
              return (
                <Card bsPrefix='nav-item' key={menu.id}>
                  {/* group title item */}
                  <div className='navbar-heading'>{menu.title}</div>
                  {/* end of group title item */}
                </Card>
              );
            } else {
              if (menu.children) {
                return (
                  <Fragment key={menu.id}>
                    {/* main menu / root menu level / root items */}
                    <CustomToggle eventKey={menu.id} icon={menu.icon}>
                      {menu.title}
                      {menu.badge ? (
                        <Badge className='ms-1' bg={menu.badgecolor ? menu.badgecolor : "primary"}>
                          {menu.badge}
                        </Badge>
                      ) : (
                        ""
                      )}
                    </CustomToggle>
                    <Accordion.Collapse eventKey={menu.id} as='li' bsPrefix='nav-item'>
                      <ListGroup as='ul' bsPrefix='' className='nav flex-column'>
                        {menu.children.map(function (menuLevel1Item: ChildrenItemProps, menuLevel1Index: number) {
                          if (menuLevel1Item.hidden) return null;

                          const childKey = `${menu.id}-${menuLevel1Index}`;
                          if (menuLevel1Item.children) {
                            return (
                              <ListGroup.Item as='li' bsPrefix='nav-item' key={menuLevel1Item.id}>
                                {/* first level menu started  */}
                                <CustomToggleLevelTwo eventKey={childKey}>
                                  {menuLevel1Item.title}
                                  {menuLevel1Item.badge ? (
                                    <Badge className='ms-1' bg={menuLevel1Item.badgecolor ? menuLevel1Item.badgecolor : "primary"}>
                                      {menuLevel1Item.badge}
                                    </Badge>
                                  ) : (
                                    ""
                                  )}
                                </CustomToggleLevelTwo>
                                <Accordion.Collapse eventKey={childKey} bsPrefix='nav-item'>
                                  <ListGroup as='ul' bsPrefix='' className='nav flex-column'>
                                    {menuLevel1Item.children.map((menuLevel2Item: ChildrenItemProps) => {
                                      if (menuLevel2Item.hidden) return null;

                                      return (
                                        <ListGroup.Item as='li' bsPrefix='nav-item' key={menuLevel2Item.id}>
                                          {/* second level menu started  */}
                                          {generateLink(menuLevel2Item)}
                                          {/* second level menu ended  */}
                                        </ListGroup.Item>
                                      );
                                    })}
                                  </ListGroup>
                                </Accordion.Collapse>
                              </ListGroup.Item>
                            );
                          } else {
                            return (
                              <ListGroup.Item as='li' bsPrefix='nav-item' key={menuLevel1Item.id}>
                                {/* first level menu items without children items */}
                                {generateLink(menuLevel1Item)}
                                {/* end of first level menu items without children items */}
                              </ListGroup.Item>
                            );
                          }
                        })}
                      </ListGroup>
                    </Accordion.Collapse>
                  </Fragment>
                );
              } else {
                return (
                  <Card bsPrefix='nav-item' key={index}>
                    {/* menu item without any childern items like Documentation and Changelog items*/}
                    <Link to={menu.link ?? "#"} className={`nav-link ${location.pathname === menu.link ? "active" : ""} ${menu.title === "Free Download" ? "bg-primary text-white" : ""}`}>
                      {typeof menu.icon === "string" ? <i className={`nav-icon fe fe-${menu.icon} me-2`}></i> : menu.icon}
                      {menu.title}
                      {menu.badge ? (
                        <Badge className='ms-1' bg={menu.badgecolor ? menu.badgecolor : "primary"}>
                          {menu.badge}
                        </Badge>
                      ) : (
                        ""
                      )}
                    </Link>
                    {/* end of menu item without any childern items */}
                  </Card>
                );
              }
            }
          })}
        </Accordion>
        {/* end of Dashboard Menu */}
      </SimpleBar>
    </Fragment>
  );
};

export default Sidebar;
