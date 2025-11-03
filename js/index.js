/* MODEL */
    const STORAGE_KEY = "studysync:tarefas";
    let tarefas = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

    /* UI refs */
    const listaEl = document.getElementById("lista");
    const form = document.getElementById("taskForm");
    const tituloEl = document.getElementById("titulo");
    const inicioEl = document.getElementById("inicio");
    const fimEl = document.getElementById("fim");
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

    function render() {
      listaEl.innerHTML = "";
      if (tarefas.length === 0) {
        emptyEl.style.display = "block";
        return;
      } else {
        emptyEl.style.display = "none";
      }

      tarefas.forEach((t, i) => {
        const div = document.createElement("div");
        div.className = "task";
        div.innerHTML = `
          <div class="left">
            <div class="dot"></div>
            <div>
              <h3>${escapeHtml(t.titulo)}</h3>
              <p>${formatDate(t.inicio)} ${t.fim ? "– " + formatDate(t.fim) : ""}</p>
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
            if (action === "editar") startEdit(idx);
            if (action === "excluir") doDelete(idx);
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
      editingIndexEl.value = index;
      cancelEdit.style.display = "inline-block";
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
      if (!titulo || !inicio) {
        alert("Preencha título e data de início.");
        return;
      }
      const editing = editingIndexEl.value;
      const obj = { titulo, inicio, fim };
      if (editing === "") {
        adicionarTarefa(obj);
      } else {
        applyEdit(Number(editing), obj);
        editingIndexEl.value = "";
        cancelEdit.style.display = "none";
      }
      form.reset();
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

    render();