import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import ConcoursList from './components/ConcoursList';
import Calendar from './components/Calendar';
import ConcoursDetail from './components/ConcoursDetail';
import PrintCalendar from './components/PrintCalendar';

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <main style={{ padding: '1rem', maxWidth: '1100px', margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={<ConcoursList />} />
          <Route path="/calendrier" element={<Calendar />} />
          <Route path="/concours/:id" element={<ConcoursDetail />} />
          <Route path="/imprimer" element={<PrintCalendar />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
