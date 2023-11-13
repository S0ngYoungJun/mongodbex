function getUsernameFromCookie() {
  const cookieArray = document.cookie.split(';');
  for (let i = 0; i < cookieArray.length; i++) {
    const cookie = cookieArray[i].trim();
    if (cookie.startsWith('username=')) {
      return cookie.substring('username='.length, cookie.length);
    }
  }
  return null;
}
// 로그인 후 사용자 정보를 서버로 전송하는 함수를 추가합니다.
async function sendUserInfoToServer() {
  const username = getUsernameFromCookie(); // 쿠키에서 사용자명을 가져옵니다.

  if (!username) {
    console.error('사용자명이 없습니다.');
    return;
  }

  const response = await fetch('/sendUserInfo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`사용자 정보 전송 실패: ${errorText}`);
  }
}
async function showNotes() {
  const response = await fetch('/fetchNotes');
  const result = await response.json();

  const userNotesDiv = document.getElementById('userNotes');
  userNotesDiv.innerHTML = '';

  if (result.length > 0) {
    result.forEach(note => {
      const noteDiv = document.createElement('div');
      noteDiv.textContent = `Note: ${note.content}, 작성자 ID: ${note.user.username}`;
      userNotesDiv.appendChild(noteDiv);
    });
  } else {
    userNotesDiv.textContent = '저장된 노트가 없습니다.';
  }
}

async function addNote() {
  const noteContent = document.getElementById('noteContent').value;

  const response = await fetch('/addNote', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `content=${encodeURIComponent(noteContent)}`,
  });

  if (!response.ok) {
    const errorText = await response.text();
    alert(`노트 추가 실패: ${errorText}`);
    return;
  }

  // 추가된 노트를 화면에 표시
  showNotes();
  alert('노트가 추가되었습니다.');
}
window.onload = sendUserInfoToServer;
window.onload = showNotes;