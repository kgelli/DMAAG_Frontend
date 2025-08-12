// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { GsuRecordsPage } from './pages/GsuRecordsPage';
import { TroyRecordsPage } from './pages/TroyRecordsPage';
import { AdvancedSearchPage } from './pages/AdvancedSearchPage';
import { VisualizationPage } from './pages/VisualizationPage';
import { AboutPage } from './pages/AboutPage';
import { DataDashboard } from './components/DataDashboard';

// Import your dashboard components
import { GsuDashboard } from './components/GsuDashboard';
import TroyDashboard from './components/TroyDashboard';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    // Test database connection
    fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query { gsuRecords(limit: 1) { deed_state } }`
      })
    })
    .then(res => res.json())
    .then(() => {
      setIsConnected(true);
      setIsLoading(false);
    })
    .catch(err => {
      console.error('Connection Error:', err);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <div>Loading DMMAG...</div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl text-red-600 mb-4">Connection Error</h1>
          <p className="text-gray-600">Unable to connect to the database. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navigation />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/advanced-search" element={<AdvancedSearchPage />} />
            <Route 
              path="/gsu" 
              element={
                <>
                  {showDashboard && <DataDashboard type="gsu" isVisible={showDashboard} />}
                  <GsuRecordsPage showDashboard={showDashboard} setShowDashboard={setShowDashboard} />
                </>
              } 
            />
            <Route 
              path="/troy" 
              element={
                <>
                  {showDashboard && <DataDashboard type="troy" isVisible={showDashboard} />}
                  <TroyRecordsPage showDashboard={showDashboard} setShowDashboard={setShowDashboard} />
                </>
              } 
            />
            <Route path="/visualization" element={<VisualizationPage />} />
            <Route path="/visualization/gsu" element={<GsuDashboard />} />
            <Route path="/visualization/troy" element={<TroyDashboard />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}