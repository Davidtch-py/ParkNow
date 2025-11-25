import { UserRound, Car, Clock, PieChart, Calendar, CreditCard, AlertTriangle } from "lucide-react";

const simpleMenuData: any = [
  {
    label: 'Parqueaderos',
    isTitle: true,
    roles: ['ADMIN', 'CONTROLADOR'],
  },
  {
    id: "dashboard",
    label: 'Dashboard',
    link: "/parknow-dashboard",
    icon: <PieChart />,
    roles: ['ADMIN', 'CONTROLADOR'],
  },
  {
    id: "parqueaderos",
    label: 'Registrar Parqueadero',
    link: "/parqueaderos",
    icon: <Car />,
    roles: ['ADMIN'], // Solo admin
  },
  {
    id: "horarios",
    label: 'Horarios de Atención',
    link: "/parknow-horarios",
    icon: <Clock />,
    roles: ['ADMIN'], // Solo admin
  },
  {
    id: "entradas-salidas",
    label: 'Entradas y Salidas',
    link: "/parknow-entradas-salidas",
    icon: <Clock />,
    roles: ['ADMIN', 'CONTROLADOR'],
  },
  {
    id: "alertas",
    label: 'Alertas de Capacidad',
    link: "/parknow-alertas",
    icon: <AlertTriangle />,
    roles: ['ADMIN', 'CONTROLADOR'],
  },
  {
    id: "reportes",
    label: 'Reportes',
    link: "/parknow-reportes",
    icon: <Calendar />,
    roles: ['ADMIN', 'CONTROLADOR'],
  },
  {
    id: "tarifas",
    label: 'Gestión de Tarifas',
    link: "/parknow-tarifas",
    icon: <CreditCard />,
    roles: ['ADMIN'], // Solo admin
  },
  {
    label: 'Administración',
    isTitle: true,
    roles: ['ADMIN'], // Solo admin ve esta sección
  },
  {
    id: "usuarios",
    label: 'Usuarios',
    link: "/usuarios",
    icon: <UserRound />,
    roles: ['ADMIN'], // Solo admin
  },
];

export { simpleMenuData };