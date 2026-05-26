/* ==========================================================================
   CONFIGURAÇÕES GERAIS E BANCO DE QUESTÕES
   ========================================================================== */
const GROUP_COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#ef4444'];
const EXTRA_PTS = [1, 0.75, 0.5, 0.25, 0.25, 0.25];

const CELL_LABELS = [
  'A1', 'B1', 'C1', 
  'A2', 'B2', 'C2', 
  'A3', 'B3', 'C3', 
  'D1', 'D2', 'D3'
];

const QUESTIONS = [
  {
    text: 'A Engenharia de Requisitos é responsável principalmente por:',
    choices: [
      'Apenas programar as funcionalidades do sistema.',
      'Manter servidores de produção.',
      'Criar apenas a interface gráfica do sistema.',
      'Realizar somente testes automatizados.',
      'Identificar, analisar, documentar, validar e gerenciar necessidades e restrições do sistema.'
    ], 
    correct: 4, 
    type: 'Objetiva'
  },
  {
    text: 'A característica que indica que um requisito deve ser escrito de forma precisa e sem termos vagos é:',
    choices: ['Viabilidade', 'Clareza e ausência de ambiguidade', 'Prioridade', 'Rastreabilidade', 'Modificabilidade'],
    correct: 1, 
    type: 'Objetiva'
  },
  {
    text: 'No modelo CMMI-DEV, a gerência de requisitos possui como objetivo principal:',
    choices: [
      'Desenvolver o código do sistema.',
      'Garantir alinhamento entre requisitos, planos do projeto e produtos de trabalho.',
      'Criar documentação de design.',
      'Reduzir o tempo de implementação do software.',
      'Automatizar o processo de testes.'
    ], 
    correct: 1, 
    type: 'Objetiva'
  },
  {
    text: 'Um requisito é considerado verificável quando:',
    choices: [
      'Pode ser modificado facilmente.',
      'Possui apenas uma funcionalidade.',
      'Possui baixo custo de implementação.',
      'Pode ser testado ou validado objetivamente.',
      'Não possui métricas.'
    ], 
    correct: 3, 
    type: 'Objetiva'
  },
  {
    text: 'Sobre rastreabilidade, analise:\nI – Permite identificar a origem do requisito.\nII – Permite identificar artefatos que implementam o requisito.\nIII – É desnecessária em projetos ágeis.\nA sequência correta é:',
    choices: ['V – V – F', 'V – F – V', 'F – V – V', 'V – V – V', 'F – F – V'],
    correct: 0, 
    type: 'Análise (V/F)'
  },
  {
    text: 'A característica que avalia se um requisito pode ser implementado dentro das restrições de prazo e orçamento é:',
    choices: ['Consistência', 'Prioridade', 'Viabilidade', 'Modificabilidade', 'Atomicidade'],
    correct: 2, 
    type: 'Objetiva'
  },
  {
    text: 'Sobre o impacto estratégico dos requisitos:\nI – Requisitos bem definidos reduzem riscos.\nII – Melhoram a previsibilidade do projeto.\nIII – Não influenciam a satisfação do cliente.\nEstá correto:',
    choices: ['Apenas I', 'Apenas II', 'I e II', 'II e III', 'I, II e III'],
    correct: 2, 
    type: 'Análise'
  },
  {
    text: 'Qual prática do CMMI-DEV envolve manter ligação entre requisitos e produtos gerados?',
    choices: [
      'Controle de mudanças', 'Rastreabilidade bidirecional',
      'Priorização de requisitos', 'Planejamento de sprints', 'Teste automatizado'
    ], 
    correct: 1, 
    type: 'Objetiva'
  },
  {
    text: 'Sobre a natureza dos requisitos, marque V ou F:\n( ) Requisitos são estáticos e raramente mudam após o início do projeto.\n( ) Requisitos podem envolver aspectos organizacionais, regulatórios e tecnológicos.\n( ) Mudanças no mercado ou legislação podem gerar alterações nos requisitos.\n( ) Requisitos existem apenas durante o ciclo de vida do projeto.\nQual a alternativa correta?',
    choices: ['V – V – F – F', 'F – V – V – F', 'V – F – V – F', 'F – F – V – V', 'V – V – V – F'],
    correct: 1, 
    type: 'Verdadeiro/Falso'
  },
  {
    text: 'Sobre o ciclo de vida dos requisitos:\nI – Requisitos deixam de ser úteis após o projeto terminar.\nII – Requisitos devem acompanhar o ciclo de vida do produto.\nIII – A gestão de requisitos ajuda na manutenção do software.\nSequência correta:',
    choices: ['F – V – V', 'V – F – V', 'V – V – F', 'F – F – V', 'V – F – F'],
    correct: 0, 
    type: 'Análise (V/F)'
  }
];

/* ==========================================================================
   ESTADO DO JOGO (STATE)
   ========================================================================== */
let state = {
  groups: [], 
  currentIdx: 0,
  cells: [], 
  usedQ: [], 
  timerInterval: null, 
  timerSec: 30,
  currentQ: null, 
  answered: false,
  groupsTried: 0,
  originalTurnIdx: 0
};

let numGroups = 3;

/* ==========================================================================
   FUNÇÕES DA TELA INICIAL (SETUP DO JOGO)
   ========================================================================== */
function changeGroups(d) {
  numGroups = Math.max(2, Math.min(6, numGroups + d));
  document.getElementById('cnt-num').textContent = numGroups;
  renderGroupInputs();
}

function renderGroupInputs() {
  const wrap = document.getElementById('group-inputs');
  const old = [...wrap.querySelectorAll('input')].map(i => i.value);
  wrap.innerHTML = '';
  for (let i = 0; i < numGroups; i++) {
    const div = document.createElement('div');
    div.className = 'group-input-wrap';
    const span = document.createElement('span');
    span.style.background = GROUP_COLORS[i];
    span.textContent = i + 1;
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.placeholder = `Nome do Grupo ${i + 1}`;
    inp.value = old[i] || `Grupo ${i + 1}`;
    div.appendChild(span); 
    div.appendChild(inp);
    wrap.appendChild(div);
  }
}

function startGame() {
  const inputs = document.querySelectorAll('#group-inputs input');
  state.groups = [];
  inputs.forEach((inp, i) => {
    state.groups.push({ 
      name: inp.value || `Grupo ${i + 1}`, 
      pts: 0, 
      bonusPts: 0, 
      correct: 0, 
      wrong: 0, 
      color: GROUP_COLORS[i] 
    });
  });
  state.currentIdx = 0;
  state.usedQ = [];
  buildCells();
  updateScoreChips();
  updateTurnBanner();
  goScreen('board');
}

/* ==========================================================================
   FUNÇÕES DO TABULEIRO (BOARD)
   ========================================================================== */
function buildCells() {
  // Posicionamento aleatório do bônus (+2 pts) e da bomba (-2 pts) em um grid de 12 casas
  const positions = Array.from({ length: 12 }, (_, i) => i);
  const shuffled = positions.sort(() => Math.random() - 0.5);
  const bonusPos = shuffled[0];
  const malusPos = shuffled[1];
  
  state.cells = positions.map(i => ({
    type: i === bonusPos ? 'bonus' : i === malusPos ? 'malus' : 'question',
    used: false, 
    idx: i
  }));
  renderBoard();
}

function renderBoard() {
  const grid = document.getElementById('board-grid');
  grid.innerHTML = '';
  state.cells.forEach((cell, i) => {
    const d = document.createElement('div');
    d.className = 'board-cell' + (cell.used ? ' used' : '');
    
    // Insere o label A1-D3
    const label = document.createElement('span');
    label.textContent = CELL_LABELS[i];
    d.appendChild(label);
    
    if (!cell.used) d.onclick = () => pickCell(i);
    grid.appendChild(d);
  });
}

function updateScoreChips() {
  const wrap = document.getElementById('score-chips');
  wrap.innerHTML = '';
  state.groups.forEach((g, i) => {
    const total = g.pts + g.bonusPts;
    const c = document.createElement('div');
    c.className = 'score-chip' + (i === state.currentIdx ? ' active-turn' : '');
    c.innerHTML = `<span class="dot" style="background:${g.color}"></span>${g.name}: <span class="pts ${total < 0 ? 'neg' : ''}">${total >= 0 ? '+' : ''}${total}</span>`;
    wrap.appendChild(c);
  });
}

function updateTurnBanner() {
  const g = state.groups[state.currentIdx];
  document.getElementById('turn-dot').style.background = g.color;
  document.getElementById('turn-name').textContent = g.name;
  document.getElementById('turn-name').style.color = g.color;
}

function pickCell(i) {
  state.cells[i].used = true;
  renderBoard();
  const cell = state.cells[i];
  if (cell.type === 'bonus') { 
    showBonus(true); 
    return; 
  }
  if (cell.type === 'malus') { 
    showBonus(false); 
    return; 
  }
  showQuestion();
}

/* ==========================================================================
   CASAS ESPECIAIS (BÔNUS E BOMBA)
   ========================================================================== */
function showBonus(isBonus) {
  const g = state.groups[state.currentIdx];
  state.originalTurnIdx = state.currentIdx; // Salva para que o nextTurn funcione corretamente
  
  if (isBonus) { 
    g.bonusPts += 2; 
    spawnParticles(true); 
  } else { 
    g.bonusPts -= 2; 
    spawnParticles(false); 
  }
  updateScoreChips();

  const card = document.getElementById('bonus-card');
  if (isBonus) {
    card.className = 'bonus-card bonus-type';
    card.innerHTML = `
      <div class="bonus-sparkle"></div>
      <span class="bonus-emoji">🎁</span>
      <div class="bonus-title bonus-type">BÔNUS!</div>
      <div class="bonus-group">${g.name} caiu na casa especial!</div>
      <span class="bonus-pts plus">+2 pts</span>
      <button class="btn-next-bonus" onclick="nextTurn()">Próximo grupo →</button>
    `;
  } else {
    card.className = 'bonus-card malus-type';
    card.innerHTML = `
      <div class="malus-sparkle"></div>
      <span class="bonus-emoji">💣</span>
      <div class="bonus-title malus-type">BOMBA!</div>
      <div class="bonus-group">${g.name} ativou a bomba!</div>
      <span class="bonus-pts minus">−2 pts</span>
      <button class="btn-next-bonus" onclick="nextTurn()">Próximo grupo →</button>
    `;
  }
  goScreen('bonus');
}

/* ==========================================================================
   GERENCIAMENTO DE PERGUNTAS E TIMER
   ========================================================================== */
function showQuestion() {
  let avail = [];
  for (let i = 0; i < QUESTIONS.length; i++) {
    if (!state.usedQ.includes(i)) avail.push(i);
  }
  if (!avail.length) { 
    state.usedQ = []; 
    avail = QUESTIONS.map((_, i) => i); 
  }
  const qi = avail[Math.floor(Math.random() * avail.length)];
  state.usedQ.push(qi);
  state.currentQ = { ...QUESTIONS[qi], qi };
  state.answered = false;
  state.groupsTried = 1; // Contabiliza as tentativas do grupo
  state.originalTurnIdx = state.currentIdx; // Salva o índice do grupo que originalmente selecionou a questão

  const g = state.groups[state.currentIdx];
  document.getElementById('q-dot').style.background = g.color;
  document.getElementById('q-group-name').textContent = g.name;
  document.getElementById('q-type-badge').textContent = state.currentQ.type;
  document.getElementById('q-number').textContent = `Questão ${qi + 1} de ${QUESTIONS.length}`;
  document.getElementById('q-text').innerHTML = state.currentQ.text.replace(/\n/g, '<br>');

  const ch = document.getElementById('choices');
  ch.innerHTML = '';
  const letters = ['A', 'B', 'C', 'D', 'E'];
  state.currentQ.choices.forEach((txt, i) => {
    const btn = document.createElement('button');
    btn.className = 'choice';
    btn.innerHTML = `<span class="choice-letter">${letters[i]}</span><span class="choice-text">${txt}</span>`;
    btn.onclick = () => answer(i);
    ch.appendChild(btn);
  });

  // Limpa feedbacks de respostas anteriores do container
  const body = document.getElementById('question-body');
  const old = body.querySelectorAll('.result-toast, .next-btn');
  old.forEach(e => e.remove());

  startTimer();
  goScreen('question');
}

function startTimer() {
  clearInterval(state.timerInterval);
  state.timerSec = 30;
  const ring = document.getElementById('timer-ring');
  const num = document.getElementById('timer-num');
  const c = 125.66; // 2 * pi * r (r=20)
  
  ring.style.strokeDasharray = c;
  ring.style.strokeDashoffset = 0;
  ring.className = 'timer-fg';
  num.className = 'timer-num-big';
  num.textContent = 30;

  state.timerInterval = setInterval(() => {
    state.timerSec--;
    num.textContent = state.timerSec;
    ring.style.strokeDashoffset = c * (1 - state.timerSec / 30);
    
    if (state.timerSec <= 10) {
      ring.className = 'timer-fg urgent';
      num.className = 'timer-num-big urgent';
    }
    if (state.timerSec <= 0) {
      clearInterval(state.timerInterval);
      if (!state.answered) handleTimeout();
    }
  }, 1000);
}

function answer(idx) {
  if (state.answered) return;
  state.answered = true;
  clearInterval(state.timerInterval);

  const choices = document.querySelectorAll('.choice');
  choices.forEach((c, i) => {
    c.classList.add('disabled');
    if (i === state.currentQ.correct) c.classList.add('correct');
    else if (i === idx) c.classList.add('wrong');
  });

  const isCorrect = idx === state.currentQ.correct;
  const g = state.groups[state.currentIdx];
  if (isCorrect) { 
    g.pts++; 
    g.correct++; 
    spawnParticles(true); 
  } else { 
    g.pts--; 
    g.wrong++; 
    spawnParticles(false); 
  }
  updateScoreChips();

  const body = document.getElementById('question-body');
  const toast = document.createElement('div');
  toast.className = 'result-toast ' + (isCorrect ? 'correct' : 'wrong');
  if (isCorrect) {
    toast.innerHTML = `<div class="result-icon-big">✅</div><div class="result-info"><div class="result-title">Resposta correta!</div><div class="result-sub">${g.name} acertou!</div></div><div class="result-pts plus">+1</div>`;
  } else {
    toast.innerHTML = `<div class="result-icon-big">❌</div><div class="result-info"><div class="result-title">Resposta errada!</div><div class="result-sub">${g.name} errou.</div></div><div class="result-pts minus">−1</div>`;
  }
  body.appendChild(toast);

  const next = document.createElement('button');
  next.className = 'next-btn';
  next.innerHTML = 'Próximo grupo →';
  next.onclick = nextTurn;
  body.appendChild(next);
  body.scrollTop = body.scrollHeight;
}

function handleTimeout() {
  state.groupsTried++;
  if (state.groupsTried < state.groups.length) {
    // Passa a vez para o próximo grupo responder a MESMA pergunta
    state.currentIdx = (state.currentIdx + 1) % state.groups.length;
    updateScoreChips();
    
    // Atualiza cabeçalho da pergunta com o novo grupo
    const g = state.groups[state.currentIdx];
    document.getElementById('q-dot').style.background = g.color;
    document.getElementById('q-group-name').textContent = g.name;
    
    // Exibe notificação de tempo esgotado e passa para o próximo grupo
    showGameToast(`Tempo esgotado! Vez do ${g.name} responder!`, true);
    
    // Reinicia o cronômetro para o novo grupo
    startTimer();
  } else {
    // Todos os grupos esgotaram o tempo de tentativa
    state.answered = true;
    const choices = document.querySelectorAll('.choice');
    choices.forEach((c, i) => {
      c.classList.add('disabled');
      if (i === state.currentQ.correct) c.classList.add('correct');
    });

    const body = document.getElementById('question-body');
    const toast = document.createElement('div');
    toast.className = 'result-toast timeout';
    toast.innerHTML = `<div class="result-icon-big">⏰</div><div class="result-info"><div class="result-title">Tempo esgotado!</div><div class="result-sub">Todos os grupos esgotaram o tempo.</div></div><div class="result-pts zero">0</div>`;
    body.appendChild(toast);

    const next = document.createElement('button');
    next.className = 'next-btn';
    next.innerHTML = 'Próximo grupo →';
    next.onclick = nextTurn;
    body.appendChild(next);
    body.scrollTop = body.scrollHeight;
  }
}

/* ==========================================================================
   NAVEGAÇÃO E CICLO DE TURNOS
   ========================================================================== */
function nextTurn() {
  // Retorna a vez para o grupo seguinte ao que originalmente escolheu a casa no tabuleiro
  state.currentIdx = (state.originalTurnIdx + 1) % state.groups.length;
  updateScoreChips();
  updateTurnBanner();
  renderBoard();
  goScreen('board');
}

function goScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + name).classList.add('active');
  if (name === 'ranking') renderRanking();
}

/* ==========================================================================
   RANKING E FIM DE JOGO
   ========================================================================== */
function renderRanking() {
  const sorted = [...state.groups]
    .map((g, i) => ({ ...g, total: g.pts + g.bonusPts, oi: i }))
    .sort((a, b) => b.total - a.total || b.correct - a.correct);

  const medals = ['🥇', '🥈', '🥉'];
  const list = document.getElementById('ranking-list');
  list.innerHTML = '';
  sorted.forEach((g, pos) => {
    const row = document.createElement('div');
    row.className = 'rank-row';
    const extra = EXTRA_PTS[pos] || 0.25;
    row.innerHTML = `
      <div class="rank-pos">${medals[pos] || (pos + 1)}</div>
      <div class="rank-color" style="background:${g.color}"></div>
      <div style="flex:1">
        <div class="rank-name">${g.name}</div>
        <div class="rank-details">✓ ${g.correct} acertos · ✗ ${g.wrong} erros · bônus: ${g.bonusPts >= 0 ? '+' : ''}${g.bonusPts}</div>
      </div>
      <div class="rank-extra">+${extra} extra</div>
      <div class="rank-score ${g.total < 0 ? 'neg' : 'pos'}">${g.total >= 0 ? '+' : ''}${g.total}</div>
    `;
    list.appendChild(row);
  });
}

function restartGame() {
  clearInterval(state.timerInterval);
  numGroups = 3;
  document.getElementById('cnt-num').textContent = 3;
  renderGroupInputs();
  goScreen('home');
}

/* ==========================================================================
   EFEITOS DE ANIMAÇÃO E PARTÍCULAS
   ========================================================================== */
function spawnParticles(isGood) {
  const container = document.getElementById('particles');
  const colors = isGood
    ? ['#10b981', '#6ee7b7', '#a7f3d0', '#fcd34d']
    : ['#ef4444', '#fca5a5', '#f97316', '#7c3aed'];
    
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.left = (40 + Math.random() * 20) + '%';
    p.style.top = '45%';
    const dx = (Math.random() - 0.5) * 200;
    const dy = -(80 + Math.random() * 160);
    p.style.setProperty('--dx', dx + 'px');
    p.style.setProperty('--dy', dy + 'px');
    p.style.animationDelay = (Math.random() * 0.2) + 's';
    p.style.width = p.style.height = (6 + Math.random() * 8) + 'px';
    container.appendChild(p);
    
    setTimeout(() => p.remove(), 1100);
  }
}

function showGameToast(msg, isUrgent = false) {
  const toast = document.createElement('div');
  toast.className = 'game-toast';
  toast.style.background = isUrgent ? 'rgba(239,68,68,0.95)' : 'rgba(124,58,237,0.95)';
  toast.style.color = '#fff';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2400);
}

/* Inicializa os inputs com os valores padrões de grupo ao carregar */
renderGroupInputs();
