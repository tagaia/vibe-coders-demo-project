import React from 'react';
import { Routes, Route, Navigate, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { ViewportProvider } from './components/ViewportProvider.jsx';
import ViewportDebug from './components/ViewportDebug.jsx';
import ViewportDemo from './components/ViewportDemo.jsx';
import Anmeldebildschirm from './components/Anmeldebildschirm.jsx';
import Registrierungsbildschirm from './components/Registrierungsbildschirm.jsx';
import PasswortAendernBildschirm from './components/PasswortAendernBildschirm.jsx';
import HomeBildschirm from './components/HomeBildschirm.jsx';
import ServicefallErfolg from './components/ServicefallErfolg.jsx';
import ServicefallAnsicht from './components/ServicefallAnsicht.jsx';
import Suchbildschirm from './components/Suchbildschirm.jsx';
import ÜbersichtBildschirm from './components/ÜbersichtBildschirm.jsx';
import Layout from './Layout.jsx';

// Simulierter Auth-Provider
const fakeAuthProvider = {
  isAuthenticated: false,
  signin(callback) {
    fakeAuthProvider.isAuthenticated = true;
    setTimeout(callback, 100);
  },
  signout(callback) {
    fakeAuthProvider.isAuthenticated = false;
    setTimeout(callback, 100);
  },
};

// Auth-Kontext
const AuthContext = React.createContext(null);

// AuthProvider-Komponente
function AuthProvider({ children }) {
  const [user, setUser] = React.useState(null);
  const signin = (newUser, callback) => {
    return fakeAuthProvider.signin(() => {
      setUser(newUser);
      callback();
    });
  };
  const signout = (callback) => {
    return fakeAuthProvider.signout(() => {
      setUser(null);
      callback();
    });
  };
  const value = { user, signin, signout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// useAuth-Hook
export function useAuth() {
  return React.useContext(AuthContext);
}

// Protected Route Wrapper
function RequireAuth({ children }) {
  const auth = useAuth();
  const location = useLocation();
  if (!auth.user) {
    return <Navigate to="/anmeldung" replace state={{ from: location }} />;
  }
  return children;
}

// Hauptkomponente
export default function App() {
  return (
    <ViewportProvider>
      <AuthProvider>
        <ViewportDebug />
        <Routes>
        <Route element={<Layout />}>
          <Route
            path="/"
            element={
              <RequireAuth>
                <HomeBildschirm />
              </RequireAuth>
            }
          />
          <Route
            path="/uebersicht"
            element={
              <RequireAuth>
                <ÜbersichtBildschirm />
              </RequireAuth>
            }
          />
          <Route path="/anmeldung" element={<Anmeldebildschirm />} />
          <Route path="/registrierung" element={<Registrierungsbildschirm />} />
          <Route
            path="/passwort-aendern"
            element={
              <RequireAuth>
                <PasswortAendernBildschirm />
              </RequireAuth>
            }
          />
          <Route
            path="/servicefall-erfolg"
            element={
              <RequireAuth>
                <ServicefallErfolg />
              </RequireAuth>
            }
          />
          {/* 4K Viewport Demo Route */}
          <Route
            path="/viewport-demo"
            element={
              <ViewportDemo />
            }
          />
          <Route
            path="/servicefall/:id"
            element={
              <RequireAuth>
                <ServicefallAnsicht />
              </RequireAuth>
            }
          />
          <Route
            path="/suche"
            element={
              <RequireAuth>
                <Suchbildschirm />
              </RequireAuth>
            }
          />
        </Route>
        </Routes>
      </AuthProvider>
    </ViewportProvider>
  );
}