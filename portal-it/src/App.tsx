import { useMemo, useState } from 'react';
import { Link, NavLink, Route, Routes } from 'react-router-dom';
import { LayoutDashboard, Book, ClipboardList, Server } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import SwitchManager from './pages/SwitchManager';
import Manuals from './pages/Manuals';
import Formats from './pages/Formats';
import Tasks from './pages/Tasks';
import GlobalSearch from './components/GlobalSearch';
import { cn } from './lib/utils';

const routes = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/switches', label: 'Switch Manager', icon: Server },
  { path: '/manuals', label: 'Manuales', icon: Book },
  { path: '/formatos', label: 'Formatos', icon: ClipboardList },
  { path: '/tareas', label: 'Tareas', icon: ClipboardList },
];

function App() {
  const [filter, setFilter] = useState('');
  const navigation = useMemo(() => routes, []);

  return (
    <div className="flex h-screen bg-background text-foreground">
      <aside className="hidden w-64 flex-col border-r border-border bg-card/40 p-4 md:flex">
        <h1 className="mb-8 text-xl font-semibold">Portal IT</h1>
        <nav className="flex flex-1 flex-col gap-2">
          {navigation.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition hover:bg-card hover:text-primary-foreground',
                  isActive && 'bg-primary text-primary-foreground shadow-card'
                )
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <footer className="mt-8 text-xs text-muted-foreground">
          <p>Modo offline - datos locales</p>
          <Link to="/formatos" className="underline">
            Exportar USB
          </Link>
        </footer>
      </aside>
      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="border-b border-border bg-card/60 p-4 backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-semibold">Portal IT Portable</h2>
            <GlobalSearch onFilter={setFilter} />
          </div>
        </header>
        <section className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard filter={filter} />} />
            <Route path="/switches" element={<SwitchManager filter={filter} />} />
            <Route path="/manuals" element={<Manuals />} />
            <Route path="/formatos" element={<Formats />} />
            <Route path="/tareas" element={<Tasks />} />
          </Routes>
        </section>
      </main>
    </div>
  );
}

export default App;
