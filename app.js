const USERS = [
  { email: "coord@escola.ao", pass: "1234", nome: "António Manuel", perfil: "Coordenador de Turno" },
  { email: "direccao@escola.ao", pass: "1234", nome: "Maria Sebastião", perfil: "Direcção" }
];

const MODULES = [
  { titulo: "Turmas e Alunos", desc: "Gestão de turnos, classes, turmas e fichas de alunos.", perfis: ["Coordenador de Turno", "Direcção"] },
  { titulo: "Registo de Ocorrências", desc: "Registar incidentes, envolvidos e testemunhas.", perfis: ["Coordenador de Turno"] },
  { titulo: "Medidas Disciplinares", desc: "Aplicar e acompanhar o cumprimento de medidas.", perfis: ["Coordenador de Turno"] },
  { titulo: "Histórico do Aluno", desc: "Consultar ocorrências, medidas e contactos por aluno.", perfis: ["Coordenador de Turno", "Direcção"] }
];

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const pass = document.getElementById("password").value.trim();
    const errorMsg = document.getElementById("errorMsg");

    if (!email || !pass) {
      errorMsg.textContent = "Preencha o e-mail e a palavra-passe para continuar.";
      return;
    }

    const user = USERS.find(u => u.email === email && u.pass === pass);
    if (!user) {
      errorMsg.textContent = "Credenciais inválidas. Verifique o e-mail e a palavra-passe.";
      return;
    }

    localStorage.setItem("caderneta_user", JSON.stringify(user));
    window.location.href = "dashboard.html";
  });
}

const userInfo = document.getElementById("userInfo");
if (userInfo) {
  const user = JSON.parse(localStorage.getItem("caderneta_user"));
  if (!user) {
    window.location.href = "index.html";
  } else {
    userInfo.textContent = `${user.nome} (${user.perfil})`;
    const grid = document.getElementById("modulesGrid");
    MODULES.filter(m => m.perfis.includes(user.perfil)).forEach(m => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `<h3>${m.titulo}</h3><p>${m.desc}</p>`;
      grid.appendChild(card);
    });
  }
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("caderneta_user");
    window.location.href = "index.html";
  });
}
