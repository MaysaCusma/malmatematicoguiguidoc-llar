// Variáveis Globais
let pursuitValue = 0; // 0 = Agente no começo, 100 = Agente alcança o fugitivo
let correctAnswer = 0;
let gameStarted = false;
let isFinalRiddleActive = false;

// Configurações do Jogo
const ADVANCE_ON_CORRECT = 10; 
const RETREAT_ON_WRONG = 5;  
const RETREAT_ON_RIDDLE_FAIL = 25; // MUITO mais recuo se errar a charada difícil
const CAPTURE_THRESHOLD = 90; // Valor a partir do qual o Cifra é alcançado (90% da barra)

// Elementos do DOM
const chaseBar = document.getElementById('chaseBar');
const questionText = document.getElementById('question');
const answerInput = document.getElementById('answerInput');
const message = document.getElementById('message');
const agenteElement = document.getElementById('agente');

/**
 * Inicia o jogo, reseta o estado.
 */
function startGame() {
    pursuitValue = 10; // Agente começa com uma pequena vantagem
    gameStarted = true;
    isFinalRiddleActive = false;
    answerInput.disabled = false;
    message.textContent = 'A perseguição começou! Resolva a conta para avançar.';
    document.querySelector('.game-container > button').style.display = 'none'; 
    
    updatePursuitBar();
    generateQuestion();
}

/**
 * Gera uma nova pergunta de perseguição (simples)
 */
function generateQuestion() {
    if (isFinalRiddleActive) return;

    // Adição e Subtração com números maiores
    const num1 = Math.floor(Math.random() * 50) + 10;
    const num2 = Math.floor(Math.random() * 20) + 5;
    const operator = Math.random() < 0.5 ? '+' : '-';

    let question = '';
    let result = 0;

    if (operator === '+') {
        result = num1 + num2;
        question = `${num1} + ${num2} = ?`;
    } else {
        const bigger = Math.max(num1, num2);
        const smaller = Math.min(num1, num2);
        result = bigger - smaller;
        question = `${bigger} - ${smaller} = ?`;
    }

    correctAnswer = result;
    questionText.textContent = question;
    answerInput.value = ''; 
    answerInput.focus();
}

/**
 * Gera a Charada Matemática FINAL (Difícil).
 */
function generateFinalRiddle() {
    isFinalRiddleActive = true;
    answerInput.type = 'text'; // Permite digitar texto para respostas mais complexas

    const charadas = [
        {
            q: "Eu sou o número que, multiplicado por 4 e subtraído por 12, resulta em 20. Quem sou eu?",
            a: "8"
        },
        {
            q: "Se um terço de um número é 9, qual é o número inteiro? (Apenas o número)",
            a: "27"
        },
        {
            q: "A idade do meu pai é o dobro da minha. Juntas, nossas idades somam 60. Qual é a minha idade? (Apenas o número)",
            a: "20"
        }
    ];

    const riddle = charadas[Math.floor(Math.random() * charadas.length)];
    correctAnswer = riddle.a;
    
    questionText.textContent = `🚨 CHARADA DE CAPTURA FINAL! ${riddle.q}`;
    message.textContent = 'Resolva o enigma para prendê-lo! Se errar, ele foge!';
    answerInput.value = '';
    answerInput.focus();
}

/**
 * Atualiza visualmente a barra e checa o estado do jogo.
 */
function updatePursuitBar() {
    pursuitValue = Math.max(0, Math.min(100, pursuitValue));
    
    // Chase bar preenchida de 0 a 100
    chaseBar.style.width = pursuitValue + '%'; 
    
    // Agente se move da esquerda (0) para a direita (100)
    agenteElement.style.left = (pursuitValue - 2) + '%'; // Move o agente junto com o progresso
    
    // Cifra (Fugitivo) permanece na ponta da fuga
    
    // Checagem de Fim de Jogo (Fuga total)
    if (pursuitValue < 0) { // O Agente 'recuou' demais
        endGame(false); 
        return;
    }
    
    // Checagem de Charada Final (Alcançou)
    if (pursuitValue >= CAPTURE_THRESHOLD && !isFinalRiddleActive) {
        // Redefine a posição para o ponto de captura para estabilidade
        pursuitValue = CAPTURE_THRESHOLD; 
        updatePursuitBar(); 
        generateFinalRiddle();
    }
}

/**
 * Verifica a resposta do jogador e atualiza o estado do jogo.
 */
function checkAnswer() {
    if (!gameStarted) return;

    const playerAnswer = answerInput.value.trim().toLowerCase();
    const isCorrect = (playerAnswer == correctAnswer);

    if (playerAnswer === "") {
        message.textContent = 'Por favor, digite sua resposta.';
        return;
    }

    if (isCorrect) {
        if (isFinalRiddleActive) {
            // Se acerta a Charada Final: Vitória
            endGame(true);
        } else {
            // Se acerta a perseguição normal: Agente avança
            pursuitValue += ADVANCE_ON_CORRECT;
            message.textContent = `✅ Correto! Avanço rápido (+${ADVANCE_ON_CORRECT}%)!`;
            updatePursuitBar();
            generateQuestion();
        }
    } else {
        if (isFinalRiddleActive) {
            // Se erra a Charada Final: Cifra escapa MUITO, charada repete
            pursuitValue -= RETREAT_ON_RIDDLE_FAIL;
            message.textContent = `❌ ERRADO! O Cifra fugiu! (-${RETREAT_ON_RIDDLE_FAIL}%) Tente a charada novamente.`;
            updatePursuitBar();
            generateFinalRiddle(); 
        } else {
            // Se erra a perseguição normal: Cifra avança (Agente recua)
            pursuitValue -= RETREAT_ON_WRONG; 
            message.textContent = `❌ Errado! O Cifra ganhou vantagem! (-${RETREAT_ON_WRONG}%)`;
            updatePursuitBar();
            generateQuestion();
        }
    }
}

/**
 * Função para encerrar o jogo (Vitória ou Derrota).
 */
function endGame(isVictory) {
    gameStarted = false;
    answerInput.disabled = true;
    answerInput.type = 'number'; // Volta para número (limpeza)
    isFinalRiddleActive = false;
    
    if (isVictory) {
        message.textContent = '🎉 CAPTURA BEM SUCEDIDA! O Cifra foi preso! 🎉';
        questionText.textContent = 'FIM DE JOGO: Você resolveu o enigma e prendeu o fugitivo.';
    } else {
        message.textContent = '😟 O Cifra escapou! Fim de Jogo.';
        questionText.textContent = 'FIM DE JOGO: O fugitivo escapou e a perseguição terminou.';
    }
    
    const startButton = document.querySelector('.game-container > button');
    startButton.textContent = 'Recomeçar Jogo';
    startButton.style.display = 'block';
}

// Inicializa a tela
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.game-container > button').style.display = 'block';
    updatePursuitBar();
});