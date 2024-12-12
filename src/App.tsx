import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import UserPreferences from "./pages/UserPreferences"
import SelectLanguageToLearn from './pages/SelectLanguageToLearn';
import { default as SelectPartner } from './pages/SelectPartner';
import { default as Chat } from './pages/Chat'; // Your existing chat component
import AppLayout from './layouts/AppLayout';
import SimpleLayout from './layouts/SimpleLayout';
import { AppProvider } from './contexts/AppContext';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AppProvider> <AppLayout /> </AppProvider>}>
            <Route path="/select-partner" element={<SelectPartner />} />
            <Route path="/chat/:partnerId" element={<Chat />} />
        </Route>
        <Route path="/user-preferences" element={<UserPreferences />} />
        <Route path="/select-language-to-learn" element={<SelectLanguageToLearn />} />
        
        <Route element={<SimpleLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;