import React, { useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig';
import './MyEvaluationsPage.css';
import ReportCharts from './ReportCharts';

const TeamEvaluationsPage = () => {
    const [evaluations, setEvaluations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedUserForChart, setSelectedUserForChart] = useState(null);

    // YENİ EKLENDİ: Dönemleri ve seçili dönemi tutmak için state'ler
    const [periods, setPeriods] = useState(['2025/Q1', '2025/Q2', '2025/Q3', '2025/Q4']);
    const [selectedPeriod, setSelectedPeriod] = useState(''); // Başlangıçta hepsi seçili

    // GÜNCELLEME: useEffect artık seçilen dönem değiştiğinde de çalışacak
    useEffect(() => {
        const fetchTeamEvaluations = async () => {
            try {
                setIsLoading(true);

                // API adresini, seçilen döneme göre dinamik olarak oluşturuyoruz.
                const url = selectedPeriod 
                    ? `/api/evaluations/team-evaluations?period=${selectedPeriod}` 
                    : '/api/evaluations/team-evaluations';

                const response = await apiClient.get(url);
                setEvaluations(response.data);
                setError('');
            } catch (err) {
                setError('Takım değerlendirmeleri yüklenirken bir hata oluştu.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTeamEvaluations();
    }, [selectedPeriod]); // Bağımlılık dizisine selectedPeriod eklendi

    const handleCardClick = (employeeName) => {
        if (selectedUserForChart === employeeName) {
            setSelectedUserForChart(null);
        } else {
            setSelectedUserForChart(employeeName);
        }
    };

    const selectedUserEvaluations = selectedUserForChart 
        ? evaluations.filter(e => e.employeeFullName === selectedUserForChart)
        : [];

    if (isLoading) return <p>Takım Değerlendirmeleri Yükleniyor...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="module-page-container">
            <div className="module-header">
                <h3>Takımımın Geçmiş Değerlendirmeleri</h3>
                
                {/* YENİ EKLENDİ: Dönem Filtresi */}
                <div className="filter-container">
                    <label htmlFor="period-filter">Döneme Göre Filtrele:</label>
                    <select 
                        id="period-filter"
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                    >
                        <option value="">Tüm Dönemler</option>
                        {periods.map(p => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedUserForChart && <ReportCharts evaluations={selectedUserEvaluations} />}

            {evaluations.length === 0 ? (
                <p>Seçilen filtreye uygun bir değerlendirme bulunmamaktadır.</p>
            ) : (
                <div className="evaluation-list">
                    {evaluations.map(evaluation => (
                        <div key={evaluation.evaluationID} className="evaluation-card">
                            <div 
                                className="evaluation-card-header clickable" 
                                onClick={() => handleCardClick(evaluation.employeeFullName)}
                            >
                                <h4>Çalışan: {evaluation.employeeFullName}</h4>
                                <span>Dönem: {evaluation.period}</span>
                            </div>
                            <div className="evaluation-card-body">
                                <p><strong>Genel Skor:</strong> {evaluation.overallScore ? evaluation.overallScore.toFixed(2) : 'N/A'}</p>
                                <p><strong>Değerlendiren:</strong> {evaluation.evaluatorFullName}</p>
                                <p><strong>Yorumlar:</strong> {evaluation.comments || 'Yorum bulunmamaktadır.'}</p>
                                <h5>Detaylı Puanlar:</h5>
                                <ul>
                                    {evaluation.scores.map((score, index) => (
                                        <li key={index}>
                                            <span>{score.criterionTitle} {score.weight && `(Ağırlık: %${score.weight})`}:</span> 
                                            <strong>{score.score}</strong>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TeamEvaluationsPage;