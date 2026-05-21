document.addEventListener("DOMContentLoaded", () => {
    
    // 1. 글로벌 테마 색상 동기화 알고리즘 (글로우 효과 자동 계산)
    const themePicker = document.getElementById("theme-picker");
    
    // HEX 코드를 RGBA로 변환하여 글로우 효과를 만드는 함수
    function hexToRgba(hex, alpha) {
        let r = parseInt(hex.slice(1, 3), 16);
        let g = parseInt(hex.slice(3, 5), 16);
        let b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    themePicker.addEventListener("input", (e) => {
        const hexColor = e.target.value;
        const glowColor = hexToRgba(hexColor, 0.4); // 투명도 40%의 네온 그림자 생성
        
        document.documentElement.style.setProperty('--theme-color', hexColor);
        document.documentElement.style.setProperty('--theme-glow', glowColor);
    });

    // 2. 이벤트 위임을 통한 이미지 업로드 통합 처리
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
                    
                    // 이미지가 업로드되면 안내 문구 및 버튼 숨기기
                    const hint = targetElement.querySelector(".upload-hint");
                    const uploadBtn = targetElement.querySelector(".hero-upload-ui");
                    if (hint) hint.style.opacity = "0";
                    if (uploadBtn) uploadBtn.style.display = "none"; 
                };
                reader.readAsDataURL(file);
            }
        }
    });

    // 3. 무한 에피소드 추가 로직 (좌측 칸)
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

    // 4. 무한 캐릭터 추가 로직 (우측 칸)
    document.getElementById("add-char-btn").addEventListener("click", () => {
        const list = document.getElementById("shorts-container");
        const newChar = document.createElement("div");
        newChar.className = "short-card";
        newChar.innerHTML = `
            <div class="short-img bg-target upload-trigger">
                <input type="file" class="hidden-input" accept="image/*">
                <span class="upload-hint ui-element">클릭하여 일러스트 업로드</span>
            </div>
            <div class="short-info">
                <h4 contenteditable="true" spellcheck="false">"캐릭터의 명대사를 입력하세요."</h4>
                <p class="cv-text theme-text" contenteditable="true" spellcheck="false">CV. 성우 가상 캐스팅</p>
            </div>
        `;
        list.appendChild(newChar);
    });

    // 5. 무결점 이미지 캡처 모듈
    const saveBtn = document.getElementById("save-btn");
    saveBtn.addEventListener("click", () => {
        if (document.activeElement) document.activeElement.blur(); // 에디터 포커스 아웃

        const originalText = saveBtn.innerText;
        saveBtn.innerText = "렌더링 중...";
        saveBtn.disabled = true;

        // 캡처 화면에 보이면 안 되는 UI 요소들 일괄 숨김 처리
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

            // 캡처 완료 후 UI 복구
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
