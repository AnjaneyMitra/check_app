import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: #ffffff;
  width: 100%;
`;

const Sidebar = styled.nav`
  width: 240px;
  background: #f7f6f3;
  border-right: 1px solid #e9e9e7;
  display: flex;
  flex-direction: column;
  padding: 0;
  min-height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 10;
  
  @media (max-width: 768px) {
    width: 100%;
    position: relative;
  }
`;

const Logo = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid #e9e9e7;
  font-size: 16px;
  font-weight: 600;
  color: #37352f;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NavSection = styled.div`
  flex: 1;
  padding: 16px 0;
`;

const NavLink = styled(Link)<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 24px;
  color: ${props => props.$active ? '#37352f' : '#787774'};
  text-decoration: none;
  font-size: 14px;
  font-weight: ${props => props.$active ? '500' : '400'};
  background: ${props => props.$active ? '#e9e9e7' : 'transparent'};
  border-right: ${props => props.$active ? '2px solid #37352f' : '2px solid transparent'};
  transition: all 0.15s ease;
  
  &:hover {
    background: #e9e9e7;
    color: #37352f;
  }
`;

const UserSection = styled.div`
  padding: 16px 24px;
  border-top: 1px solid #e9e9e7;
  background: #f7f6f3;
`;

const UserInfo = styled.div`
  font-size: 12px;
  color: #787774;
  margin-bottom: 8px;
  font-weight: 500;
`;

const LogoutButton = styled.button`
  background: transparent;
  color: #787774;
  border: 1px solid #e9e9e7;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  width: 100%;
  
  &:hover {
    background: #e9e9e7;
    color: #37352f;
  }
`;

const Main = styled.main`
  flex: 1;
  margin-left: 240px;
  padding: 0;
  background: #ffffff;
  min-height: 100vh;
  
  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const ContentArea = styled.div`
  padding: 32px 40px;
  max-width: 900px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 24px 20px;
  }
`;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <LayoutContainer>
      <Sidebar>
        <Logo>
          <span>📋</span>
          Daily Check-In
        </Logo>
        
        <NavSection>
          <NavLink to="/" $active={location.pathname === '/'}>
            <span>📊</span>
            Today's Tasks
          </NavLink>
          <NavLink to="/history" $active={location.pathname === '/history'}>
            <span>📈</span>
            Progress History
          </NavLink>
          <NavLink to="/setup" $active={location.pathname === '/setup'}>
            <span>⚙️</span>
            Partner Settings
          </NavLink>
        </NavSection>
        
        <UserSection>
          <UserInfo>
            Signed in as {currentUser?.email}
          </UserInfo>
          <LogoutButton onClick={handleLogout}>
            Sign Out
          </LogoutButton>
        </UserSection>
      </Sidebar>
      
      <Main>
        <ContentArea>
          {children}
        </ContentArea>
      </Main>
    </LayoutContainer>
  );
};

export default Layout;
