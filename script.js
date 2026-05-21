document.addEventListener("DOMContentLoaded", () => {
    
    // 1. 실시간 텍스트 동기화
    const editTitle = document.getElementById("edit-title");
    const editDesc = document.getElementById("edit-desc");
    const bgTitleDisplay = document.getElementById("bg-title-display");
    const bgDescDisplay = document.getElementById("bg-desc-display");

    editTitle.addEventListener("input", () => { bgTitleDisplay.innerText = editTitle.innerText; });
    editDesc.addEventListener("input", () => { bgDescDisplay.innerText = editDesc.innerText; });

    // 2. 테마 컬러 실시간 연동
    const themePicker = document.getElementById("theme-picker");
    function hexToRgba(hex, alpha) {
        let r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    themePicker.addEventListener("input", (e) => {
        const hexColor = e.target.value;
        document.documentElement.style.setProperty('--theme-color', hexColor);
        document.documentElement.style.setProperty('--theme-glow', hexToRgba(hexColor, 0.4));
    });

    // 3. 수정됨: 이미지 업로드 버그 완벽 해결
    document.addEventListener("click", (e) => {
        const trigger = e.target.closest(".upload-trigger");
        // 버튼(BUTTON) 막던 멍청한 조건 삭제, 인풋(INPUT)만 아니면 업로드창 열림
        if (trigger && e.target.tagName !== "INPUT") {
            const fileInput = trigger.querySelector(".hidden-input");
            if (fileInput) fileInput.click();
        }
    });

    document.addEventListener("change", (e) => {
        if (e.target.classList.contains("hidden-input")) {
            const file = e.target.files[0];
            const targetElement = e.target.closest(".bg-target") || e.target.closest("#hero-bg");
            if (file && targetElement) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    targetElement.style.backgroundImage = `url('${event.target.result}')`;
                    targetElement.style.backgroundSize = "cover";
                    targetElement.style.backgroundPosition = "center";
                    const hint = targetElement.querySelector(".upload-hint");
                    const uploadBtn = targetElement.querySelector(".hero-upload-ui");
                    if (hint) hint.style.opacity = "0";
                    if (uploadBtn) uploadBtn.style.display = "none"; 
                };
                reader.readAsDataURL(file);
            }
        }
    });

    // 4. 에피소드 및 캐릭터 동적 추가
    document.getElementById("add-epi-btn").addEventListener("click", () => {
        const list = document.getElementById("episode-list");
        const newEpi = document.createElement("article");
        newEpi.className = "episode-item";
        newEpi.innerHTML = `
            <button class="btn-delete btn-delete-epi ui-element">✕</button>
            <div class="epi-thumbnail bg-target upload-trigger">
                <input type="file" class="hidden-input" accept="image/*">
                <span class="upload-hint ui-element">+</span>
            </div>
            <div class="epi-details">
                <h4 contenteditable="true" spellcheck="false">제 ${list.children.length + 1}화: 에피소드 제목</h4>
                <p class="epi-runtime theme-text" contenteditable="true" spellcheck="false">24min</p>
                <p class="epi-desc" contenteditable="true" spellcheck="false">새로운 에피소드의 시놉시스나 연성 내용을 입력하세요.</p>
            </div>
        `;
        list.appendChild(newEpi);
    });

    document.getElementById("add-char-btn").addEventListener("click", () => {
        const list = document.getElementById("shorts-container");
        const newChar = document.createElement("div");
        newChar.className = "short-card";
        newChar.innerHTML = `
            <button class="btn-delete btn-delete-char ui-element">✕</button>
            <div class="short-img bg-target upload-trigger">
                <input type="file" class="hidden-input" accept="image/*">
                <span class="upload-hint ui-element">이미지 업로드</span>
            </div>
            <div class="short-info">
                <h4 contenteditable="true" spellcheck="false">"캐릭터의 명대사를 입력하세요."</h4>
                <p class="cv-text theme-text" contenteditable="true" spellcheck="false">CV. 성우 가상 캐스팅</p>
            </div>
        `;
        list.appendChild(newChar);
        setTimeout(() => { list.scrollTo({ left: list.scrollWidth, behavior: 'smooth' }); }, 50);
    });

    // 5. 항목 삭제
    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("btn-delete-char")) {
            e.target.closest(".short-card").remove();
        } else if (e.target.classList.contains("btn-delete-epi")) {
            e.target.closest(".episode-item").remove();
        }
    });

    // 6. 이미지 캡처 (PNG)
    const saveBtn = document.getElementById("save-btn");
    saveBtn.addEventListener("click", () => {
        if (document.activeElement) document.activeElement.blur(); 
        const originalText = saveBtn.innerText;
        saveBtn.innerText = "렌더링 중...";
        saveBtn.disabled = true;

        const uiElements = document.querySelectorAll(".ui-element");
        uiElements.forEach(el => el.classList.add("hide-ui"));

        html2canvas(document.getElementById("capture-area"), {
            backgroundColor: "#050608", scale: 2, useCORS: true
        }).then((canvas) => {
            const link = document.createElement("a");
            link.href = canvas.toDataURL("image/png");
            link.download = "ARCH_ORIGINAL.png";
            document.body.appendChild(link); link.click(); document.body.removeChild(link);
            uiElements.forEach(el => el.classList.remove("hide-ui"));
            saveBtn.innerText = originalText; saveBtn.disabled = false;
        }).catch(err => {
            console.error("캡처 에러:", err); alert("오류가 발생했습니다.");
            uiElements.forEach(el => el.classList.remove("hide-ui"));
            saveBtn.innerText = originalText; saveBtn.disabled = false;
        });
    });

// 7. 움짤(WebM) 동영상 화면 녹화 (마우스 & 스크롤바 완벽 숨김 패치)
    const recordBtn = document.getElementById("record-btn");
    let mediaRecorder;
    let recordedChunks = [];

    recordBtn.addEventListener("click", async () => {
        if (mediaRecorder && mediaRecorder.state === "recording") { mediaRecorder.stop(); return; }
        try {
            alert("💡 안내: 녹화가 시작되면 뜨는 팝업에서 [현재 탭]을 선택하고 '공유'를 눌러주세요!");
            
            // 영상 자체에서 마우스 커서 영구 제명
            const stream = await navigator.mediaDevices.getDisplayMedia({ 
                video: { preferCurrentTab: true, cursor: "never" }, 
                audio: false 
            });
            
            // UI 숨김 및 버튼 상태 변경
            const uiElements = document.querySelectorAll(".ui-element");
            uiElements.forEach(el => el.classList.add("hide-ui"));
            recordBtn.classList.remove("hide-ui"); 
            recordBtn.classList.add("is-recording");
            recordBtn.innerText = "⏹ 녹화 종료 및 저장";

            // 🔥 패치 1: 사이트 내 마우스 커서 숨김
            document.body.style.cursor = "none";
            
            // 🔥 패치 2: 스크롤바 완벽 삭제 마법 (녹화 중에만 강제 스타일 주입)
            const noScrollStyle = document.createElement("style");
            noScrollStyle.id = "hide-scrollbar-style";
            noScrollStyle.innerHTML = `
                *::-webkit-scrollbar { display: none !important; }
                * { -ms-overflow-style: none !important; scrollbar-width: none !important; }
            `;
            document.head.appendChild(noScrollStyle);

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
                
                // UI 원상 복구
                uiElements.forEach(el => el.classList.remove("hide-ui"));
                recordBtn.classList.remove("is-recording");
                recordBtn.innerText = "🔴 움짤(WebM) 녹화";
                
                // 🔥 복구: 마우스 커서 및 스크롤바 다시 보이게 하기
                document.body.style.cursor = "auto";
                const styleToRemove = document.getElementById("hide-scrollbar-style");
                if (styleToRemove) styleToRemove.remove();
            };

            // 사용자가 강제로 공유를 중지했을 때의 방어 로직
            stream.getVideoTracks()[0].onended = () => { 
                if (mediaRecorder.state === "recording") mediaRecorder.stop(); 
            };

            if (document.activeElement) document.activeElement.blur();
            setTimeout(() => { mediaRecorder.start(); }, 500);
        } catch (err) {
            console.error("녹화 취소/에러:", err); 
            alert("녹화가 취소되었거나 지원하지 않는 브라우저입니다.");
            
            // 에러 시에도 마우스와 스크롤바는 복구해줘야 함
            document.body.style.cursor = "auto"; 
            const styleToRemove = document.getElementById("hide-scrollbar-style");
            if (styleToRemove) styleToRemove.remove();
        }
    });
