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
import AppInitializer from './pages/AppInitializer';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route element={<SimpleLayout />}>
          <Route path="/" element={<Home />} />
        </Route>

        {/* Protected routes with AppProvider */}
        <Route
          path="/*"
          element={
            <AppProvider>
              <Routes>
                {/* Login page inside AppProvider */}
                <Route path="/login" element={<Login />} />

                {/* App initialization and other pages */}
                <Route
                  path="/*"
                  element={
                    <AppInitializer>
                      <Routes>
                        <Route element={<AppLayout />}>
                          <Route path="/user-preferences" element={<UserPreferences />} />
                          <Route path="/select-language-to-learn" element={<SelectLanguageToLearn />} />
                          <Route path="/select-partner" element={<SelectPartner />} />
                          <Route path="/words" element={<WordsPage />} />
                        </Route>
                        <Route element={<SimpleLayout />}>
                          <Route path="/chat/:partnerId" element={<Chat />} />
                        </Route>
                      </Routes>
                    </AppInitializer>
                  }
                />
              </Routes>
            </AppProvider>
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;