import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Overview from './components/Overview';
import QudemoLibrary from './components/QudemoLibrary';
import BuyerInteractions from './components/BuyerInteractions';
import InsightsAnalytics from './components/InsightsAnalytics';
import Settings from './components/SettingsPage';
import CreateQuDemo from './components/CreateQuDemo';
import VideoDemoChatPopup from './components/VideoDemoChatPopup';
import DemoHomePage from './components/DemoHomePage';

function AppContent() {
  const location = useLocation();
  const isUserRoute = location.pathname === '/home';

  return (
    <div className="flex flex-col h-screen">
      {!isUserRoute && <Header />}
      <div className="flex flex-1">
        {!isUserRoute && <Sidebar />}
        <main className={`flex-1 overflow-auto ${isUserRoute ? '' : 'bg-gray-50 p-6'}`}>
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/createQUDemo" element={<CreateQuDemo />} />
            <Route path="/qudemo-library" element={<QudemoLibrary />} />
            <Route path="/buyer-interactions" element={<BuyerInteractions />} />
            <Route path="/insights-analytics" element={<InsightsAnalytics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/VideoDemoChatPopup" element={<VideoDemoChatPopup />} />
            <Route path="/home" element={<DemoHomePage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
