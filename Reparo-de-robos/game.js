/* =============================================================
   SISTEMA DE NOME + RANKING
   ============================================================= */

// Salvar nome e iniciar jogo
function salvarNome() {
    const nome = document.getElementById("nomeInput").value;

    if (nome.trim() === "") {
        alert("Digite um nome válido!");
        return;
    }

    localStorage.setItem("nomeJogador", nome);

    // Salva o início do jogo
    localStorage.setItem("tempoInicio", Date.now());

    iniciarJogo(nome);
}

function iniciarJogo(nome) {
    document.getElementById("telaNome").style.display = "none";
    document.getElementById("telaJogo").style.display = "block";
    document.getElementById("nomeJogador").textContent = nome;
}

// Finalizar jogo e registrar no ranking
function finalizarJogo() {
    const inicio = parseInt(localStorage.getItem("tempoInicio"));
    const tempoFinal = ((Date.now() - inicio) / 1000).toFixed(2);
    const nome = localStorage.getItem("nomeJogador");

    const resultado = {
        nome: nome,
        tempo: Number(tempoFinal),
        robos: totalRobosConsertados,
        componentes: totalComponentesTroca
    };

    let ranking = JSON.parse(localStorage.getItem("ranking")) || [];
    ranking.push(resultado);
    localStorage.setItem("ranking", JSON.stringify(ranking));

    alert(`Parabéns, ${nome}!  
Robôs consertados: ${totalRobosConsertados}  
Componentes trocados: ${totalComponentesTroca}  
Tempo total: ${tempoFinal}s`);

    window.location.href = "ranking.html";
}

/* =============================================================
   LISTA ENCADEADA DE ROBÔS
   ============================================================= */

class RobotNode {
    constructor(robotData) {
        this.data = robotData;
        this.next = null;
    }
}

class RobotLinkedList {
    constructor() {
        this.head = null;
        this.size = 0;
    }

    insert(robotData) {
        const newNode = new RobotNode(robotData);

        if (!this.head) {
            this.head = newNode;
        } else {
            let cur = this.head;
            while (cur.next !== null) cur = cur.next;
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

        let cur = this.head;
        let prev = null;

        while (cur !== null && cur.data.id !== id) {
            prev = cur;
            cur = cur.next;
        }

        if (cur === null) return null;

        prev.next = cur.next;
        this.size--;
        return cur.data;
    }

    searchById(id) {
        let cur = this.head;
        while (cur !== null) {
            if (cur.data.id === id) return cur.data;
            cur = cur.next;
        }
        return null;
    }

    toArray() {
        let arr = [];
        let cur = this.head;
        while (cur !== null) {
            arr.push(cur.data);
            cur = cur.next;
        }
        return arr;
    }
}

/* =============================================================
   PILHA DE COMPONENTES (MANUAL)
   ============================================================= */

class ComponentNode {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

class ComponentStack {
    constructor() {
        this.top = null;
        this.size = 0;
    }

    push(data) {
        const newNode = new ComponentNode(data);
        newNode.next = this.top;
        this.top = newNode;
        this.size++;
    }

    pop() {
        if (!this.top) return null;
        const removed = this.top;
        this.top = this.top.next;
        this.size--;
        return removed.data;
    }

    peek() {
        return this.top ? this.top.data : null;
    }

    isEmpty() {
        return this.top === null;
    }

    toArray() {
        let list = [];
        let cur = this.top;
        while (cur !== null) {
            list.push(cur.data);
            cur = cur.next;
        }
        return list;
    }
}

/* =============================================================
   CLASSE DO ROBÔ
   ============================================================= */

class Robot {
    constructor(id, model, priority, stack) {
        this.id = id;
        this.model = model;
        this.priority = priority;
        this.components = stack;
        this.state = "pendente";
    }
}

/* =============================================================
   VARIÁVEIS DO JOGO
   ============================================================= */

const robotsList = new RobotLinkedList();
let selectedRobotId = null;

// Limite máximo de robôs na oficina
const LIMITE_ROBOS = 5;

// Contadores para ranking
let totalRobosConsertados = 0;
let totalComponentesTroca = 0;

/* =============================================================
   GERAR ROBÔ ALEATÓRIO
   ============================================================= */

function spawnRobot() {

    // Bloqueia criação se atingir o limite
    if (robotsList.size >= LIMITE_ROBOS) {
        alert("🚨 A oficina ficou superlotada! Jogo encerrado!");
        finalizarJogo(); // Jogo termina aqui
        return;
    }


    const id = Math.floor(Math.random() * 10000);
    const modelos = ["RX-2000", "T-800", "ZetaPrime", "MK-3"];
    const prioridades = ["emergência", "padrão", "baixo risco"];

    const stack = new ComponentStack();
    const qty = Math.floor(Math.random() * 4) + 1;

    for (let i = 0; i < qty; i++) {
        stack.push({
            nome: "Componente " + (i + 1),
            codigo: "C-" + Math.floor(Math.random() * 900 + 100),
            tempo: Math.floor(Math.random() * 5) + 1
        });
    }

    const robot = new Robot(
        id,
        modelos[Math.floor(Math.random() * modelos.length)],
        prioridades[Math.floor(Math.random() * prioridades.length)],
        stack
    );

    robotsList.insert(robot);
    render();
}

/* =============================================================
   EXIBIR ROBÔS
   ============================================================= */

function render() {
    const robotArea = document.getElementById("robots");
    robotArea.innerHTML = "";

    const robots = robotsList.toArray();

    robots.forEach(robot => {
        const div = document.createElement("div");
        div.className = "robot-card";
        if (robot.id === selectedRobotId) div.classList.add("selected");

        div.innerHTML = `
            <strong>ID:</strong> ${robot.id}<br>
            Modelo: ${robot.model}<br>
            Prioridade: ${robot.priority}<br>
            Componentes restantes: ${robot.components.size}
        `;

        div.onclick = () => selectRobot(robot.id);

        robotArea.appendChild(div);
    });

    renderStack();
}

/* =============================================================
   SELECIONAR ROBÔ
   ============================================================= */

function selectRobot(id) {
    selectedRobotId = id;
    render();
}

/* =============================================================
   EXIBIR A PILHA
   ============================================================= */

function renderStack() {
    const stackArea = document.getElementById("stack");
    const info = document.getElementById("selected-info");

    stackArea.innerHTML = "";

    if (!selectedRobotId) {
        info.innerText = "Nenhum robô selecionado";
        return;
    }

    const robot = robotsList.searchById(selectedRobotId);

    info.innerHTML = `
        <strong>ID:</strong> ${robot.id}<br>
        Modelo: ${robot.model}<br>
        Prioridade: ${robot.priority}<br>
        Estado: ${robot.state}
    `;

    const components = robot.components.toArray();
    components.forEach(c => {
        let div = document.createElement("div");
        div.className = "component";
        div.innerText = `${c.nome} → Código: ${c.codigo}`;
        stackArea.appendChild(div);
    });
}

/* =============================================================
   VALIDAR CÓDIGO DO COMPONENTE
   ============================================================= */

function verifyCode() {
    if (!selectedRobotId) return alert("Selecione um robô!");

    const typed = document.getElementById("codeInput").value;
    const robot = robotsList.searchById(selectedRobotId);

    const top = robot.components.peek();
    if (!top) return;

    if (typed === top.codigo) {

        // Contabiliza componente trocado
        totalComponentesTroca++;

        alert("✔ Código correto! Componente substituído.");
        robot.components.pop();

        // Se terminou a pilha → robô consertado
        if (robot.components.isEmpty()) {
            alert("🤖 Robô consertado!");

            totalRobosConsertados++;

            robotsList.removeById(robot.id);
            selectedRobotId = null;

            // Se acabou o jogo
            if (robotsList.size === 0) {
                finalizarJogo();
                return;
            }
        }

    } else {
        alert("❌ Código errado!");
    }

    // Tempo entre cada nova chegada de robô (ms)
    const TEMPO_RODADA = 5000; // 5 segundos

    setInterval(() => {
        spawnRobot(); // novo robô chega a cada rodada
    }, TEMPO_RODADA);

    document.getElementById("codeInput").value = "";
    render();
}
