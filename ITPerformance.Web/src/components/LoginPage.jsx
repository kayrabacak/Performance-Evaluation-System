import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // AuthContext'i kullanmak için import ediyoruz

const API_BASE_URL = 'http://localhost:5124'; // Kendi API adresinle değiştirmeyi unutma!

const LoginPage = () => {
    const [isLoginView, setIsLoginView] = useState(true);
    const { login } = useAuth(); // Context'ten login fonksiyonunu alıyoruz

    // Form verileri
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [departmentId, setDepartmentId] = useState('');

    // Departman listesi
    const [departments] = useState([
        { departmentID: 1, departmentName: 'İş Analistleri' },
        { departmentID: 2, departmentName: 'Yazılımcılar' },
        { departmentID: 3, departmentName: 'QA/Test Uzmanları' },
    ]);

    // Yardımcı state'ler
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        setIsError(false);

        if (isLoginView) {
            try {
                const response = await axios.post(`${API_BASE_URL}/api/account/login`, { email, password });
                // BAŞARILI GİRİŞ! Context'teki login fonksiyonunu çağırıyoruz.
                // Bu, token'ı ve kullanıcı bilgilerini global olarak saklayacak.
                login(response.data, response.data.token);
            } catch (error) {
                setIsLoading(false);
                setIsError(true);
                setMessage(error.response?.data || 'Giriş sırasında bir hata oluştu.');
            }
        } else {
            // Kayıt olma mantığı
            try {
                const response = await axios.post(`${API_BASE_URL}/api/account/register`, {
                    firstName,
                    lastName,
                    email,
                    password,
                    departmentId: parseInt(departmentId)
                });
                setIsLoading(false);
                setMessage(response.data.message);
                setTimeout(() => {
                    setIsLoginView(true);
                    resetForm();
                }, 2000);
            } catch (error) {
                setIsLoading(false);
                setIsError(true);
                setMessage(error.response?.data || 'Kayıt sırasında bir hata oluştu.');
            }
        }
    };
    
    // ... (resetForm ve toggleView fonksiyonları ve return JSX'i önceki App.jsx ile aynı)
    const resetForm = () => {
        setEmail(''); setPassword(''); setFirstName(''); setLastName('');
        setDepartmentId(''); setMessage(''); setIsError(false);
    };
    const toggleView = () => {
        setIsLoginView(!isLoginView);
        resetForm();
    };

    return (
        <div className="auth-container">
            <div className="form-box">
                <h2 className="form-title">{isLoginView ? 'Performans Değerlendirme Sistemi' : 'Yeni Hesap Oluştur'}</h2>
                <form onSubmit={handleSubmit}>
                    {!isLoginView && (
                        <>
                            <div className="input-group">
                                <input type="text" placeholder="İsim" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="form-input" required />
                                <input type="text" placeholder="Soyisim" value={lastName} onChange={(e) => setLastName(e.target.value)} className="form-input" required />
                            </div>
                            <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className="form-input" required>
                                <option value="" disabled>Departman Seçiniz...</option>
                                {departments.map(dep => (
                                    <option key={dep.departmentID} value={dep.departmentID}>{dep.departmentName}</option>
                                ))}
                            </select>
                        </>
                    )}
                    <input type="email" placeholder="E-posta Adresi" value={email} onChange={(e) => setEmail(e.target.value)} className="form-input" required />
                    <input type="password" placeholder="Şifre" value={password} onChange={(e) => setPassword(e.target.value)} className="form-input" required />
                    <button type="submit" disabled={isLoading} className="submit-button">
                        {isLoading ? 'İşlem Yapılıyor...' : (isLoginView ? 'Giriş Yap' : 'Kayıt Ol')}
                    </button>
                </form>
                {message && <div className={`message-box ${isError ? 'error' : 'success'}`}>{message}</div>}
                <div style={{ textAlign: 'center' }}>
                    <p>Giriş yapamadıysanız lütfen yöneticiniz ile iletişime geçiniz.</p>
                    
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
