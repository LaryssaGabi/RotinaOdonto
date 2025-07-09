import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Box,
  Typography
} from '@mui/material';
import { Add, Edit } from '@mui/icons-material';
import { Task, TaskFormData } from '../types/task';
import { DAYS_OF_WEEK, DENTAL_THEME } from '../utils/constants';

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (taskData: TaskFormData) => void;
  editingTask?: Task | null;
}

const TaskModal: React.FC<TaskModalProps> = ({ open, onClose, onSave, editingTask }) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    day: 'monday'
  });

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title,
        description: editingTask.description,
        day: editingTask.day
      });
    } else {
      setFormData({
        title: '',
        description: '',
        day: 'monday'
      });
    }
  }, [editingTask, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onSave(formData);
      onClose();
    }
  };

  const handleChange = (field: keyof TaskFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {editingTask ? <Edit /> : <Add />}
          <Typography variant="h6" component="div">
            {editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
          </Typography>
        </Box>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Título"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
              autoFocus
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: DENTAL_THEME.colors.secondary,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: DENTAL_THEME.colors.secondary,
                  }
                }
              }}
            />
            <TextField
              fullWidth
              label="Descrição"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              multiline
              rows={3}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: DENTAL_THEME.colors.secondary,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: DENTAL_THEME.colors.secondary,
                  }
                }
              }}
            />
            <TextField
              select
              fullWidth
              label="Dia da Semana"
              value={formData.day}
              onChange={(e) => handleChange('day', e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: DENTAL_THEME.colors.secondary,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: DENTAL_THEME.colors.secondary,
                  }
                }
              }}
            >
              {DAYS_OF_WEEK.map((day) => (
                <MenuItem key={day.key} value={day.key}>
                  {day.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={onClose}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              color: DENTAL_THEME.colors.darkGray
            }}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="contained"
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              backgroundColor: DENTAL_THEME.colors.secondary,
              '&:hover': {
                backgroundColor: DENTAL_THEME.colors.primary
              }
            }}
          >
            {editingTask ? 'Salvar' : 'Criar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TaskModal;