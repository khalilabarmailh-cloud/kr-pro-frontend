import React, { useState, useEffect } from 'react';

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [downloadInfo, setDownloadInfo] = useState(null);

  useEffect(() => {
    let interval;
    if (loading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => (prev >= 95 ? 95 : prev + 2));
      }, 500);
    } else if (downloadInfo) {
      setProgress(100);
    }
    return () => clearInterval(interval);
  }, [loading, downloadInfo]);

  const handleTranslate = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('file', file);
    
    // توجيه ذكي حسب نوع الملف
    const fileName = file.name.toLowerCase();
    let endpoint = '';
    let ext = '';
    
    if (fileName.endsWith('.pdf')) {
        endpoint = 'https://kr-pro-api.onrender.com/translate-pptx';
        ext = '.docx'; // الـ PDF بيرجع وورد
    } else if (fileName.endsWith('.docx')) {
        endpoint = 'https://kr-pro-api.onrender.com/translate-pptx';
        ext = '.docx';
    } else {
        endpoint = 'https://kr-pro-api.onrender.com/translate-pptx';
        ext = '.pptx';
    }

    try {
      const response = await fetch(endpoint, { method: 'POST', body: formData });
      if (!response.ok) throw new Error('تأكد من تشغيل السيرفر (الشاشة السوداء)');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // إزالة الامتداد القديم وإضافة الجديد
      const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      setDownloadInfo({ url, name: `KR_Pro_${baseName}${ext}` });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // تحديد الأيقونة حسب نوع الملف
  let fileIcon = '📥';
  if (file) {
    if (file.name.toLowerCase().endsWith('.pdf')) fileIcon = '📄';
    else if (file.name.toLowerCase().endsWith('.pptx')) fileIcon = '📊';
    else if (file.name.toLowerCase().endsWith('.docx')) fileIcon = '📝';
  }

  return (
    <div style={styles.appWrapper}>
      <style>{`
        html, body, #root { margin: 0 !important; padding: 0 !important; background-color: #050a07 !important; width: 100%; min-height: 100vh; }
        * { box-sizing: border-box; }
      `}</style>

      <div style={styles.contentContainer}>
        
        <header style={styles.header}>
          <span style={{ color: '#2d4c36', fontWeight: 'bold' }}>خليل | 2026</span>
          <div style={styles.logo}>KR Pro AI <span style={styles.badge}>KR</span></div>
        </header>

        <div style={styles.mainCard}>
          <div style={styles.uploadBox}>
            {/* أضفنا docx للأنواع المقبولة */}
            <label htmlFor="fileInput" style={{ cursor: loading ? 'not-allowed' : 'pointer', display: 'block' }}>
              <div style={styles.icon}>{fileIcon}</div>
              <h2 style={{ fontSize: '1.4rem', margin: '10px 0', color: '#fff' }}>
                {file ? file.name : 'اسحب الملف أو اضغط للاختيار'}
              </h2>
              <p style={{ color: '#2d4c36', fontSize: '0.9rem', margin: 0 }}>PPTX / DOCX / PDF تدعم ملفات</p>
            </label>
            <input type="file" id="fileInput" accept=".pptx, .pdf, .docx" onChange={(e) => {setFile(e.target.files[0]); setDownloadInfo(null); setError('');}} style={{ display: 'none' }} disabled={loading} />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          {(loading || downloadInfo) && (
            <div style={{ margin: '20px 0' }}>
              <div style={styles.progressBg}><div style={{ ...styles.progressFill, width: `${progress}%` }}></div></div>
              <p style={styles.statusText}>{downloadInfo ? '✅ تمت المعالجة بنجاح' : '⏳ جاري تحليل البيانات...'}</p>
            </div>
          )}

          {!downloadInfo ? (
            <button onClick={handleTranslate} disabled={!file || loading} style={{ ...styles.btn, backgroundColor: file && !loading ? '#1db954' : '#0a120d', color: file && !loading ? '#000' : '#2d4c36' }}>
              {loading ? 'الرجاء الانتظار...' : 'بدء الترجمة'}
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <a href={downloadInfo.url} download={downloadInfo.name} style={styles.downloadBtn}>⬇️ تحميل الملف</a>
              <button onClick={() => { setFile(null); setDownloadInfo(null); }} style={styles.resetBtn}>ملف جديد</button>
            </div>
          )}
        </div>

        <div style={styles.infoGrid}>
          <div style={styles.infoCard}>
            <h3 style={styles.infoTitle}>1. الرفع</h3>
            <p style={styles.infoDesc}>ارفع ملفك الأكاديمي.</p>
          </div>
          <div style={styles.infoCard}>
            <h3 style={styles.infoTitle}>2. الترجمة</h3>
            <p style={styles.infoDesc}>ذكاء يفهم التخصص.</p>
          </div>
          <div style={styles.infoCard}>
            <h3 style={styles.infoTitle}>3. النتيجة</h3>
            <p style={styles.infoDesc}>ملف منسق للدراسة.</p>
          </div>
        </div>

      </div>
    </div>
  );
}

const styles = {
  appWrapper: { minHeight: '100vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', fontFamily: 'sans-serif' },
  contentContainer: { width: '100%', maxWidth: '700px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  header: { width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '30px' },
  logo: { fontWeight: 'bold', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' },
  badge: { backgroundColor: '#1db954', color: '#000', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem' },
  mainCard: { backgroundColor: '#0c1410', padding: '40px', borderRadius: '24px', width: '100%', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' },
  uploadBox: { border: '2px dashed #1a2e23', borderRadius: '16px', padding: '40px 20px', marginBottom: '20px', transition: '0.3s' },
  icon: { fontSize: '4rem', marginBottom: '10px' },
  progressBg: { height: '8px', backgroundColor: '#050a07', borderRadius: '10px', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#1db954', transition: 'width 0.4s' },
  statusText: { fontSize: '0.9rem', color: '#4a7c59', marginTop: '10px' },
  btn: { width: '100%', padding: '16px', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem', transition: '0.3s' },
  downloadBtn: { flex: 2, backgroundColor: '#1db954', color: '#000', textDecoration: 'none', padding: '16px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  resetBtn: { flex: 1, backgroundColor: 'transparent', border: '1px solid #1a2e23', color: '#4a7c59', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' },
  error: { color: '#ff4d4d', fontSize: '0.9rem', marginBottom: '15px' },
  infoGrid: { display: 'flex', gap: '15px', marginTop: '40px', width: '100%', justifyContent: 'space-between' },
  infoCard: { backgroundColor: '#0c1410', padding: '20px', borderRadius: '16px', flex: 1, textAlign: 'center', border: '1px solid #1a2e23' },
  infoTitle: { color: '#1db954', fontSize: '1.1rem', margin: '0 0 8px 0' },
  infoDesc: { color: '#4a7c59', fontSize: '0.85rem', margin: 0 }
};

export default App;