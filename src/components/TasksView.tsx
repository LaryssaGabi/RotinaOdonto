import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  writeBatch,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Task, DayOfWeek } from '../types/task';
import { TaskCard } from './TaskCard';
import { TaskModal } from './TaskModal';
import { ConfirmModal } from './ConfirmModal';

interface TasksViewProps {
  selectedDay: DayOfWeek;
}

const dayNames = {
  segunda: 'Segunda-feira',
  terca: 'Terça-feira',
  quarta: 'Quarta-feira',
  quinta: 'Quinta-feira',
  sexta: 'Sexta-feira',
  sabado: 'Sábado',
  domingo: 'Domingo',
};

export function TasksView({ selectedDay }: TasksViewProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, [selectedDay]);

  const loadTasks = async () => {
    try {
      const tasksRef = collection(db, 'tasks');
      const q = query(
        tasksRef,
        where('day_of_week', '==', selectedDay),
        orderBy('order_position', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const tasksData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        due_date: doc.data().due_date,
        completed_at: doc.data().completed_at || null,
        created_at: doc.data().created_at?.toDate?.().toISOString() || new Date().toISOString(),
        updated_at: doc.data().updated_at?.toDate?.().toISOString() || new Date().toISOString(),
      })) as Task[];
      
      setTasks(tasksData);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    }
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    try {
      if (editingTask) {
        // Atualizar tarefa existente
        const taskRef = doc(db, 'tasks', editingTask.id);
        await updateDoc(taskRef, {
          title: taskData.title,
          description: taskData.description,
          due_date: taskData.due_date || null,
          priority: taskData.priority,
          day_of_week: taskData.day_of_week,
          updated_at: Timestamp.now(),
        });
      } else {
        // Criar nova tarefa
        const maxPosition = tasks.length > 0 
          ? Math.max(...tasks.map(t => t.order_position)) 
          : -1;

        await addDoc(collection(db, 'tasks'), {
          title: taskData.title!,
          description: taskData.description || '',
          due_date: taskData.due_date || null,
          priority: taskData.priority!,
          day_of_week: taskData.day_of_week!,
          status: 'pendente',
          order_position: maxPosition + 1,
          completed_at: null,
          created_at: Timestamp.now(),
          updated_at: Timestamp.now(),
        });
      }

      loadTasks();
      setEditingTask(null);
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
    }
  };

  const handleDeleteTask = (id: string) => {
    setTaskToDelete(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;

    try {
      await deleteDoc(doc(db, 'tasks', taskToDelete));
      setIsConfirmOpen(false);
      setTaskToDelete(null);
      loadTasks();
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
    }
  };

  const cancelDelete = () => {
    setIsConfirmOpen(false);
    setTaskToDelete(null);
  };

  const handleStatusChange = async (id: string, status: Task['status']) => {
    try {
      const taskRef = doc(db, 'tasks', id);
      await updateDoc(taskRef, {
        status,
        completed_at: status === 'concluida' ? Timestamp.now().toDate().toISOString() : null,
        updated_at: Timestamp.now(),
      });

      loadTasks();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const handleDragStart = (task: Task) => setDraggedTask(task);

  const handleDragOver = (e: React.DragEvent, targetTask: Task) => {
    e.preventDefault();
    if (!draggedTask || draggedTask.id === targetTask.id) return;

    const draggedIndex = tasks.findIndex(t => t.id === draggedTask.id);
    const targetIndex = tasks.findIndex(t => t.id === targetTask.id);
    if (draggedIndex === targetIndex) return;

    const newTasks = [...tasks];
    newTasks.splice(draggedIndex, 1);
    newTasks.splice(targetIndex, 0, draggedTask);
    setTasks(newTasks);
  };

  const handleDragEnd = async () => {
    if (!draggedTask) return;

    try {
      const batch = writeBatch(db);
      
      tasks.forEach((task, index) => {
        const taskRef = doc(db, 'tasks', task.id);
        batch.update(taskRef, { 
          order_position: index,
          updated_at: Timestamp.now(),
        });
      });

      await batch.commit();
      setDraggedTask(null);
      loadTasks();
    } catch (error) {
      console.error('Erro ao reordenar tarefas:', error);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{dayNames[selectedDay]}</h1>
          <p className="text-gray-600">Organize suas tarefas para hoje</p>
        </div>

        <div className="mb-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            <Plus size={20} />
            Adicionar nova tarefa
          </button>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Calendar size={64} className="mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Nenhuma tarefa para {dayNames[selectedDay]}.
            </h3>
            <p className="text-gray-500">
              Adicione uma tarefa para começar seu planejamento!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                draggable
                onDragStart={() => handleDragStart(task)}
                onDragOver={(e) => handleDragOver(e, task)}
                onDragEnd={handleDragEnd}
              >
                <TaskCard
                  task={task}
                  onEdit={handleEdit}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleStatusChange}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTask}
        task={editingTask}
        defaultDay={selectedDay}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Excluir tarefa"
        message="Tem certeza que deseja excluir esta tarefa? Essa ação não poderá ser desfeita."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}

function Calendar({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  );
}