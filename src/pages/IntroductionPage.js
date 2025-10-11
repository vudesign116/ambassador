import React from 'react';
import { useNavigate } from 'react-router-dom';



const IntroductionPage = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Quý Dược sĩ';

  const rewardLevels = [
    {
      title: 'Học Gia Trẻ',
      stars: '⭐⭐',
      threshold: '3.000 điểm/quý',
      gift: 'Máy sấy tóc Philips HP8108 1000W',
      color: '#FFD700',
    },
    {
      title: 'Chuyên Gia',
      stars: '⭐⭐⭐',
      threshold: '5.000 điểm/quý',
      gift: 'Quạt cầm tay tốc độ cao Shimono SM-HF18(W)',
      color: '#FF6B9D',
    },
  ];

  return (
    <div className="full-height" style={{ paddingBottom: '80px' }}>
      <div className="header-gradient">
        <div className="logo-circle logo-small">M</div>
        <h2 className="header-title">M.AMBASSADOR</h2>
      </div>

      <div className="container">
        <div className="card space-y-4">
          <h3 className="title-3">Xin chào {userName}!</h3>
          
          <p className="text-secondary">
            Cảm ơn Quý Dược sĩ đã tham gia chương trình{' '}
            <strong>M.Ambassador</strong> của MerapLion.
          </p>

          <p className="text-secondary">
            Với mong muốn xây dựng mối quan hệ bền vững và hỗ trợ thành lâu và quý Dược sĩ tự vận hiện thành trong chương trình chăm sóc sức khỏe gia đình Việt, <strong>MerapLion</strong> thấu hiểu rằng kiến thức chuyên môn chính là hành trang quan trọng giúp Quý Dược sĩ tư vấn hiệu quả và mang lại giá trị thiết thực cho bệnh nhân.
          </p>

          <p className="text-secondary">
            Chính vì vậy, chúng tôi không ngừng nỗ lực chia sẻ, hỗ trợ và tạo loạt kiến thức thông qua các hoạt động thực tiễn. Trên hành trình đó, <strong>MerapLion</strong> luôn ghi nhớ và theo dõi những giá trị đôi bạn – <strong>"Trách nhiệm – Đồng hành"</strong>, như lời cam kết bền chặt dành cho cộng đồng Dược sĩ Việt Nam.
          </p>

          <p className="text-secondary">
            Chương trình <strong>M.Ambassador</strong> không chỉ là nơi cung cấp những kiến thức hữu ích mà còn mang đến nhiều trải nghiệm giá trị.
          </p>

          <p className="text-secondary">
            Quý Dược sĩ hãy tích cực tra cứu, cập nhật kiến thức và tham gia tương tác để nâng cao chuyên môn, tận hưởng trải nghiệm giá trị thông qua hệ sinh thái phong phú dưới nhẻ.
          </p>
        </div>

        <h3 className="title-3">🎁 Đọc giá chăm chỉ:</h3>

        <p className="text-secondary" style={{ marginBottom: '24px' }}>
          Tiêu chí hạng quý: Top 50 Thành viên có số ngày tham gia tra cứu thư viện chuyên cân nhất (điểm tối thiểu là 3.000 điểm/quý), được chọn 1 món quà sau:
        </p>

        <div className="space-y-4">
          {rewardLevels.map((level, index) => (
            <div key={index} className="card">
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '48px', marginRight: '16px' }}>🏆</div>
                <div>
                  <h4 style={{ color: level.color, fontWeight: 'bold', margin: 0 }}>
                    {level.title}
                  </h4>
                  <p className="text-secondary" style={{ margin: 0, fontSize: '14px' }}>
                    {level.stars}
                  </p>
                </div>
              </div>
              
              <p className="text-secondary" style={{ marginBottom: '16px' }}>
                {level.threshold}
              </p>

              <div className="card" style={{ overflow: 'hidden' }}>
                <div
                  style={{
                    height: '140px',
                    background: 'linear-gradient(45deg, #f5f5f5 25%, transparent 25%), linear-gradient(-45deg, #f5f5f5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f5f5f5 75%), linear-gradient(-45deg, transparent 75%, #f5f5f5 75%)',
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <h4 className="text-secondary">📦 Gift Image</h4>
                </div>
                <div style={{ padding: '16px' }}>
                  <strong>{level.gift}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center" style={{ marginTop: '32px', marginBottom: '24px' }}>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/dashboard')}
            style={{ padding: '0 32px' }}
          >
            TIẾP TỤC
          </button>
        </div>
      </div>

      <button
        className="btn btn-primary btn-fixed"
        onClick={() => navigate('/dashboard')}
      >
        TIẾP TỤC
      </button>
    </div>
  );
};

export default IntroductionPage;