import { useState, useEffect } from 'react';
import { Task, TaskFormData } from '../types/task';
import { addTask, updateTask, deleteTask, getTasks } from '../firebase/firestore';
import { toZonedTime, format } from 'date-fns-tz'; 

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const tasksData = await getTasks();
      setTasks(tasksData);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Reset semanal automático
  const checkAndResetWeeklyTasks = async () => {
    const now = new Date();

    // 📍 Converte o horário atual para o fuso de Brasília
    const timeZone = 'America/Sao_Paulo';
    const brasiliaTime = toZonedTime(now, timeZone);

    console.log('🕒 Horário UTC atual:', now.toISOString());
    console.log('🇧🇷 Horário Brasília:', brasiliaTime.toLocaleString('pt-BR', { timeZone }));
     console.log('🕒 Horário de Brasília:', format(brasiliaTime, 'yyyy-MM-dd HH:mm:ssXXX', { timeZone }));

    const isWednesday = brasiliaTime.getDay() === 6;
    const isTime = brasiliaTime.getHours() === 0 && brasiliaTime.getMinutes() === 0;

    const todayKey = brasiliaTime.toISOString().split('T')[0]; // Ex: '2025-07-09'
    const resetKey = `reset-done-${todayKey}`;
    const alreadyReset = localStorage.getItem(resetKey);

    if (isWednesday && isTime && !alreadyReset) {
      try {
        const checkedTasks = tasks.filter(task => task.checked);

        for (const task of checkedTasks) {
          await updateTask(task.id, { checked: false });
        }

        await loadTasks();
        localStorage.setItem(resetKey, 'true'); 

        console.log('✔ Reset semanal executado com sucesso!');
      } catch (error) {
        console.error('❌ Erro ao executar reset semanal:', error);
      }
    }
  };

  // Verifica a cada 1 minuto
  useEffect(() => {
    const interval = setInterval(() => {
      checkAndResetWeeklyTasks();
    }, 60000);

    return () => clearInterval(interval);
  }, [tasks]);

  useEffect(() => {
    loadTasks();
  }, []);

  const createTask = async (taskData: TaskFormData) => {
    try {
      await addTask(taskData);
      await loadTasks();
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      throw error;
    }
  };

  const updateTaskData = async (id: string, updates: Partial<Task>) => {
    try {
      await updateTask(id, updates);
      await loadTasks();
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      throw error;
    }
  };

  const removeTask = async (id: string) => {
    try {
      await deleteTask(id);
      await loadTasks();
    } catch (error) {
      console.error('Erro ao remover tarefa:', error);
      throw error;
    }
  };

  const toggleTaskCheck = async (id: string, checked: boolean) => {
    try {
      await updateTask(id, { checked });
      await loadTasks();
    } catch (error) {
      console.error('Erro ao atualizar status da tarefa:', error);
      throw error;
    }
  };

  const getTasksByDay = (day: string) => {
    return tasks.filter(task => task.day === day);
  };

  return {
    tasks,
    loading,
    createTask,
    updateTaskData,
    removeTask,
    toggleTaskCheck,
    getTasksByDay,
    refreshTasks: loadTasks
  };
};
