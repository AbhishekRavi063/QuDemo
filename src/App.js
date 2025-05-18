// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Overview from './components/Overview';
import QudemoLibrary from './components/QudemoLibrary';
import BuyerInteractions from './components/BuyerInteractions';
import InsightsAnalytics from './components/InsightsAnalytics';
import Settings from './components/SettingsPage';
import CreateQuDemo from './components/CreateQuDemo';
import InteractiveDiscovery from './components/InteractiveDiscovery';
import VideoDemoChatPopup from './components/VideoDemoChatPopup';



function App() {
  return (
    <Router>
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 overflow-auto bg-gray-50 p-6">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/createQUDemo" element={<CreateQuDemo/>} />
              <Route path="/qudemo-library" element={<QudemoLibrary />} />
              <Route path="/buyer-interactions" element={<BuyerInteractions />} />
              <Route path="/insights-analytics" element={<InsightsAnalytics />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/interactiveDiscovery" element={<InteractiveDiscovery />} />
              <Route path="/VideoDemoChatPopup" element={<VideoDemoChatPopup />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
