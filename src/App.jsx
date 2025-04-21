import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import EventView from './views/eventView';
import OfflinePanel from './views/offlinePanel';
import ProductDisplay from './views/productDisplay';
import ServerSide from './views/serverSide';
import SettingsPanel from './views/settingsPanel';
import LoginScreen from './views/loginScreen';
import HomePageView from './views/homePageView';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <EventView />
        <OfflinePanel />
        <ProductDisplay />
        <ServerSide />
        <SettingsPanel />
        <LoginScreen />
        <HomePageView />
      </div>
    </>
  )
}

export default App;
