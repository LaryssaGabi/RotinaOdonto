import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Tooltip
} from '@mui/material';
import { MoreVert, Edit, Delete } from '@mui/icons-material';
import { Task } from '../types/task';
import { DENTAL_THEME } from '../utils/constants';

interface TaskCardProps {
  task: Task;
  onToggleCheck: (id: string, checked: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggleCheck, onEdit, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    onEdit(task);
    handleClose();
  };

  const handleDelete = () => {
    onDelete(task.id);
    handleClose();
  };

  return (
    <Card 
      sx={{
        mb: 2,
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: task.checked ? `2px solid ${DENTAL_THEME.colors.secondary}` : '1px solid #e0e0e0',
        backgroundColor: task.checked ? DENTAL_THEME.colors.primary : DENTAL_THEME.colors.white,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          transform: 'translateY(-2px)'
        }
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
            <Checkbox
              checked={task.checked}
              onChange={(e) => onToggleCheck(task.id, e.target.checked)}
              sx={{
                color: DENTAL_THEME.colors.secondary,
                '&.Mui-checked': {
                  color: DENTAL_THEME.colors.secondary,
                },
                p: 0.5,
                mr: 1
              }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: task.checked ? DENTAL_THEME.colors.darkGray : '#333',
                  textDecoration: task.checked ? 'line-through' : 'none',
                  mb: 0.5
                }}
              >
                {task.title}
              </Typography>
              {task.description && (
                <Typography
                  variant="body2"
                  sx={{
                    color: task.checked ? DENTAL_THEME.colors.darkGray : '#666',
                    textDecoration: task.checked ? 'line-through' : 'none',
                    fontSize: '0.85rem'
                  }}
                >
                  {task.description}
                </Typography>
              )}
            </Box>
          </Box>
          <Tooltip title="Opções">
            <IconButton
              size="small"
              onClick={handleClick}
              sx={{ color: DENTAL_THEME.colors.darkGray }}
            >
              <MoreVert />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 120
          }
        }}
      >
        <MenuItem onClick={handleEdit}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: DENTAL_THEME.colors.error }}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Excluir
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default TaskCard;