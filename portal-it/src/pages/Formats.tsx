import { Archive, Download } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { useState } from 'react';

const formats = [
  { id: 'entrega-equipo', title: 'Formato de Entrega de Equipo', path: './formatos/formato_entrega_equipo.html' },
  { id: 'incidencia', title: 'Formato de Incidencias', path: './formatos/incidencia.html' },
];

const Formats = () => {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);
      await invoke('export_database');
      alert('Respaldo generado en la ruta seleccionada. Copia el archivo a tu USB.');
    } catch (error) {
      console.error(error);
      alert('No fue posible exportar los datos. Revisa la consola.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <Archive className="text-primary" />
        <div>
          <h2 className="text-xl font-semibold">Formatos y Respaldo</h2>
          <p className="text-sm text-muted-foreground">
            Accede a plantillas HTML y realiza exportaciones manuales de la base de datos.
          </p>
        </div>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {formats.map((format) => (
          <a
            key={format.id}
            href={format.path}
            target="_blank"
            rel="noreferrer"
            className="flex h-32 flex-col justify-between rounded-xl border border-border bg-card/60 p-4 shadow-card transition hover:-translate-y-1 hover:border-primary"
          >
            <Download className="text-accent" />
            <h3 className="text-lg font-semibold">{format.title}</h3>
            <p className="text-xs text-muted-foreground">Abrir formato offline</p>
          </a>
        ))}
      </div>
      <button
        onClick={handleExport}
        disabled={exporting}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {exporting ? 'Generando respaldo...' : 'Exportar USB (.json)'}
      </button>
    </div>
  );
};

export default Formats;
