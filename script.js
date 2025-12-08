// --- 시간 업데이트 기능 (년월일 요일 시분초) ---
function updateTime() {
    const now = new Date();
    const dateString = now.toLocaleDateString('ko-KR', {
        year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short'
    }).replace(/\.$/, '').replace('. ', '.'); 
    const timeString = now.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });
    document.getElementById('current-time').textContent = `${dateString} ${timeString}`;
}
setInterval(updateTime, 1000);
updateTime();


// --- 사용자 정보 관리 및 LocalStorage 기능 ---
let userInfo = {
    name: "미등록 사용자", nickname: "없음", address: "미등록 주소",
    photoUrl: "placeholder_photo.jpg", isBandMode: false 
};

function loadUserInfo() {
    const savedInfo = localStorage.getItem('idCardUserInfo');
    if (savedInfo) { 
        userInfo = JSON.parse(savedInfo); 
    } else {
        localStorage.setItem('idCardUserInfo', JSON.stringify(userInfo));
    }
    
    updateCardUI(); 
    loadInputFields();
    document.getElementById('modeSwitch').checked = userInfo.isBandMode;
    applyModeStyles();
}

function updateCardUI() {
    document.getElementById('user-name').textContent = userInfo.name;
    document.getElementById('user-nickname').textContent = userInfo.nickname;
    
    // 주소 엔터 처리: \n를 <br> 태그로 변환하여 innerHTML로 삽입
    const addressHtml = userInfo.address.replace(/\n/g, '<br>');
    document.getElementById('user-address').innerHTML = addressHtml;
    
    // 별명 텍스트의 폰트 굵기를 굵게 설정
    document.getElementById('user-nickname').style.fontWeight = 'bold';

    const userPhotoElement = document.getElementById('user-photo');
    userPhotoElement.src = userInfo.photoUrl || "placeholder_photo.jpg";

    // 이미지 로드 실패 핸들러
    userPhotoElement.onerror = () => {
        console.error("프로필 사진 로드 실패. 기본 이미지로 대체합니다.");
        userPhotoElement.src = "placeholder_photo.jpg"; 
    };
}


function loadInputFields() {
    document.getElementById('userNameInput').value = userInfo.name;
    document.getElementById('userNicknameInput').value = userInfo.nickname;
    // textarea에 원본 텍스트(엔터 포함) 로드
    document.getElementById('userAddressInput').value = userInfo.address;
    
    document.getElementById('userPhotoUrlInput').value = ''; 
    document.getElementById('userPhotoFileInput').value = '';
}

function saveUserInfo() {
    const fileInput = document.getElementById('userPhotoFileInput');
    const urlInput = document.getElementById('userPhotoUrlInput');
    
    userInfo.name = document.getElementById('userNameInput').value;
    userInfo.nickname = document.getElementById('userNicknameInput').value;
    // textarea에서 값 가져옴
    userInfo.address = document.getElementById('userAddressInput').value;

    if (fileInput.files && fileInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = function(e) {
            userInfo.photoUrl = e.target.result; 
            finalizeSave(); 
        };
         reader.onerror = function(e) { 
            console.error("파일 읽기 오류:", e);
            alert("사진 파일을 읽는 중 오류가 발생했습니다. URL 입력란을 확인해주세요.");
            finalizeSave(); 
        };
        reader.readAsDataURL(fileInput.files);
    } else if (urlInput.value.trim() !== '') {
        userInfo.photoUrl = urlInput.value.trim();
        finalizeSave();
    } else {
        finalizeSave();
    }
}

function finalizeSave() {
    localStorage.setItem('idCardUserInfo', JSON.stringify(userInfo));
    updateCardUI(); 
    toggleSettings(); 
    alert("정보가 기기에 저장되었습니다!");
    document.getElementById('userPhotoFileInput').value = ''; 
    document.getElementById('userPhotoUrlInput').value = '';
}


function toggleSettings() {
    const sidebar = document.getElementById('settings-sidebar');
    sidebar.classList.toggle('open');
    if (!sidebar.classList.contains('open')) { loadInputFields(); }
}


// --- 모드 전환 기능 (신분증 <-> 자격증) ---
function toggleMode() {
    const modeSwitch = document.getElementById('modeSwitch');
    userInfo.isBandMode = modeSwitch.checked;
    applyModeStyles();
    localStorage.setItem('idCardUserInfo', JSON.stringify(userInfo));
}

function applyModeStyles() {
    const idCard = document.getElementById('idCardElement');
    const timeStamp = document.getElementById('current-time'); 
    const bgVideo = document.getElementById('bg-video'); 

    if (userInfo.isBandMode) {
        idCard.classList.add('band-mode');
        timeStamp.style.color = 'white'; 
        if (bgVideo) bgVideo.style.opacity = 0.8;
    } else {
        idCard.classList.remove('band-mode');
        timeStamp.style.color = '#333';
        if (bgVideo) bgVideo.style.opacity = 0.5;
    }
}


// 페이지 로드 시 초기 함수 실행
loadUserInfo();

// ⭐ 신분증 클릭 시 정보 표시/숨김 및 배경 오버레이 토글 ⭐
document.getElementById('idCardElement').addEventListener('click', function() {
    const contentElement = document.querySelector('.content'); 
    const idCardContainer = document.querySelector('.id-card-container');
    const bodyElement = document.body;

    contentElement.classList.toggle('revealed'); 
    idCardContainer.classList.toggle('revealed');
    bodyElement.classList.toggle('overlay-active');
});

document.addEventListener('DOMContentLoaded', (event) => {
    updateTime();
    setInterval(updateTime, 1000);
    loadUserInfo();
    
    // [추가] 사용자의 첫 상호작용 시 비디오 재생 시도
    document.body.addEventListener('touchstart', tryPlayVideo, { once: true });
    document.body.addEventListener('click', tryPlayVideo, { once: true });
});

function tryPlayVideo() {
    const video = document.getElementById('bg-video');
    if (video) {
        // Promise를 반환하므로 성공/실패 처리
        video.play().catch(error => {
            console.log("비디오 재생 실패 (브라우저 정책):", error);
        });
    }
}
