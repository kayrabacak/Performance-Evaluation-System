import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx'; 
import { Toaster } from 'react-hot-toast';

// 1. Genel, tüm sayfayı etkileyen temel stilleri yüklüyoruz.
import './index.css'; 

// 2. App bileşenimize özel stilleri de buradan yüklüyoruz.
// Yükleme sırası önemlidir. Önce genel, sonra özel stiller.
import './App.css';   

// Uygulamayı HTML'deki 'root' elementinin içine render ediyoruz.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* YENİ EKLENDİ: Tüm App bileşenini AuthProvider ile sarmalıyoruz.
        Bu sayede, App bileşeni ve onun altındaki tüm bileşenler,
        AuthContext'in sağladığı bilgilere (user, token, login, logout) erişebilir.
    */}
    <AuthProvider>
      <Toaster position="top-right" reverseOrder={false}/>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
