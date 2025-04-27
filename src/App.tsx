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
import { ChatSettingsProvider } from './contexts/ChatSettingsContext';
import { Amplify } from 'aws-amplify';
import { experimentalSettingsManager } from "./core/ExperimentalSettingsManager.ts";
import Feedback from './pages/FeedbackPage.tsx';
import SubscriptionPage from './pages/SubscriptionPage.tsx';

const experimentalSettings = experimentalSettingsManager.getSettings();

Amplify.configure({
  Auth: {
    region: "eu-north-1",
    userPoolId: "us-east-1_walDCpNcK",
    userPoolWebClientId: "7o8tqlt2ucihqsbtthfopc9d4p",
    oauth: {
      domain: "talk-to-me.auth.us-east-1.amazoncognito.com",
      scope: ["openid email"],
      redirectSignIn: `${experimentalSettings.Frontend.Url}/select-partner/`,
      redirectSignOut: `${experimentalSettings.Frontend.Url}/login/`,
      responseType: "code",
    },
  },
})

function App() {

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route element={<SimpleLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
        </Route>
        
          <Route path="/*" element={
              <AppProvider>
                <Routes>
                  {/* Protected by App provider */}
                  <Route path="/*" element={
                      <AppInitializer>
                        <Routes>
                          <Route element={<AppLayout />}>
                            <Route path="/user-preferences" element={<UserPreferences />} />
                            <Route path="/select-language-to-learn" element={<SelectLanguageToLearn />} />
                            <Route path="/select-partner" element={<SelectPartner />} />
                            <Route path="/words" element={<WordsPage />} />
                            <Route path="/feedbacks" element={<Feedback />} />
                            <Route path="/subscriptions" element={<SubscriptionPage />} />
                          </Route>
                          <Route element={<SimpleLayout />}>
                          </Route>
                          <Route path="/chat/:partnerId" element={<ChatSettingsProvider><Chat /></ChatSettingsProvider>} />
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