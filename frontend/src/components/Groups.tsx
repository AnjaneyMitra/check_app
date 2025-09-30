import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { apiService, Group } from '../services/api';

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

const EmptyState = styled.div`
  text-align: center;
  color: #9b9a97;
  padding: 40px 24px;
  font-size: 14px;
`;

const Groups: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const groupsData = await apiService.getGroups();
      setGroups(groupsData.groups || []);
    } catch (error) {
      console.error('Failed to load groups:', error);
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

  return (
    <Container>
      <Title>👥 Groups</Title>

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
    </Container>
  );
};

export default Groups;
