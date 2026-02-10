import React, { useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig';

const UserEditModal = ({ user, onClose, onUpdate }) => {
    const [roleId, setRoleId] = useState(user.roleID || '');
    const [departmentId, setDepartmentId] = useState(user.departmentID || '');

    // Bu listeler ileride API'dan çekilebilir.
    const [roles] = useState([
        { roleID: 1, roleName: 'Yönetici' },
        { roleID: 2, roleName: 'Değerlendirici' },
        { roleID: 3, roleName: 'Çalışan' },
    ]);
    const [departments] = useState([
        { departmentID: 1, departmentName: 'İş Analistleri' },
        { departmentID: 2, departmentName: 'Yazılımcılar' },
        { departmentID: 3, departmentName: 'QA/Test Uzmanları' },
    ]);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            roleID: parseInt(roleId),
            departmentID: parseInt(departmentId)
        };

        try {
            await apiClient.put(`/api/users/${user.userID}`, payload);
            onUpdate(); // Ana listeyi yenile
            onClose(); // Modal'ı kapat
        } catch (error) {
            console.error("Kullanıcı güncellenirken bir hata oluştu:", error);
            alert("Kullanıcı güncellenirken bir hata oluştu.");
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h3>Kullanıcıyı Düzenle: {user.firstName} {user.lastName}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="role">Rol:</label>
                        <select id="role" value={roleId} onChange={(e) => setRoleId(e.target.value)} required>
                            {roles.map(role => (
                                <option key={role.roleID} value={role.roleID}>
                                    {role.roleName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="department">Departman:</label>
                        <select id="department" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} required>
                            {departments.map(dep => (
                                <option key={dep.departmentID} value={dep.departmentID}>
                                    {dep.departmentName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="modal-actions">
                        <button type="submit" className="save-button">Kaydet</button>
                        <button type="button" onClick={onClose} className="cancel-button">İptal</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserEditModal;
