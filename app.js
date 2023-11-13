const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const app = express();
const port = 3000;
const bcrypt = require('bcrypt');
const saltRounds = 10
// MongoDB 연결

mongoose.connect('mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.0.2', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// 회원 모델 정의
const UserSchema = new mongoose.Schema({
  username: String,
  password: String
});

const User = mongoose.model('User', UserSchema, 'myco');
const NoteSchema = new mongoose.Schema({
  content: String,
  // 추가 필드를 사용하여 사용자와 노트를 연결할 수 있습니다.
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});
const Note = mongoose.model('Note', NoteSchema, 'mycoblog');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

// 세션 설정
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

// HTML 폼 렌더링
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 회원가입 요청 처리
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 새 사용자 생성
    const newUser = new User({
      username: username,
      password: hashedPassword
    });

    // 사용자 저장
    await newUser.save();

    res.send('회원가입이 완료되었습니다.');
  } catch (error) {
    res.send('회원가입 실패: ' + error.message);
  }
});

app.get('/fetchData', async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.send('데이터 조회 실패: ' + error.message);
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).send('로그인 실패: 유저 정보가 일치하지 않습니다.');
    }

    // 비밀번호 일치 여부를 확인합니다.
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      req.session.user = user;
      res.send('로그인 성공!');
    } else {
      res.status(401).send('로그인 실패: 비밀번호가 일치하지 않습니다.');
    }
  } catch (error) {
    console.error('로그인 에러:', error);
    res.status(500).send('로그인 실패: ' + error.message);
  }
});

app.get('/blog', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }

  res.sendFile(path.join(__dirname, 'public', 'blog.html'));
});
app.post('/sendUserInfo', (req, res) => {
  const username = req.session.user.username;
  res.json({ username });
});

// 노트를 추가하기 위한 새 라우트를 추가하세요
app.post('/addNote', async (req, res) => {
  try {
    const { content } = req.body;

    const user = req.session.user;
    if (!user) {
      return res.status(400).send('사용자를 찾을 수 없습니다.');
    }

    // 노트를 생성하고 사용자와 연결합니다.
    const newNote = new Note({
      content,
      user: user._id
    });

    await newNote.save();

    // 노트가 추가된 후 모든 노트를 다시 가져와 응답합니다.
    const notes = await Note.find({ user: user._id }).populate('user', 'username');
    res.json(notes);
  } catch (error) {
    res.status(500).send('노트 추가 실패: ' + error.message);
  }
});

app.get('/fetchNotes', async (req, res) => {
  try {
    // 로그인한 사용자 정보를 가져옵니다.
    const user = req.session.user;
    if (!user) {
      return res.status(400).send('사용자를 찾을 수 없습니다.');
    }

    const notes = await Note.find({ user: user._id }).populate('user', 'username');
    res.json(notes);
  } catch (error) {
    res.status(500).send('노트 조회 실패: ' + error.message);
  }
});

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});