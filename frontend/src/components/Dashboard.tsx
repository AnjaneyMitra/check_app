import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { apiService, Task } from '../services/api';

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
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

const TaskForm = styled.form`
  padding: 20px 24px;
  background: #fafafa;
  border-bottom: 1px solid #f1f1ef;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid #d9d9d7;
  border-radius: 6px;
  font-size: 14px;
  background: #ffffff;
  color: #37352f;
  transition: all 0.15s ease;
  
  &:focus {
    outline: none;
    border-color: #37352f;
    box-shadow: 0 0 0 1px #37352f;
  }
  
  &::placeholder {
    color: #9b9a97;
  }
`;

const TextArea = styled.textarea`
  padding: 10px 12px;
  border: 1px solid #d9d9d7;
  border-radius: 6px;
  font-size: 14px;
  min-height: 60px;
  resize: vertical;
  font-family: inherit;
  background: #ffffff;
  color: #37352f;
  transition: all 0.15s ease;
  
  &:focus {
    outline: none;
    border-color: #37352f;
    box-shadow: 0 0 0 1px #37352f;
  }
  
  &::placeholder {
    color: #9b9a97;
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

const TaskList = styled.div`
  padding: 0 24px 24px 24px;
`;

const TaskItem = styled.div<{ $completed?: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f1f1ef;
  transition: all 0.15s ease;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: #fafafa;
    margin: 0 -12px;
    padding: 12px;
    border-radius: 6px;
  }
`;

const CheckboxContainer = styled.div`
  position: relative;
  margin-top: 2px;
`;

const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  border: 0;
  clip: rect(0 0 0 0);
  clippath: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
`;

const StyledCheckbox = styled.div<{ $checked: boolean }>`
  display: inline-flex;
  width: 18px;
  height: 18px;
  background: ${props => props.$checked ? '#37352f' : 'transparent'};
  border: 2px solid ${props => props.$checked ? '#37352f' : '#d9d9d7'};
  border-radius: 3px;
  transition: all 0.15s ease;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  
  &:hover {
    border-color: #37352f;
    background: ${props => props.$checked ? '#37352f' : '#f7f6f3'};
  }
  
  ${HiddenCheckbox}:focus + & {
    box-shadow: 0 0 0 2px rgba(55, 53, 47, 0.2);
  }
`;

const CheckIcon = styled.svg<{ $checked: boolean }>`
  fill: none;
  stroke: white;
  stroke-width: 2px;
  width: 12px;
  height: 12px;
  opacity: ${props => props.$checked ? 1 : 0};
  transition: opacity 0.15s ease;
`;

const TaskContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const TaskTitle = styled.div<{ $completed?: boolean }>`
  font-size: 14px;
  color: ${props => props.$completed ? '#9b9a97' : '#37352f'};
  text-decoration: ${props => props.$completed ? 'line-through' : 'none'};
  font-weight: 400;
  margin-bottom: ${props => props.$completed ? '0' : '4px'};
  word-wrap: break-word;
`;

const TaskDescription = styled.div<{ $completed?: boolean }>`
  font-size: 13px;
  color: ${props => props.$completed ? '#9b9a97' : '#787774'};
  text-decoration: ${props => props.$completed ? 'line-through' : 'none'};
  line-height: 1.4;
  word-wrap: break-word;
`;

const TaskActions = styled.div`
  opacity: 0;
  display: flex;
  gap: 8px;
  margin-top: 2px;
  
  ${TaskItem}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  background: transparent;
  border: none;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  color: #9b9a97;
  font-size: 12px;
  transition: all 0.15s ease;
  
  &:hover {
    background: #f1f1ef;
    color: #37352f;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  color: #9b9a97;
  padding: 40px 24px;
  font-size: 14px;
`;

const ProgressSection = styled.div`
  padding: 16px 24px;
  background: #fafafa;
  border-bottom: 1px solid #f1f1ef;
`;

const ProgressBar = styled.div`
  background: #e9e9e7;
  border-radius: 4px;
  height: 6px;
  margin: 8px 0 12px 0;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $percentage: number }>`
  background: #37352f;
  height: 100%;
  width: ${props => props.$percentage}%;
  transition: width 0.3s ease;
`;

const Stats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #787774;
`;

const MotivationalSection = styled.div`
  padding: 20px 24px;
  background: #fafafa;
  border-top: 1px solid #f1f1ef;
`;

const MotivationalTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 500;
  color: #37352f;
`;

const NoteForm = styled.form`
  display: flex;
  gap: 8px;
`;

const NoteInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d9d9d7;
  border-radius: 6px;
  font-size: 13px;
  background: #ffffff;
  
  &:focus {
    outline: none;
    border-color: #37352f;
    box-shadow: 0 0 0 1px #37352f;
  }
  
  &::placeholder {
    color: #9b9a97;
  }
`;

const SmallButton = styled.button`
  background: #37352f;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  
  &:hover {
    background: #2f2e2a;
  }
`;

const Dashboard: React.FC = () => {
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [partnerTasks, setPartnerTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [motivationalNote, setMotivationalNote] = useState('');
  const [loading, setLoading] = useState(false);

  const loadTasks = async () => {
    try {
      const [myTasksData, partnerTasksData] = await Promise.all([
        apiService.getTodayTasks(),
        apiService.getPartnerTodayTasks()
      ]);
      
      setMyTasks(myTasksData.tasks || []);
      setPartnerTasks(partnerTasksData.tasks || []);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      setLoading(true);
      await apiService.createTask(newTaskTitle, newTaskDescription);
      setNewTaskTitle('');
      setNewTaskDescription('');
      await loadTasks();
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    try {
      await apiService.updateTask(taskId, !completed);
      await loadTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await apiService.deleteTask(taskId);
      await loadTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleSendMotivationalNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivationalNote.trim()) return;

    try {
      await apiService.sendMotivationalNote(motivationalNote);
      setMotivationalNote('');
      alert('Motivational note sent to your partner! 🎉');
    } catch (error) {
      console.error('Failed to send note:', error);
    }
  };

  const calculateProgress = (tasks: Task[]) => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(task => task.completed).length;
    return Math.round((completed / tasks.length) * 100);
  };

  const myProgress = calculateProgress(myTasks);
  const partnerProgress = calculateProgress(partnerTasks);

  const renderCheckbox = (checked: boolean, onChange: () => void) => (
    <CheckboxContainer>
      <HiddenCheckbox
        checked={checked}
        onChange={onChange}
      />
      <StyledCheckbox $checked={checked} onClick={onChange}>
        <CheckIcon $checked={checked} viewBox="0 0 24 24">
          <polyline points="20,6 9,17 4,12" />
        </CheckIcon>
      </StyledCheckbox>
    </CheckboxContainer>
  );

  return (
    <DashboardContainer>
      {/* My Tasks Section */}
      <Section>
        <SectionTitle>
          <span>📝</span>
          My Tasks Today
        </SectionTitle>
        
        <ProgressSection>
          <Stats>
            <span>{myTasks.filter(t => t.completed).length} of {myTasks.length} completed</span>
            <span>{myProgress}%</span>
          </Stats>
          <ProgressBar>
            <ProgressFill $percentage={myProgress} />
          </ProgressBar>
        </ProgressSection>

        <TaskForm onSubmit={handleCreateTask}>
          <InputGroup>
            <Input
              type="text"
              placeholder="Add a new task..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              required
            />
            <TextArea
              placeholder="Add a description (optional)"
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
            />
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Task'}
            </Button>
          </InputGroup>
        </TaskForm>

        <TaskList>
          {myTasks.length === 0 ? (
            <EmptyState>No tasks for today. Add one above to get started!</EmptyState>
          ) : (
            myTasks.map((task) => (
              <TaskItem key={task.id} $completed={task.completed}>
                {renderCheckbox(task.completed, () => handleToggleTask(task.id, task.completed))}
                <TaskContent>
                  <TaskTitle $completed={task.completed}>{task.title}</TaskTitle>
                  {task.description && (
                    <TaskDescription $completed={task.completed}>
                      {task.description}
                    </TaskDescription>
                  )}
                </TaskContent>
                <TaskActions>
                  <ActionButton onClick={() => handleDeleteTask(task.id)}>
                    Delete
                  </ActionButton>
                </TaskActions>
              </TaskItem>
            ))
          )}
        </TaskList>
      </Section>

      {/* Partner's Tasks Section */}
      <Section>
        <SectionTitle>
          <span>👥</span>
          Partner's Progress
        </SectionTitle>
        
        <ProgressSection>
          <Stats>
            <span>{partnerTasks.filter(t => t.completed).length} of {partnerTasks.length} completed</span>
            <span>{partnerProgress}%</span>
          </Stats>
          <ProgressBar>
            <ProgressFill $percentage={partnerProgress} />
          </ProgressBar>
        </ProgressSection>

        <TaskList>
          {partnerTasks.length === 0 ? (
            <EmptyState>Your partner hasn't added tasks yet today</EmptyState>
          ) : (
            partnerTasks.map((task) => (
              <TaskItem key={task.id} $completed={task.completed}>
                <CheckboxContainer>
                  <StyledCheckbox $checked={task.completed}>
                    <CheckIcon $checked={task.completed} viewBox="0 0 24 24">
                      <polyline points="20,6 9,17 4,12" />
                    </CheckIcon>
                  </StyledCheckbox>
                </CheckboxContainer>
                <TaskContent>
                  <TaskTitle $completed={task.completed}>{task.title}</TaskTitle>
                  {task.description && (
                    <TaskDescription $completed={task.completed}>
                      {task.description}
                    </TaskDescription>
                  )}
                </TaskContent>
              </TaskItem>
            ))
          )}
        </TaskList>

        <MotivationalSection>
          <MotivationalTitle>💪 Send Encouragement</MotivationalTitle>
          <NoteForm onSubmit={handleSendMotivationalNote}>
            <NoteInput
              type="text"
              placeholder="Send a motivational note..."
              value={motivationalNote}
              onChange={(e) => setMotivationalNote(e.target.value)}
              required
            />
            <SmallButton type="submit">Send</SmallButton>
          </NoteForm>
        </MotivationalSection>
      </Section>
    </DashboardContainer>
  );
};

export default Dashboard;
