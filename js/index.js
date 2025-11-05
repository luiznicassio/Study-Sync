/* MODEL */
const create = document.querySelector('.create');
const addbtn = document.querySelector('#addToggle')  
const STORAGE_KEY = "studysync:tarefas";
let tarefas = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

/* UI refs */
const listaEl = document.getElementById("lista");
const form = document.getElementById("taskForm");
const tituloEl = document.getElementById("titulo");
const inicioEl = document.getElementById("inicio");
const fimEl = document.getElementById("fim");
const prioridadeEl = document.getElementById("prioridade"); // 🔹 prioridade
const editingIndexEl = document.getElementById("editingIndex");
const addToggle = document.getElementById("addToggle");
const cancelEdit = document.getElementById("cancelEdit");
const clearAll = document.getElementById("clearAll");
const emptyEl = document.getElementById("empty");

function saveStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tarefas));
}

function formatDate(d) {
  if (!d) return "";
  const parts = d.split("-");
  return parts[2] + "/" + parts[1] + "/" + parts[0];
}

/* 💡 Função nova — contador de tempo restante */
function tempoRestante(fim) {
  if (!fim) return "";
  const agora = new Date();
  const dataFim = new Date(fim);
  const diff = dataFim - agora;

  if (diff <= 0) {
    return "<p class='deadline expired'>⛔ Prazo encerrado!</p>";
  }

  const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
  const horas = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutos = Math.floor((diff / (1000 * 60)) % 60);

  if (dias > 0) return `<p class='deadline'>⏳ ${dias} dia${dias>1?"s":""} e ${horas}h restantes</p>`;
  if (horas > 0) return `<p class='deadline'>⏳ ${horas}h e ${minutos}min restantes</p>`;
  return `<p class='deadline'>⏳ ${minutos} min restantes</p>`;
}

function render() {
  listaEl.innerHTML = "";

  if (tarefas.length === 0) {
    emptyEl.style.display = "block";
    return;
  } else {
    emptyEl.style.display = "none";
  }

  // 🔹 Ordena tarefas por prioridade: alta -> média -> baixa
  tarefas.sort((a, b) => {
    const ordem = { alta: 1, media: 2, baixa: 3 };
    return ordem[a.prioridade] - ordem[b.prioridade];
  });

  tarefas.forEach((t, i) => {
    const div = document.createElement("div");
    div.className = "task";
    div.innerHTML = `
      <div class="left">
        <div class="dot"></div>
        <div>
          <h3>${escapeHtml(t.titulo)}</h3>
          <p>${formatDate(t.inicio)} ${t.fim ? "– " + formatDate(t.fim) : ""}</p>
          ${t.fim ? tempoRestante(t.fim) : ""}
          <span class="prioridade ${t.prioridade}">${t.prioridade}</span>
        </div>
      </div>
      <div class="actions">
        <div class="menu" data-index="${i}">
          <button class="menu-btn">⋯</button>
          <div class="menu-list">
            <button data-action="editar">Editar</button>
            <button data-action="excluir">Excluir</button>
          </div>
        </div>
      </div>`;
    listaEl.appendChild(div);
  });

  attachMenuHandlers();
}

function attachMenuHandlers() {
  document.querySelectorAll(".menu").forEach((menu) => {
    const btn = menu.querySelector(".menu-btn");
    const list = menu.querySelector(".menu-list");

    btn.onclick = (e) => {
      e.stopPropagation();
      document.querySelectorAll(".menu-list").forEach((m) => {
        if (m !== list) m.style.display = "none";
      });
      list.style.display = list.style.display === "block" ? "none" : "block";
    };

    list.querySelectorAll("button").forEach((b) => {
      b.onclick = () => {
        const action = b.dataset.action;
        const idx = Number(menu.dataset.index);
        list.style.display = "none";
        if (action === "editar") {
          startEdit(idx);
          create.style.display = "block"; // 🔹 mostra o formulário ao editar
        }
        if (action === "excluir") {
          doDelete(idx);
        }
      };
    });
  });
}

function escapeHtml(str) {
  return String(str).replace(
    /[&<>"'`=\/]/g,
    (s) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
        "/": "&#x2F;",
        "`": "&#x60;",
        "=": "&#x3D;",
      }[s])
  );
}

function adicionarTarefa(obj) {
  tarefas.push(obj);
  saveStorage();
  render();
}

function doDelete(index) {
  if (!confirm("Deseja excluir essa tarefa?")) return;
  tarefas.splice(index, 1);
  saveStorage();
  render();
}

function startEdit(index) {
  const t = tarefas[index];
  tituloEl.value = t.titulo;
  inicioEl.value = t.inicio;
  fimEl.value = t.fim || "";
  prioridadeEl.value = t.prioridade || "media"; // 🔹 define prioridade ao editar
  editingIndexEl.value = index;
  
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function applyEdit(index, obj) {
  tarefas[index] = obj;
  saveStorage();
  render();
}


form.addEventListener("submit", (e) => {
  e.preventDefault();
  const titulo = tituloEl.value.trim();
  const inicio = inicioEl.value;
  const fim = fimEl.value || "";
  const prioridade = prioridadeEl.value; // 🔹 pega prioridade

  if (!titulo || !inicio) {
    alert("Preencha título e data de início.");
    return;
  }

  const editing = editingIndexEl.value;
  const obj = { titulo, inicio, fim, prioridade };

  if (editing === "") {
    adicionarTarefa(obj);
  } else {
    applyEdit(Number(editing), obj);
    editingIndexEl.value = "";
    cancelEdit.style.display = "none";
  }

  form.reset();
  const addAtivado = document.querySelector('#addativado')  
  const addinativo = document.querySelector('#addToggle')
  
  addinativo.style.display = "block";
  addAtivado.style.display = "none";
  create.style.display = "none"; //  esconde o formulário após salvar
});

cancelEdit.addEventListener("click", () => {
  editingIndexEl.value = "";
  cancelEdit.style.display = "none";
  form.reset();
});

addToggle.addEventListener("click", () => {
  tituloEl.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

clearAll.addEventListener("click", () => {
  if (!confirm("Limpar todas as tarefas?")) return;
  tarefas = [];
  saveStorage();
  render();
});

document.addEventListener("click", () => {
  document.querySelectorAll(".menu-list").forEach((m) => (m.style.display = "none"));
});

/* 💡 Atualiza o contador automaticamente a cada minuto */
setInterval(render, 60000); // atualiza automaticamente a cada minuto
window.addEventListener("focus", render); // atualiza ao voltar para a aba

// Inicializa render
render();
