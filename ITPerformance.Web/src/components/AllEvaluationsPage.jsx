import React, { useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig';
import './MyEvaluationsPage.css';
import ReportCharts from './ReportCharts';

const AllEvaluationsPage = () => {
    const [evaluations, setEvaluations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedUserForChart, setSelectedUserForChart] = useState(null);

    // --- Departman Filtresi State'leri ---
    const [departments, setDepartments] = useState([
        { departmentID: 1, departmentName: 'İş Analistleri' },
        { departmentID: 2, departmentName: 'Yazılımcılar' },
        { departmentID: 3, departmentName: 'QA/Test Uzmanları' },
    ]);
    const [selectedDepartment, setSelectedDepartment] = useState('');

    // --- YENİ EKLENDİ: Dönem Filtresi State'leri ---
    const [periods, setPeriods] = useState(['2025/Q1', '2025/Q2', '2025/Q3', '2025/Q4']);
    const [selectedPeriod, setSelectedPeriod] = useState(''); // Başlangıçta hepsi seçili

    // GÜNCELLEME: useEffect artık her iki filtre değiştiğinde de çalışacak
    useEffect(() => {
        const fetchAllEvaluations = async () => {
            try {
                setIsLoading(true);
                // URL'e hem departmentId hem de period parametrelerini ekliyoruz.
                const params = new URLSearchParams();
                if (selectedDepartment) {
                    params.append('departmentId', selectedDepartment);
                }
                if (selectedPeriod) {
                    params.append('period', selectedPeriod);
                }
                
                const response = await apiClient.get(`/api/evaluations/all?${params.toString()}`);
                setEvaluations(response.data);
                setError('');
            } catch (err) {
                setError('Tüm değerlendirmeler yüklenirken bir hata oluştu.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllEvaluations();
    }, [selectedDepartment, selectedPeriod]); // Bağımlılıklara selectedPeriod eklendi

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

    if (isLoading) return <p>Tüm Değerlendirmeler Yükleniyor...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="module-page-container">
            <div className="module-header">
                <h3>Tüm Değerlendirme Raporları</h3>
                {/* Filtreleri bir arada tutan bir container */}
                <div className="filters-wrapper">
                    <div className="filter-container">
                        <label htmlFor="department-filter">Departmana Göre Filtrele: </label>
                        <select 
                            id="department-filter"
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                        >
                            <option value="">Tüm Departmanlar</option>
                            {departments.map(dep => (
                                <option key={dep.departmentID} value={dep.departmentID}>
                                    {dep.departmentName}
                                </option>
                            ))}
                        </select>
                    </div>

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
            </div>
            {selectedUserForChart && <ReportCharts evaluations={selectedUserEvaluations} />}

            {evaluations.length === 0 ? (
                <p>Seçilen filtreye uygun bir değerlendirme bulunmamaktadır.</p>
            ) : (
                <div className="evaluation-list">
                    {evaluations.map(evaluation => (
                        <div key={evaluation.evaluationID} className="evaluation-card">
                            <div className="evaluation-card-header clickable" onClick={() => handleCardClick(evaluation.employeeFullName)}>
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
                                            <span>
                                                {score.criterionTitle} 
                                                {score.weight && ` (Ağırlık: %${Number(score.weight)})`}:
                                            </span> 
                                            <strong> {score.score}</strong>
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

export default AllEvaluationsPage;