import React from 'react';
import { useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';

function App() {
  // Global AuthContext'ten kullanıcının giriş durumunu kontrol ediyoruz.
  const { isLoggedIn } = useAuth();

  // Eğer kullanıcı giriş yapmışsa (isLoggedIn true ise) DashboardPage'i göster,
  // yapmamışsa LoginPage'i göster.
  return (
    <div>
      {isLoggedIn ? <DashboardPage /> : <LoginPage />}
    </div>
  );
}

export default App;
