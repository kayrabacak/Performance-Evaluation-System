import React, { useState } from 'react';
import apiClient from '../api/axiosConfig';

const CriterionItem = ({ criterion, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editState, setEditState] = useState({
        title: criterion.title,
        weight: criterion.weight || '',
        analystDescription: criterion.analystDescription || '',
        developerDescription: criterion.developerDescription || '',
        qaDescription: criterion.qaDescription || ''
    });

    const handleToggleStatus = async () => {
        try {
            await apiClient.patch(`/api/criteria/${criterion.criterionID}/status`);
            onUpdate();
        } catch (error) {
            console.error("Durum değiştirilirken hata oluştu:", error);
            alert("Kriter durumu değiştirilirken bir hata oluştu.");
        }
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditState(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        const payload = {
            title: editState.title,
            weight: parseFloat(editState.weight) || null,
            analystDescription: editState.analystDescription,
            developerDescription: editState.developerDescription,
            qaDescription: editState.qaDescription
        };

        try {
            await apiClient.put(`/api/criteria/${criterion.criterionID}`, payload);
            setIsEditing(false);
            onUpdate();
        } catch (error) {
            console.error("Güncelleme sırasında hata oluştu:", error);
            const errorMessage = error.response?.data?.message || "Kriter güncellenirken bir hata oluştu.";
            alert(errorMessage);
        }
    };

    // Görüntüleme Modu
    if (!isEditing) {
        const hasDescription = criterion.analystDescription || criterion.developerDescription || criterion.qaDescription;

        return (
            <li className={`criterion-item ${!criterion.isActive ? 'inactive' : ''}`}>
                
                
                <div className="criterion-header">
                    
                    <div className="criterion-title">
                        <strong>{criterion.title}</strong>
                    </div>

                    
                    <div className="criterion-details">
                        <span className="criterion-weight">
                            {criterion.weight ? `(Ağırlık: ${Number(criterion.weight)}%)` : ''}
                        </span>

                        
                        <div className="criterion-actions">
                            {!criterion.isActive && <span className="inactive-tag">(Pasif)</span>}
                            <div className="item-buttons">
                                <button onClick={handleToggleStatus} className="toggle-status-button">
                                    {criterion.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                                </button>
                                <button onClick={() => setIsEditing(true)} className="edit-button">Düzenle</button>
                            </div>
                        </div>
                    </div>
                </div>
                

                {criterion.parentCriterionID && hasDescription && (
                    <div className="criterion-descriptions">
                        {criterion.analystDescription && <p><strong>Analist:</strong> {criterion.analystDescription}</p>}
                        {criterion.developerDescription && <p><strong>Yazılımcı:</strong> {criterion.developerDescription}</p>}
                        {criterion.qaDescription && <p><strong>QA:</strong> {criterion.qaDescription}</p>}
                    </div>
                )}
                
                {criterion.subCriteria && criterion.subCriteria.length > 0 && (
                    <ul className="sub-criteria-list">
                        {criterion.subCriteria.map(subCriterion => (
                            <CriterionItem 
                                key={subCriterion.criterionID} 
                                criterion={subCriterion} 
                                onUpdate={onUpdate}
                            />
                        ))}
                    </ul>
                )}
            </li>
        );
    }

    // Düzenleme Modu
    return (
        <li className="criterion-item editing">
            <form onSubmit={handleUpdate} className="edit-form">
                <input type="text" name="title" value={editState.title} onChange={handleEditChange} required />
                <input type="number" name="weight" value={editState.weight} onChange={handleEditChange} placeholder="Ağırlık (%)" required />
                
                {criterion.parentCriterionID && (
                    <div className="description-fields">
                        <textarea name="developerDescription" value={editState.developerDescription} onChange={handleEditChange} placeholder="Yazılımcı Açıklaması" />
                        <textarea name="analystDescription" value={editState.analystDescription} onChange={handleEditChange} placeholder="Analist Açıklaması" />
                        <textarea name="qaDescription" value={editState.qaDescription} onChange={handleEditChange} placeholder="QA Açıklaması" />
                    </div>
                )}

                <div className="form-buttons">
                    <button type="submit">Kaydet</button>
                    <button type="button" onClick={() => setIsEditing(false)}>İptal</button>
                </div>
            </form>
        </li>
    );
};

export default CriterionItem;