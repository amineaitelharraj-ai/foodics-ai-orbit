import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import OrbitAssistant from './pages/OrbitAssistant'
import OrbitInsights from './pages/OrbitInsights'
import InventoryGuru from './pages/InventoryGuru'
import SayAndServe from './pages/SayAndServe'
import PlatStudio from './pages/PlatStudio'
import ItemDetailsExample from './pages/ItemDetailsExample'
import PurchaseOrderExample from './pages/PurchaseOrderExample'
import InventoryCountExample from './pages/InventoryCountExample'
import FoodicsDemo from './pages/FoodicsDemo'
import { Login } from './pages/Login'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={
        <ProtectedRoute>
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/ai-orbit/assistant" replace />} />
              <Route path="/ai-orbit" element={<Navigate to="/ai-orbit/assistant" replace />} />
              <Route path="/ai-orbit/assistant" element={<OrbitAssistant />} />
              <Route path="/ai-orbit/insights" element={<OrbitInsights />} />
              <Route path="/ai-orbit/inventory-guru" element={<InventoryGuru />} />
              <Route path="/ai-orbit/say-and-serve" element={<SayAndServe />} />
              <Route path="/ai-orbit/plat-studio" element={<PlatStudio />} />
              <Route path="/console/item-details" element={<ItemDetailsExample />} />
              <Route path="/console/purchase-order" element={<PurchaseOrderExample />} />
              <Route path="/console/inventory-count" element={<InventoryCountExample />} />
              <Route path="/foodics-demo" element={<FoodicsDemo />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default App
