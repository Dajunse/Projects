export type BookmarkSection = {
  id: string;
  title: string;
  links: Array<{
    id: string;
    label: string;
    url: string;
    description?: string;
    tags?: string[];
  }>;
};

export const mockSections: BookmarkSection[] = [
  {
    id: 'admin',
    title: 'Administración Local',
    links: [
      { id: 'fw', label: 'Firewall HQ', url: 'https://192.168.10.1', description: 'Administración central' },
      { id: 'nas', label: 'NAS Principal', url: 'https://192.168.10.20', description: 'Almacenamiento y respaldos' },
    ],
  },
  {
    id: 'mx',
    title: 'Red MX',
    links: [
      { id: 'mx-fw', label: 'Firewall MX', url: 'https://10.0.0.1', description: 'Acceso remoto' },
      { id: 'mx-switch', label: 'Switch MX-24', url: 'https://10.0.0.2', description: 'Puertos y VLANs' },
    ],
  },
  {
    id: 'tools',
    title: 'Herramientas Locales',
    links: [
      { id: 'switch-manager', label: 'Gestor de Switches', url: '#/switches', description: 'Configurar puertos y VLANs', tags: ['local'] },
      { id: 'formats', label: 'Formatos', url: '#/formatos', description: 'Plantillas y reportes', tags: ['local'] },
    ],
  },
];
