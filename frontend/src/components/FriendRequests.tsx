import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { apiService, FriendRequest } from '../services/api';

const Section = styled.div`
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e9e9e7;
  overflow: hidden;
  margin-bottom: 32px;
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


const FriendRequests: React.FC = () => {
    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            const requestsData = await apiService.getFriendRequests();
            setFriendRequests(requestsData.requests || []);
        } catch (error) {
            console.error('Failed to load friend requests:', error);
        }
    };

    const handleRespondToRequest = async (requestId: string, accept: boolean) => {
        try {
          await apiService.respondToFriendRequest(requestId, accept);
          await loadRequests();
        } catch (error) {
          console.error('Failed to respond to friend request:', error);
        }
    };

    return (
        <Section>
            <SectionTitle>
                Friend Requests
                {friendRequests.length > 0 && <Badge>{friendRequests.length}</Badge>}
            </SectionTitle>
            <List>
                {friendRequests.length > 0 ? (
                friendRequests.map(request => (
                    <ListItem key={request.id}>
                    <ItemInfo>
                        <ItemName>{request.sender_name}</ItemName>
                        <ItemDetail>@{request.sender_username}</ItemDetail>
                    </ItemInfo>
                    <ItemActions>
                        <AcceptButton onClick={() => handleRespondToRequest(request.id, true)}>Accept</AcceptButton>
                        <RejectButton onClick={() => handleRespondToRequest(request.id, false)}>Decline</RejectButton>
                    </ItemActions>
                    </ListItem>
                ))
                ) : (
                <EmptyState>You have no pending friend requests.</EmptyState>
                )}
            </List>
        </Section>
    );
}

export default FriendRequests;
