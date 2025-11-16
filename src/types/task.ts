export type Priority = 'baixa' | 'media' | 'alta' | 'urgente';
export type DayOfWeek = 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado' | 'domingo';
export type TaskStatus = 'pendente' | 'em_andamento' | 'concluida';

export interface Task {
  id: string;
  title: string;
  description: string;
  due_date: string | null; 
  priority: Priority;
  day_of_week: DayOfWeek;
  status: TaskStatus;
  order_position: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}