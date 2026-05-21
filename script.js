document.addEventListener("DOMContentLoaded", () => {
    // 1. 이미지 업로드 처리 함수 (FileReader API)
    function handleImageUpload(inputId, bgId) {
        const input = document.getElementById(inputId);
        const bgElement = document.getElementById(bgId);

        input.addEventListener("change", function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    // 배경 이미지로 설정
                    bgElement.style.backgroundImage = `url('${e.target.result}')`;
                    bgElement.style.backgroundSize = "cover";
                    bgElement.style.backgroundPosition = "center";
                    
                    // 내부 힌트 텍스트(업로드 안내문) 숨기기
                    const hint = bgElement.querySelector('.upload-hint, .upload-hint-small');
                    if (hint) hint.style.display = 'none';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 각 영역에 업로드 이벤트 연결
    handleImageUpload("hero-upload", "hero-bg");
    handleImageUpload("char1-upload", "char1-bg");
    handleImageUpload("char2-upload", "char2-bg");
    handleImageUpload("epi1-upload", "epi1-bg");

    // 2. 캡처 및 저장 기능
    const saveBtn = document.getElementById("save-btn");
    const captureArea = document.getElementById("capture-area");

    saveBtn.addEventListener("click", () => {
        // 캡처 전, 거슬리는 UI 버튼들 임시로 숨기기
        const uploadBtns = document.querySelectorAll(".upload-btn");
        uploadBtns.forEach(btn => btn.classList.add("hide-on-capture"));

        // 에디터 포커스 해제 (파란색 테두리 없애기)
        if (document.activeElement) document.activeElement.blur();

        const originalText = saveBtn.innerText;
        saveBtn.innerText = "연성물 렌더링 중...";
        saveBtn.disabled = true;

        html2canvas(captureArea, {
            backgroundColor: "#141414",
            scale: 2, 
            useCORS: true
        }).then((canvas) => {
            const imgUrl = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = imgUrl;
            link.download = "my_original_anime.png";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // 숨겼던 UI 버튼들 다시 복구
            uploadBtns.forEach(btn => btn.classList.remove("hide-on-capture"));
            saveBtn.innerText = originalText;
            saveBtn.disabled = false;
        }).catch(err => {
            console.error("캡처 오류:", err);
            alert("캡처에 실패했습니다. 오타쿠의 심장을 멈추게 하는 에러군요.");
            uploadBtns.forEach(btn => btn.classList.remove("hide-on-capture"));
            saveBtn.innerText = originalText;
            saveBtn.disabled = false;
        });
    });
});
