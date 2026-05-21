/* 글로벌 테마 변수 */
:root {
    --theme-color: #00f2fe; 
    --theme-glow: rgba(0, 242, 254, 0.4); 
    --bg-deep: #050608;
    --bg-panel: rgba(18, 20, 28, 0.65);
}

/* 프리텐다드 폰트 강제 고정 */
* { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Pretendard', sans-serif !important; }
body { background-color: var(--bg-deep); color: #ffffff; overflow-x: hidden; }

/* 캡처 영역 설정 (애니메이션을 품기 위한 기준점) */
#capture-area { position: relative; width: 100%; min-height: 100vh; overflow: hidden; background-color: var(--bg-deep); }

/* 🔥 움직이는 전자 회선(Circuit) 배경 애니메이션 🔥 */
.circuit-bg {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; pointer-events: none;
    /* 회로도 패턴 생성 */
    background-image: 
        linear-gradient(var(--theme-glow) 1px, transparent 1px),
        linear-gradient(90deg, var(--theme-glow) 1px, transparent 1px);
    background-size: 60px 60px; /* 격자 크기 */
    opacity: 0.15;
    animation: grid-move 20s linear infinite;
}
/* 스캔라인 (위아래로 움직이는 레이저 빔 효과) */
.circuit-bg::after {
    content: ""; position: absolute; top: -50%; left: 0; width: 100%; height: 25vh;
    background: linear-gradient(to bottom, transparent, var(--theme-color), transparent);
    opacity: 0.15; animation: scanline 8s linear infinite;
}
@keyframes grid-move { 0% { background-position: 0 0; } 100% { background-position: 60px 60px; } }
@keyframes scanline { 0% { top: -30%; } 100% { top: 120%; } }

/* 테마 유틸리티 */
.theme-text { color: var(--theme-color) !important; text-shadow: 0 0 10px var(--theme-glow); }
.theme-border { border-color: var(--theme-color) !important; box-shadow: inset 0 0 10px var(--theme-glow), 0 0 10px var(--theme-glow); }

/* 네비게이션 */
.navbar {
    position: fixed; top: 0; width: 100%; height: 70px;
    display: flex; justify-content: space-between; align-items: center;
    padding: 0 40px; background: rgba(5, 6, 8, 0.85); backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05); z-index: 1000;
}
.nav-left { display: flex; align-items: center; gap: 30px; }
.logo { font-size: 24px; font-weight: 900; letter-spacing: 2px; }

/* 컬러 휠 디테일 */
.color-picker-wrapper { display: flex; align-items: center; gap: 10px; font-size: 12px; font-weight: 700; color: #888; }
#theme-picker { -webkit-appearance: none; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; background: transparent; box-shadow: 0 0 12px var(--theme-glow); }
#theme-picker::-webkit-color-swatch-wrapper { padding: 0; }
#theme-picker::-webkit-color-swatch { border: 2px solid #fff; border-radius: 50%; }

/* 버튼 류 (줄바꿈 방지 적용) */
.btn-primary { background: var(--theme-color); color: #000; font-weight: 800; padding: 12px 28px; border: none; border-radius: 30px; cursor: pointer; box-shadow: 0 0 20px var(--theme-glow); transition: 0.3s; white-space: nowrap; }
.btn-primary:hover { filter: brightness(1.2); transform: translateY(-2px); }
.btn-secondary { background: transparent; color: #fff; padding: 12px 28px; border: 1px solid #fff; border-radius: 30px; font-weight: 800; cursor: pointer; white-space: nowrap; }
.btn-glass { background: rgba(255, 255, 255, 0.05); color: #fff; border: 1px solid rgba(255, 255, 255, 0.1); padding: 8px 16px; border-radius: 20px; font-weight: 700; font-size: 13px; cursor: pointer; transition: 0.2s; backdrop-filter: blur(4px); white-space: nowrap; flex-shrink: 0; }
.btn-glass:hover { background: rgba(255, 255, 255, 0.15); border-color: var(--theme-color); }

/* 1. 상단 히어로 배너 */
.hero-section { position: relative; height: 60vh; margin-top: 70px; background: #11131a; display: flex; align-items: flex-end; padding: 60px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); z-index: 10; }
.hero-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to top, var(--bg-deep) 0%, rgba(5,6,8,0.3) 100%); }
.hero-upload-ui { position: absolute; top: 30px; right: 40px; z-index: 20; }
.hero-content { position: relative; z-index: 10; max-width: 800px; }
.badge { padding: 6px 14px; font-size: 12px; font-weight: 900; border-radius: 20px; background: rgba(0,0,0,0.4); display: inline-block; margin-bottom: 16px; }
.anime-title { font-size: 48px; font-weight: 900; margin-bottom: 16px; text-shadow: 0 4px 15px rgba(0,0,0,0.8); }
.anime-synopsis { font-size: 16px; line-height: 1.7; color: #cbd0e1; margin-bottom: 30px; text-shadow: 0 2px 10px rgba(0,0,0,0.8); }
.hero-buttons { display: flex; gap: 15px; }

/* 2. 메인 2단 그리드 */
.main-content-grid {
    display: grid; 
    grid-template-columns: 1fr 1fr; /* 반반 비율로 안정적 분배 */
    gap: 40px; padding: 40px 60px; max-width: 1800px; margin: 0 auto;
    align-items: start; position: relative; z-index: 10;
}

/* 패널 공통 */
.panel-section { background: var(--bg-panel); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 32px; padding: 35px; box-shadow: 0 15px 40px rgba(0,0,0,0.4); }
/* 버튼 깨짐 방지를 위해 flex-wrap 추가 */
.panel-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 30px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding-bottom: 15px; }
.section-title { font-size: 20px; font-weight: 900; letter-spacing: 1px; flex-grow: 1; }

/* [좌측] 에피소드 리스트 */
.episode-list { display: flex; flex-direction: column; gap: 20px; }
.episode-item { display: flex; gap: 20px; padding: 16px; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.03); border-radius: 20px; transition: 0.3s; }
.episode-item:hover { border-color: var(--theme-color); background: rgba(255, 255, 255, 0.05); box-shadow: 0 0 15px var(--theme-glow); }
.epi-thumbnail { width: 160px; height: 90px; border-radius: 12px; background: #181a25; flex-shrink: 0; position: relative; overflow: hidden; }
.epi-details { display: flex; flex-direction: column; justify-content: center; }
.epi-details h4 { font-size: 16px; font-weight: 800; margin-bottom: 6px; }
.epi-runtime { font-size: 13px; font-weight: 700; margin-bottom: 6px; }
.epi-desc { font-size: 14px; color: #a4a9c6; line-height: 1.6; }

/* [우측] 캐릭터 PV 리스트 (오른쪽으로 무한 스와이프 기능) */
.shorts-container {
    display: flex; flex-direction: row; gap: 20px;
    overflow-x: auto; /* 가로 스크롤 활성화 */
    overflow-y: hidden;
    padding-bottom: 15px; /* 스크롤바 공간 확보 */
}
/* SF 느낌의 커스텀 스크롤바 */
.shorts-container::-webkit-scrollbar { height: 8px; }
.shorts-container::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 4px; }
.shorts-container::-webkit-scrollbar-thumb { background: var(--theme-color); border-radius: 4px; }

/* 세로로 길쭉한 숏츠 비율의 캐릭터 카드 */
.short-card {
    width: 220px; /* 고정 가로폭 (카드가 늘어나지 않음) */
    flex-shrink: 0; /* 카드가 찌그러지는 것을 방지 */
    display: flex; flex-direction: column;
    background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.03);
    border-radius: 24px; overflow: hidden; transition: 0.3s;
}
.short-card:hover { border-color: var(--theme-color); box-shadow: 0 0 20px var(--theme-glow); transform: translateY(-4px); }
.short-img { height: 320px; background: #181a25; position: relative; flex-shrink: 0; }
.short-info { padding: 20px; background: linear-gradient(to top, rgba(18,20,28,1), rgba(18,20,28,0.4)); flex-grow: 1; }
.short-info h4 { font-size: 15px; font-weight: 800; margin-bottom: 10px; font-style: italic; line-height: 1.5; color: #e2e5f5; }
.cv-text { font-size: 13.5px; font-weight: 800; letter-spacing: 0.5px; }

/* 기타 유틸리티 */
.hidden-input { display: none; }
.upload-trigger { cursor: pointer; }
.upload-hint { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; color: rgba(255, 255, 255, 0.5); font-size: 14px; font-weight: 700; background: rgba(0,0,0,0.2); transition: 0.3s; }
.upload-trigger:hover .upload-hint { background: rgba(0,0,0,0.5); color: #fff; }
[contenteditable="true"] { outline: none; transition: 0.2s; border-radius: 6px; }
[contenteditable="true"]:hover { background: rgba(255, 255, 255, 0.05); }
[contenteditable="true"]:focus { background: rgba(255, 255, 255, 0.1); box-shadow: 0 0 0 1px var(--theme-color); }
.hide-ui { display: none !important; }
