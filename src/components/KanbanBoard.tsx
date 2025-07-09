import { useState } from 'react';
import {
  Box,
  Fab,
  Typography,
  Container,
  useMediaQuery,
  useTheme,
  Grid,
  Button
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { FileDown } from 'lucide-react';
import { Task, TaskFormData } from '../types/task';
import { useTasks } from '../hooks/useTasks';
import WeekColumn from './WeekColumn';
import TaskModal from './TaskModal';
import ExportModal from './ExportModal';
import { DAYS_OF_WEEK, DENTAL_THEME } from '../utils/constants';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';

const KanbanBoard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { 
    tasks, 
    loading, 
    createTask, 
    updateTaskData, 
    removeTask, 
    toggleTaskCheck, 
    getTasksByDay 
  } = useTasks();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const handleCreateTask = async (taskData: TaskFormData) => {
    try {
      await createTask(taskData);
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
    }
  };

  const handleUpdateTask = async (taskData: TaskFormData) => {
    if (!editingTask) return;
    
    try {
      await updateTaskData(editingTask.id, taskData);
      setEditingTask(null);
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await removeTask(id);
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
    }
  };

  const handleToggleCheck = async (id: string, checked: boolean) => {
    try {
      await toggleTaskCheck(id, checked);
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleSaveTask = (taskData: TaskFormData) => {
    if (editingTask) {
      handleUpdateTask(taskData);
    } else {
      handleCreateTask(taskData);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingTask(null);
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    if (format === 'pdf') {
      exportToPDF(tasks);
    } else {
      exportToExcel(tasks);
    }
  };
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <Typography variant="h6" color="textSecondary">
            Carregando tarefas...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontWeight: 700,
            color: '#333',
            mb: 1
          }}
        >
          Rotina Semanal
        </Typography>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            color: DENTAL_THEME.colors.darkGray,
            mb: 3
          }}
        >
          Organize suas tarefas da semana e mantenha sua rotina em dia!
        </Typography>
        
        <Button
          variant="outlined"
          startIcon={<FileDown size={20} />}
          onClick={() => setExportModalOpen(true)}
          disabled={tasks.length === 0}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            borderColor: DENTAL_THEME.colors.secondary,
            color: DENTAL_THEME.colors.secondary,
            '&:hover': {
              borderColor: DENTAL_THEME.colors.primary,
              backgroundColor: DENTAL_THEME.colors.primary,
              color: 'white'
            }
          }}
        >
          Exportar Tarefas
        </Button>
      </Box>

      <Box sx={{ width: '100%', maxWidth: '1400px' }}>
        <Grid container spacing={2} justifyContent="center">
        {DAYS_OF_WEEK.map((day) => (
            <Grid item xs={12} sm={6} md={4} lg={2.4} xl={2} key={day.key}>
            <WeekColumn
              day={day}
              tasks={getTasksByDay(day.key)}
              onToggleCheck={handleToggleCheck}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
            />
          </Grid>
        ))}
        </Grid>
      </Box>

      <Fab
        color="primary"
        onClick={() => setModalOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          backgroundColor: DENTAL_THEME.colors.secondary,
          '&:hover': {
            backgroundColor: DENTAL_THEME.colors.primary
          }
        }}
      >
        <Add />
      </Fab>

      <TaskModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTask}
        editingTask={editingTask}
      />

      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        tasks={tasks}
        onExport={handleExport}
      />
    </Container>
  );
};

export default KanbanBoard;