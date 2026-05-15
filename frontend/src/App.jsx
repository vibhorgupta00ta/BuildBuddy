import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Discover from './pages/Discover';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import CreateTeam from './pages/CreateTeam';
import Teams from './pages/Teams';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import TeamWorkspace from './pages/TeamWorkspace';
import GlobalBackground from './components/GlobalBackground';
import Footer from './components/Footer';


import Requests from './pages/Requests';

function App() {
  return (
    <div className="min-h-screen relative">
      <GlobalBackground />
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/create-team" element={<CreateTeam />} />
        {/* Fallback routes */}
        <Route path="/events" element={<div className="pt-32 text-center text-2xl">Events Coming Soon...</div>} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/team/:teamId" element={<TeamWorkspace />} />
        <Route path="/requests" element={<Requests />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:userId" element={<Profile />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/messages/:userId" element={<Messages />} />
      </Routes>
      
      <Footer />
    </div>
  );
}

export default App;

