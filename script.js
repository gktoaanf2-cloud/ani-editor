document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================
    // 🔥 신규: 입력한 텍스트를 배경 포스터에 실시간 동기화
    // ==========================================
    const editTitle = document.getElementById("edit-title");
    const editDesc = document.getElementById("edit-desc");
    const bgTitleDisplay = document.getElementById("bg-title-display");
    const bgDescDisplay = document.getElementById("bg-desc-display");

    // 제목을 수정할 때마다 배경 텍스트 변경
    editTitle.addEventListener("input", () => {
        bgTitleDisplay.innerText = editTitle.innerText;
    });

    // 시놉시스를 수정할 때마다 배경 서브타이틀 변경
    editDesc.addEventListener("input", () => {
        bgDescDisplay.innerText = editDesc.innerText;
    });

    // (아래부터는 기존의 테마 컬러 연동, 무한 증식, 캡처, 녹화 코드 그대로 유지!)
    // ...
    const themePicker = document.getElementById("theme-picker");
    
    function hexToRgba(hex, alpha) {
        let r = parseInt(hex.slice(1, 3), 16);
        let g = parseInt(hex.slice(3, 5), 16);
        let b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    themePicker.addEventListener("input", (e) => {
        const hexColor = e.target.value;
        const glowColor = hexToRgba(hexColor, 0.4); 
        
        document.documentElement.style.setProperty('--theme-color', hexColor);
        document.documentElement.style.setProperty('--theme-glow', glowColor);
    });

    document.addEventListener("click", (e) => {
        const trigger = e.target.closest(".upload-trigger");
        if (trigger && e.target.tagName !== "INPUT" && e.target.tagName !== "BUTTON") {
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

    document.getElementById("add-epi-btn").addEventListener("click", () => {
        const list = document.getElementById("episode-list");
        const newEpi = document.createElement("article");
        newEpi.className = "episode-item";
        newEpi.innerHTML = `
            <div class="epi-thumbnail bg-target upload-trigger">
                <input type="file" class="hidden-input" accept="image/*">
                <span class="upload-hint ui-element">+</span>
            </div>
            <div class="epi-details">
                <h4 contenteditable="true" spellcheck="false">제 ${list.children.length + 1}화: 에피소드 제목</h4>
                <p class="epi-runtime theme-text" contenteditable="true" spellcheck="false">24min</p>
                <p class="epi-desc" contenteditable="true" spellcheck="false">이곳을 클릭하여 새로운 에피소드의 시놉시스나 연성 내용을 입력하세요.</p>
            </div>
        `;
        list.appendChild(newEpi);
    });

    document.getElementById("add-char-btn").addEventListener("click", () => {
        const list = document.getElementById("shorts-container");
        const newChar = document.createElement("div");
        newChar.className = "short-card";
        newChar.innerHTML = `
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
        
        // 카드가 추가될 때 자동으로 오른쪽 끝으로 스크롤 이동
        list.scrollLeft = list.scrollWidth;
    });

    const saveBtn = document.getElementById("save-btn");
    saveBtn.addEventListener("click", () => {
        if (document.activeElement) document.activeElement.blur(); 

        const originalText = saveBtn.innerText;
        saveBtn.innerText = "렌더링 중...";
        saveBtn.disabled = true;

        const uiElements = document.querySelectorAll(".ui-element");
        uiElements.forEach(el => el.classList.add("hide-ui"));

        html2canvas(document.getElementById("capture-area"), {
            backgroundColor: "#050608",
            scale: 2, 
            useCORS: true
        }).then((canvas) => {
            const link = document.createElement("a");
            link.href = canvas.toDataURL("image/png");
            link.download = "ARCH_ORIGINAL.png";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            uiElements.forEach(el => el.classList.remove("hide-ui"));
            saveBtn.innerText = originalText;
            saveBtn.disabled = false;
        }).catch(err => {
            console.error("캡처 에러 발생:", err);
            alert("캡처 중 오류가 발생했습니다.");
            uiElements.forEach(el => el.classList.remove("hide-ui"));
            saveBtn.innerText = originalText;
            saveBtn.disabled = false;
        });
    });
});
/* ========================================================
       🔥 신규 추가: 애니메이션 화면 녹화 (WebM 내보내기) 엔진 🔥
    ======================================================== */
    const recordBtn = document.getElementById("record-btn");
    let mediaRecorder;
    let recordedChunks = [];

    recordBtn.addEventListener("click", async () => {
        // 이미 녹화 중이라면 녹화를 중지합니다.
        if (mediaRecorder && mediaRecorder.state === "recording") {
            mediaRecorder.stop();
            return;
        }

        try {
            alert("💡 안내: 녹화가 시작되면 뜨는 팝업에서 [현재 탭]을 선택하고 '공유'를 눌러주세요!");
            
            // 화면 캡처 권한 요청 (오디오 제외, 현재 탭 우선)
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { preferCurrentTab: true },
                audio: false
            });

            // UI 요소 (버튼, 인풋 등) 숨기기
            const uiElements = document.querySelectorAll(".ui-element");
            uiElements.forEach(el => el.classList.add("hide-ui"));

            // 녹화 버튼 상태 변경
            recordBtn.classList.remove("hide-ui"); // 녹화 버튼만은 보이게 유지
            recordBtn.classList.add("is-recording");
            recordBtn.innerText = "⏹ 녹화 종료 및 저장";

            // WebM 포맷으로 녹화 설정
            mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
            recordedChunks = [];

            // 데이터가 들어올 때마다 배열에 저장
            mediaRecorder.ondataavailable = function(e) {
                if (e.data.size > 0) {
                    recordedChunks.push(e.data);
                }
            };

            // 녹화가 종료되었을 때의 처리
            mediaRecorder.onstop = function() {
                // Blob 객체로 영상 파일(WebM) 생성
                const blob = new Blob(recordedChunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                
                // 가상의 a태그를 만들어 다운로드 실행
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = 'ARCH_ORIGINAL_ANIMATION.webm';
                document.body.appendChild(a);
                a.click();
                
                // 찌꺼기 청소
                setTimeout(() => {
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                }, 100);

                // 스트림 종료 (브라우저 상단의 화면 공유 아이콘 끄기)
                stream.getTracks().forEach(track => track.stop());

                // UI 및 버튼 원상 복구
                uiElements.forEach(el => el.classList.remove("hide-ui"));
                recordBtn.classList.remove("is-recording");
                recordBtn.innerText = "🔴 움짤(WebM) 녹화";
            };

            // 유저가 화면 공유 팝업에서 '공유 중지'를 직접 눌렀을 때의 방어 로직
            stream.getVideoTracks()[0].onended = function () {
                if (mediaRecorder.state === "recording") {
                    mediaRecorder.stop();
                }
            };

            // 에디터 포커스 아웃 후 0.5초 대기 후 녹화 시작 (글리치 효과 제대로 나오게)
            if (document.activeElement) document.activeElement.blur();
            setTimeout(() => {
                mediaRecorder.start();
            }, 500);

        } catch (err) {
            console.error("녹화 취소 또는 에러 발생:", err);
            alert("녹화가 취소되었거나 지원하지 않는 브라우저입니다.");
        }
    });
