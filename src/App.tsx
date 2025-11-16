import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TasksView } from './components/TasksView';
import { StatisticsView } from './components/StatisticsView';
import { ReportsView } from './components/ReportsView';
import { DoubtsView } from './components/DoubtsView';
import { DoubtModal } from './components/DoubtModal';
import { DayOfWeek } from './types/task';

function App() {
  const [currentView, setCurrentView] = useState<'tasks' | 'statistics' | 'reports' | 'doubts'>('tasks');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('segunda');
  const [selectedDoubt, setSelectedDoubt] = useState<string | null>(null);
  const [triggerAddDoubt, setTriggerAddDoubt] = useState(false);
  const [sidebarKey, setSidebarKey] = useState(0);

  const handleAddDoubt = () => {
    setCurrentView('doubts');
    setSelectedDoubt(null);
    setTriggerAddDoubt(true);
  };

  const handleDoubtCreated = () => {
    // Força o recarregamento da sidebar para mostrar a nova dúvida
    setSidebarKey(prev => prev + 1);
    setTriggerAddDoubt(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        key={sidebarKey}
        currentView={currentView}
        onViewChange={setCurrentView}
        selectedDay={selectedDay}
        onDayChange={(day) => setSelectedDay(day as DayOfWeek)}
        selectedDoubt={selectedDoubt}
        onDoubtChange={setSelectedDoubt}
        onAddDoubt={handleAddDoubt}
      />

      <main className="flex-1 flex flex-col">
        {currentView === 'tasks' && <TasksView selectedDay={selectedDay} />}
        {currentView === 'statistics' && <StatisticsView />}
        {currentView === 'reports' && <ReportsView />}
        {currentView === 'doubts' && (
          <DoubtsView 
            selectedDoubt={selectedDoubt}
            onDoubtCreated={handleDoubtCreated}
            triggerAddDoubt={triggerAddDoubt}
            onAddDoubtComplete={() => setTriggerAddDoubt(false)}
          />
        )}
      </main>
    </div>
  );
}

export default App;