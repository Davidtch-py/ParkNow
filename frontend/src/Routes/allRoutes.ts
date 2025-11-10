// ParkNow Components - Views principales del sistema
import ParqueaderoWizard from "views/ParqueaderoWizard";
import UsuariosListView from "views/UsuariosListView";
import HorariosAtencion from "views/HorariosAtencion";
import AlertasCapacidad from "views/AlertasCapacidad";
import RegistroEntradaSalida from "views/RegistroEntradaSalida";
import DashboardAnalytics from "views/DashboardAnalytics";
import ReportesListView from "views/ReportesListView";
import GestionTarifas from "views/GestionTarifas";
import LoginBoxedParkNow from "views/LoginBoxed";
import UsuariosSimple from "views/UsuariosSimple";
import TestComponent from "views/TestComponent";

// Componentes UI básicos necesarios
import UiButtons from "pages/Components/UIElement/UiButtons";
import UiModal from "pages/Components/UIElement/Modal";
import UiCards from "pages/Components/UIElement/UiCards";
import UiDropdown from "pages/Components/UIElement/UiDropdown";
import UiNotification from "pages/Components/UIElement/UiNotification";
import UITooltip from "pages/Components/UIElement/UiTooltip";

// Componentes de formularios necesarios
import FormsBasic from "pages/Components/Forms/Basic";
import FormValidation from "pages/Components/Forms/Validation";
import FormSelect from "pages/Components/Forms/Select";
import FormDatePicker from "pages/Components/Forms/Datepicker";
import FormTimePicker from "pages/Components/Forms/Timepicker";

// Componentes de navegación básicos
import NavBars from "pages/Components/Navigation/Navbars";
import NavTabs from "pages/Components/Navigation/Tabs";
import Pagination from "pages/Components/Navigation/Pagination";

// Tablas necesarias
import BasicTable from "pages/Components/Table/Basic";
import ReactDataTable from "pages/Components/Table/ReactTable";

// Mapas (específicamente requeridos)
// import MapsGoogle from "pages/Components/MapsGoogle"; // Deshabilitado: incompatible con React 18
import MapsLeaflet from "pages/Components/MapsLeaflet";

// Páginas básicas que existen
import Logout from "pages/Authentication/LogOut";
import Register from "pages/Authentication/Register";
import UserProfile from "pages/Authentication/UserProfile";

// Páginas adicionales útiles que pueden servir
import Account from "pages/Pages/Account";
import Settings from "pages/Pages/Settings";
import Pricing from "pages/Pages/Pricing";
import Faqs from "pages/Pages/Faqs";
import ContactUs from "pages/Pages/ContactUs";

interface RouteObject {
  path: string;
  component: React.ComponentType<any>;
  exact?: boolean;
}

const authProtectedRoutes: Array<RouteObject> = [
  // ParkNow - Sistema de Gestión de Parqueaderos
  { path: "/", component: DashboardAnalytics },
  { path: "/dashboard", component: DashboardAnalytics },
  { path: "/parknow-dashboard", component: DashboardAnalytics },
  { path: "/parknow-parqueaderos", component: ParqueaderoWizard },
  { path: "/parqueaderos", component: ParqueaderoWizard },
  { path: "/parknow-usuarios", component: UsuariosListView },
  { path: "/usuarios", component: UsuariosListView },
  { path: "/usuarios-simple", component: UsuariosSimple },
  { path: "/parknow-horarios", component: HorariosAtencion },
  { path: "/parknow-alertas", component: AlertasCapacidad },
  { path: "/parknow-entradas-salidas", component: RegistroEntradaSalida },
  { path: "/parknow-reportes", component: ReportesListView },
  { path: "/parknow-tarifas", component: GestionTarifas },
  // Nota: /parqueaderos ahora usa ParqueaderoWizard en /parknow-parqueaderos

  // Componente de prueba para diagnosticar problemas
  { path: "/test", component: TestComponent },

  // Componentes UI básicos necesarios
  { path: "/ui-buttons", component: UiButtons },
  { path: "/ui-modal", component: UiModal },
  { path: "/ui-cards", component: UiCards },
  { path: "/ui-dropdown", component: UiDropdown },
  { path: "/ui-notification", component: UiNotification },
  { path: "/ui-tooltip", component: UITooltip },

  // Formularios necesarios
  { path: "/forms-basic", component: FormsBasic },
  { path: "/forms-validation", component: FormValidation },
  { path: "/forms-select", component: FormSelect },
  { path: "/forms-datepicker", component: FormDatePicker },
  { path: "/forms-timepicker", component: FormTimePicker },

  // Navegación necesaria
  { path: "/navigation-navbars", component: NavBars },
  { path: "/navigation-tabs", component: NavTabs },
  { path: "/navigation-pagination", component: Pagination },

  // Tablas necesarias
  { path: "/tables-basic", component: BasicTable },
  { path: "/tables-datatable", component: ReactDataTable },

  // Mapas (requeridos específicamente)
  // { path: "/maps-google", component: MapsGoogle }, // Deshabilitado: incompatible con React 18
  { path: "/maps-leaflet", component: MapsLeaflet },

  // Páginas útiles que pueden servir para features adicionales
  { path: "/pages-account", component: Account },
  { path: "/pages-account-settings", component: Settings },
  { path: "/pages-pricing", component: Pricing },
  { path: "/pages-faqs", component: Faqs },
  { path: "/pages-contact-us", component: ContactUs },

  // Perfil de usuario
  { path: "/user-profile", component: UserProfile },
];

const publicRoutes = [
  // Autenticación principal de ParkNow
  { path: "/login", component: LoginBoxedParkNow },
  { path: "/logout", component: Logout },
  { path: "/register", component: Register },
  { path: "/parknow-login", component: LoginBoxedParkNow },
]

export { authProtectedRoutes, publicRoutes };
