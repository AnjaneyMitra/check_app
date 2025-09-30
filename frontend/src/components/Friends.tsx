import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { apiService, Friend } from '../services/api';

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
  border-bottom: 1px solid #f1f1ef;
  display: flex;
  gap: 12px;
  align-items: end;
`;

const Input = styled.input`
  flex: 1;
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
  
  &:hover {
    background: #2f2e2a;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const List = styled.div`
  padding: 0 24px 24px 24px;
`;

const ListItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #f1f1ef;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ItemInfo = styled.div`
  flex: 1;
`;

const ItemName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #37352f;
  margin-bottom: 4px;
`;

const ItemDetail = styled.div`
  font-size: 12px;
  color: #787774;
`;

const ItemActions = styled.div`
  display: flex;
  gap: 8px;
`;

const SmallButton = styled.button`
  background: transparent;
  border: 1px solid #d9d9d7;
  color: #37352f;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  
  &:hover {
    background: #f1f1ef;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  color: #9b9a97;
  padding: 40px 24px;
  font-size: 14px;
`;

const Friends: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendEmail, setFriendEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      const friendsData = await apiService.getFriends();
      setFriends(friendsData.friends || []);
    } catch (error) {
      console.error('Failed to load friends:', error);
    }
  };

  const handleSendFriendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendEmail.trim()) return;

    try {
      setLoading(true);
      await apiService.sendFriendRequest(friendEmail);
      setFriendEmail('');
      alert('Friend request sent! 🎉');
      // We don't reload friends here, as the request needs to be accepted first.
    } catch (error: any) {
      console.error('Failed to send friend request:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to send friend request. Please check the email and try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!window.confirm('Are you sure you want to remove this friend?')) return;

    try {
      await apiService.removeFriend(friendId);
      await loadFriends();
    } catch (error) {
      console.error('Failed to remove friend:', error);
    }
  };

  return (
    <Container>
      <Title>👥 Friends</Title>
      
      <Section>
        <SectionTitle>
          <span>➕</span>
          Add Friend
        </SectionTitle>
        <Form onSubmit={handleSendFriendRequest}>
          <Input
            type="email"
            placeholder="Enter friend's email address"
            value={friendEmail}
            onChange={(e) => setFriendEmail(e.target.value)}
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Request'}
          </Button>
        </Form>
      </Section>

      <Section>
        <SectionTitle>
          Your Friends ({friends.length})
        </SectionTitle>
        <List>
          {friends.length > 0 ? (
            friends.map(friend => (
              <ListItem key={friend.id}>
                <ItemInfo>
                  <ItemName>{friend.display_name}</ItemName>
                  <ItemDetail>@{friend.username}</ItemDetail>
                </ItemInfo>
                <ItemActions>
                  <SmallButton onClick={() => handleRemoveFriend(friend.id)}>Remove</SmallButton>
                </ItemActions>
              </ListItem>
            ))
          ) : (
            <EmptyState>You have no friends yet. Add some!</EmptyState>
          )}
        </List>
      </Section>
    </Container>
  );
};

export default Friends;
