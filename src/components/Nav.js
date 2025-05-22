import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FiSearch, FiHome, FiRefreshCw, FiTrendingUp, FiList, FiPlus, FiLogOut, FiFilm, FiLoader } from 'react-icons/fi';
import { useAuth } from '../AuthContext';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const NavContainer = styled.nav`
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 60px;
  background-color: #000;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 100;
`;

const Logo = styled.div`
  color: #00ff9d; /* Neon green */
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 40px;
  
  a {
    color: #00ff9d; /* Ensuring the link inherits the neon green color */
    text-decoration: none;
  }
`;

const NavIcon = styled.div`
  color: ${props => props.active ? '#00ff9d' : '#777'};
  margin: 15px 0;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    color: #00ff9d;
    transform: scale(1.1);
  }
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

const NavLink = styled(Link)`
  text-decoration: none;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 0;
    background: #00ff9d;
    transition: height 0.3s ease;
  }
  
  &.active::after {
    height: 70%;
  }
`;

const LogoutButton = styled.button`
  position: absolute;
  bottom: 20px;
  background: none;
  border: none;
  color: #777;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 10px;
  
  &:hover {
    color: #ff4444;
    transform: scale(1.1);
  }
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

const QueueIndicator = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
  background: #00ff9d;
  color: black;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  box-shadow: 0 0 10px rgba(0, 255, 157, 0.5);
  animation: ${props => props.active ? 'pulse 2s infinite' : 'none'};

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(0, 255, 157, 0.4);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(0, 255, 157, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(0, 255, 157, 0);
    }
  }
`;

const NavIconWrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
`;

function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeJobs, setActiveJobs] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Set up real-time listener for active jobs
    const moviesRef = collection(db, 'movies');
    const q = query(
      moviesRef,
      where('userId', '==', user.uid),
      where('status', 'in', ['queued', 'processing'])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setActiveJobs(snapshot.docs.length);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <NavContainer>
      <Logo>
        <Link 
          to="/" 
          style={{ 
            color: '#00ff9d', 
            textDecoration: 'none',
            textShadow: '0 0 10px #00ff9d, 0 0 15px #00ff9d'
          }}
        >
          D
        </Link>
      </Logo>
      
      <NavLink to="/search" className={isActive('/search') ? 'active' : ''}>
        <NavIcon active={isActive('/search')}>
          <FiSearch />
        </NavIcon>
      </NavLink>
      
      <NavLink to="/movies" className={isActive('/movies') ? 'active' : ''}>
        <NavIcon active={isActive('/movies')}>
          <FiHome />
        </NavIcon>
      </NavLink>
      
      {/* <NavLink to="/new" className={isActive('/new') ? 'active' : ''}>
        <NavIcon active={isActive('/new')}>
          <FiRefreshCw />
        </NavIcon>
      </NavLink> */}
      
      <NavLink to="/trending" className={isActive('/trending') ? 'active' : ''}>
        <NavIcon active={isActive('/trending')}>
          <FiTrendingUp />
        </NavIcon>
      </NavLink>
      
      <NavLink to="/watchlist" className={isActive('/watchlist') ? 'active' : ''}>
        <NavIcon active={isActive('/watchlist')}>
          <FiList />
        </NavIcon>
      </NavLink>
      
      <NavLink to="/my-movies" className={isActive('/my-movies') ? 'active' : ''}>
        <NavIconWrapper>
          <NavIcon active={isActive('/my-movies')}>
            <FiFilm />
          </NavIcon>
          {activeJobs > 0 && (
            <QueueIndicator active={true}>
              {activeJobs}
            </QueueIndicator>
          )}
        </NavIconWrapper>
      </NavLink>
      
      <NavLink to="/create" className={isActive('/create') ? 'active' : ''}>
        <NavIcon active={isActive('/create')}>
          <FiPlus />
        </NavIcon>
      </NavLink>

      <LogoutButton onClick={handleLogout}>
        <FiLogOut />
      </LogoutButton>
    </NavContainer>
  );
}

export default Nav;