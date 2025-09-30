import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { FirebaseProvider } from './contexts/FirebaseContext';
import Layout from './components/Layout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import History from './components/History';
import FriendsGroups from './components/FriendsGroups';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <FirebaseProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/history" element={
                <ProtectedRoute>
                  <Layout>
                    <History />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/friends" element={
                <ProtectedRoute>
                  <Layout>
                    <FriendsGroups />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/setup" element={
                <ProtectedRoute>
                  <Layout>
                    <FriendsGroups />
                  </Layout>
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </FirebaseProvider>
  );
}

export default App;
