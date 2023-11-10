// 회원가입 함수
async function registerUser() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const response = await fetch('/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
  });

  const result = await response.text();
  alert(result);
}

// 데이터 조회 함수
async function fetchData() {
  const response = await fetch('/fetchData');
  const result = await response.json();

  const userDataDiv = document.getElementById('userData');
  userDataDiv.innerHTML = '';

  if (result.length > 0) {
    result.forEach(user => {
      const userDiv = document.createElement('div');
      userDiv.textContent = `Username: ${user.username}, Password: ${user.password}`;
      userDataDiv.appendChild(userDiv);
    });
  } else {
    userDataDiv.textContent = '저장된 데이터가 없습니다.';
  }
}