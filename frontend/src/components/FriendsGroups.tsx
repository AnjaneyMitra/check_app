import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { apiService, Friend, FriendRequest, Group, UserProfile } from '../services/api';

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

const TabContainer = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 24px;
`;

const Tab = styled.button<{ $active?: boolean }>`
  padding: 8px 16px;
  border: none;
  background: ${props => props.$active ? '#37352f' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#787774'};
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  
  &:hover {
    background: ${props => props.$active ? '#37352f' : '#f1f1ef'};
    color: ${props => props.$active ? 'white' : '#37352f'};
  }
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

const TextArea = styled.textarea`
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #d9d9d7;
  border-radius: 6px;
  font-size: 14px;
  background: #ffffff;
  color: #37352f;
  min-height: 80px;
  resize: vertical;
  
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

const AcceptButton = styled(SmallButton)`
  background: #16a34a;
  color: white;
  border-color: #16a34a;
  
  &:hover {
    background: #15803d;
  }
`;

const RejectButton = styled(SmallButton)`
  background: #dc2626;
  color: white;
  border-color: #dc2626;
  
  &:hover {
    background: #b91c1c;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  color: #9b9a97;
  padding: 40px 24px;
  font-size: 14px;
`;

const Badge = styled.span`
  background: #37352f;
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
  margin-left: 8px;
`;

const FriendsGroups: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'friends' | 'groups' | 'requests' | 'profile'>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [friendEmail, setFriendEmail] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [friendsData, groupsData, requestsData, profileData] = await Promise.all([
        apiService.getFriends(),
        apiService.getGroups(),
        apiService.getFriendRequests(),
        apiService.getUserProfile()
      ]);
      
      setFriends(friendsData.friends || []);
      setGroups(groupsData.groups || []);
      setFriendRequests(requestsData.requests || []);
      
      const profile = profileData.user;
      setUserProfile(profile);
      setDisplayName(profile?.display_name || '');
      setUsername(profile?.username || '');
    } catch (error) {
      console.error('Failed to load data:', error);
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
      await loadData();
    } catch (error: any) {
      console.error('Failed to send friend request:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to send friend request. Please check the email and try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToRequest = async (requestId: string, accept: boolean) => {
    try {
      await apiService.respondToFriendRequest(requestId, accept);
      await loadData();
    } catch (error) {
      console.error('Failed to respond to friend request:', error);
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!window.confirm('Are you sure you want to remove this friend?')) return;

    try {
      await apiService.removeFriend(friendId);
      await loadData();
    } catch (error) {
      console.error('Failed to remove friend:', error);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    try {
      setLoading(true);
      await apiService.createGroup(groupName, groupDescription);
      setGroupName('');
      setGroupDescription('');
      alert('Group created successfully! 🎉');
      await loadData();
    } catch (error) {
      console.error('Failed to create group:', error);
      alert('Failed to create group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    try {
      setLoading(true);
      await apiService.joinGroup(joinCode);
      setJoinCode('');
      alert('Successfully joined group! 🎉');
      await loadData();
    } catch (error) {
      console.error('Failed to join group:', error);
      alert('Failed to join group. Please check the invite code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (!window.confirm('Are you sure you want to leave this group?')) return;

    try {
      await apiService.leaveGroup(groupId);
      await loadData();
    } catch (error) {
      console.error('Failed to leave group:', error);
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
      await loadData();
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to update profile. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>👥 Friends & Groups</Title>

      <TabContainer>
        <Tab $active={activeTab === 'friends'} onClick={() => setActiveTab('friends')}>
          Friends ({friends.length})
        </Tab>
        <Tab $active={activeTab === 'groups'} onClick={() => setActiveTab('groups')}>
          Groups ({groups.length})
        </Tab>
        <Tab $active={activeTab === 'requests'} onClick={() => setActiveTab('requests')}>
          Requests
          {friendRequests.length > 0 && <Badge>{friendRequests.length}</Badge>}
        </Tab>
        <Tab $active={activeTab === 'profile'} onClick={() => setActiveTab('profile')}>
          Profile
        </Tab>
      </TabContainer>

      {activeTab === 'friends' && (
        <>
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
              <span>👥</span>
              My Friends
            </SectionTitle>
            <List>
              {friends.length === 0 ? (
                <EmptyState>No friends yet. Send some friend requests to get started!</EmptyState>
              ) : (
                friends.map((friend) => (
                  <ListItem key={friend.id}>
                    <ItemInfo>
                      <ItemName>
                        {friend.display_name || friend.username || friend.email}
                      </ItemName>
                      <ItemDetail>{friend.email}</ItemDetail>
                    </ItemInfo>
                    <ItemActions>
                      <SmallButton onClick={() => handleRemoveFriend(friend.id)}>
                        Remove
                      </SmallButton>
                    </ItemActions>
                  </ListItem>
                ))
              )}
            </List>
          </Section>
        </>
      )}

      {activeTab === 'groups' && (
        <>
          <Section>
            <SectionTitle>
              <span>➕</span>
              Create Group
            </SectionTitle>
            <Form onSubmit={handleCreateGroup} style={{ flexDirection: 'column', gap: '12px' }}>
              <Input
                type="text"
                placeholder="Group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                required
              />
              <TextArea
                placeholder="Group description (optional)"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
              />
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Group'}
              </Button>
            </Form>
          </Section>

          <Section>
            <SectionTitle>
              <span>🔗</span>
              Join Group
            </SectionTitle>
            <Form onSubmit={handleJoinGroup}>
              <Input
                type="text"
                placeholder="Enter group invite code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                required
              />
              <Button type="submit" disabled={loading}>
                {loading ? 'Joining...' : 'Join Group'}
              </Button>
            </Form>
          </Section>

          <Section>
            <SectionTitle>
              <span>👥</span>
              My Groups
            </SectionTitle>
            <List>
              {groups.length === 0 ? (
                <EmptyState>No groups yet. Create a group or join one with an invite code!</EmptyState>
              ) : (
                groups.map((group) => (
                  <ListItem key={group.id}>
                    <ItemInfo>
                      <ItemName>{group.name}</ItemName>
                      <ItemDetail>
                        {group.members.length} members • Invite code: {group.invite_code}
                        {group.description && ` • ${group.description}`}
                      </ItemDetail>
                    </ItemInfo>
                    <ItemActions>
                      <SmallButton onClick={() => navigator.clipboard.writeText(group.invite_code)}>
                        Copy Code
                      </SmallButton>
                      <SmallButton onClick={() => handleLeaveGroup(group.id)}>
                        Leave
                      </SmallButton>
                    </ItemActions>
                  </ListItem>
                ))
              )}
            </List>
          </Section>
        </>
      )}

      {activeTab === 'requests' && (
        <Section>
          <SectionTitle>
            <span>📬</span>
            Friend Requests
          </SectionTitle>
          <List>
            {friendRequests.length === 0 ? (
              <EmptyState>No pending friend requests</EmptyState>
            ) : (
              friendRequests.map((request) => (
                <ListItem key={request.id}>
                  <ItemInfo>
                    <ItemName>
                      {request.from_user?.display_name || request.from_user?.username || request.from_user?.email || 'Unknown User'}
                    </ItemName>
                    <ItemDetail>
                      {request.from_user?.email || 'No email'} • {new Date(request.created_at).toLocaleDateString()}
                    </ItemDetail>
                  </ItemInfo>
                  <ItemActions>
                    <AcceptButton onClick={() => handleRespondToRequest(request.id, true)}>
                      Accept
                    </AcceptButton>
                    <RejectButton onClick={() => handleRespondToRequest(request.id, false)}>
                      Reject
                    </RejectButton>
                  </ItemActions>
                </ListItem>
              ))
            )}
          </List>
        </Section>
      )}

      {activeTab === 'profile' && (
        <Section>
          <SectionTitle>
            <span>👤</span>
            My Profile
          </SectionTitle>
          <Form onSubmit={handleUpdateProfile}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#37352f' 
                }}>
                  Display Name
                </label>
                <Input
                  type="text"
                  placeholder="Enter your display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#37352f' 
                }}>
                  Username
                </label>
                <Input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <div style={{ 
                  fontSize: '12px', 
                  color: '#787774', 
                  marginTop: '4px' 
                }}>
                  Your username helps friends find you easily
                </div>
              </div>
              <div style={{ 
                padding: '16px', 
                background: '#f8f8f7', 
                borderRadius: '6px', 
                border: '1px solid #e9e9e7' 
              }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#37352f', marginBottom: '8px' }}>
                  Account Info
                </div>
                <div style={{ fontSize: '14px', color: '#787774' }}>
                  <div>Email: {userProfile?.email}</div>
                  {userProfile?.friend_count !== undefined && (
                    <div>Friends: {userProfile.friend_count}</div>
                  )}
                  {userProfile?.group_count !== undefined && (
                    <div>Groups: {userProfile.group_count}</div>
                  )}
                </div>
              </div>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Profile'}
            </Button>
          </Form>
        </Section>
      )}
    </Container>
  );
};

export default FriendsGroups;
