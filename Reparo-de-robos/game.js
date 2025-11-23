/* =============================================================
SISTEMA DE NOME + RANKING COM LISTA ENCADEADA
============================================================= */

let timerInterval = null;

function salvarNome() {
    const nome = document.getElementById("nomeInput").value.trim();
    if (!nome) return alert("Digite um nome válido!");


    localStorage.setItem("nomeJogador", nome);
    localStorage.setItem("tempoInicio", Date.now());
    iniciarJogo(nome);

}

function iniciarJogo(nome) {
    document.getElementById("telaNome").style.display = "none";
    document.getElementById("telaJogo").style.display = "block";
    document.getElementById("nomeJogador").textContent = nome;


    iniciarGeracaoRobos();
    iniciarTimer();


}

function iniciarTimer() {
    const timerEl = document.getElementById("timer");
    timerInterval = setInterval(() => {
        const inicio = parseInt(localStorage.getItem("tempoInicio"));
        timerEl.innerText = `Tempo: ${Math.floor((Date.now() - inicio) / 1000)}s`;
    }, 1000);
}

let jogoFinalizado = false;

function finalizarJogo() {
    if (jogoFinalizado) return; // evita múltiplos alert
    jogoFinalizado = true;
    clearInterval(timerInterval);


    const inicio = parseInt(localStorage.getItem("tempoInicio"));
    const tempoFinal = ((Date.now() - inicio) / 1000).toFixed(2);
    const nome = localStorage.getItem("nomeJogador");

    const resultado = {
        nome,
        tempo: Number(tempoFinal),
        robos: totalRobosConsertados,
        componentes: totalComponentesTroca,
        data: new Date().toLocaleString()
    };

    rankingList.insertByRobos(resultado); // adiciona na lista encadeada
    alert(`Parabéns, ${nome}!\nRobôs consertados: ${totalRobosConsertados}\nComponentes trocados: ${totalComponentesTroca}\nTempo total: ${tempoFinal}s`);

    window.location.href = "ranking.html";


}

/* =============================================================
LISTA ENCADEADA DE ROBÔS COM PRIORIDADE
============================================================= */

class RobotNode {
    constructor(robot) {
        this.data = robot;
        this.next = null;
    }
}

class RobotLinkedList {
    constructor() {
        this.head = null;
        this.size = 0;
    }


    insertByPriority(robot) {
        const newNode = new RobotNode(robot);
        if (!this.head || robot.priority === "emergência") {
            newNode.next = this.head;
            this.head = newNode;
        } else {
            let cur = this.head;
            while (cur.next && cur.next.data.priority !== "emergência") {
                cur = cur.next;
            }
            newNode.next = cur.next;
            cur.next = newNode;
        }
        this.size++;
    }

    removeById(id) {
        if (!this.head) return null;
        if (this.head.data.id === id) {
            const removed = this.head;
            this.head = this.head.next;
            this.size--;
            return removed.data;
        }
        let cur = this.head, prev = null;
        while (cur && cur.data.id !== id) { prev = cur; cur = cur.next; }
        if (!cur) return null;
        prev.next = cur.next;
        this.size--;
        return cur.data;
    }

    searchById(id) {
        let cur = this.head;
        while (cur) {
            if (cur.data.id === id) return cur.data;
            cur = cur.next;
        }
        return null;
    }

    toArray() {
        const arr = [];
        let cur = this.head;
        while (cur) { arr.push(cur.data); cur = cur.next; }
        return arr;
    }


}

/* =============================================================
PILHA DE COMPONENTES DUPLAMENTE ENCADEADA
============================================================= */

class ComponentNode {
    constructor(data) {
        this.data = data;
        this.next = null;
        this.prev = null;
    }
}

class ComponentStack {
    constructor() {
        this.top = null;
        this.size = 0;
    }


    push(data) {
        const node = new ComponentNode(data);
        if (this.top) { this.top.prev = node; node.next = this.top; }
        this.top = node;
        this.size++;
    }

    pop() {
        if (!this.top) return null;
        const removed = this.top;
        this.top = this.top.next;
        if (this.top) this.top.prev = null;
        this.size--;
        return removed.data;
    }

    peek() { return this.top ? this.top.data : null; }

    isEmpty() { return !this.top; }

    toArray() {
        const arr = [];
        let cur = this.top;
        while (cur) { arr.push(cur.data); cur = cur.next; }
        return arr;
    }


}

/* =============================================================
LISTA DE COMPONENTES CONCERTADOS
============================================================= */

class FixedComponentNode {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

class FixedComponentsList {
    constructor() {
        this.head = null;
        this.size = 0;
    }


    add(data) {
        const node = new FixedComponentNode(data);
        node.next = this.head;
        this.head = node;
        this.size++;
    }

    toArray() {
        const arr = [];
        let cur = this.head;
        while (cur) { arr.push(cur.data); cur = cur.next; }
        return arr;
    }


}

let componentesConsertados = new FixedComponentsList();

/* =============================================================
LISTA DE RANKING (ENCAD. COM PERSISTÊNCIA)
============================================================= */

class RankingNode {
    constructor(data) { this.data = data; this.next = null; }
}

class RankingList {
    constructor() { this.head = null; this.size = 0; }

    insertByRobos(data) {
        const node = new RankingNode(data);
        if (!this.head || data.robos > this.head.data.robos) {
            node.next = this.head;
            this.head = node;
        } else {
            let cur = this.head;
            while (cur.next && cur.next.data.robos >= data.robos) cur = cur.next;
            node.next = cur.next;
            cur.next = node;
        }
        this.size++;
        localStorage.setItem("ranking", JSON.stringify(this.toArray()));
    }

    toArray() {
        const arr = [];
        let cur = this.head;
        while (cur) { arr.push(cur.data); cur = cur.next; }
        return arr;
    }

    fromArray(arr) {
        this.head = null;
        this.size = 0;
        arr.forEach(item => this.insertByRobos(item));
    }


}

// Inicializa o ranking carregando do localStorage
let rankingList = new RankingList();
const savedRanking = localStorage.getItem("ranking");
if (savedRanking) {
    rankingList.fromArray(JSON.parse(savedRanking));
}

/* =============================================================
CLASSE ROBÔ
============================================================= */

class Robot {
    constructor(id, model, priority, stack) {
        this.id = id;
        this.model = model;
        this.priority = priority; // emergência > padrão > baixo risco
        this.components = stack;
        this.state = "pendente";
    }
}

/* =============================================================
VARIÁVEIS DO JOGO
============================================================= */

const robotsList = new RobotLinkedList();
let selectedRobotId = null;
const LIMITE_ROBOS = 5;
let totalRobosConsertados = 0;
let totalComponentesTroca = 0;

/* =============================================================
GERAR ROBÔ ALEATÓRIO
============================================================= */

function spawnRobot() {
    if (robotsList.size >= LIMITE_ROBOS) { finalizarJogo(); return; }


    const id = Math.floor(Math.random() * 100000);
    const modelos = ["RX-2000", "T-800", "ZetaPrime", "MK-3"];
    const prioridades = ["emergência", "padrão", "baixo risco"];
    const stack = new ComponentStack();
    const qnt = Math.floor(Math.random() * 4) + 1;
    for (let i = 0; i < qnt; i++) {
        stack.push({ nome: `Componente ${i + 1}`, codigo: `C-${Math.floor(Math.random() * 900 + 100)}`, tempo: Math.floor(Math.random() * 5) + 1 });
    }

    const robot = new Robot(id, modelos[Math.floor(Math.random() * modelos.length)], prioridades[Math.floor(Math.random() * prioridades.length)], stack);
    robotsList.insertByPriority(robot);
    render();

}

/* =============================================================
LOOP DE CHEGADA DE ROBÔS
============================================================= */

let intervaloRobos = null;
function iniciarGeracaoRobos() {
    spawnRobot();
    intervaloRobos = setInterval(spawnRobot, 6000);
}

/* =============================================================
RENDERIZAÇÃO DOS CARDS
============================================================= */

function render() {
    const area = document.getElementById("robots");
    area.innerHTML = "";
    robotsList.toArray().forEach(robot => {
        const div = document.createElement("div");
        div.className = "robot-card";
        if (robot.id === selectedRobotId) div.classList.add("selected");
        div.innerHTML = `<strong>ID:</strong> ${robot.id}<br>Modelo: ${robot.model}<br>Prioridade: ${robot.priority}<br>Componentes: ${robot.components.size}`;
        div.onclick = () => selectRobot(robot.id);
        area.appendChild(div);
    });
    renderStack();
}

function selectRobot(id) { selectedRobotId = id; render(); }

function renderStack() {
    const stackArea = document.getElementById("stack");
    const info = document.getElementById("selected-info");
    stackArea.innerHTML = "";
    if (!selectedRobotId) { info.innerHTML = "Nenhum robô selecionado"; return; }
    const robot = robotsList.searchById(selectedRobotId);
    info.innerHTML = `<strong>ID:</strong>${robot.id}<br>Modelo:${robot.model}<br>Prioridade:${robot.priority}<br>Estado:${robot.state}`;
    robot.components.toArray().forEach(c => {
        const div = document.createElement("div");
        div.className = "component";
        div.innerText = `${c.nome} → Código: ${c.codigo}`;
        stackArea.appendChild(div);
    });
}

/* =============================================================
VERIFICAR CÓDIGO
============================================================= */

function verifyCode() {
    if (!selectedRobotId) return alert("Selecione um robô!");
    const typed = document.getElementById("codeInput").value;
    const robot = robotsList.searchById(selectedRobotId);
    const top = robot.components.peek();
    if (!top) return;
    if (typed === top.codigo) {
        totalComponentesTroca++;
        componentesConsertados.add({ robotId: robot.id, ...top });
        robot.components.pop();
        if (robot.components.isEmpty()) {
            totalRobosConsertados++;
            robotsList.removeById(robot.id);
            selectedRobotId = null;
            if (robotsList.size === 0) finalizarJogo();
        }
    } else alert("❌ Código incorreto!");
    document.getElementById("codeInput").value = "";
    render();
}
