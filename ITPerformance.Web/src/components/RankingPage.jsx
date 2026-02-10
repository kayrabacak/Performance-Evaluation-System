import React, { useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import './AdminPanel.css'; // Veya bu sayfa için kullandığınız CSS dosyası

const RankingPage = () => {
    const { user } = useAuth();
    const [rankingData, setRankingData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // --- Departman Filtresi State'leri ---
    const [departments, setDepartments] = useState([
        { departmentID: 1, departmentName: 'İş Analistleri' },
        { departmentID: 2, departmentName: 'Yazılımcılar' },
        { departmentID: 3, departmentName: 'QA/Test Uzmanları' },
    ]);
    const [selectedDepartment, setSelectedDepartment] = useState('');

    // --- YENİ EKLENDİ: Dönem Filtresi State'leri ---
    const [periods, setPeriods] = useState(['2025/Q1', '2025/Q2', '2025/Q3', '2025/Q4']);
    // Varsayılan olarak ilk dönemin seçili gelmesini sağlıyoruz.
    const [selectedPeriod, setSelectedPeriod] = useState(periods[0]); 

    // GÜNCELLEME: useEffect artık hem departman hem de dönem seçimi değiştiğinde çalışacak
    useEffect(() => {
        // Eğer bir dönem seçili değilse, hata vermemesi için veri çekme.
        if (!selectedPeriod) {
            setRankingData([]);
            setIsLoading(false);
            return;
        }

        const fetchRanking = async () => {
            try {
                setIsLoading(true);

                // URL'e hem period hem de departmentId parametrelerini ekliyoruz.
                const params = new URLSearchParams({ period: selectedPeriod });
                if (user?.role === 'Admin' && selectedDepartment) {
                    params.append('departmentId', selectedDepartment);
                }

                const response = await apiClient.get(`/api/reports/ranking?${params.toString()}`);
                setRankingData(response.data);
                setError('');
            } catch (err) {
                setError('Sıralama verileri yüklenirken bir hata oluştu.');
                setRankingData([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRanking();
    }, [selectedDepartment, selectedPeriod, user?.role]); // Bağımlılıklara selectedPeriod eklendi

    if (isLoading) return <p>Performans Sıralaması Yükleniyor...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="module-page-container">
            <div className="module-header">
                <h2>{user?.role === 'Admin' ? 'Performans Sıralaması' : 'Takım Performans Sıralaması'}</h2>
                
                {/* Filtreleri bir arada tutan bir container */}
                <div className="filters-wrapper">
                    {/* Departman Filtresi (Sadece Admin için) */}
                    {user?.role === 'Admin' && (
                        <div className="filter-container">
                            <label htmlFor="department-filter">Departman:</label>
                            <select 
                                id="department-filter"
                                value={selectedDepartment}
                                onChange={(e) => setSelectedDepartment(e.target.value)}
                            >
                                <option value="">Tümü</option>
                                {departments.map(dep => (
                                    <option key={dep.departmentID} value={dep.departmentID}>
                                        {dep.departmentName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    {/* YENİ EKLENDİ: Dönem Filtresi */}
                    <div className="filter-container">
                        <label htmlFor="period-filter">Dönem:</label>
                        <select 
                            id="period-filter"
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                        >
                            {periods.map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
            <div className="table-container">
                {rankingData.length === 0 && !isLoading ? (
                    <p>Seçilen filtrelere uygun bir sıralama bulunamadı.</p>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Sıra</th>
                                <th>Çalışan</th>
                                <th>Departman</th>
                                {/* GÜNCELLEME: Başlıklar yeni DTO'ya göre güncellendi */}
                                <th>Dönem Skoru</th>
                                <th>Değerlendirme Dönemi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rankingData.map((user, index) => (
                                <tr key={user.userId}>
                                    <td>{index + 1}</td>
                                    <td>{user.fullName}</td>
                                    <td>{user.departmentName}</td>
                                    {/* GÜNCELLEME: Alan adları yeni DTO'ya göre güncellendi */}
                                    <td>{user.score.toFixed(2)}</td>
                                    <td>{user.period}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default RankingPage;