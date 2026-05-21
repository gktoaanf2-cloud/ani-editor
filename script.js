document.addEventListener("DOMContentLoaded", () => {
    const saveBtn = document.getElementById("save-btn");
    const captureArea = document.getElementById("capture-area");

    saveBtn.addEventListener("click", () => {
        // 캡처하는 동안 버튼 텍스트 변경
        const originalText = saveBtn.innerText;
        saveBtn.innerText = "영업 자료 생성 중...";
        saveBtn.disabled = true;

        // html2canvas를 사용하여 지정한 영역 캡처
        html2canvas(captureArea, {
            backgroundColor: "#141414", // 다크 테마 배경색 유지
            scale: 2, // 고해상도(레티나) 화질로 저장
            useCORS: true // 외부 이미지(CDN 등) 사용 시 보안 에러 방지
        }).then((canvas) => {
            // 캔버스를 이미지 URL로 변환
            const imgUrl = canvas.toDataURL("image/png");

            // 가상의 a 태그를 만들어 다운로드 트리거
            const link = document.createElement("a");
            link.href = imgUrl;
            link.download = "boss_original_anime.png"; // 저장될 파일명
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // 버튼 상태 원상복구
            saveBtn.innerText = originalText;
            saveBtn.disabled = false;
        }).catch(err => {
            console.error("캡처 중 오류 발생:", err);
            alert("이미지 저장에 실패했습니다. 오타쿠의 적인 에러가 발생했군요.");
            saveBtn.innerText = originalText;
            saveBtn.disabled = false;
        });
    });
});
