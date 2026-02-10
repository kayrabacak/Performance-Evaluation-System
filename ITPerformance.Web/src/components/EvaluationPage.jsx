import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../api/axiosConfig';
import './EvaluationPage.css'; 

const EvaluationPage = () => {
    const [teamMembers, setTeamMembers] = useState([]);
    const [criteria, setCriteria] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [period, setPeriod] = useState('');
    const [comments, setComments] = useState('');
    const [scores, setScores] = useState({}); 

    const [expandedSubCriteria, setExpandedSubCriteria] = useState({});
    const [submissionStatus, setSubmissionStatus] = useState({ message: '', success: false });

    // YENİ: Tamamlanmış değerlendirmeleri ve uyarı durumunu tutmak için state'ler
    const [completedEvaluations, setCompletedEvaluations] = useState([]);
    const [isAlreadyEvaluated, setIsAlreadyEvaluated] = useState(false);

    const fetchFormData = async () => {
        try {
            setIsLoading(true);
            const response = await apiClient.get('/api/evaluations/form-data');
            setTeamMembers(response.data.teamMembers);
            setCriteria(response.data.criteria);
            setCompletedEvaluations(response.data.completedEvaluations || []); // completedEvaluations listesini state'e yaz
            setError('');
        } catch (err) {
            setError('Değerlendirme verileri yüklenirken bir hata oluştu.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFormData();
    }, []);

    // daha önce değerlendirildi mi kontrolu 
    useEffect(() => {
        if (selectedEmployeeId && period) {
            const found = completedEvaluations.some(ev => 
                ev.employeeID == selectedEmployeeId && ev.period === period
            );
            setIsAlreadyEvaluated(found);
        } else {
            setIsAlreadyEvaluated(false);
        }
    }, [selectedEmployeeId, period, completedEvaluations]);
    
    const activeCriteria = useMemo(() => {
        if (!criteria || criteria.length === 0) return [];
        return criteria
            .filter(category => category.isActive)
            .map(category => ({
                ...category,
                subCriteria: category.subCriteria.filter(sub => sub.isActive)
            }))
            .filter(category => category.subCriteria.length > 0);
    }, [criteria]);

    const truncateText = (text, limit = 70) => {
        if (!text || text.length <= limit) {
            return text;
        }
        return text.substring(0, limit) + '...';
    };

    const handleScoreChange = (criterionId, score) => {
        setScores(prev => ({ ...prev, [criterionId]: score }));
    };

    const toggleSubCriterion = (id) => {
        setExpandedSubCriteria(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmissionStatus({ message: '', success: false });

        

        // burda başlıyor
        if (isAlreadyEvaluated) {
            setSubmissionStatus({ message: 'Bu çalışan bu dönem için zaten değerlendirilmiş.', success: false });
            return;
        }
        
        // toplam ağırlık kontrolu ana kriter
        const mainCriteriaTotalWeight = activeCriteria.reduce((sum, cat) => sum + (Number(cat.weight) || 0), 0);
        if (mainCriteriaTotalWeight !== 100) {
            setSubmissionStatus({ message: `Değerlendirme gönderilemedi: Ana kriterlerin toplam ağırlığı %${mainCriteriaTotalWeight} , %100 olmalı. Lütfen yönetici ile iletişime geçin.`, success: false });
            return;
        }

        // toplam agirlik kontrolu alt kriter
        for (const category of activeCriteria) {
            const subCriteriaTotalWeight = category.subCriteria.reduce((sum, sub) => sum + (Number(sub.weight) || 0), 0);
            if (subCriteriaTotalWeight !== 100) {
                setSubmissionStatus({ message: `Değerlendirme gönderilemedi: "${category.title}" başlığının alt kriterlerinin toplam ağırlığı %${subCriteriaTotalWeight} , %100 olmalı.`, success: false });
                return;
            }
        }

        // --- GÜNCELLEME BİTİYOR ---

        const scoresPayload = Object.entries(scores).map(([criterionId, score]) => ({ criterionId: parseInt(criterionId), score }));
        
        const allSubCriteriaIds = activeCriteria.flatMap(cat => cat.subCriteria.map(sub => sub.criterionID));
        if (scoresPayload.length !== allSubCriteriaIds.length) {
            setSubmissionStatus({ message: 'Lütfen tüm aktif kriterler için bir puan seçin.', success: false });
            return;
        }
        
        const submissionPayload = { employeeId: parseInt(selectedEmployeeId), period, comments, scores: scoresPayload };
        try {
            const response = await apiClient.post('/api/evaluations', submissionPayload);
            setSubmissionStatus({ message: `${response.data.message} (Genel Skor: ${response.data.overallScore.toFixed(2)})`, success: true });
            // Formu ve state'i temizle
            setSelectedEmployeeId('');
            setPeriod('');
            setComments('');
            setScores({});
            setExpandedSubCriteria({});
            // Yeni bir değerlendirme yapıldığı için tamamlanmış listesini de yenileyelim
            fetchFormData(); 
        } catch (err) {
            setSubmissionStatus({ message: err.response?.data?.message || 'Bir hata oluştu.', success: false });
            console.error("Değerlendirme gönderme hatası:", err);
        }
    };

    if (isLoading) return <p>Değerlendirme Formu Yükleniyor...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="evaluation-page-container">
            <h3>Performans Değerlendirmesi Yap</h3>
            <form onSubmit={handleSubmit} className="evaluation-form">
                <div className="form-group-row">
                    <div className="form-group">
                        <label htmlFor="employee-select">Değerlendirilecek Çalışan:</label>
                        <select id="employee-select" value={selectedEmployeeId} onChange={(e) => setSelectedEmployeeId(e.target.value)} required>
                            <option value="" disabled>Lütfen bir çalışan seçin...</option>
                            {teamMembers.map(member => (<option key={member.userID} value={member.userID}>{member.fullName}</option>))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="period-input">Dönem:</label>
                        <select 
                            id="period-input" 
                            value={period} 
                            onChange={(e) => setPeriod(e.target.value)} 
                            required
                        >
                            <option value="" disabled>Lütfen bir dönem seçin...</option>
                            <option value="2025/Q1">2025/Q1</option>
                            <option value="2025/Q2">2025/Q2</option>
                            <option value="2025/Q3">2025/Q3</option>
                            <option value="2025/Q4">2025/Q4</option>
                        </select>
                    </div>
                </div>

                
                {isAlreadyEvaluated && (
                    <div className="message-box warning">
                        ⚠️ Bu çalışan bu dönem için tarafınızca zaten değerlendirilmiş.
                    </div>
                )}

                <hr />
                {activeCriteria.map(category => (
                    <div key={category.criterionID} className="criteria-category">
                        <h4>{category.title} (Ana Ağırlık: {Number(category.weight)}%)</h4>
                        {category.subCriteria.map(sub => (
                            <div key={sub.criterionID} className="criteria-item-wrapper">
                                <div className="criteria-item-main-row">
                                    <label>{sub.title} <strong>(Ağırlık: {Number(sub.weight)}%)</strong></label>
                                    <div className="score-inputs">
                                        {[1,2,3,4,5].map(val => (
                                            <label key={val}>
                                                <input type="radio" name={`criterion-${sub.criterionID}`} value={val} checked={scores[sub.criterionID] === val} onChange={() => handleScoreChange(sub.criterionID, val)} required />
                                                {val}
                                            </label>
                                        ))}
                                    </div>
                                    <button type="button" className="details-toggle-button" onClick={() => toggleSubCriterion(sub.criterionID)}>
                                        {expandedSubCriteria[sub.criterionID] ? 'Gizle' : 'Detaylar'}
                                    </button>
                                </div>
                                {expandedSubCriteria[sub.criterionID] && (
                                    <div className="sub-criterion-descriptions">
                                        {sub.analystDescription && (<p title={sub.analystDescription}><strong>Analist:</strong> {truncateText(sub.analystDescription)}</p>)}
                                        {sub.developerDescription && (<p title={sub.developerDescription}><strong>Yazılımcı:</strong> {truncateText(sub.developerDescription)}</p>)}
                                        {sub.qaDescription && (<p title={sub.qaDescription}><strong>QA:</strong> {truncateText(sub.qaDescription)}</p>)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
                <div className="form-group">
                    <label htmlFor="comments-textarea">Genel Yorumlar:</label>
                    <textarea id="comments-textarea" value={comments} onChange={(e) => setComments(e.target.value)} rows="4" placeholder="Değerlendirme hakkındaki genel görüşleriniz..." />
                </div>
                <button type="submit" className="submit-button" disabled={isAlreadyEvaluated}>
                    Değerlendirmeyi Gönder
                </button>
                {submissionStatus.message && (<div className={`message-box ${submissionStatus.success ? 'success' : 'error'}`}>{submissionStatus.message}</div>)}
            </form>
        </div>
    );
};

export default EvaluationPage;