import { useMemo } from 'react';
import { HardDrive, Shield, Wrench } from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import { useBookmarks } from '../hooks/useBookmarks';

interface DashboardProps {
  filter: string;
}

const iconMap: Record<string, JSX.Element> = {
  admin: <Shield className="text-primary" />,
  mx: <HardDrive className="text-accent" />,
  tools: <Wrench className="text-primary" />,
};

const Dashboard = ({ filter }: DashboardProps) => {
  const { data: sections } = useBookmarks();

  const filtered = useMemo(() => {
    if (!sections) return [];
    const term = filter.trim().toLowerCase();
    if (!term) return sections;
    return sections
      .map((section) => ({
        ...section,
        links: section.links.filter((link) =>
          [link.label, link.url, link.description, ...(link.tags ?? [])]
            .filter(Boolean)
            .some((value) => value!.toLowerCase().includes(term))
        ),
      }))
      .filter((section) => section.links.length > 0);
  }, [sections, filter]);

  if (!filtered.length) {
    return (
      <div className="grid h-full place-items-center text-muted-foreground">
        No se encontraron recursos. Ajusta tu búsqueda.
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {filtered.map((section) => (
        <div key={section.id} className="space-y-3">
          <div className="flex items-center gap-3">
            {iconMap[section.id] ?? <Wrench className="text-primary" />}
            <h3 className="text-lg font-semibold">{section.title}</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {section.links.map((link) => (
              <DashboardCard
                key={link.id}
                title={link.label}
                description={link.description ?? link.section}
                href={link.url}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
