import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled, { ThemeProvider } from 'styled-components';
import { AuthProvider } from './AuthContext';
import { ProtectedRoute } from './ProtectedRoute';
import GlobalStyles from './GlobalStyles';
import Nav from './components/Nav';
import Home from './pages/Home';
import Movies from './pages/Movies';
import Create from './pages/Create';
import MyMovies from './pages/MyMovies';
import FeaturedContent from './components/FeaturedContent';
import TrendingRow from './components/TrendingRow';
import Roadmap from './pages/Roadmap';

const theme = {
  colors: {
    primary: '#00ff9d',
    background: '#000000',
    text: '#ffffff',
    secondary: '#1a1a1a',
    accent: '#00ff9d',
    error: '#ff4444'
  },
  fonts: {
    body: 'Inter, system-ui, sans-serif',
    heading: 'Inter, system-ui, sans-serif'
  },
  fontSizes: {
    small: '0.875rem',
    medium: '1rem',
    large: '1.25rem',
    xlarge: '1.5rem',
    xxlarge: '2rem'
  },
  spacing: {
    small: '0.5rem',
    medium: '1rem',
    large: '2rem',
    xlarge: '4rem'
  }
};

const AppContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
`;

const MainContent = styled.main`
  flex-grow: 1;
  margin-left: 60px; /* Same as Nav width */
  overflow-x: hidden;
`;

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <GlobalStyles />
          <AppContainer>
            <Routes>
              {/* Home page route - doesn't include Nav */}
              <Route path="/" element={<Home />} />
              
              {/* Protected app routes - all include Nav */}
              <Route path="/*" element={
                <ProtectedRoute>
                  <Nav />
                  <MainContent>
                    <Routes>
                      <Route path="/movies" element={
                        <>
                          <FeaturedContent />
                          {/* <TrendingRow title="Trending Now" /> */}
                          <Movies />
                        </>
                      } />
                      <Route path="/roadmap" element={<Roadmap />} />
                      <Route path="/create" element={<Create />} />
                      <Route path="/my-movies" element={<MyMovies />} />
                      {/* Redirect app/* to movies if no match */}
                      <Route path="*" element={<Navigate to="/movies" replace />} />
                    </Routes>
                  </MainContent>
                </ProtectedRoute>
              } />
            </Routes>
          </AppContainer>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;