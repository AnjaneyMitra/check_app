import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

const LoginContainer = styled.div`
  min-height: 100vh;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const LoginCard = styled.div`
  background: #ffffff;
  border: 1px solid #e9e9e7;
  border-radius: 8px;
  padding: 2.5rem;
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 0.5rem;
  color: #37352f;
  font-size: 1.5rem;
  font-weight: 600;
`;

const Subtitle = styled.p`
  text-align: center;
  color: #787774;
  margin-bottom: 2rem;
  line-height: 1.5;
  font-size: 14px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #e9e9e7;
  border-radius: 6px;
  font-size: 14px;
  color: #37352f;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #37352f;
  }
  
  &::placeholder {
    color: #9b9a97;
  }
`;

const Button = styled.button`
  background: #37352f;
  color: #ffffff;
  border: none;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #2f2e2a;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const GoogleButton = styled(Button)`
  background: #ffffff;
  color: #37352f;
  border: 1px solid #e9e9e7;
  margin-top: 0.5rem;
  
  &:hover {
    background: #f7f6f3;
  }
`;

const ErrorMessage = styled.div`
  background: #fdf2f2;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  text-align: center;
  font-size: 14px;
`;

const ToggleMode = styled.div`
  text-align: center;
  margin-top: 1.5rem;
  color: #787774;
  font-size: 14px;
`;

const ToggleLink = styled.button`
  background: none;
  border: none;
  color: #37352f;
  cursor: pointer;
  font-weight: 500;
  text-decoration: underline;
  font-size: 14px;
`;

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    
    try {
      setError('');
      setLoading(true);
      
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      
      navigate('/');
    } catch (error: any) {
      setError('Failed to ' + (isLogin ? 'sign in' : 'create account'));
    }
    
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      navigate('/');
    } catch (error: any) {
      setError('Failed to sign in with Google');
    }
    setLoading(false);
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Title>📋 Daily Check-In</Title>
        <Subtitle>
          Stay accountable with your partner and track your daily goals together
        </Subtitle>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <Form onSubmit={handleSubmit}>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </Button>
        </Form>
        
        <GoogleButton onClick={handleGoogleLogin} disabled={loading}>
          🔍 Continue with Google
        </GoogleButton>
        
        <ToggleMode>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <ToggleLink onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign up' : 'Sign in'}
          </ToggleLink>
        </ToggleMode>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;
