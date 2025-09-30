import { UserRound, Car, Clock, PieChart, Calendar, Settings, CreditCard } from "lucide-react";

const simpleMenuData: any = [
  {
    label: 'Parqueaderos',
    isTitle: true,
  },
  {
    id: "dashboard",
    label: 'Dashboard',
    link: "/dashboard",
    icon: <PieChart />,
  },
  {
    id: "parqueaderos",
    label: 'Parqueaderos',
    link: "/parqueaderos",
    icon: <Car />,
  },
  {
    id: "entradas",
    label: 'Registrar Entrada',
    link: "/entradas",
    icon: <Clock />,
  },
  {
    id: "salidas",
    label: 'Registrar Salida',
    link: "/salidas",
    icon: <Clock />,
  },
  {
    id: "reportes",
    label: 'Reportes',
    link: "/reportes",
    icon: <Calendar />,
  },
  {
    id: "tarifas",
    label: 'Tarifas',
    link: "/tarifas",
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
  {
    id: "configuracion",
    label: 'Configuración',
    link: "/configuracion",
    icon: <Settings />,
  },
];

export { simpleMenuData };