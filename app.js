'use strict';

const TOTAL_QUESTIONS = 20;
const MAX_NUM = 20;

let problems = [];
let currentIndex = 0;
let score = 0;
let mistakes = [];

// ===== 화면 전환 =====
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ===== 문제 생성 =====
function generateProblems() {
  const generated = [];
  const seen = new Set();

  // 더하기 10문제 + 빼기 10문제
  const ops = ['+', '-'];
  const counts = { '+': 10, '-': 10 };

  for (const op of ops) {
    let count = 0;
    let attempts = 0;
    while (count < counts[op] && attempts < 500) {
      attempts++;
      const a = randomInt(1, MAX_NUM);
      const b = randomInt(1, MAX_NUM);
      let answer;

      if (op === '+') {
        answer = a + b;
        if (answer > MAX_NUM) continue;
      } else {
        if (a < b) continue; // 빼기는 음수가 되지 않도록
        answer = a - b;
      }

      const key = `${a}${op}${b}`;
      if (seen.has(key)) continue;
      seen.add(key);

      generated.push({ a, op, b, answer });
      count++;
    }
  }

  // 셔플
  for (let i = generated.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [generated[i], generated[j]] = [generated[j], generated[i]];
  }

  return generated;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ===== 문제 표시 =====
function showProblem(index) {
  const p = problems[index];
  const opDisplay = p.op === '+' ? '＋' : '－';

  document.getElementById('problem-text').textContent = `${p.a} ${opDisplay} ${p.b}`;
  document.getElementById('question-number').textContent = `${index + 1} / ${TOTAL_QUESTIONS} 문제`;

  const progress = (index / TOTAL_QUESTIONS) * 100;
  document.getElementById('progress-bar').style.width = progress + '%';

  const input = document.getElementById('answer-input');
  input.value = '';
  input.disabled = false;
  input.focus();

  hideFeedback();

  const btn = document.getElementById('btn-answer');
  btn.textContent = '답하기';
  btn.disabled = false;
}

// ===== 정답 확인 =====
function checkAnswer() {
  const input = document.getElementById('answer-input');
  const rawValue = input.value.trim();

  if (rawValue === '') {
    input.focus();
    return;
  }

  const userAnswer = parseInt(rawValue, 10);
  if (isNaN(userAnswer)) {
    input.value = '';
    input.focus();
    return;
  }

  const p = problems[currentIndex];
  const isCorrect = userAnswer === p.answer;

  input.disabled = true;
  document.getElementById('btn-answer').disabled = true;

  if (isCorrect) {
    score++;
    showFeedback('○ 정답！', 'correct');
  } else {
    const opDisplay = p.op === '+' ? '＋' : '－';
    mistakes.push({
      problem: `${p.a} ${opDisplay} ${p.b}`,
      userAnswer,
      correctAnswer: p.answer
    });
    showFeedback(`× 정답은 ${p.answer}`, 'incorrect');
  }

  // 잠시 후 다음 문제로
  setTimeout(() => {
    currentIndex++;
    if (currentIndex < TOTAL_QUESTIONS) {
      showProblem(currentIndex);
    } else {
      showResult();
    }
  }, 1000);
}

// ===== 피드백 표시 =====
function showFeedback(message, type) {
  const el = document.getElementById('feedback');
  el.textContent = message;
  el.className = `feedback ${type}`;
}

function hideFeedback() {
  const el = document.getElementById('feedback');
  el.className = 'feedback hidden';
  el.textContent = '';
}

// ===== 결과 표시 =====
function showResult() {
  document.getElementById('progress-bar').style.width = '100%';

  const scoreText = `${TOTAL_QUESTIONS}문제 중 ${score}문제 정답！`;
  document.getElementById('score-text').textContent = scoreText;

  // 별점 평가
  const ratio = score / TOTAL_QUESTIONS;
  let stars = '';
  let message = '';
  if (ratio === 1) {
    stars = '★★★';
    message = '완벽해요！ 정말 대단해요！';
  } else if (ratio >= 0.8) {
    stars = '★★☆';
    message = '잘했어요！ 조금만 더 해봐요！';
  } else if (ratio >= 0.5) {
    stars = '★☆☆';
    message = '열심히 했어요！ 다시 도전해봐요！';
  } else {
    stars = '☆☆☆';
    message = '포기하지 말고 또 도전해봐요！';
  }
  document.getElementById('stars').textContent = stars;
  document.getElementById('result-message').textContent = message;

  // 틀린 문제 목록
  const mistakesSection = document.getElementById('mistakes-section');
  const mistakesList = document.getElementById('mistakes-list');
  mistakesList.innerHTML = '';

  if (mistakes.length > 0) {
    mistakesSection.classList.remove('hidden');
    mistakes.forEach(m => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span class="mistake-problem">${m.problem} ＝</span>
        <span class="mistake-your-answer">${m.userAnswer}</span>
        <span>→</span>
        <span class="mistake-correct-answer">${m.correctAnswer}</span>
      `;
      mistakesList.appendChild(li);
    });
  } else {
    mistakesSection.classList.add('hidden');
  }

  showScreen('screen-result');
}

// ===== 다시 시작 =====
function restartApp() {
  problems = generateProblems();
  currentIndex = 0;
  score = 0;
  mistakes = [];
  document.getElementById('progress-bar').style.width = '0%';
  showScreen('screen-quiz');
  showProblem(0);
}

// ===== 이벤트 설정 =====
document.getElementById('btn-start').addEventListener('click', () => {
  problems = generateProblems();
  currentIndex = 0;
  score = 0;
  mistakes = [];
  showScreen('screen-quiz');
  showProblem(0);
});

document.getElementById('btn-answer').addEventListener('click', checkAnswer);

document.getElementById('answer-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') checkAnswer();
});

document.getElementById('btn-restart').addEventListener('click', restartApp);
