import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Task } from '../types/task';
import { BarChart, Calendar, CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';

interface WeeklyStats {
  completed: number;
  inProgress: number;
  pending: number;
  total: number;
}

interface DailyStats {
  day: string;
  completed: number;
  total: number;
}

interface PriorityStats {
  priority: string;
  count: number;
  completed: number;
}

export function StatisticsView() {
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({ completed: 0, inProgress: 0, pending: 0, total: 0 });
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [priorityStats, setPriorityStats] = useState<PriorityStats[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<'current' | 'last'>('current');
  const [recentCompletedTasks, setRecentCompletedTasks] = useState<Task[]>([]);

  useEffect(() => {
    loadStatistics();
  }, [selectedWeek]);

  const loadStatistics = async () => {
    try {
      const weekOffset = selectedWeek === 'current' ? 0 : 7;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - startDate.getDay() - weekOffset);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 7);

      const tasksRef = collection(db, 'tasks');
      const q = query(
        tasksRef,
        where('created_at', '>=', Timestamp.fromDate(startDate)),
        where('created_at', '<', Timestamp.fromDate(endDate))
      );

      const querySnapshot = await getDocs(q);
      const tasks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        due_date: doc.data().due_date,
        completed_at: doc.data().completed_at || null,
        created_at: doc.data().created_at?.toDate?.().toISOString() || new Date().toISOString(),
        updated_at: doc.data().updated_at?.toDate?.().toISOString() || new Date().toISOString(),
      })) as Task[];

      if (tasks.length === 0) {
        setWeeklyStats({ completed: 0, inProgress: 0, pending: 0, total: 0 });
        setDailyStats([]);
        setPriorityStats([]);
        setRecentCompletedTasks([]);
        return;
      }

      const completed = tasks.filter(t => t.status === 'concluida').length;
      const inProgress = tasks.filter(t => t.status === 'em_andamento').length;
      const pending = tasks.filter(t => t.status === 'pendente').length;

      setWeeklyStats({
        completed,
        inProgress,
        pending,
        total: tasks.length,
      });

      const dayMap = {
        'segunda': 'Seg',
        'terca': 'Ter',
        'quarta': 'Qua',
        'quinta': 'Qui',
        'sexta': 'Sex',
        'sabado': 'Sáb',
        'domingo': 'Dom',
      };

      const daily: DailyStats[] = Object.entries(dayMap).map(([key, label]) => {
        const dayTasks = tasks.filter(t => t.day_of_week === key);
        return {
          day: label,
          completed: dayTasks.filter(t => t.status === 'concluida').length,
          total: dayTasks.length,
        };
      });

      setDailyStats(daily);

      const priorityMap = {
        'urgente': 'Urgente',
        'alta': 'Alta',
        'media': 'Média',
        'baixa': 'Baixa',
      };

      const priority: PriorityStats[] = Object.entries(priorityMap).map(([key, label]) => {
        const priorityTasks = tasks.filter(t => t.priority === key);
        return {
          priority: label,
          count: priorityTasks.length,
          completed: priorityTasks.filter(t => t.status === 'concluida').length,
        };
      });

      setPriorityStats(priority);

      // Buscar tarefas concluídas recentemente
      const completedTasksRef = collection(db, 'tasks');
      const recentQuery = query(
        completedTasksRef,
        where('status', '==', 'concluida'),
        orderBy('completed_at', 'desc')
      );

      const recentSnapshot = await getDocs(recentQuery);
      const recentTasks = recentSnapshot.docs
        .slice(0, 5)
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          due_date: doc.data().due_date,
          completed_at: doc.data().completed_at || null,
          created_at: doc.data().created_at?.toDate?.().toISOString() || new Date().toISOString(),
          updated_at: doc.data().updated_at?.toDate?.().toISOString() || new Date().toISOString(),
        })) as Task[];

      setRecentCompletedTasks(recentTasks);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const completionRate = weeklyStats.total > 0
    ? Math.round((weeklyStats.completed / weeklyStats.total) * 100)
    : 0;

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Estatísticas</h1>
          <p className="text-gray-600">Acompanhe o desempenho da equipe</p>
        </div>

        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setSelectedWeek('current')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedWeek === 'current'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Semana Atual
          </button>
          <button
            onClick={() => setSelectedWeek('last')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedWeek === 'last'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Semana Passada
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total de Tarefas"
            value={weeklyStats.total}
            icon={<Calendar size={24} />}
            color="bg-blue-500"
          />
          <StatCard
            title="Concluídas"
            value={weeklyStats.completed}
            icon={<CheckCircle size={24} />}
            color="bg-green-500"
          />
          <StatCard
            title="Em Andamento"
            value={weeklyStats.inProgress}
            icon={<Clock size={24} />}
            color="bg-yellow-500"
          />
          <StatCard
            title="Pendentes"
            value={weeklyStats.pending}
            icon={<AlertCircle size={24} />}
            color="bg-red-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart size={24} className="text-blue-600" />
              <h2 className="text-lg font-bold text-gray-800">Tarefas por Dia</h2>
            </div>
            <div className="space-y-3">
              {dailyStats.map((stat) => {
                const percentage = stat.total > 0 ? (stat.completed / stat.total) * 100 : 0;
                return (
                  <div key={stat.day}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{stat.day}</span>
                      <span className="text-gray-600">
                        {stat.completed}/{stat.total}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp size={24} className="text-blue-600" />
              <h2 className="text-lg font-bold text-gray-800">Taxa de Conclusão</h2>
            </div>
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center w-40 h-40 mb-4">
                <svg className="transform -rotate-90 w-40 h-40">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 70}`}
                    strokeDashoffset={`${2 * Math.PI * 70 * (1 - completionRate / 100)}`}
                    className="text-green-500"
                  />
                </svg>
                <span className="absolute text-3xl font-bold text-gray-800">
                  {completionRate}%
                </span>
              </div>
              <p className="text-gray-600">
                {weeklyStats.completed} de {weeklyStats.total} tarefas concluídas
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Tarefas por Prioridade</h2>
            <div className="space-y-3">
              {priorityStats.map((stat, index) => {
                const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
                const percentage = stat.count > 0 ? (stat.completed / stat.count) * 100 : 0;
                return (
                  <div key={stat.priority}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{stat.priority}</span>
                      <span className="text-gray-600">
                        {stat.completed}/{stat.count}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`${colors[index]} h-2.5 rounded-full transition-all`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Tarefas Recém Concluídas</h2>
            <div className="space-y-3">
              {recentCompletedTasks.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhuma tarefa concluída ainda</p>
              ) : (
                recentCompletedTasks.map((task) => (
                  <div key={task.id} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{task.title}</p>
                      <p className="text-sm text-gray-600">
                        {task.completed_at && new Date(task.completed_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`${color} text-white p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-gray-600 text-sm mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}