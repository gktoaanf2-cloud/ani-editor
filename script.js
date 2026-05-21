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

    function syncHeroText() {
        bgTitleDisplay.innerText = editTitle.innerText;
        bgDescDisplay.innerText = editDesc.innerText;
    }
    editTitle.addEventListener("input", syncHeroText);
    editDesc.addEventListener("input", syncHeroText);
    themePicker.addEventListener("input", (e) => applyThemeColor(e.target.value));

    // ==========================================
    // 2. 무결점 오토 세이브 (Local Storage)
    // ==========================================
    let autoSaveTimeout;
    const MAX_IMG_WIDTH = 1200;

    function compressImage(file, callback) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                let width = img.width, height = img.height;
                if (width > MAX_IMG_WIDTH) { height *= MAX_IMG_WIDTH / width; width = MAX_IMG_WIDTH; }
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                callback(canvas.toDataURL('image/jpeg', 0.9)); 
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function saveState() {
        try {
            const bgImgElement = document.getElementById("hero-bg-img");
            const state = {
                themeColor: themePicker.value,
                heroBadge: document.getElementById("edit-badge").innerText,
                heroTitle: editTitle.innerText,
                heroDesc: editDesc.innerText,
                bgControls: {
                    img: (bgImgElement.src && bgImgElement.src.startsWith('data:')) ? bgImgElement.src : "",
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
            console.warn("용량 초과! 이미지가 너무 큽니다.", e);
        }
    }

    function triggerAutoSave() {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(saveState, 500);
    }

    document.addEventListener("input", (e) => {
        if (e.target.isContentEditable || e.target.type === "range" || e.target.type === "color") {
            triggerAutoSave();
        }
    });

    // ==========================================
    // 3. HTML 빌더 (서브 레이어)
    // ==========================================
    function createEpisodeHTML(data) {
        const item = document.createElement("article");
        item.className = "episode-item";
        const bgStyle = (data.img && data.img !== 'none' && data.img !== 'url("")' && data.img.startsWith('url')) ? `background-image: ${data.img};` : '';
        item.innerHTML = `
            <button class="btn-delete btn-delete-epi ui-element">✕</button>
            <div class="epi-thumbnail bg-target upload-trigger" style="${bgStyle}">
                <input type="file" class="hidden-input" accept="image/*">
                <span class="upload-hint ui-element" style="opacity: ${bgStyle ? '0' : '1'}">+</span>
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
        const bgStyle = (data.img && data.img !== 'none' && data.img !== 'url("")' && data.img.startsWith('url')) ? `background-image: ${data.img};` : '';
        item.innerHTML = `
            <button class="btn-delete btn-delete-char ui-element">✕</button>
            <div class="short-img bg-target upload-trigger" style="${bgStyle}">
                <input type="file" class="hidden-input" accept="image/*">
                <span class="upload-hint ui-element" style="opacity: ${bgStyle ? '0' : '1'}">이미지 업로드</span>
            </div>
            <div class="short-info">
                <h4 contenteditable="true" spellcheck="false">${data.quote}</h4>
                <p class="cv-text theme-text" contenteditable="true" spellcheck="false">${data.cv}</p>
            </div>
        `;
        return item;
    }

    // ==========================================
    // 4. 🔥 메인 배경 에디터 패널 (자유 트랜스폼) 🔥
    // ==========================================
    const bgImgElement = document.getElementById("hero-bg-img");
    const bgUploadBtn = document.getElementById("bg-upload-btn");
    const mainUploadInput = document.getElementById("hero-main-upload");
    const bgUploadTrigger = document.getElementById("bg-upload-trigger");
    const bgControls = document.getElementById("bg-controls");

    function applyBgTransforms() {
        const s = document.getElementById("bg-scale").value;
        const r = document.getElementById("bg-rotate").value;
        const x = document.getElementById("bg-x").value;
        const y = document.getElementById("bg-y").value;
        
        // CSS 변수에 값을 전달하여 원본 이미지 태그가 잘리지 않고 실시간 변형되도록 처리
        bgImgElement.style.setProperty('--bg-scale', s);
        bgImgElement.style.setProperty('--bg-rotate', r);
        bgImgElement.style.setProperty('--bg-x', x);
        bgImgElement.style.setProperty('--bg-y', y);
    }

    ['bg-scale', 'bg-rotate', 'bg-x', 'bg-y'].forEach(id => {
        document.getElementById(id).addEventListener('input', applyBgTransforms);
    });

    bgUploadBtn.addEventListener("click", () => {
        mainUploadInput.click();
    });

    mainUploadInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            compressImage(file, (compressedDataUrl) => {
                bgImgElement.src = compressedDataUrl;
                bgImgElement.style.display = "block"; // 숨겨뒀던 이미지를 나타나게 함
                bgUploadTrigger.classList.add("hide-ui");
                bgControls.classList.remove("hide-ui");
                triggerAutoSave();
            });
        }
        e.target.value = "";
    });

    document.getElementById("bg-delete-btn").addEventListener("click", () => {
        bgImgElement.src = "";
        bgImgElement.style.display = "none";
        document.getElementById("bg-scale").value = 1;
        document.getElementById("bg-rotate").value = 0;
        document.getElementById("bg-x").value = 0;
        document.getElementById("bg-y").value = 0;
        applyBgTransforms();
        bgControls.classList.add("hide-ui");
        bgUploadTrigger.classList.remove("hide-ui");
        triggerAutoSave();
    });

    // ==========================================
    // 5. 캐릭터 및 에피소드 업로드 (충돌 방지 로직 적용)
    // ==========================================
    document.addEventListener("click", (e) => {
        const trigger = e.target.closest(".upload-trigger");
        if (trigger && trigger.id !== "bg-upload-trigger" && e.target.tagName !== "INPUT" && e.target.tagName !== "BUTTON") {
            const fileInput = trigger.querySelector(".hidden-input");
            if (fileInput) fileInput.click();
        }
    });

    document.addEventListener("change", (e) => {
        if (e.target.classList.contains("hidden-input") && e.target.id !== "hero-main-upload") {
            const file = e.target.files[0];
            const targetElement = e.target.closest(".bg-target");
            if (file && targetElement) {
                compressImage(file, (compressedDataUrl) => {
                    targetElement.style.backgroundImage = `url('${compressedDataUrl}')`;
                    targetElement.style.backgroundSize = "cover";
                    targetElement.style.backgroundPosition = "center";
                    const hint = targetElement.querySelector(".upload-hint");
                    if (hint) hint.style.opacity = "0";
                    triggerAutoSave();
                });
            }
            e.target.value = ''; 
        }
    });

    // ==========================================
    // 6. 데이터 로드 (초기 렌더링)
    // ==========================================
    function loadState() {
        const saved = localStorage.getItem("archDataV2");
        if (saved) {
            const data = JSON.parse(saved);
            
            themePicker.value = data.themeColor || "#00f2fe";
            applyThemeColor(themePicker.value);
            document.getElementById("edit-badge").innerText = data.heroBadge || "ARCH EXCLUSIVE";
            editTitle.innerText = data.heroTitle || "";
            editDesc.innerText = data.heroDesc || "";
            syncHeroText();

            // 메인 배경 로드
            if (data.bgControls && data.bgControls.img && data.bgControls.img !== "") {
                bgImgElement.src = data.bgControls.img;
                bgImgElement.style.display = "block";
                
                document.getElementById("bg-scale").value = data.bgControls.scale || 1;
                document.getElementById("bg-rotate").value = data.bgControls.rotate || 0;
                document.getElementById("bg-x").value = data.bgControls.x || 0;
                document.getElementById("bg-y").value = data.bgControls.y || 0;
                applyBgTransforms();

                bgUploadTrigger.classList.add("hide-ui");
                bgControls.classList.remove("hide-ui");
            }

            const epiList = document.getElementById("episode-list");
            epiList.innerHTML = "";
            if (data.episodes && data.episodes.length > 0) {
                data.episodes.forEach(epi => epiList.appendChild(createEpisodeHTML(epi)));
            } else { document.getElementById("add-epi-btn").click(); }

            const charList = document.getElementById("shorts-container");
            charList.innerHTML = "";
            if (data.chars && data.chars.length > 0) {
                data.chars.forEach(char => charList.appendChild(createCharHTML(char)));
            } else { document.getElementById("add-char-btn").click(); }
        } else {
            // 완전 첫 접속 시 기본 세팅
            applyThemeColor("#00f2fe");
            document.getElementById("add-epi-btn").click();
            document.getElementById("add-char-btn").click();
        }
    }

    // ==========================================
    // 7. 추가/삭제 버튼 동작
    // ==========================================
    document.getElementById("add-epi-btn").addEventListener("click", () => {
        const list = document.getElementById("episode-list");
        const count = list.children.length + 1;
        list.appendChild(createEpisodeHTML({ img: '', title: `제 ${count}화: 에피소드 제목`, runtime: '24min', desc: '새로운 시놉시스를 입력하세요.' }));
        triggerAutoSave();
    });

    document.getElementById("add-char-btn").addEventListener("click", () => {
        const list = document.getElementById("shorts-container");
        list.appendChild(createCharHTML({ img: '', quote: '"캐릭터의 명대사를 입력하세요."', cv: 'CV. 성우 가상 캐스팅' }));
        setTimeout(() => { list.scrollTo({ left: list.scrollWidth, behavior: 'smooth' }); }, 50);
        triggerAutoSave();
    });

    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("btn-delete-char")) {
            e.target.closest(".short-card").remove(); triggerAutoSave();
        } else if (e.target.classList.contains("btn-delete-epi")) {
            e.target.closest(".episode-item").remove(); triggerAutoSave();
        }
    });

    // ==========================================
    // 8. 캡처 및 화면 녹화 스텔스 엔진
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

    // 9. 실행 시작
    loadState();
});
