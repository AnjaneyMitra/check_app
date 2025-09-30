import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { apiService, UserProfile } from '../services/api';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
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
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e9e9e7;
  overflow: hidden;
`;

const SectionTitle = styled.h2`
  margin: 0;
  padding: 20px 24px 16px 24px;
  color: #37352f;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #f1f1ef;
`;

const Form = styled.form`
  padding: 20px 24px;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid #d9d9d7;
  border-radius: 6px;
  font-size: 14px;
  background: #ffffff;
  color: #37352f;
  
  &:focus {
    outline: none;
    border-color: #37352f;
    box-shadow: 0 0 0 1px #37352f;
  }
`;

const Button = styled.button`
  background: #37352f;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  align-self: flex-start;
  
  &:hover {
    background: #2f2e2a;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Profile: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profileData = await apiService.getUserProfile();
      const profile = profileData.user;
      setUserProfile(profile);
      setDisplayName(profile?.display_name || '');
      setUsername(profile?.username || '');
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await apiService.updateProfile({
        display_name: displayName.trim() || undefined,
        username: username.trim() || undefined
      });
      alert('Profile updated successfully! 🎉');
      await loadProfile();
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to update profile. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!userProfile) {
    return <div>Loading profile...</div>;
  }

  return (
    <Container>
      <Title>👤 Profile</Title>
      
      <Section>
        <SectionTitle>Edit Your Profile</SectionTitle>
        <Form onSubmit={handleUpdateProfile}>
          <div>
            <label htmlFor="displayName">Display Name</label>
            <Input
              id="displayName"
              type="text"
              placeholder="Enter your display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="username">Username</label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Profile'}
          </Button>
        </Form>
      </Section>
    </Container>
  );
};

export default Profile;
