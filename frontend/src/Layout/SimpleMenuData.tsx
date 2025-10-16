import { UserRound, Car, Clock, PieChart, Calendar, CreditCard, AlertTriangle } from "lucide-react";

const simpleMenuData: any = [
  {
    label: 'Parqueaderos',
    isTitle: true,
  },
  {
    id: "dashboard",
    label: 'Dashboard',
    link: "/parknow-dashboard",
    icon: <PieChart />,
  },
  {
    id: "parqueaderos",
    label: 'Registrar Parqueadero',
    link: "/parqueaderos",
    icon: <Car />,
  },
  {
    id: "horarios",
    label: 'Horarios de Atención',
    link: "/parknow-horarios",
    icon: <Clock />,
  },
  {
    id: "entradas-salidas",
    label: 'Entradas y Salidas',
    link: "/parknow-entradas-salidas",
    icon: <Clock />,
  },
  {
    id: "alertas",
    label: 'Alertas de Capacidad',
    link: "/parknow-alertas",
    icon: <AlertTriangle />,
  },
  {
    id: "reportes",
    label: 'Reportes',
    link: "/parknow-reportes",
    icon: <Calendar />,
  },
  {
    id: "tarifas",
    label: 'Gestión de Tarifas',
    link: "/parknow-tarifas",
    icon: <CreditCard />,
  },
  {
    label: 'Administración',
    isTitle: true,
  },
  {
    id: "usuarios",
    label: 'Usuarios',
    link: "/usuarios",
    icon: <UserRound />,
  },
];

export { simpleMenuData };