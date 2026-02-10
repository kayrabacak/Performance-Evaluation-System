import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import CriteriaAdminPage from './CriteriaAdminPage';
import UserAdminPage from './UserAdminPage';
import EvaluationPage from './EvaluationPage';
import MyEvaluationsPage from './MyEvaluationsPage';
import TeamEvaluationsPage from './TeamEvaluationsPage';
import AllEvaluationsPage from './AllEvaluationsPage';
import RankingPage from './RankingPage'; // Yeni bileşeni import ediyoruz

const ModuleCard = ({ title, description, onClick }) => (
    <button onClick={onClick} className="module-card">
        <h3>{title}</h3>
        <p>{description}</p>
    </button>
);

const DashboardPage = () => {
    const { user, logout } = useAuth();
    const [activeModule, setActiveModule] = useState('home');

    const renderActiveModule = () => {
        switch (activeModule) {
            case 'criteria': return <CriteriaAdminPage />;
            case 'users': return <UserAdminPage />;
            case 'reports': return <AllEvaluationsPage />;
            case 'new-evaluation': return <EvaluationPage />;
            case 'team-reports': return <TeamEvaluationsPage />;
            case 'my-evaluations': return <MyEvaluationsPage />;
            case 'ranking': return <RankingPage />; // YENİ EKLENDİ
            default:
                return (
                    <div className="module-grid">
                        {/* Admin'e Özel Kartlar */}
                        {user?.role === 'Admin' && (
                            <>
                                <ModuleCard title="Kriter Yönetimi" description="Performans kriterlerini oluşturun ve düzenleyin." onClick={() => setActiveModule('criteria')} />
                                <ModuleCard title="Kullanıcı Yönetimi" description="Kullanıcıları, rolleri ve departmanları yönetin." onClick={() => setActiveModule('users')} />
                                <ModuleCard title="Tüm Raporlar" description="Sistemdeki tüm değerlendirme sonuçlarını görüntüleyin." onClick={() => setActiveModule('reports')} />
                                {/* --- YENİ EKLENDİ: Admin için Sıralama Kartı --- */}
                                <ModuleCard title="Performans Sıralaması" description="Tüm çalışanların performans sıralamasını görüntüleyin." onClick={() => setActiveModule('ranking')} />
                            </>
                        )}
                        
                        {/* Evaluator'a Özel Kartlar */}
                        {user?.role === 'Evaluator' && (
                            <>
                                <ModuleCard title="Değerlendirme Yap" description="Takımınızdaki çalışanlar için yeni bir değerlendirme başlatın." onClick={() => setActiveModule('new-evaluation')} />
                                <ModuleCard title="Takım Raporları" description="Takımınızın geçmiş değerlendirme sonuçlarını görüntüleyin." onClick={() => setActiveModule('team-reports')} />
                                {/* --- YENİ EKLENDİ: Evaluator için Sıralama Kartı --- */}
                                <ModuleCard title="Takım Performans Sıralaması" description="Takımınızdaki çalışanların performans sıralamasını görüntüleyin." onClick={() => setActiveModule('ranking')} />
                            </>
                        )}

                        {/* Employee'ye Özel Kartlar */}
                        {user?.role === 'Employee' && (
                            <>
                                <ModuleCard title="Değerlendirmelerim" description="Kendi geçmiş performans değerlendirme sonuçlarınızı görüntüleyin." onClick={() => setActiveModule('my-evaluations')} />
                            </>
                        )}
                    </div>
                );
        }
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Performans Değerlendirme Sistemi</h1>
                <div className="user-info">
                    <span>Hoş geldin, {user?.firstName}! ({user?.role})</span>
                    <button onClick={logout} className="logout-button">Çıkış Yap</button>
                </div>
            </header>
            <main className="dashboard-content">
                {activeModule !== 'home' && (
                    <button onClick={() => setActiveModule('home')} className="back-button">
                        &larr; Ana Menüye Dön
                    </button>
                )}
                {renderActiveModule()}
            </main>
        </div>
    );
};

export default DashboardPage;
