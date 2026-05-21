document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================
    // 1. 유틸리티 및 테마 연동
    // ==========================================
    const themePicker = document.getElementById("theme-picker");
    const editTitle = document.getElementById("edit-title");
    const editDesc = document.getElementById("edit-desc");
    const bgTitleDisplay = document.getElementById("bg-title-display");
    const bgDescDisplay = document.getElementById("bg-desc-display");

    function hexToRgba(hex, alpha) {
        let r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    function applyThemeColor(hexColor) {
        document.documentElement.style.setProperty('--theme-color', hexColor);
        document.documentElement.style.setProperty('--theme-glow', hexToRgba(hexColor, 0.4));
    }

    // 타이핑 동기화
    function syncHeroText() {
        bgTitleDisplay.innerText = editTitle.innerText;
        bgDescDisplay.innerText = editDesc.innerText;
    }
    editTitle.addEventListener("input", syncHeroText);
    editDesc.addEventListener("input", syncHeroText);

    // ==========================================
    // 2. 무결점 데이터 저장소 (Local Storage) 엔진
    // ==========================================
    let autoSaveTimeout;

    // 이미지가 너무 커서 로컬 스토리지가 터지는 걸 막기 위한 압축기 (Canvas 활용)
    function compressImage(file, callback) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1200; // 최대 해상도 제한으로 용량 다이어트
                let width = img.width, height = img.height;
                if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                // JPEG 80% 퀄리티로 압축하여 반환
                callback(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // 사이트의 모든 상태를 긁어모아 저장하는 함수
    function saveState() {
        try {
            const state = {
                themeColor: themePicker.value,
                heroBadge: document.getElementById("edit-badge").innerText,
                heroTitle: editTitle.innerText,
                heroDesc: editDesc.innerText,
                bgControls: {
                    img: document.getElementById("hero-bg-layer").style.backgroundImage,
                    scale: document.getElementById("bg-scale").value,
                    rotate: document.getElementById("bg-rotate").value,
                    x: document.getElementById("bg-x").value,
                    y: document.getElementById("bg-y").value
                },
                episodes: Array.from(document.querySelectorAll('.episode-item')).map(item => ({
                    img: item.querySelector('.epi-thumbnail').style.backgroundImage,
                    title: item.querySelector('.epi-details h4').innerText,
                    runtime: item.querySelector('.epi-runtime').innerText,
                    desc: item.querySelector('.epi-desc').innerText
                })),
                chars: Array.from(document.querySelectorAll('.short-card')).map(item => ({
                    img: item.querySelector('.short-img').style.backgroundImage,
                    quote: item.querySelector('.short-info h4').innerText,
                    cv: item.querySelector('.cv-text').innerText
                }))
            };
            localStorage.setItem("archDataV2", JSON.stringify(state));
        } catch (e) {
            console.warn("용량 초과! 이미지가 너무 많습니다.", e);
        }
    }

    // 변화가 생길 때마다 0.5초 뒤에 자동 저장 (렉 방지)
    function triggerAutoSave() {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(saveState, 500);
    }

    // 모든 입력창(글자, 색상, 슬라이더)에 자동 저장 리스너 부착
    document.addEventListener("input", (e) => {
        if (e.target.isContentEditable || e.target.type === "range" || e.target.type === "color") {
            triggerAutoSave();
        }
    });

    // ==========================================
    // 3. 에피소드 & 캐릭터 HTML 빌더
    // ==========================================
    function createEpisodeHTML(data) {
        const item = document.createElement("article");
        item.className = "episode-item";
        item.innerHTML = `
            <button class="btn-delete btn-delete-epi ui-element">✕</button>
            <div class="epi-thumbnail bg-target upload-trigger" style="background-image: ${data.img || ''}">
                <input type="file" class="hidden-input" accept="image/*">
                <span class="upload-hint ui-element" style="opacity: ${data.img && data.img !== 'none' ? '0' : '1'}">+</span>
            </div>
            <div class="epi-details">
                <h4 contenteditable="true" spellcheck="false">${data.title}</h4>
                <p class="epi-runtime theme-text" contenteditable="true" spellcheck="false">${data.runtime}</p>
                <p class="epi-desc" contenteditable="true" spellcheck="false">${data.desc}</p>
            </div>
        `;
        return item;
    }

    function createCharHTML(data) {
        const item = document.createElement("div");
        item.className = "short-card";
        item.innerHTML = `
            <button class="btn-delete btn-delete-char ui-element">✕</button>
            <div class="short-img bg-target upload-trigger" style="background-image: ${data.img || ''}">
                <input type="file" class="hidden-input" accept="image/*">
                <span class="upload-hint ui-element" style="opacity: ${data.img && data.img !== 'none' ? '0' : '1'}">이미지 업로드</span>
            </div>
            <div class="short-info">
                <h4 contenteditable="true" spellcheck="false">${data.quote}</h4>
                <p class="cv-text theme-text" contenteditable="true" spellcheck="false">${data.cv}</p>
            </div>
        `;
        return item;
    }

    // ==========================================
    // 4. 초기화 시 저장된 데이터 불러오기 (Load)
    // ==========================================
    function loadState() {
        const saved = localStorage.getItem("archDataV2");
        if (saved) {
            const data = JSON.parse(saved);
            
            // 텍스트 및 색상 복구
            themePicker.value = data.themeColor || "#00f2fe";
            applyThemeColor(themePicker.value);
            document.getElementById("edit-badge").innerText = data.heroBadge || "ARCH EXCLUSIVE";
            editTitle.innerText = data.heroTitle || "";
            editDesc.innerText = data.heroDesc || "";
            syncHeroText();

            // 메인 배경 복구 및 컨트롤러 세팅
            if (data.bgControls && data.bgControls.img && data.bgControls.img !== "none") {
                const bgLayer = document.getElementById("hero-bg-layer");
                bgLayer.style.backgroundImage = data.bgControls.img;
                
                document.getElementById("bg-scale").value = data.bgControls.scale || 1;
                document.getElementById("bg-rotate").value = data.bgControls.rotate || 0;
                document.getElementById("bg-x").value = data.bgControls.x || 0;
                document.getElementById("bg-y").value = data.bgControls.y || 0;
                applyBgTransforms();

                document.getElementById("bg-upload-trigger").classList.add("hide-ui");
                document.getElementById("bg-controls").classList.remove("hide-ui");
            }

            // 에피소드 복구
            const epiList = document.getElementById("episode-list");
            epiList.innerHTML = "";
            if (data.episodes && data.episodes.length > 0) {
                data.episodes.forEach(epi => epiList.appendChild(createEpisodeHTML(epi)));
            } else { // 데이터가 비었으면 기본 1개 생성
                document.getElementById("add-epi-btn").click();
            }

            // 캐릭터 복구
            const charList = document.getElementById("shorts-container");
            charList.innerHTML = "";
            if (data.chars && data.chars.length > 0) {
                data.chars.forEach(char => charList.appendChild(createCharHTML(char)));
            } else {
                document.getElementById("add-char-btn").click();
            }
        } else {
            // 처음 온 유저를 위한 초기 생성
            applyThemeColor("#00f2fe");
            document.getElementById("add-epi-btn").click();
            document.getElementById("add-char-btn").click();
        }
    }

    // ==========================================
    // 5. 배경 이미지 에디터 로직 (스케일/회전/이동)
    // ==========================================
    const bgLayer = document.getElementById("hero-bg-layer");
    
    function applyBgTransforms() {
        const s = document.getElementById("bg-scale").value;
        const r = document.getElementById("bg-rotate").value;
        const x = document.getElementById("bg-x").value;
        const y = document.getElementById("bg-y").value;
        
        bgLayer.style.setProperty('--bg-scale', s);
        bgLayer.style.setProperty('--bg-rotate', r);
        bgLayer.style.setProperty('--bg-x', x);
        bgLayer.style.setProperty('--bg-y', y);
    }

    ['bg-scale', 'bg-rotate', 'bg-x', 'bg-y'].forEach(id => {
        document.getElementById(id).addEventListener('input', applyBgTransforms);
    });

    // 배경 삭제 버튼
    document.getElementById("bg-delete-btn").addEventListener("click", () => {
        bgLayer.style.backgroundImage = "none";
        document.getElementById("bg-scale").value = 1;
        document.getElementById("bg-rotate").value = 0;
        document.getElementById("bg-x").value = 0;
        document.getElementById("bg-y").value = 0;
        applyBgTransforms();
        
        document.getElementById("bg-controls").classList.add("hide-ui");
        document.getElementById("bg-upload-trigger").classList.remove("hide-ui");
        triggerAutoSave();
    });

    // 테마 피커 연동
    themePicker.addEventListener("input", (e) => applyThemeColor(e.target.value));

    // ==========================================
    // 6. 이미지 업로드 모듈 (압축 적용)
    // ==========================================
    document.addEventListener("click", (e) => {
        const trigger = e.target.closest(".upload-trigger");
        if (trigger && e.target.tagName !== "INPUT") {
            const fileInput = trigger.querySelector(".hidden-input");
            if (fileInput) fileInput.click();
        }
    });

    document.addEventListener("change", (e) => {
        if (e.target.classList.contains("hidden-input")) {
            const file = e.target.files[0];
            const targetElement = e.target.closest(".bg-target");
            const isMainHero = e.target.id === "hero-main-upload";

            if (file) {
                // 이미지를 리사이징 압축한 후 UI에 반영
                compressImage(file, (compressedDataUrl) => {
                    if (isMainHero) {
                        bgLayer.style.backgroundImage = `url('${compressedDataUrl}')`;
                        document.getElementById("bg-upload-trigger").classList.add("hide-ui");
                        document.getElementById("bg-controls").classList.remove("hide-ui");
                    } else if (targetElement) {
                        targetElement.style.backgroundImage = `url('${compressedDataUrl}')`;
                        const hint = targetElement.querySelector(".upload-hint");
                        if (hint) hint.style.opacity = "0";
                    }
                    triggerAutoSave();
                });
            }
            e.target.value = ''; // 같은 파일 다시 올릴 수 있게 초기화
        }
    });

    // ==========================================
    // 7. 추가 및 삭제 버튼 동작
    // ==========================================
    document.getElementById("add-epi-btn").addEventListener("click", () => {
        const list = document.getElementById("episode-list");
        const count = list.children.length + 1;
        list.appendChild(createEpisodeHTML({
            img: '', title: `제 ${count}화: 에피소드 제목`, runtime: '24min', desc: '새로운 시놉시스를 입력하세요.'
        }));
        triggerAutoSave();
    });

    document.getElementById("add-char-btn").addEventListener("click", () => {
        const list = document.getElementById("shorts-container");
        list.appendChild(createCharHTML({
            img: '', quote: '"캐릭터의 명대사를 입력하세요."', cv: 'CV. 성우 가상 캐스팅'
        }));
        setTimeout(() => { list.scrollTo({ left: list.scrollWidth, behavior: 'smooth' }); }, 50);
        triggerAutoSave();
    });

    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("btn-delete-char")) {
            e.target.closest(".short-card").remove();
            triggerAutoSave();
        } else if (e.target.classList.contains("btn-delete-epi")) {
            e.target.closest(".episode-item").remove();
            triggerAutoSave();
        }
    });

    // ==========================================
    // 8. 캡처 및 녹화 엔진
    // ==========================================
    const saveBtn = document.getElementById("save-btn");
    saveBtn.addEventListener("click", () => {
        if (document.activeElement) document.activeElement.blur(); 
        const originalText = saveBtn.innerText;
        saveBtn.innerText = "렌더링 중..."; saveBtn.disabled = true;

        const uiElements = document.querySelectorAll(".ui-element");
        uiElements.forEach(el => el.classList.add("hide-ui"));

        html2canvas(document.getElementById("capture-area"), {
            backgroundColor: "#050608", scale: 2, useCORS: true
        }).then((canvas) => {
            const link = document.createElement("a");
            link.href = canvas.toDataURL("image/png"); link.download = "ARCH_ORIGINAL.png";
            document.body.appendChild(link); link.click(); document.body.removeChild(link);
            uiElements.forEach(el => el.classList.remove("hide-ui"));
            saveBtn.innerText = originalText; saveBtn.disabled = false;
        }).catch(err => {
            console.error("캡처 에러:", err); alert("오류가 발생했습니다.");
            uiElements.forEach(el => el.classList.remove("hide-ui"));
            saveBtn.innerText = originalText; saveBtn.disabled = false;
        });
    });

    const recordBtn = document.getElementById("record-btn");
    let mediaRecorder, recordedChunks = [];
    recordBtn.addEventListener("click", async () => {
        if (mediaRecorder && mediaRecorder.state === "recording") { mediaRecorder.stop(); return; }
        try {
            alert("💡 안내: 녹화 팝업이 뜨면 [현재 탭]을 선택하고 '공유'를 눌러주세요!");
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: { preferCurrentTab: true, cursor: "never" }, audio: false });
            
            const uiElements = document.querySelectorAll(".ui-element");
            uiElements.forEach(el => el.classList.add("hide-ui"));
            recordBtn.classList.remove("hide-ui"); 
            recordBtn.classList.add("is-recording"); recordBtn.innerText = "⏹ 녹화 종료 및 저장";

            const stealthStyle = document.createElement("style");
            stealthStyle.id = "stealth-mode-style";
            stealthStyle.innerHTML = `
                #capture-area, #capture-area * { cursor: none !important; }
                *::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
                * { -ms-overflow-style: none !important; scrollbar-width: none !important; }
            `;
            document.head.appendChild(stealthStyle);

            mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
            recordedChunks = [];
            mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunks.push(e.data); };
            
            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none'; a.href = url; a.download = 'ARCH_ORIGINAL_ANIMATION.webm';
                document.body.appendChild(a); a.click();
                setTimeout(() => { document.body.removeChild(a); window.URL.revokeObjectURL(url); }, 100);
                stream.getTracks().forEach(track => track.stop());
                
                uiElements.forEach(el => el.classList.remove("hide-ui"));
                recordBtn.classList.remove("is-recording"); recordBtn.innerText = "🔴 움짤(WebM) 녹화";
                if (document.getElementById("stealth-mode-style")) document.getElementById("stealth-mode-style").remove();
            };

            stream.getVideoTracks()[0].onended = () => { if (mediaRecorder.state === "recording") mediaRecorder.stop(); };
            if (document.activeElement) document.activeElement.blur();
            setTimeout(() => { mediaRecorder.start(); }, 500);
        } catch (err) {
            console.error("녹화 취소/에러:", err); 
            if (document.getElementById("stealth-mode-style")) document.getElementById("stealth-mode-style").remove();
        }
    });

    // 9. 실행: 저장된 데이터 불러오기
    loadState();
});
