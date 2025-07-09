export interface Task {
  id: string;
  title: string;
  description: string;
  day: string;
  checked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskFormData {
  title: string;
  description: string;
  day: string;
}