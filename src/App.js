import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/DashboardPage';
import Login from './pages/LoginPage';
import Introduction from './pages/IntroductionPage';
import Contact from './pages/ContactPage';
import './App.css';

function App() {
  return (
    <Router future={{ v7_startTransition: true }}>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/introduction" element={<Introduction />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;