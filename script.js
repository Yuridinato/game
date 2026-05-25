const GROUP_COLORS = ['#534AB7','#1D9E75','#D85A30','#BA7517','#D4537E','#378ADD'];

const QUESTIONS = [
  { type:'Objetiva', text:'Qual linguagem de programação é conhecida por ser orientada a objetos e multiplataforma?', choices:['Python','JavaScript','Java','C','Ruby'], correct:2 },
  { type:'Objetiva', text:'Qual estrutura de dados utiliza a política LIFO (último a entrar, primeiro a sair)?', choices:['Fila','Árvore','Lista encadeada','Pilha','Grafo'], correct:3 },
  { type:'Verdadeiro ou Falso', text:'Um banco de dados relacional organiza os dados em tabelas com linhas e colunas.', choices:['Verdadeiro','Falso','Depende do SGBD','Apenas em alguns casos','Somente em SQL'], correct:0 },
  { type:'Certo ou Errado', text:'O protocolo HTTP é stateful, ou seja, mantém o estado da conexão entre as requisições.', choices:['Certo','Errado','Parcialmente certo','Depende da versão','Apenas no HTTP/2'], correct:1 },
  { type:'Completar lacuna', text:'O padrão de projeto __________ define uma interface para criar objetos, mas deixa as subclasses decidirem quais classes instanciar.', choices:['Singleton','Observer','Factory Method','Decorator','Adapter'], correct:2 },
  { type:'Objetiva', text:'Qual comando Git é utilizado para unir branches diferentes?', choices:['git pull','git push','git commit','git merge','git clone'], correct:3 },
  { type:'Verdadeiro ou Falso', text:'CSS é uma linguagem de programação de propósito geral.', choices:['Verdadeiro','Falso','Depende do contexto','Sim, com JavaScript','Apenas em projetos web'], correct:1 },
  { type:'Objetiva', text:'Em redes de computadores, qual camada do modelo OSI é responsável pelo endereçamento IP?', choices:['Física','Enlace','Rede','Transporte','Aplicação'], correct:2 },
  { type:'Completar lacuna', text:'Na programação orientada a objetos, o conceito de __________ permite que uma classe herde atributos e métodos de outra.', choices:['Polimorfismo','Encapsulamento','Herança','Abstração','Interface'], correct:2 },
  { type:'Certo ou Errado', text:'O algoritmo de ordenação Bubble Sort tem complexidade O(n²) no pior caso.', choices:['Certo','Errado','Depende da implementação','Apenas em listas grandes','Somente em listas desordenadas'], correct:0 },
];

let state = {
  groups:[],
  currentGroupIdx:0,
  boardCells:[],
  timerInterval:null,
  timerSecs:30,
  usedQuestions:[],
};

function changeGroups(delta) {
  const inp = document.getElementById('num-groups');
  let v = parseInt(inp.value) + delta;
  if(v<2)v=2; if(v>6)v=6;
  inp.value=v;
  renderGroupInputs();
}

function renderGroupInputs() {
  const n = parseInt(document.getElementById('num-groups').value);
  const wrap = document.getElementById('group-names-list');
  wrap.innerHTML = '';
  for(let i=0;i<n;i++){
    const d = document.createElement('div');
    d.className='group-name-field';
    const inp = document.createElement('input');
    inp.type='text'; inp.placeholder=`Nome do Grupo ${i+1}`;
    inp.id=`gname-${i}`; inp.value=`Grupo ${i+1}`;
    d.appendChild(inp); wrap.appendChild(d);
  }
}

function startGame() {
  const n = parseInt(document.getElementById('num-groups').value);
  state.groups = [];
  for(let i=0;i<n;i++){
    const nm = document.getElementById(`gname-${i}`).value || `Grupo ${i+1}`;
    state.groups.push({ name:nm, pts:0, correct:0, wrong:0, bonusPts:0, color:GROUP_COLORS[i] });
  }
  state.currentGroupIdx=0;
  state.usedQuestions=[];
  buildBoard();
  goScreen('board');
  document.getElementById('btn-ranking').style.display='flex';
  document.getElementById('header-scores').style.display='flex';
  updateHeaderScores();
}

function buildBoard() {
  const bonusIdx = [2,9];
  state.boardCells = [];
  let qPool = Array.from({length:10},(_,i)=>i);
  for(let i=0;i<12;i++){
    if(bonusIdx.includes(i)){
      state.boardCells.push({type:i===2?'bonus':'malus',used:false});
    } else {
      state.boardCells.push({type:'question',used:false});
    }
  }
  renderBoard();
  renderBoardScores();
}

const CELL_ICONS = [
  'ti-circle-1','ti-circle-2','ti-gift','ti-circle-4','ti-circle-5',
  'ti-circle-6','ti-circle-7','ti-circle-8','ti-circle-9','ti-circle-0',
  'ti-triangle','ti-mood-sad'
];
const CELL_LABELS = [
  'Pergunta 1','Pergunta 2','Bônus +2','Pergunta 4','Pergunta 5',
  'Pergunta 6','Pergunta 7','Pergunta 8','Pergunta 9','Pergunta 10',
  'Pergunta 11','Ônus -2'
];

function renderBoard() {
  const grid = document.getElementById('board-grid');
  grid.innerHTML='';
  state.boardCells.forEach((cell,i)=>{
    const d = document.createElement('div');
    d.className='board-cell'+(cell.type==='bonus'?' bonus':(cell.type==='malus'?' malus':''))+(cell.used?' used':'');
    d.innerHTML=`<span class="cell-num">${i+1}</span><i class="ti ${CELL_ICONS[i]}" aria-hidden="true"></i><div class="cell-label">${CELL_LABELS[i]}</div>`;
    if(!cell.used) d.onclick=()=>pickCell(i);
    grid.appendChild(d);
  });
  const grp = state.groups[state.currentGroupIdx];
  document.getElementById('current-group-name').textContent=grp.name;
  document.getElementById('current-dot').style.background=grp.color;
}

function renderBoardScores() {
  const wrap = document.getElementById('board-scores');
  wrap.innerHTML='';
  state.groups.forEach((g,i)=>{
    const d=document.createElement('div');
    d.className='score-card'+(i===state.currentGroupIdx?' active-turn':'');
    const pts=g.pts+g.bonusPts;
    d.innerHTML=`<div class="score-card-name"><span class="dot" style="background:${g.color};width:8px;height:8px;border-radius:50%;display:inline-block"></span>${g.name}</div><div class="score-card-pts ${pts<0?'negative':''}">${pts>=0?'+':''}${pts}</div>`;
    wrap.appendChild(d);
  });
}

function updateHeaderScores() {
  const wrap = document.getElementById('header-scores');
  wrap.innerHTML='';
  state.groups.forEach(g=>{
    const pts=g.pts+g.bonusPts;
    const c=document.createElement('div');
    c.className='tg-score-chip';
    c.innerHTML=`<span class="dot" style="background:${g.color}"></span>${g.name}: <span class="pts">${pts>=0?'+':''}${pts}</span>`;
    wrap.appendChild(c);
  });
}

function pickCell(i) {
  const cell=state.boardCells[i];
  cell.used=true;
  if(cell.type==='bonus'||cell.type==='malus'){
    showBonus(cell.type);
  } else {
    showQuestion();
  }
}

function showBonus(type) {
  const grp=state.groups[state.currentGroupIdx];
  const card=document.getElementById('bonus-card');
  if(type==='bonus'){
    grp.bonusPts+=2;
    card.innerHTML=`<div class="bonus-overlay bbonus"><div class="hero-icon" style="color:#1D9E75"><i class="ti ti-gift" aria-hidden="true"></i></div><div class="hero-title">Bônus!</div><div class="hero-sub">${grp.name} caiu na casa especial de bônus!</div><div class="result-pts plus">+2 pontos</div></div>`;
  } else {
    grp.bonusPts-=2;
    card.innerHTML=`<div class="bonus-overlay bmalus"><div class="hero-icon" style="color:#D85A30"><i class="ti ti-mood-sad" aria-hidden="true"></i></div><div class="hero-title">Ônus!</div><div class="hero-sub">${grp.name} caiu na casa especial de ônus!</div><div class="result-pts minus">-2 pontos</div></div>`;
  }
  updateHeaderScores();
  goScreen('bonus');
}

let currentAnswer=-1;
let currentQ=null;

function showQuestion() {
  let avail=[];
  for(let i=0;i<QUESTIONS.length;i++){
    if(!state.usedQuestions.includes(i)) avail.push(i);
  }
  if(avail.length===0){state.usedQuestions=[];avail=Array.from({length:QUESTIONS.length},(_,i)=>i);}
  const qi=avail[Math.floor(Math.random()*avail.length)];
  state.usedQuestions.push(qi);
  currentQ=QUESTIONS[qi];
  currentAnswer=-1;

  document.getElementById('q-type-badge').textContent=currentQ.type;
  document.getElementById('q-text').innerHTML=currentQ.type==='Completar lacuna'
    ? currentQ.text.replace('__________','<span class="q-blank"></span>')
    : currentQ.text;

  const choicesEl=document.getElementById('choices');
  choicesEl.innerHTML='';
  const letters=['A','B','C','D','E'];
  currentQ.choices.forEach((ch,i)=>{
    const btn=document.createElement('button');
    btn.className='choice-btn';
    btn.innerHTML=`<span class="choice-letter">${letters[i]}</span>${ch}`;
    btn.onclick=()=>selectAnswer(i);
    choicesEl.appendChild(btn);
  });

  document.getElementById('result-panel').style.display='none';
  document.getElementById('next-btn-wrap').style.display='none';

  startTimer();
  goScreen('question');
}

function startTimer() {
  clearInterval(state.timerInterval);
  state.timerSecs=30;
  const disp=document.getElementById('timer-display');
  const bar=document.getElementById('timer-bar');
  disp.textContent=30; disp.className='timer-num';
  bar.style.width='100%'; bar.className='timer-bar';

  state.timerInterval=setInterval(()=>{
    state.timerSecs--;
    disp.textContent=state.timerSecs;
    bar.style.width=(state.timerSecs/30*100)+'%';
    if(state.timerSecs<=10){disp.className='timer-num urgent';bar.className='timer-bar urgent';}
    if(state.timerSecs<=0){
      clearInterval(state.timerInterval);
      handleTimeout();
    }
  },1000);
}

function selectAnswer(idx) {
  clearInterval(state.timerInterval);
  currentAnswer=idx;
  const btns=document.querySelectorAll('.choice-btn');
  btns.forEach((b,i)=>{
    b.classList.add('disabled');
    if(i===currentQ.correct) b.classList.add('correct');
    else if(i===idx) b.classList.add('wrong');
  });

  const grp=state.groups[state.currentGroupIdx];
  const isCorrect=idx===currentQ.correct;
  if(isCorrect) grp.pts++;
  else grp.pts--;
  updateHeaderScores();

  const panel=document.getElementById('result-panel');
  panel.style.display='block';
  if(isCorrect){
    panel.innerHTML=`<div class="result-overlay correct"><i class="ti ti-circle-check result-icon" aria-hidden="true"></i><div class="result-title">Resposta correta!</div><div class="result-sub">${grp.name} acertou!</div><div class="result-pts plus">+1 ponto</div></div>`;
  } else {
    panel.innerHTML=`<div class="result-overlay wrong"><i class="ti ti-circle-x result-icon" aria-hidden="true"></i><div class="result-title">Resposta errada!</div><div class="result-sub">${grp.name} errou.</div><div class="result-pts minus">-1 ponto</div></div>`;
  }
  document.getElementById('next-btn-wrap').style.display='flex';
}

function handleTimeout() {
  const btns=document.querySelectorAll('.choice-btn');
  btns.forEach((b,i)=>{
    b.classList.add('disabled');
    if(i===currentQ.correct) b.classList.add('correct');
  });
  const panel=document.getElementById('result-panel');
  panel.style.display='block';
  panel.innerHTML=`<div class="result-overlay timeout"><i class="ti ti-clock-off result-icon" aria-hidden="true"></i><div class="result-title">Tempo esgotado!</div><div class="result-sub">Nenhum grupo pontua nesta rodada.</div><div class="result-pts" style="color:var(--color-text-secondary)">0 pts</div></div>`;
  document.getElementById('next-btn-wrap').style.display='flex';
}

function nextTurn() {
  state.currentGroupIdx=(state.currentGroupIdx+1)%state.groups.length;
  renderBoard();
  renderBoardScores();
  updateHeaderScores();
  goScreen('board');
}

function goScreen(name) {
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById('screen-'+name).classList.add('active');
  if(name==='ranking') renderRanking();
}

function renderRanking() {
  const sorted=[...state.groups].map((g,i)=>({...g, total:g.pts+g.bonusPts, origIdx:i}))
    .sort((a,b)=>b.total-a.total);
  const extraPts=[1,0.75,0.5];
  const list=document.getElementById('ranking-list');
  list.innerHTML='';
  sorted.forEach((g,pos)=>{
    const d=document.createElement('div');
    d.className='rank-row rank-'+(pos+1);
    const trophy=pos<3?`<div class="rank-trophy"><i class="ti ${pos===0?'ti-trophy':pos===1?'ti-medal':'ti-award'}" aria-hidden="true"></i></div>`:'';
    const extra=pos<3?`<span class="rank-extra-pts">+${extraPts[pos]} extra</span>`:'<span class="rank-extra-pts">+0.25 extra</span>';
    d.innerHTML=`
      <div class="rank-pos">${pos+1}</div>
      ${trophy}
      <div style="flex:1">
        <div class="rank-name" style="display:flex;align-items:center;gap:8px">
          <span class="dot" style="background:${g.color};width:10px;height:10px;border-radius:50%;display:inline-block;flex-shrink:0"></span>${g.name}
        </div>
        <div class="rank-bonus" style="margin-top:2px">Acertos: ${g.correct} | Erros: ${g.wrong} | Bônus: ${g.bonusPts>=0?'+':''}${g.bonusPts}</div>
      </div>
      ${extra}
      <div class="rank-pts ${g.total<0?'negative':''}">${g.total>=0?'+':''}${g.total}</div>
    `;
    list.appendChild(d);
  });
}

function restartGame() {
  clearInterval(state.timerInterval);
  document.getElementById('btn-ranking').style.display='none';
  document.getElementById('header-scores').style.display='none';
  renderGroupInputs();
  goScreen('home');
}

renderGroupInputs();
