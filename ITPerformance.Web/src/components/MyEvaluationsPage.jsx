import React, { useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig';
import './MyEvaluationsPage.css';
import { 
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const MyEvaluationsPage = () => {
    const [evaluations, setEvaluations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMyEvaluations = async () => {
            try {
                setIsLoading(true);
                const response = await apiClient.get('/api/evaluations/my-evaluations');
                setEvaluations(response.data);
                setError('');
            } catch (err) {
                setError('Değerlendirme geçmişiniz yüklenirken bir hata oluştu.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchMyEvaluations();
    }, []);

    const lineChartData = evaluations
        .map(e => ({
            period: e.period,
            "Genel Skor": e.overallScore ? parseFloat(e.overallScore.toFixed(2)) : 0,
        }))
        .reverse();

    const latestEvaluation = evaluations[0];
    const barChartData = latestEvaluation?.scores.map(s => ({
        name: s.criterionTitle,
        Puan: s.score
    }));

    if (isLoading) return <p>Değerlendirme Geçmişiniz Yükleniyor...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="module-page-container">
            <div className="module-header">
                <h2>Geçmiş Performans Değerlendirmelerim</h2>
            </div>
            {evaluations.length === 0 ? (
                <p>Henüz size ait bir değerlendirme bulunmamaktadır.</p>
            ) : (
                <>
                    <div className="charts-grid">
                        <div className="chart-container">
                            <h4>Performans Gelişim Grafiği (Genel Skor)</h4>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={lineChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="period" />
                                    <YAxis domain={[0, 5]} />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="Genel Skor" stroke="#8884d8" activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="chart-container">
                            <h4>Son Değerlendirme Detayları ({latestEvaluation?.period})</h4>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={barChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="Puan" fill="#82ca9d" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="evaluation-list">
                        {evaluations.map(evaluation => (
                            <div key={evaluation.evaluationID} className="evaluation-card">
                                <div className="evaluation-card-header">
                                    <h4>Dönem: {evaluation.period}</h4>
                                    <span>Tarih: {new Date(evaluation.evaluationDate).toLocaleDateString('tr-TR')}</span>
                                </div>
                                <div className="evaluation-card-body">
                                    <p><strong>Genel Skor:</strong> {evaluation.overallScore ? evaluation.overallScore.toFixed(2) : 'N/A'}</p>
                                    <p><strong>Değerlendiren:</strong> {evaluation.evaluatorFullName}</p>
                                    <p><strong>Yorumlar:</strong> {evaluation.comments || 'Yorum bulunmamaktadır.'}</p>
                                    <h5>Detaylı Puanlar:</h5>
                                    <ul>
                                        {evaluation.scores.map((score, index) => (
                                            <li key={index}>
                                                {/* --- DEĞİŞİKLİK BURADA: Ağırlık bilgisini ekliyoruz --- */}
                                                <span>{score.criterionTitle} {score.weight && `(Ağırlık: %${score.weight})`}:</span> 
                                                <strong>{score.score}</strong>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default MyEvaluationsPage;