document.addEventListener("DOMContentLoaded", () => {
    
    // 1. 테마 색상 휠 실시간 연동 리스너
    const themePicker = document.getElementById("theme-picker");
    themePicker.addEventListener("input", (e) => {
        const hexColor = e.target.value;
        document.documentElement.style.setProperty('--theme-color', hexColor);
        // 글로우 효과용 연한 투명 색상도 계산하여 적용
        document.documentElement.style.setProperty('--text-glow', hexColor + "66");
    });

    // 2. [위임 방식] 이미지 동적 업로드 메커니즘
    document.addEventListener("click", (e) => {
        const trigger = e.target.closest(".upload-trigger");
        if (trigger && e.target.type !== "file") {
            const fileInput = trigger.querySelector(".hidden-input");
            if (fileInput) fileInput.click();
        }
    });

    document.addEventListener("change", (e) => {
        if (e.target.classList.contains("hidden-input")) {
            const file = e.target.files[0];
            const bgTarget = e.target.closest(".bg-target");
            
            if (file && bgTarget) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    bgTarget.style.backgroundImage = `url('${event.target.result}')`;
                    bgTarget.style.backgroundSize = "cover";
                    bgTarget.style.backgroundPosition = "center";
                    
                    const hint = bgTarget.querySelector(".upload-hint");
                    if (hint) hint.style.opacity = "0"; // 힌트 문구 숨김
                };
                reader.readAsDataURL(file);
            }
        }
    });

    // 3. 무한 회차(에피소드) 추가 로직
    const addEpiBtn = document.getElementById("add-epi-btn");
    const episodeList = document.getElementById("episode-list");

    addEpiBtn.addEventListener("click", () => {
        const currentCount = episodeList.children.length + 1;
        const newEpi = document.createElement("article");
        newEpi.className = "episode-item";
        newEpi.innerHTML = `
            <div class="epi-thumbnail bg-target upload-trigger">
                <input type="file" class="hidden-input" accept="image/*">
                <span class="upload-hint">+</span>
            </div>
            <div class="epi-details">
                <h4 contenteditable="true" spellcheck="false">제 ${currentCount}화: 새로운 에피소드 제목</h4>
                <p class="epi-runtime" contenteditable="true" spellcheck="false">24min</p>
                <p class="epi-desc" contenteditable="true" spellcheck="false">이곳을 클릭해 해당 회차의 시놉시스나 연성 로그 요약을 자유롭게 작성하세요.</p>
            </div>
        `;
        episodeList.appendChild(newEpi);
    });

    // 4. 무한 성우/캐릭터 추가 로직
    const addCharBtn = document.getElementById("add-char-btn");
    const shortsContainer = document.getElementById("shorts-container");

    addCharBtn.addEventListener("click", () => {
        const newChar = document.createElement("div");
        newChar.className = "short-card";
        newChar.innerHTML = `
            <div class="short-img bg-target upload-trigger">
                <input type="file" class="hidden-input" accept="image/*">
                <span class="upload-hint">클릭하여 이미지 업로드</span>
            </div>
            <div class="short-info">
                <h4 contenteditable="true" spellcheck="false">"새로 추가한 캐릭터의 웅장한 대사를 입력하세요."</h4>
                <p class="cv-text" contenteditable="true" spellcheck="false">CV. 성우 가상 캐스팅</p>
            </div>
        `;
        shortsContainer.appendChild(newChar);
    });

    // 5. 궁극의 이미지 저장 메커니즘
    const saveBtn = document.getElementById("save-btn");
    const captureArea = document.getElementById("capture-area");

    saveBtn.addEventListener("click", () => {
        if (document.activeElement) document.activeElement.blur(); // 에디터 초점 해제

        const originalText = saveBtn.innerText;
        saveBtn.innerText = "SF 렌더링 엔진 가동 중...";
        saveBtn.disabled = true;

        // 캡처 시 불필요한 가이드 텍스트 및 인풋 숨기기
        const hints = document.querySelectorAll(".upload-hint");
        hints.forEach(h => { if(h.style.opacity !== "0") h.classList.add("hide-on-capture"); });

        html2canvas(captureArea, {
            backgroundColor: "#090a10",
            scale: 2, // 2배 고해상도 박제
            useCORS: true
        }).then((canvas) => {
            const imgUrl = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = imgUrl;
            link.download = "ARCH_ORIGINAL_ANIME.png";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // 복구
            hints.forEach(h => h.classList.remove("hide-on-capture"));
            saveBtn.innerText = originalText;
            saveBtn.disabled = false;
        }).catch(err => {
            console.error(err);
            alert("렌더링 실패. 우주의 시공간에 왜곡이 생겼습니다.");
            hints.forEach(h => h.classList.remove("hide-on-capture"));
            saveBtn.innerText = originalText;
            saveBtn.disabled = false;
        });
    });
});
