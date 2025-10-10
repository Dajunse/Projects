import { BookOpenText, FileText } from 'lucide-react';

const manuals = [
  { id: 'fw', title: 'Manual Firewall', path: './manuales/firewall/index.html' },
  { id: 'switch', title: 'Manual Switch Layer 2', path: './manuales/switch/index.html' },
];

const Manuals = () => {
  return (
    <div className="space-y-4">
      <header className="flex items-center gap-3">
        <BookOpenText className="text-primary" />
        <div>
          <h2 className="text-xl font-semibold">Manuales</h2>
          <p className="text-sm text-muted-foreground">
            Accede a manuales HTML almacenados localmente dentro del paquete portable.
          </p>
        </div>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {manuals.map((manual) => (
          <a
            key={manual.id}
            href={manual.path}
            target="_blank"
            rel="noreferrer"
            className="flex h-32 flex-col justify-between rounded-xl border border-border bg-card/60 p-4 shadow-card transition hover:-translate-y-1 hover:border-primary"
          >
            <FileText className="text-accent" />
            <h3 className="text-lg font-semibold">{manual.title}</h3>
            <p className="text-xs text-muted-foreground">Abrir manual offline</p>
          </a>
        ))}
      </div>
    </div>
  );
};

export default Manuals;
