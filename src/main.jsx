import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LangProvider } from './i18n/index.jsx';
import Invitation from './pages/Invitation.jsx';
import TableFinder from './pages/TableFinder.jsx';
import './styles/global.css';
import './styles/theme.css';

const Admin = lazy(() => import('./admin/Admin.jsx'));

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<Suspense fallback={null}><Admin /></Suspense>} />
        <Route path="/tables" element={<LangProvider><TableFinder /></LangProvider>} />
        <Route path="/i/:code" element={<LangProvider><Invitation /></LangProvider>} />
        <Route path="*" element={<LangProvider><Invitation /></LangProvider>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
