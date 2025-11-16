import { Calendar, BarChart3, FileText, HelpCircle, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface SidebarProps {
  currentView: 'tasks' | 'statistics' | 'reports' | 'doubts';
  onViewChange: (view: 'tasks' | 'statistics' | 'reports' | 'doubts') => void;
  selectedDay: string;
  onDayChange: (day: string) => void;
  selectedDoubt?: string | null;
  onDoubtChange?: (doubtId: string | null) => void;
  onAddDoubt?: () => void;
}

const daysOfWeek = [
  { name: 'Segunda', key: 'segunda', abbr: 'SEG' },
  { name: 'Terça', key: 'terca', abbr: 'TER' },
  { name: 'Quarta', key: 'quarta', abbr: 'QUA' },
  { name: 'Quinta', key: 'quinta', abbr: 'QUI' },
  { name: 'Sexta', key: 'sexta', abbr: 'SEX' },
  { name: 'Sábado', key: 'sabado', abbr: 'SÁB' },
  { name: 'Domingo', key: 'domingo', abbr: 'DOM' },
];

export function Sidebar({ 
  currentView, 
  onViewChange, 
  selectedDay, 
  onDayChange,
  selectedDoubt,
  onDoubtChange,
  onAddDoubt
}: SidebarProps) {
  const [isDoubtsExpanded, setIsDoubtsExpanded] = useState(false);
  const [doubts, setDoubts] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    if (isDoubtsExpanded) {
      loadDoubts();
    }
  }, [isDoubtsExpanded]);

  const loadDoubts = async () => {
    try {
      const doubtsRef = collection(db, 'doubts');
      const querySnapshot = await getDocs(doubtsRef);
      const doubtsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
      }));
      setDoubts(doubtsData);
    } catch (error) {
      console.error('Erro ao carregar dúvidas:', error);
    }
  };

  const handleDoubtClick = () => {
    setIsDoubtsExpanded(!isDoubtsExpanded);
    if (!isDoubtsExpanded) {
      onViewChange('doubts');
      if (onDoubtChange) onDoubtChange(null);
    }
  };

  return (
    <div className="w-60 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-blue-600">OdontoRoutine</h1>
        <p className="text-sm text-gray-500 mt-1">Sistema de Rotina</p>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Navegação
          </h2>
          <div className="space-y-1">
            <button
              onClick={() => onViewChange('tasks')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                currentView === 'tasks'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Calendar size={20} />
              <span className="font-medium">Tarefas</span>
            </button>
            
            <button
              onClick={() => onViewChange('statistics')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                currentView === 'statistics'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <BarChart3 size={20} />
              <span className="font-medium">Estatísticas</span>
            </button>
            
            <button
              onClick={() => onViewChange('reports')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                currentView === 'reports'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FileText size={20} />
              <span className="font-medium">Relatórios</span>
            </button>

            {/* Seção de Dúvidas */}
            <div>
              <button
                onClick={handleDoubtClick}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  currentView === 'doubts'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <HelpCircle size={20} />
                <span className="font-medium flex-1 text-left">Dúvidas</span>
                {isDoubtsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>

              {/* Submenu de Dúvidas */}
              {isDoubtsExpanded && (
                <div className="ml-4 mt-1 space-y-1">
                  {doubts.map((doubt) => (
                    <button
                      key={doubt.id}
                      onClick={() => {
                        onViewChange('doubts');
                        if (onDoubtChange) onDoubtChange(doubt.id);
                      }}
                      className={`w-full flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedDoubt === doubt.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="truncate">{doubt.name}</span>
                    </button>
                  ))}
                  
                  {/* Botão Add Dúvidas */}
                  <button
                    onClick={() => {
                      onViewChange('doubts');
                      if (onAddDoubt) onAddDoubt();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-blue-600 hover:bg-blue-50 transition-colors font-medium"
                  >
                    <Plus size={16} />
                    <span>Add Dúvidas</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {currentView === 'tasks' && (
          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Dias da Semana
            </h2>
            <div className="space-y-1">
              {daysOfWeek.map((day) => (
                <button
                  key={day.key}
                  onClick={() => onDayChange(day.key)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                    selectedDay === day.key
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="font-medium">{day.name}</span>
                  <span className="text-xs font-semibold">{day.abbr}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}