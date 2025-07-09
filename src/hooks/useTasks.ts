import { useState, useEffect } from 'react';
import { Task, TaskFormData } from '../types/task';
import { addTask, updateTask, deleteTask, getTasks } from '../firebase/firestore';

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

  useEffect(() => {
    loadTasks();
  }, []);

  const createTask = async (taskData: TaskFormData) => {
    try {
      await addTask(taskData);
      await loadTasks(); // Recarrega as tarefas após criar
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      throw error;
    }
  };

  const updateTaskData = async (id: string, updates: Partial<Task>) => {
    try {
      await updateTask(id, updates);
      await loadTasks(); // Recarrega as tarefas após atualizar
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      throw error;
    }
  };

  const removeTask = async (id: string) => {
    try {
      await deleteTask(id);
      await loadTasks(); // Recarrega as tarefas após remover
    } catch (error) {
      console.error('Erro ao remover tarefa:', error);
      throw error;
    }
  };

  const toggleTaskCheck = async (id: string, checked: boolean) => {
    try {
      await updateTask(id, { checked });
      await loadTasks(); // Recarrega as tarefas após toggle
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