import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Payouts from './pages/Payouts';
import Beneficiaries from './pages/Beneficiaries';
import Transactions from './pages/Transactions';
import Reconciliation from './pages/Reconciliation';
import Settings from './pages/Settings';
import Deposit from './pages/Deposit';
import DashboardLayout from './layouts/DashboardLayout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="payouts" element={<Payouts />} />
          <Route path="beneficiaries" element={<Beneficiaries />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="reconciliation" element={<Reconciliation />} />
          <Route path="settings" element={<Settings />} />
          <Route path="deposit" element={<Deposit />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
