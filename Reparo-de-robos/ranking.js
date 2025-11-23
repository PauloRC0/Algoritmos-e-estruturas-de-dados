// Carrega o ranking salvo no localStorage
const ranking = JSON.parse(localStorage.getItem("ranking")) || [];

// Seleciona o container onde os cards aparecerão
const container = document.getElementById("ranking-container");

// Ordena pelo número de robôs consertados (maior → menor)
ranking.sort((a, b) => b.robos - a.robos);

// Se não houver dados, avisa
if (ranking.length === 0) {
    container.innerHTML = "<p>Nenhum registro encontrado.</p>";
}

// Cria um card para cada jogador
ranking.forEach((item, index) => {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
        <h2>#${index + 1} - ${item.nome}</h2>
        <p><strong>Robôs consertados:</strong> ${item.robos}</p>
        <p><strong>Componentes trocados:</strong> ${item.componentes}</p>
        <p><strong>Tempo total:</strong> ${item.tempo}s</p>
    `;

    container.appendChild(card);
});
