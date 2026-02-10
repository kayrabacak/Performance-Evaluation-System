import React, { useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig';
import UserEditModal from './UserEditModal';
import UserCreateModal from './UserCreateModal';
import './AdminPanel.css';
import toast from 'react-hot-toast';

const UserAdminPage = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [editingUser, setEditingUser] = useState(null);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const response = await apiClient.get('/api/users');
            setUsers(response.data);
            setError('');
        } catch (err) {
            setError('Kullanıcılar yüklenirken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleToggleStatus = async (userId) => {

        const toastID = toast.loading('Kullanıcı durumu güncelleniyor...');

        try {
            await apiClient.patch(`/api/users/${userId}/status`);
            fetchUsers();
            toast.success('Kullanıcı durumu başarıyla güncellendi.',{id:toastID});
        } catch (error) {
            toast.error('Durum değiştirilirken bir hata oluştu.', { id: toastId });
            console.error("Kullanıcı durumu değiştirilirken hata oluştu:", error);
        }
    };

    if (isLoading) return <p>Kullanıcılar Yükleniyor...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="module-page-container">
            <div className="module-header">
                <h2>Kullanıcı Yönetimi</h2>
                <button onClick={() => setCreateModalOpen(true)} className="add-button">
                    + Yeni Kullanıcı Ekle
                </button>
            </div>
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Adı Soyadı</th>
                            <th>Email</th>
                            <th>Departman</th>
                            <th>Rol</th>
                            <th>Durum</th>
                            <th className="actions-column">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.userID}>
                                <td>{user.userID}</td>
                                <td>{user.firstName} {user.lastName}</td>
                                <td>{user.email}</td>
                                <td>{user.departmentName}</td>
                                <td>{user.roleName}</td>
                                <td>
                                    <span className={`status-tag ${user.isActive ? 'active' : 'inactive'}`}>
                                        {user.isActive ? 'Aktif' : 'Pasif'}
                                    </span>
                                </td>
                                <td className="action-buttons">
                                    <button onClick={() => setEditingUser(user)} className="action-button edit">Düzenle</button>
                                    <button 
                                        onClick={() => handleToggleStatus(user.userID)} 
                                        className={`action-button ${user.isActive ? 'deactivate' : 'activate'}`}
                                    >
                                        {user.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {editingUser && (
                <UserEditModal 
                    user={editingUser} 
                    onClose={() => setEditingUser(null)} 
                    onUpdate={fetchUsers} 
                />
            )}

            {isCreateModalOpen && (
                <UserCreateModal
                    onClose={() => setCreateModalOpen(false)}
                    onUpdate={fetchUsers}
                />
            )}
        </div>
    );
};

export default UserAdminPage;
