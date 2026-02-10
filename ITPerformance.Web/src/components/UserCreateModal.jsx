import React,{useState} from 'react';
import apiClient from '../api/axiosConfig';
import toast from 'react-hot-toast';

const UserCreateModal = ({ onClose, onUpdate }) => {
    // --- GÜNCELLEME BURADA: Varsayılan değerleri kaldırıyoruz ---
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        roleID: '', // Varsayılan değeri boş string yapıyoruz
        departmentID: '' // Varsayılan değeri boş string yapıyoruz
    });
    const [error, setError] = useState('');

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const payload = {
            ...formData,
            roleID: parseInt(formData.roleID),
            departmentID: parseInt(formData.departmentID)
        };

        try {
            const toastId = toast.loading('Kullanıcı oluşturuluyor...');
            await apiClient.post('/api/users', payload);
            toast.success('Kullanıcı başarıyla oluşturuldu.' , {id:toastId});
            onUpdate();
            onClose();
        } catch (err) {
            const errorMessage = err.response?.data?.title || err.response?.data || "Kullanıcı oluşturulurken bir hata oluştu.";
            toast.error(errorMessage, { id: toastId });
            console.error("Kullanıcı oluşturma hatası:", err);
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h3>Yeni Kullanıcı Oluştur</h3>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>İsim:</label>
                        <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Soyisim:</label>
                        <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Email:</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Şifre:</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Rol:</label>
                        {/* --- GÜNCELLEME BURADA: Seçim için bir placeholder ekliyoruz --- */}
                        <select name="roleID" value={formData.roleID} onChange={handleChange} required>
                            <option value="" disabled>Lütfen bir rol seçin...</option>
                            {roles.map(role => (
                                <option key={role.roleID} value={role.roleID}>{role.roleName}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Departman:</label>
                        {/* --- GÜNCELLEME BURADA: Seçim için bir placeholder ekliyoruz --- */}
                        <select name="departmentID" value={formData.departmentID} onChange={handleChange} required>
                            <option value="" disabled>Lütfen bir departman seçin...</option>
                            {departments.map(dep => (
                                <option key={dep.departmentID} value={dep.departmentID}>{dep.departmentName}</option>
                            ))}
                        </select>
                    </div>
                    <div className="modal-actions">
                        <button type="submit" className="save-button">Oluştur</button>
                        <button type="button" onClick={onClose} className="cancel-button">İptal</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserCreateModal;
