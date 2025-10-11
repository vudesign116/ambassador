import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!phoneNumber.trim()) {
      setError('Vui lòng nhập số điện thoại');
      return;
    }

    // Validate phone number format
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneRegex.test(phoneNumber)) {
      setError('Số điện thoại không hợp lệ');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simulate API call to check phone number
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, accept any valid phone number
      // In real app, you would call Firebase/API here
      localStorage.setItem('phoneNumber', phoneNumber);
      localStorage.setItem('userName', 'Quý Dược sĩ Hoàng'); // Demo name
      navigate('/introduction');
    } catch (err) {
      setError('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="full-height" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="banner-box">
        <div className="cherry-blossoms">🌸🌸🌸</div>
        <div className="mountain-silhouette"></div>
        <h1 className="banner-title">meraplion</h1>
      </div>

      <div className="container">
        <div className="card card-elevated">
          <div className="logo-container">
            <div className="logo-circle">M</div>
            <h2 className="title-2 text-primary-color">meraplion</h2>
            <p className="text-secondary text-center">
              Tận tâm vì sức khỏe mỗi gia đình
            </p>
          </div>

          <div className="space-y-6">
            <p className="text-center text-secondary">
              *Vui lòng nhập SĐT cho lần đăng nhập đầu tiên
            </p>

            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            <input
              className="input"
              placeholder="Nhập số điện thoại"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              type="tel"
            />

            <button
              className="btn btn-primary btn-block"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? 'ĐANG XỬ LÝ...' : 'TIẾP TỤC'}
            </button>

            <div className="text-center">
              <button
                className="btn-link"
                onClick={() => navigate('/contact')}
              >
                Liên hệ CSKH
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;