import { GripVertical, Pencil, Trash2, CheckCircle2, Circle, Clock } from 'lucide-react';
import { Task } from '../types/task';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Task['status']) => void;
  dragHandleProps?: any;
}

const priorityColors = {
  baixa: 'bg-green-100 text-green-700 border-green-200',
  media: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  alta: 'bg-orange-100 text-orange-700 border-orange-200',
  urgente: 'bg-red-100 text-red-700 border-red-200',
};

const priorityLabels = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  urgente: 'Urgente',
};

export function TaskCard({ task, onEdit, onDelete, onStatusChange, dragHandleProps }: TaskCardProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Sem data';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const StatusIcon = task.status === 'concluida' ? CheckCircle2 : task.status === 'em_andamento' ? Clock : Circle;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing pt-1">
          <GripVertical size={20} className="text-gray-400" />
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-start gap-2 flex-1">
              <button
                onClick={() => {
                  const newStatus = task.status === 'concluida' ? 'pendente' :
                                  task.status === 'em_andamento' ? 'concluida' : 'em_andamento';
                  onStatusChange(task.id, newStatus);
                }}
                className="mt-0.5 flex-shrink-0"
              >
                <StatusIcon
                  size={20}
                  className={
                    task.status === 'concluida' ? 'text-green-500' :
                    task.status === 'em_andamento' ? 'text-blue-500' : 'text-gray-400'
                  }
                />
              </button>
              <div className="flex-1">
                <h3 className={`font-semibold text-gray-800 ${task.status === 'concluida' ? 'line-through opacity-60' : ''}`}>
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-2 py-1 rounded-full border font-medium ${priorityColors[task.priority]}`}>
              {priorityLabels[task.priority]}
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar size={14} />
              {formatDate(task.due_date)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Editar tarefa"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Excluir tarefa"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Calendar({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  );
}