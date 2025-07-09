import { Box, Typography, Paper, Badge } from '@mui/material';
import { Task } from '../types/task';
import TaskCard from './TaskCard';
import { DENTAL_THEME } from '../utils/constants';

interface WeekColumnProps {
  day: {
    key: string;
    label: string;
    short: string;
  };
  tasks: Task[];
  onToggleCheck: (id: string, checked: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const WeekColumn: React.FC<WeekColumnProps> = ({ 
  day, 
  tasks, 
  onToggleCheck, 
  onEdit, 
  onDelete 
}) => {
  const completedTasks = tasks.filter(task => task.checked).length;
  const totalTasks = tasks.length;

  return (
    <Paper 
      elevation={0}
      sx={{
        p: 2,
        minHeight: '65vh',
        maxHeight: '75vh',
        backgroundColor: DENTAL_THEME.colors.lightGray,
        borderRadius: 3,
        border: `1px solid ${DENTAL_THEME.colors.primary}`,
        display: 'flex',
        flexDirection: 'column',
        width: '100%'
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              color: '#333',
              display: { xs: 'none', md: 'block' }
            }}
          >
            {day.label}
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              color: '#333',
              display: { xs: 'block', md: 'none' }
            }}
          >
            {day.short}
          </Typography>
          <Badge 
            badgeContent={totalTasks} 
            color="primary"
            sx={{
              '& .MuiBadge-badge': {
                backgroundColor: DENTAL_THEME.colors.secondary,
                color: 'white'
              }
            }}
          >
            <Box />
          </Badge>
        </Box>
        {totalTasks > 0 && (
          <Typography 
            variant="caption" 
            sx={{ 
              color: DENTAL_THEME.colors.darkGray,
              display: 'block'
            }}
          >
            {completedTasks} de {totalTasks} concluídas
          </Typography>
        )}
      </Box>
      
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {tasks.length === 0 ? (
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: '200px',
              color: DENTAL_THEME.colors.darkGray,
              textAlign: 'center'
            }}
          >
            <Typography variant="body2">
              Nenhuma tarefa para este dia
            </Typography>
          </Box>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleCheck={onToggleCheck}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </Box>
    </Paper>
  );
};

export default WeekColumn;