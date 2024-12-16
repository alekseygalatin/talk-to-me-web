import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { default as SelectPartner } from './pages/SelectPartner';
import { default as Chat } from './pages/Chat'; // Your existing chat component
import { default as WordsPage } from './pages/WordsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/select-partner" element={<SelectPartner />} />
        <Route path="/words" element={<WordsPage />} />
        <Route path="/chat/:partnerId" element={<Chat />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;