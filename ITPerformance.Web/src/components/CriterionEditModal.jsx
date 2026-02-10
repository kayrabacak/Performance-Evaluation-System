// src/components/CriterionEditModal.jsx (YENİ DOSYA)

import React, { useState, useMemo } from 'react';
import apiClient from '../api/axiosConfig';
import toast from 'react-hot-toast';

const CriterionEditModal = ({ criterion, allCriteria, onClose, onUpdate }) => {
    const [editState, setEditState] = useState({
        title: criterion.title,
        weight: criterion.weight ?? 0,
        analystDescription: criterion.analystDescription || '',
        developerDescription: criterion.developerDescription || '',
        qADescription: criterion.qADescription || ''
    });

    const siblingWeight = useMemo(() => {
        if (!criterion.parentCriterionID) {
            return allCriteria
                .filter(c => !c.parentCriterionID && c.criterionID !== criterion.criterionID)
                .reduce((sum, c) => sum + (c.weight || 0), 0);
        } else {
            return allCriteria
                .filter(c => c.parentCriterionID === criterion.parentCriterionID && c.criterionID !== criterion.criterionID)
                .reduce((sum, c) => sum + (c.weight || 0), 0);
        }
    }, [allCriteria, criterion]);

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditState(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const toastId = toast.loading('Kriter güncelleniyor...');
        const payload = {
            title: editState.title,
            weight: parseFloat(editState.weight),
            analystDescription: criterion.parentCriterionID ? editState.analystDescription : null,
            developerDescription: criterion.parentCriterionID ? editState.developerDescription : null,
            qADescription: criterion.parentCriterionID ? editState.qADescription : null,
        };

        try {
            await apiClient.put(`/api/criteria/${criterion.criterionID}`, payload);
            toast.success('Kriter başarıyla güncellendi.', { id: toastId });
            onUpdate();
            onClose();
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Güncelleme sırasında bir hata oluştu.';
            toast.error(errorMessage, { id: toastId });
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Kriteri Düzenle</h3>
                <form onSubmit={handleUpdate} className="modal-form">
                    <div className="form-group">
                        <label>Başlık</label>
                        <input type="text" name="title" value={editState.title} onChange={handleEditChange} required />
                    </div>
                    
                    <div className="form-group">
                        <label>Ağırlık: {editState.weight}%</label>
                        <input type="range" name="weight" value={editState.weight} onChange={handleEditChange} min="0" max={100 - siblingWeight} step="1" />
                        <small>Bu kritere atayabileceğiniz maksimum ağırlık: %{100 - siblingWeight}</small>
                    </div>

                    {criterion.parentCriterionID && (
                        <>
                            <div className="form-group">
                                <label>Yazılımcı Açıklaması</label>
                                <textarea name="developerDescription" value={editState.developerDescription} onChange={handleEditChange} />
                            </div>
                            <div className="form-group">
                                <label>İş Analisti Açıklaması</label>
                                <textarea name="analystDescription" value={editState.analystDescription} onChange={handleEditChange} />
                            </div>
                            <div className="form-group">
                                <label>QA/Test Uzmanı Açıklaması</label>
                                <textarea name="qADescription" value={editState.qADescription} onChange={handleEditChange} />
                            </div>
                        </>
                    )}
                    
                    <div className="modal-actions">
                        <button type="submit" className="action-button save">Kaydet</button>
                        <button type="button" onClick={onClose} className="action-button cancel">İptal</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CriterionEditModal;