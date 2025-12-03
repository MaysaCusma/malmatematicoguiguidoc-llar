/* Corre do GuiGui - script.js
   Autor: ChatGPT (adaptado para May)
   Observações:
   - imagem do matemático usada em src: /mnt/data/guiguidocellar-removebg-preview.png
   - movimentação com setas do teclado
*/

const chaser = document.getElementById('chaser');
const mathematician = document.getElementById('mathematician');
const modal = document.getElementById('modal');
const charText = document.getElementById('charada-text');
const answerInput = document.getElementById('answer');
const submitBt = document.getElementById('submit-answer');
const skipBt = document.getElementById('skip');
const status = document.getElementById('status');
const fugasTxt = document.getElementById('fugas');
const overlay = document.getElementById('ui-overlay');
const chooseBtns = document.querySelectorAll('.choose');
const win = document.getElementById('win');
const restart = document.getElementById('restart');

let fugas = 0;
let chaserPos = { x: 80, y: 70 }; // left, bottom (px)
let chaserSpeed = 8; // px per tick
let keys = {};
let mathematicianState = {
    xRight: 120,
    bottom: 60,
    speed: 1.0, // base speed for wandering
    fleeing: false
};
let currentAnswer = null;
let playing = false;
let genderChosen = 'male';

/* initial setup - choose gender */
chooseBtns.forEach(b=>{
    b.addEventListener('click', ()=>{
        genderChosen = b.dataset.gender || 'male';
        chaser.classList.remove('male','female');
        chaser.classList.add(genderChosen);
        overlay.classList.add('hidden');
        startGame();
    });
});

/* restart */
restart?.addEventListener('click', ()=>{
    location.reload();
});

/* start loop */
function startGame(){
    playing = true;
    status.textContent = 'Perseguição iniciada — vá até o matemático!';
    // ensure focus for keyboard
    chaser.focus();
    window.requestAnimationFrame(gameLoop);
}

/* keyboard handling */
window.addEventListener('keydown', (e)=>{
    if(!playing) return;
    keys[e.key] = true;
});
window.addEventListener('keyup', (e)=>{
    keys[e.key] = false;
});

/* simple random wandering for mathematician */
function mathWander(){
    // move left-right between 60px and 420px from right edge
    // We'll manipulate "right" style to simulate him moving along path
    let min = 80;
    let max = window.innerWidth * 0.5; // dynamic limit
    // adjust mathem. relative right offset
    let delta = (Math.random() - 0.5) * 6 * mathematicianState.speed;
    mathematicianState.xRight = Math.max(40, Math.min(420, mathematicianState.xRight + delta));
    mathematician.style.right = `${mathematicianState.xRight}px`;
}

/* collision detection */
function isColliding() {
    const a = chaser.getBoundingClientRect();
    const b = mathematician.getBoundingClientRect();
    return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}

/* generate medium/high-school mixed charadas */
function generateCharada() {
    // Types: linear equation, percent, power, factorization, combined ops
    const types = ['linear','percent','power','factor','mixed','rational'];
    const t = types[Math.floor(Math.random()*types.length)];
    let q = '', a = null;

    if(t==='linear'){
        // ax + b = c  -> x = (c-b)/a with integer solution
        let acoef = [1,2,3,4][Math.floor(Math.random()*4)];
        let x = Math.floor(Math.random()*12) - 2; // -2..9
        let b = Math.floor(Math.random()*10) - 5;
        let c = acoef*x + b;
        q = `Resolva a equação: ${acoef}x ${b>=0?'+ '+b: '- '+Math.abs(b)} = ${c}`;
        a = x;
    } else if(t==='percent'){
        // percent problem: A is p% of B -> compute A or B
        let p = [5,10,12,15,20,25,30][Math.floor(Math.random()*7)];
        let B = (Math.floor(Math.random()*18)+5)*5;
        let A = Math.round(B * p / 100);
        q = `${p}% de ${B} é quanto?`;
        a = A;
    } else if(t==='power'){
        // powers or roots
        let base = [2,3,4,5][Math.floor(Math.random()*4)];
        let exp = [2,3,4][Math.floor(Math.random()*3)];
        q = `Quanto é ${base}<sup>${exp}</sup>?`;
        a = Math.pow(base,exp);
    } else if(t==='factor'){
        // fatoração simples: qual o produto de (x+a)(x+b) para x=... or numeric factoring
        let a1 = Math.floor(Math.random()*6)+1;
        let b1 = Math.floor(Math.random()*6)+1;
        let xval = Math.floor(Math.random()*8)+1;
        let expr = (x)=> (x + a1)*(x + b1);
        q = `Calcule (x+${a1})(x+${b1}) para x = ${xval}.`;
        a = expr(xval);
    } else if(t==='mixed'){
        // mistura de operações
        let v1 = Math.floor(Math.random()*25)+3;
        let v2 = Math.floor(Math.random()*20)+2;
        let v3 = Math.floor(Math.random()*10)+1;
        q = `Calcule: (${v1} + ${v2}) × ${v3} ÷ ${Math.max(1,Math.floor(Math.random()*5)+1)} (arredonde se necessário)`;
        let denom = Math.max(1,Math.floor(Math.random()*5)+1);
        a = Math.round(((v1+v2) * v3) / denom);
    } else if(t==='rational'){
        // pequeno problema com fração
        let num = Math.floor(Math.random()*12)+3;
        let den = Math.floor(Math.random()*8)+2;
        let mult = Math.floor(Math.random()*6)+2;
        q = `Simplifique e calcule: (${num}/${den}) × ${mult}`;
        a = Math.round((num/den)*mult*100)/100;
        // if integer, convert to int
        if (Math.abs(a - Math.round(a)) < 0.0001) a = Math.round(a);
    }

    return { q, a };
}

/* show modal with question */
function askCharada(){
    const item = generateCharada();
    currentAnswer = item.a;
    charText.innerHTML = item.q;
    answerInput.value = '';
    modal.classList.remove('hidden');
    answerInput.focus();
}

/* respond */
submitBt.addEventListener('click', ()=>{
});