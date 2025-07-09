import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  Timestamp 
} from "firebase/firestore";
import { db } from "./config";
import { Task, TaskFormData } from "../types/task";

const COLLECTION_NAME = "tasks";

export const addTask = async (taskData: TaskFormData): Promise<void> => {
  try {
    await addDoc(collection(db, COLLECTION_NAME), {
      ...taskData,
      checked: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error("Erro ao adicionar tarefa:", error);
    throw error;
  }
};

export const updateTask = async (id: string, updates: Partial<Task>): Promise<void> => {
  try {
    const taskRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(taskRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error("Erro ao atualizar tarefa:", error);
    throw error;
  }
};

export const deleteTask = async (id: string): Promise<void> => {
  try {
    const taskRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(taskRef);
  } catch (error) {
    console.error("Erro ao deletar tarefa:", error);
    throw error;
  }
};

export const getTasks = async (): Promise<Task[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const tasks: Task[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    })) as Task[];
    
    return tasks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error("Erro ao buscar tarefas:", error);
    throw error;
  }
};