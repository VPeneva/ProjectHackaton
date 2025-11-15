import CssBaseline from '@mui/material/CssBaseline';
import { Outlet } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import EmployeeList from '../components/EmployeeList';
import EmployeeShow from '../components/EmployeeShow';
import EmployeeCreate from '../components/EmployeeCreate';
import EmployeeEdit from '../components/EmployeeEdit';
import NotificationsProvider from '../hooks/useNotifications/NotificationsProvider';
import DialogsProvider from '../hooks/useDialogs/DialogsProvider';
import AppTheme from '../shared-theme/AppTheme';
import {
  dataGridCustomizations,
  datePickersCustomizations,
  sidebarCustomizations,
  formInputCustomizations,
} from '../theme/customizations';

// Routing is handled at the app root (single BrowserRouter in `App.jsx`).
// This component provides theme/providers and renders nested routes via <Outlet />.

const themeComponents = {
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...sidebarCustomizations,
  ...formInputCustomizations,
};

export default function CrudDashboard(props) {
  return (
    <AppTheme {...props} themeComponents={themeComponents}>
      <CssBaseline enableColorScheme />
      <NotificationsProvider>
        <DialogsProvider>
          <Outlet />
        </DialogsProvider>
      </NotificationsProvider>
    </AppTheme>
  );
}
