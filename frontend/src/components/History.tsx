import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { apiService, HistoryEntry } from '../services/api';

const HistoryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const Title = styled.h1`
  margin: 0 0 24px 0;
  color: #37352f;
  font-size: 24px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: #ffffff;
  border: 1px solid #e9e9e7;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 600;
  color: #37352f;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 13px;
  color: #787774;
  font-weight: 500;
`;

const HistorySection = styled.div`
  background: #ffffff;
  border: 1px solid #e9e9e7;
  border-radius: 8px;
  overflow: hidden;
`;

const SectionTitle = styled.h2`
  margin: 0;
  padding: 20px 24px;
  color: #37352f;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 1px solid #f1f1ef;
`;

const HistoryList = styled.div`
  padding: 0;
`;

const HistoryItem = styled.div`
  display: grid;
  grid-template-columns: 100px 1fr auto auto;
  gap: 16px;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #f1f1ef;
  transition: all 0.15s ease;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: #fafafa;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
    text-align: left;
  }
`;

const DateColumn = styled.div`
  font-weight: 500;
  color: #37352f;
  font-size: 14px;
  white-space: nowrap;
`;

const ProgressColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`;

const ProgressBar = styled.div`
  background: #e9e9e7;
  border-radius: 4px;
  height: 6px;
  overflow: hidden;
  width: 180px;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ProgressFill = styled.div<{ $percentage: number }>`
  background: #37352f;
  height: 100%;
  width: ${props => props.$percentage}%;
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  font-size: 13px;
  color: #787774;
`;

const TasksColumn = styled.div`
  text-align: center;
  font-size: 13px;
  color: #787774;
  white-space: nowrap;
`;

const TasksNumber = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #37352f;
  margin-bottom: 2px;
`;

const PercentageColumn = styled.div<{ $percentage: number }>`
  font-size: 16px;
  font-weight: 600;
  color: ${props => 
    props.$percentage >= 80 ? '#0f7b0f' : 
    props.$percentage >= 60 ? '#b7791f' : 
    '#d44c47'
  };
  text-align: right;
  white-space: nowrap;
`;

const EmptyState = styled.div`
  text-align: center;
  color: #9b9a97;
  padding: 60px 24px;
  font-size: 14px;
`;

const LoadingState = styled.div`
  text-align: center;
  color: #787774;
  padding: 40px 24px;
  font-size: 14px;
`;

const History: React.FC = () => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await apiService.getUserHistory();
        setHistory(data || []);
      } catch (error) {
        console.error('Failed to load history:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const calculateStats = () => {
    if (history.length === 0) {
      return {
        totalDays: 0,
        averageCompletion: 0,
        bestStreak: 0,
        currentStreak: 0
      };
    }

    const totalDays = history.length;
    const averageCompletion = Math.round(
      history.reduce((sum, entry) => sum + entry.completion_percentage, 0) / totalDays
    );

    // Calculate streaks (days with >80% completion)
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    // Sort history by date (most recent first)
    const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    for (let i = 0; i < sortedHistory.length; i++) {
      const entry = sortedHistory[i];
      if (entry.completion_percentage >= 80) {
        tempStreak++;
        if (i === 0) {
          currentStreak = tempStreak;
        }
      } else {
        bestStreak = Math.max(bestStreak, tempStreak);
        if (i === 0) {
          currentStreak = 0;
        }
        tempStreak = 0;
      }
    }
    bestStreak = Math.max(bestStreak, tempStreak);

    return {
      totalDays,
      averageCompletion,
      bestStreak,
      currentStreak
    };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <HistoryContainer>
        <LoadingState>Loading your history... 📊</LoadingState>
      </HistoryContainer>
    );
  }

  return (
    <HistoryContainer>
      <Title>
        <span>📈</span>
        Progress History
      </Title>

      <StatsGrid>
        <StatCard>
          <StatValue>{stats.totalDays}</StatValue>
          <StatLabel>Total Days Tracked</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.averageCompletion}%</StatValue>
          <StatLabel>Average Completion</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.bestStreak}</StatValue>
          <StatLabel>Best Streak (80%+ days)</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.currentStreak}</StatValue>
          <StatLabel>Current Streak</StatLabel>
        </StatCard>
      </StatsGrid>

      <HistorySection>
        <SectionTitle>Daily Progress</SectionTitle>
        <HistoryList>
          {history.length === 0 ? (
            <EmptyState>
              No history yet! Complete some tasks to start tracking your progress.
            </EmptyState>
          ) : (
            history
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((entry) => (
                <HistoryItem key={entry.date}>
                  <DateColumn>{formatDate(entry.date)}</DateColumn>
                  <ProgressColumn>
                    <ProgressBar>
                      <ProgressFill $percentage={entry.completion_percentage} />
                    </ProgressBar>
                    <ProgressText>
                      {entry.completed_tasks} of {entry.total_tasks} tasks completed
                    </ProgressText>
                  </ProgressColumn>
                  <TasksColumn>
                    <TasksNumber>
                      {entry.completed_tasks}/{entry.total_tasks}
                    </TasksNumber>
                    <div>tasks</div>
                  </TasksColumn>
                  <PercentageColumn $percentage={entry.completion_percentage}>
                    {Math.round(entry.completion_percentage)}%
                  </PercentageColumn>
                </HistoryItem>
              ))
          )}
        </HistoryList>
      </HistorySection>
    </HistoryContainer>
  );
};

export default History;
