import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { apiService, UserProfile } from '../services/api';

const SetupContainer = styled.div`
  background: #ffffff;
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
`;

const Title = styled.h1`
  margin: 0 0 2rem 0;
  color: #37352f;
  font-size: 1.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Section = styled.div`
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e9e9e7;
`;

const SectionTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #37352f;
  font-size: 1rem;
  font-weight: 600;
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

const InfoCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #fafafa;
  border-radius: 6px;
  border: 1px solid #e9e9e7;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 6px;
  background: #37352f;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 500;
  font-size: 14px;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-weight: 500;
  color: #37352f;
  margin-bottom: 0.25rem;
  font-size: 14px;
`;

const UserEmail = styled.div`
  color: #787774;
  font-size: 12px;
`;

const StatusBadge = styled.div<{ $connected?: boolean }>`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  background: ${props => props.$connected ? '#f7f6f3' : '#fafafa'};
  color: ${props => props.$connected ? '#37352f' : '#787774'};
  border: 1px solid ${props => props.$connected ? '#e9e9e7' : '#e9e9e7'};
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

const SuccessMessage = styled.div`
  background: #f0fdf4;
  color: #16a34a;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  text-align: center;
  font-size: 14px;
`;

const Instructions = styled.div`
  background: #f7f6f3;
  color: #37352f;
  padding: 1.5rem;
  border-radius: 6px;
  margin-bottom: 2rem;
  line-height: 1.5;
  font-size: 14px;
`;

const PartnerSetup: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<UserProfile | null>(null);
  const [partnerEmail, setPartnerEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const data = await apiService.getUserProfile();
      setUserProfile(data.user);
      setPartnerProfile(data.partner);
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  const handleSetupPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!partnerEmail.trim()) {
      setError('Please enter your partner\'s email address');
      return;
    }

    try {
      setLoading(true);
      await apiService.setupUser(partnerEmail);
      setSuccess('Partner connected successfully! 🎉');
      setPartnerEmail('');
      await loadUserProfile();
    } catch (error: any) {
      setError('Failed to connect with partner. Make sure they have an account and the email is correct.');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (email: string) => {
    return email.split('@')[0].substring(0, 2).toUpperCase();
  };

  return (
    <SetupContainer>
      <Title>⚙️ Account Settings</Title>

      <Instructions>
        <strong>How it works:</strong> Connect with your accountability partner by entering their email address. 
        Both of you need to have accounts and add each other to start tracking progress together.
      </Instructions>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}

      <Section>
        <SectionTitle>Your Profile</SectionTitle>
        {userProfile && (
          <InfoCard>
            <Avatar>{getInitials(userProfile.email)}</Avatar>
            <UserInfo>
              <UserName>{userProfile.display_name || 'You'}</UserName>
              <UserEmail>{userProfile.email}</UserEmail>
            </UserInfo>
            <StatusBadge $connected={!!userProfile.partner_id}>
              {userProfile.partner_id ? 'Connected' : 'Solo'}
            </StatusBadge>
          </InfoCard>
        )}
      </Section>

      {partnerProfile ? (
        <Section>
          <SectionTitle>Your Partner</SectionTitle>
          <InfoCard>
            <Avatar>{getInitials(partnerProfile.email)}</Avatar>
            <UserInfo>
              <UserName>{partnerProfile.display_name || 'Your Partner'}</UserName>
              <UserEmail>{partnerProfile.email}</UserEmail>
            </UserInfo>
            <StatusBadge $connected={true}>Connected</StatusBadge>
          </InfoCard>
        </Section>
      ) : (
        <Section>
          <SectionTitle>Connect with Partner</SectionTitle>
          <Form onSubmit={handleSetupPartner}>
            <Input
              type="email"
              placeholder="Enter your partner's email address"
              value={partnerEmail}
              onChange={(e) => setPartnerEmail(e.target.value)}
              required
            />
            <Button type="submit" disabled={loading}>
              {loading ? 'Connecting...' : 'Connect Partner'}
            </Button>
          </Form>
        </Section>
      )}

      <Section>
        <SectionTitle>How to Get Started</SectionTitle>
        <div style={{ color: '#787774', lineHeight: '1.5', fontSize: '14px' }}>
          <p><strong>1.</strong> Both you and your partner need to create accounts</p>
          <p><strong>2.</strong> Add each other using your email addresses</p>
          <p><strong>3.</strong> Start adding daily tasks on the Dashboard</p>
          <p><strong>4.</strong> Check each other's progress and send encouragement</p>
          <p><strong>5.</strong> View your progress history to track improvement</p>
        </div>
      </Section>
    </SetupContainer>
  );
};

export default PartnerSetup;
