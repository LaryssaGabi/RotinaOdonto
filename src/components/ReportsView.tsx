import { useState, useEffect } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Task } from '../types/task';

interface WeekGroup {
  weekLabel: string;
  startDate: Date;
  endDate: Date;
  tasks: Task[];
}

export function ReportsView() {
  const [weekGroups, setWeekGroups] = useState<WeekGroup[]>([]);
  const [selectedWeeks, setSelectedWeeks] = useState<number>(4);

  useEffect(() => {
    loadReports();
  }, [selectedWeeks]);

  const loadReports = async () => {
    try {
      const groups: WeekGroup[] = [];

      for (let i = 0; i < selectedWeeks; i++) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - startDate.getDay() - (i * 7));
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);

        const tasksRef = collection(db, 'tasks');
        const q = query(
          tasksRef,
          where('created_at', '>=', Timestamp.fromDate(startDate)),
          where('created_at', '<', Timestamp.fromDate(endDate)),
          orderBy('created_at', 'desc')
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

        const weekLabel = `${startDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} - ${endDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`;

        groups.push({
          weekLabel,
          startDate,
          endDate,
          tasks,
        });
      }

      setWeekGroups(groups);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    }
  };

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = generateReportHTML();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const exportToExcel = () => {
    let csv = 'Semana,Título,Descrição,Data de Entrega,Prioridade,Dia da Semana,Status,Criado em\n';

    weekGroups.forEach(group => {
      group.tasks.forEach(task => {
        const row = [
          group.weekLabel,
          `"${task.title.replace(/"/g, '""')}"`,
          `"${task.description.replace(/"/g, '""')}"`,
          task.due_date ? new Date(task.due_date).toLocaleDateString('pt-BR') : 'Sem data',
          task.priority,
          task.day_of_week,
          task.status,
          new Date(task.created_at).toLocaleDateString('pt-BR'),
        ].join(',');
        csv += row + '\n';
      });
    });

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_tarefas_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateReportHTML = () => {
    const tasksHTML = weekGroups.map(group => `
      <div style="margin-bottom: 40px; page-break-inside: avoid;">
        <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 8px; margin-bottom: 20px;">
          ${group.weekLabel}
        </h2>
        ${group.tasks.length === 0 ? '<p style="color: #6b7280; font-style: italic;">Nenhuma tarefa nesta semana</p>' : ''}
        ${group.tasks.map(task => `
          <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 12px; background: white;">
            <div style="display: flex; align-items: start; justify-content: space-between; margin-bottom: 8px;">
              <h3 style="margin: 0; color: #1f2937; font-size: 16px;">${task.title}</h3>
              <span style="padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;
                ${task.priority === 'urgente' ? 'background: #fee2e2; color: #991b1b;' :
                  task.priority === 'alta' ? 'background: #fed7aa; color: #9a3412;' :
                  task.priority === 'media' ? 'background: #fef3c7; color: #92400e;' :
                  'background: #d1fae5; color: #065f46;'}">
                ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
            </div>
            ${task.description ? `<p style="color: #4b5563; margin: 8px 0; font-size: 14px;">${task.description}</p>` : ''}
            <div style="display: flex; gap: 16px; font-size: 13px; color: #6b7280; margin-top: 12px;">
              ${task.due_date ? `<span><strong>Data:</strong> ${new Date(task.due_date).toLocaleDateString('pt-BR')}</span>` : '<span><strong>Data:</strong> Sem data</span>'}
              <span><strong>Dia:</strong> ${task.day_of_week.charAt(0).toUpperCase() + task.day_of_week.slice(1)}</span>
              <span><strong>Status:</strong> ${
                task.status === 'concluida' ? 'Concluída' :
                task.status === 'em_andamento' ? 'Em Andamento' : 'Pendente'
              }</span>
            </div>
          </div>
        `).join('')}
      </div>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Relatório de Tarefas - OdontoRoutine</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 40px; background: #f9fafb; }
          .header { text-align: center; margin-bottom: 40px; }
          .header h1 { color: #2563eb; font-size: 28px; margin-bottom: 8px; }
          .header p { color: #6b7280; }
          @media print {
            body { background: white; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>OdontoRoutine - Relatório de Tarefas</h1>
          <p>Gerado em ${new Date().toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          })}</p>
        </div>
        ${tasksHTML}
      </body>
      </html>
    `;
  };

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

  const statusLabels = {
    pendente: 'Pendente',
    em_andamento: 'Em Andamento',
    concluida: 'Concluída',
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Relatórios</h1>
          <p className="text-gray-600">Visualize e exporte o histórico de tarefas</p>
        </div>

        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex gap-3">
            <select
              value={selectedWeeks}
              onChange={(e) => setSelectedWeeks(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value={2}>Últimas 2 semanas</option>
              <option value={4}>Últimas 4 semanas</option>
              <option value={8}>Últimas 8 semanas</option>
              <option value={12}>Últimas 12 semanas</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              <Download size={20} />
              Exportar PDF
            </button>
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <FileSpreadsheet size={20} />
              Exportar Excel
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {weekGroups.map((group, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4">
                <h2 className="text-xl font-bold">{group.weekLabel}</h2>
                <p className="text-blue-100 text-sm mt-1">
                  {group.tasks.length} {group.tasks.length === 1 ? 'tarefa' : 'tarefas'}
                </p>
              </div>

              <div className="p-6">
                {group.tasks.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Nenhuma tarefa registrada nesta semana
                  </p>
                ) : (
                  <div className="space-y-4">
                    {group.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <h3 className="font-semibold text-gray-800 flex-1">{task.title}</h3>
                          <span className={`text-xs px-3 py-1 rounded-full border font-medium ${priorityColors[task.priority]}`}>
                            {priorityLabels[task.priority]}
                          </span>
                        </div>

                        {task.description && (
                          <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                          <span>
                            <strong className="text-gray-700">Data:</strong>{' '}
                            {task.due_date ? new Date(task.due_date).toLocaleDateString('pt-BR') : 'Sem data'}
                          </span>
                          <span>
                            <strong className="text-gray-700">Dia:</strong>{' '}
                            {task.day_of_week.charAt(0).toUpperCase() + task.day_of_week.slice(1)}
                          </span>
                          <span>
                            <strong className="text-gray-700">Status:</strong>{' '}
                            {statusLabels[task.status]}
                          </span>
                          {task.completed_at && (
                            <span>
                              <strong className="text-gray-700">Concluída em:</strong>{' '}
                              {new Date(task.completed_at).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}