import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../api/axiosConfig';
import CriterionItem from './CriterionItem';
import './AdminPanel.css';

const CriteriaAdminPage = () => {
    const [criteria, setCriteria] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [formState, setFormState] = useState({
        title: '',
        parentCriterionID: '',
        weight: '0',
        analystDescription: '',
        developerDescription: '',
        qADescription: ''
    });

    const fetchCriteria = async () => {
        try {
            setIsLoading(true);
            const response = await apiClient.get('/api/criteria');
            // Gelen veride isActive alanı yoksa diye bir önlem
            const criteriaWithStatus = response.data.map(c => ({
                ...c,
                isActive: c.isActive !== undefined ? c.isActive : true
            }));
            setCriteria(criteriaWithStatus);
            setError('');
        } catch (err) {
            setError('Kriterler yüklenirken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCriteria();
    }, []);
    
    const hierarchicalCriteria = useMemo(() => {
        const criteriaMap = {};
        const nestedCriteria = [];
        criteria.forEach(c => {
            criteriaMap[c.criterionID] = { ...c, subCriteria: [] };
        });
        criteria.forEach(c => {
            if (c.parentCriterionID && criteriaMap[c.parentCriterionID]) {
                criteriaMap[c.parentCriterionID].subCriteria.push(criteriaMap[c.criterionID]);
            } else {
                nestedCriteria.push(criteriaMap[c.criterionID]);
            }
        });
        return nestedCriteria;
    }, [criteria]);

    // ormdaki ağırlık hesaplamaları artık sadece afktif kriterleri baz alıcak.
    const { currentMainCriteriaTotalWeight, currentSubCriteriaTotalWeight } = useMemo(() => {
        const mainWeights = criteria
            .filter(c => !c.parentCriterionID && c.isActive) 
            .reduce((sum, c) => sum + (Number(c.weight) || 0), 0);

        if (!formState.parentCriterionID) {
            return { currentMainCriteriaTotalWeight: mainWeights, currentSubCriteriaTotalWeight: 0 };
        }

        const subWeights = criteria
            
            .filter(c => c.parentCriterionID === parseInt(formState.parentCriterionID) && c.isActive)
            .reduce((sum, c) => sum + (Number(c.weight) || 0), 0);

        return { currentMainCriteriaTotalWeight: mainWeights, currentSubCriteriaTotalWeight: subWeights };
    }, [formState.parentCriterionID, criteria]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormState(prevState => ({ ...prevState, [name]: value }));
    };

    const handleAddCriterion = async (e) => {
        e.preventDefault();
        if (!formState.title || !formState.weight) {
            setError("Başlık ve Ağırlık alanları zorunludur.");
            return;
        }
        const newWeight = parseFloat(formState.weight);
        if (formState.parentCriterionID) {
            if (currentSubCriteriaTotalWeight + newWeight > 100) {
                setError(`Aktif alt kriterlerin toplam ağırlığı (%${currentSubCriteriaTotalWeight + newWeight}) %100'ü geçemez.`);
                return;
            }
        } else {
            if (currentMainCriteriaTotalWeight + newWeight > 100) {
                setError(`Aktif ana kriterlerin toplam ağırlığı (%${currentMainCriteriaTotalWeight + newWeight}) %100'ü geçemez.`);
                return;
            }
        }
        const payload = {
            title: formState.title,
            parentCriterionID: formState.parentCriterionID ? parseInt(formState.parentCriterionID) : null,
            weight: parseFloat(formState.weight),
            analystDescription: formState.analystDescription,
            developerDescription: formState.developerDescription,
            qADescription: formState.qADescription
        };
        try {
            await apiClient.post('/api/criteria', payload);
            setFormState({ title: '', parentCriterionID: '', weight: '0', analystDescription: '', developerDescription: '', qADescription: '' });
            fetchCriteria();
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Kriter eklenirken bir hata oluştu.';
            setError(errorMessage);
        }
    };

    const mainCriteria = criteria.filter(c => !c.parentCriterionID);

    return (
        <div className="module-page-container">
            <div className="module-header">
                <h2>Kriter Yönetimi</h2>
            </div>
            
            <div className="form-container">
                <h4>Yeni Kriter Ekle</h4>
                <form onSubmit={handleAddCriterion} className="add-criterion-form">
                    <input name="title" type="text" value={formState.title} onChange={handleFormChange} placeholder="Yeni kriter başlığı" required />
                    <select name="parentCriterionID" value={formState.parentCriterionID} onChange={handleFormChange}>
                        <option value="">-- Ana Kriter Olarak Ekle --</option>
                        {mainCriteria.map(parent => (
                            <option key={parent.criterionID} value={parent.criterionID}>Alt Kriteri Olarak Ekle: {parent.title}</option>
                        ))}
                    </select>
                    <div className="weight-input-container">
                        {!formState.parentCriterionID ? (
                            <>
                                <label htmlFor="weight">Ana Kriter Ağırlığı: {formState.weight}%</label>
                                <div className="weight-info">Mevcut ana kriterlerin toplamı: <strong>%{currentMainCriteriaTotalWeight}</strong></div>
                                <input name="weight" type="range" value={formState.weight} onChange={handleFormChange} step="1" min="0" max={100 - currentMainCriteriaTotalWeight} className="custom-slider" />
                            </>
                        ) : (
                            <>
                                <label htmlFor="weight">Alt Kriter Ağırlığı: {formState.weight}%</label>
                                <div className="weight-info">Bu başlığın mevcut alt kriter toplamı: <strong>%{currentSubCriteriaTotalWeight}</strong></div>
                                <input name="weight" type="range" value={formState.weight} onChange={handleFormChange} step="1" min="0" max={100 - currentSubCriteriaTotalWeight} className="custom-slider" />
                                <div className="description-fields">
                                    <textarea name="developerDescription" value={formState.developerDescription} onChange={handleFormChange} placeholder="Yazılımcı için Açıklama" />
                                    <textarea name="analystDescription" value={formState.analystDescription} onChange={handleFormChange} placeholder="İş Analisti için Açıklama" />
                                    <textarea name="qADescription" value={formState.qADescription} onChange={handleFormChange} placeholder="QA/Test Uzmanı için Açıklama" />
                                </div>
                            </>
                        )}
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="add-button">Ekle</button>
                </form>
            </div>

            <div className="validation-summary-container">
                <h4>Genel Ağırlık Durumu</h4>
                <div className={`summary-item ${currentMainCriteriaTotalWeight === 100 ? 'summary-valid' : 'summary-invalid'}`}>
                    <strong>Tüm Aktif Ana Kriterlerin Toplam Ağırlığı:</strong> %{currentMainCriteriaTotalWeight}
                    {currentMainCriteriaTotalWeight !== 100 && " (Hedef: %100)"}
                </div>
                <hr style={{margin: '10px 0'}} />
                {mainCriteria.map(parent => {
                    const activeSubCriteria = criteria.filter(c => c.parentCriterionID === parent.criterionID && c.isActive);
                    
                    if (activeSubCriteria.length === 0) return null;

                    const totalWeight = activeSubCriteria.reduce((sum, c) => sum + (Number(c.weight) || 0), 0);
                    
                    return (
                        <div key={parent.criterionID} className={`summary-item ${totalWeight === 100 ? 'summary-valid' : 'invalid'}`}>
                           <strong>{parent.title} (Aktif Alt Kriterler):</strong> Toplam %{totalWeight}
                           {totalWeight !== 100 && " (Hedef: %100)"}
                        </div>
                    );
                })}
            </div>

            <div className="list-container">
                <h4>Mevcut Kriterler</h4>
                {isLoading ? ( <p>Kriterler Yükleniyor...</p> ) : (
                    <ul className="criteria-list">
                        {criteria.length > 0 ? (
                            hierarchicalCriteria.map(criterion => (
                                <CriterionItem 
                                    key={criterion.criterionID}
                                    criterion={criterion}
                                    onUpdate={fetchCriteria} 
                                />
                            ))
                        ) : (
                            <p>Henüz hiç kriter eklenmemiş.</p>
                        )}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default CriteriaAdminPage;