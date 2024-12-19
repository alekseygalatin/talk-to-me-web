import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import UserPreferences from "./pages/UserPreferences"
import SelectLanguageToLearn from './pages/SelectLanguageToLearn';
import { default as SelectPartner } from './pages/SelectPartner';
import { default as Chat } from './pages/Chat'; // Your existing chat component
import { default as WordsPage } from './pages/WordsPage';
import AppLayout from './layouts/AppLayout';
import SimpleLayout from './layouts/SimpleLayout';
import { AppProvider } from './contexts/AppContext';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<SimpleLayout />}>
          <Route path="/user-preferences" element={<UserPreferences />} />
          <Route path="/select-language-to-learn" element={<SelectLanguageToLearn />} />
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>

        <Route element={<AppProvider> <AppLayout /> </AppProvider>}>
            <Route path="/select-partner" element={<SelectPartner />} />
            <Route path="/words" element={<WordsPage />} />
        </Route>

        <Route path="/chat/:partnerId" element={<AppProvider><Chat /></AppProvider>}/>
      </Routes>
    </Router>
  );
}

export default App;