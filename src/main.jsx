import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LangProvider } from './i18n/index.jsx';
import Invitation from './pages/Invitation.jsx';
import './styles/global.css';

const Admin = lazy(() => import('./admin/Admin.jsx'));

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<Suspense fallback={null}><Admin /></Suspense>} />
        <Route path="/i/:code" element={<LangProvider><Invitation /></LangProvider>} />
        <Route path="*" element={<LangProvider><Invitation /></LangProvider>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
