import { FC } from "react";

declare module "./pages/integrations/Event" {
  const Event: FC;
  export default Event;
}

declare module "./pages/integrations/Product" {
  const Product: FC;
  export default Product;
}

declare module "./pages/integrations/Offline" {
  const Offline: FC;
  export default Offline;
}

declare module "./pages/integrations/WebPush" {
  const WebPush: FC;
  export default WebPush;
}
