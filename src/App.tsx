import { Route, Routes } from 'react-router-dom'
import Layout from '@/components/Layout'
import { RequireAuth } from '@/components/RequireAuth'
import Login from '@/pages/Login'
import Alerts from '@/pages/Alerts'
import CustomerDetail from '@/pages/CustomerDetail'
import Customers from '@/pages/Customers'
import GpuDetail from '@/pages/GpuDetail'
import Gpus from '@/pages/Gpus'
import Overview from '@/pages/Overview'
import Servers from '@/pages/Servers'
import SettingsPage from '@/pages/Settings'
import Vgpus from '@/pages/Vgpus'

export default function App() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route element={<RequireAuth><Layout /></RequireAuth>}>
        <Route index element={<Overview />} />
        <Route path="customers" element={<Customers />} />
        <Route path="customers/:id" element={<CustomerDetail />} />
        <Route path="gpus" element={<Gpus />} />
        <Route path="gpus/:id" element={<GpuDetail />} />
        <Route path="vgpus" element={<Vgpus />} />
        <Route path="servers" element={<Servers />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}
