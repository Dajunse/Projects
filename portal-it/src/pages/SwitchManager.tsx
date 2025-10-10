import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import { BadgeCheck, Cable, HardDrive } from 'lucide-react';

interface SwitchManagerProps {
  filter: string;
}

export interface SwitchItem {
  id: number;
  name: string;
  ip: string;
  location?: string;
  notes?: string;
}

const fetchSwitches = async (): Promise<SwitchItem[]> => {
  try {
    return await invoke<SwitchItem[]>('list_switches');
  } catch (error) {
    console.warn('Falling back to mock switches', error);
    return [
      { id: 1, name: 'Core Switch', ip: '192.168.10.2', location: 'Site HQ', notes: 'Stack principal' },
      { id: 2, name: 'Switch Piso 2', ip: '192.168.20.2', location: 'Piso 2', notes: 'VLAN 20 usuarios' },
    ];
  }
};

const SwitchManager = ({ filter }: SwitchManagerProps) => {
  const { data: switches = [] } = useQuery({ queryKey: ['switches'], queryFn: fetchSwitches });
  const filtered = useMemo(() => {
    const term = filter.toLowerCase();
    if (!term) return switches;
    return switches.filter((item) =>
      [item.name, item.ip, item.location, item.notes]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term))
    );
  }, [switches, filter]);

  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-xl font-semibold">Gestor de Switches</h2>
        <p className="text-sm text-muted-foreground">
          Consulta y actualiza puertos, VLANs y credenciales. Los cambios se guardan automáticamente en SQLite.
        </p>
      </header>
      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((item) => (
          <div key={item.id} className="space-y-3 rounded-xl border border-border bg-card/60 p-4 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="text-sm text-muted-foreground">{item.location ?? 'Sin ubicación'}</p>
              </div>
              <BadgeCheck className="text-primary" />
            </div>
            <div className="grid gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><HardDrive size={16} /> {item.ip}</span>
              <span className="flex items-center gap-2"><Cable size={16} /> {item.notes ?? 'Sin notas'}</span>
            </div>
            <button className="w-full rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:brightness-110">
              Abrir detalle
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SwitchManager;
