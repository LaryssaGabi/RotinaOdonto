import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Chip
} from '@mui/material';
import { FileDown, FileText, FileSpreadsheet } from 'lucide-react';
import { Task } from '../types/task';
import { DENTAL_THEME, DAYS_OF_WEEK } from '../utils/constants';

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  tasks: Task[];
  onExport: (format: 'pdf' | 'excel') => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ open, onClose, tasks, onExport }) => {
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'excel'>('pdf');

  const { colors } = DENTAL_THEME;

  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.checked).length;
    const pendingTasks = totalTasks - completedTasks;

    const tasksByDay = DAYS_OF_WEEK.map(day => {
      const dayTasks = tasks.filter(task => task.day === day.key);
      return {
        day: day.label,
        tasks: dayTasks.length,
        completed: dayTasks.filter(task => task.checked).length
      };
    });

    return { totalTasks, completedTasks, pendingTasks, tasksByDay };
  }, [tasks]);

const handleExport = async () => {
  if (selectedFormat === 'pdf') {
    await onExport(selectedFormat);
  } else {
    onExport(selectedFormat);
  }
  onClose();
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
          <FileDown size={24} />
          <Typography variant="h6" component="div">
            Exportar Tarefas da Semana
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, color: colors.darkGray }}>
            Resumo das Tarefas
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            <Chip label={`Total: ${stats.totalTasks}`} color="primary" variant="outlined" size="small" />
            <Chip
              label={`Concluídas: ${stats.completedTasks}`}
              sx={{ backgroundColor: colors.secondary, color: 'white' }}
              size="small"
            />
            <Chip label={`Pendentes: ${stats.pendingTasks}`} color="warning" variant="outlined" size="small" />
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: 1
            }}
          >
            {stats.tasksByDay.map(dayStats => (
              <Box
                key={dayStats.day}
                sx={{
                  p: 1,
                  backgroundColor: colors.lightGray,
                  borderRadius: 1,
                  textAlign: 'center'
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {dayStats.day.substring(0, 3).toUpperCase()}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                  {dayStats.completed}/{dayStats.tasks}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <FormControl component="fieldset" fullWidth>
          <FormLabel sx={{ mb: 2, color: '#333', fontWeight: 600 }}>
            Escolha o formato de exportação:
          </FormLabel>
          <RadioGroup
            value={selectedFormat}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSelectedFormat(e.target.value as 'pdf' | 'excel')
            }
          >
            <FormControlLabel
              value="pdf"
              control={
                <Radio
                  sx={{
                    color: colors.secondary,
                    '&.Mui-checked': {
                      color: colors.secondary
                    }
                  }}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FileText size={20} />
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      PDF
                    </Typography>
                    <Typography variant="caption" sx={{ color: colors.darkGray }}>
                      Documento formatado para impressão e visualização
                    </Typography>
                  </Box>
                </Box>
              }
              sx={{ mb: 2, alignItems: 'flex-start' }}
            />

            <FormControlLabel
              value="excel"
              control={
                <Radio
                  sx={{
                    color: colors.secondary,
                    '&.Mui-checked': {
                      color: colors.secondary
                    }
                  }}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FileSpreadsheet size={20} />
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      Excel
                    </Typography>
                    <Typography variant="caption" sx={{ color: colors.darkGray }}>
                      Planilha editável para análise e manipulação de dados
                    </Typography>
                  </Box>
                </Box>
              }
              sx={{ alignItems: 'flex-start' }}
            />
          </RadioGroup>
        </FormControl>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={onClose}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            color: colors.darkGray
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleExport}
          variant="contained"
          disabled={stats.totalTasks === 0}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            backgroundColor: colors.secondary,
            '&:hover': {
              backgroundColor: colors.primary
            }
          }}
        >
          Exportar {selectedFormat.toUpperCase()}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportModal;
