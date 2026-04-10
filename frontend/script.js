const especialidadeSelect = document.getElementById("especialidade");
const profissionalSelect = document.getElementById("profissional");
const dataHoraSelect = document.getElementById("dataHora");
const nomeInput = document.getElementById("nome");
const cpfInput = document.getElementById("cpf");
const btnAgendar = document.getElementById("btnAgendar");
const mensagemAgendamento = document.getElementById("mensagemAgendamento");

const cpfConsultaInput = document.getElementById("cpfConsulta");
const btnConsultar = document.getElementById("btnConsultar");
const resultadoConsulta = document.getElementById("resultadoConsulta");

const idCancelamentoInput = document.getElementById("idCancelamento");
const btnCancelar = document.getElementById("btnCancelar");
const mensagemCancelamento = document.getElementById("mensagemCancelamento");

let profissionais = [];

async function carregarProfissionais() {
  const resposta = await fetch("http://localhost:3000/api/profissionais");
  profissionais = await resposta.json();

  const especialidades = [...new Set(profissionais.map(p => p.especialidade))];

  especialidadeSelect.innerHTML = `<option value="">Selecione uma especialidade</option>`;
  profissionalSelect.innerHTML = `<option value="">Selecione um profissional</option>`;
  dataHoraSelect.innerHTML = `<option value="">Selecione um horário</option>`;

  especialidades.forEach(especialidade => {
    const option = document.createElement("option");
    option.value = especialidade;
    option.textContent = especialidade;
    especialidadeSelect.appendChild(option);
  });
}

especialidadeSelect.addEventListener("change", () => {
  const especialidadeSelecionada = especialidadeSelect.value;

  profissionalSelect.innerHTML = `<option value="">Selecione um profissional</option>`;
  dataHoraSelect.innerHTML = `<option value="">Selecione um horário</option>`;

  const profissionaisFiltrados = profissionais.filter(
    p => p.especialidade === especialidadeSelecionada
  );

  profissionaisFiltrados.forEach(profissional => {
    const option = document.createElement("option");
    option.value = profissional.id;
    option.textContent = profissional.nome;
    profissionalSelect.appendChild(option);
  });
});

profissionalSelect.addEventListener("change", () => {
  const profissionalId = Number(profissionalSelect.value);
  dataHoraSelect.innerHTML = `<option value="">Selecione um horário</option>`;

  const profissional = profissionais.find(p => p.id === profissionalId);

  if (profissional) {
    profissional.datasDisponiveis.forEach(dataHora => {
      const option = document.createElement("option");
      option.value = dataHora;
      option.textContent = dataHora;
      dataHoraSelect.appendChild(option);
    });
  }
});

btnAgendar.addEventListener("click", async () => {
  const nome = nomeInput.value;
  const cpf = cpfInput.value;
  const profissionalId = profissionalSelect.value;
  const dataHora = dataHoraSelect.value;

  const resposta = await fetch("http://localhost:3000/api/agendar", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      nome,
      cpf,
      profissionalId,
      dataHora
    })
  });

  const dados = await resposta.json();

  if (resposta.ok) {
  mensagemAgendamento.textContent = dados.mensagem;
  mensagemAgendamento.style.color = "green";
} else {
  mensagemAgendamento.textContent = dados.erro;
  mensagemAgendamento.style.color = "red";
}
});

btnConsultar.addEventListener("click", async () => {
  const cpf = cpfConsultaInput.value;

  const resposta = await fetch(`http://localhost:3000/api/agendamento/${cpf}`);
  const dados = await resposta.json();

  if (resposta.ok) {
    resultadoConsulta.innerHTML = "";

    dados.forEach(agendamento => {
      const p = document.createElement("p");
      p.textContent = `ID: ${agendamento.id} | Profissional: ${agendamento.profissionalNome} | Especialidade: ${agendamento.especialidade} | Data/Hora: ${agendamento.dataHora}`;
      resultadoConsulta.appendChild(p);
    });
  } else {
    resultadoConsulta.textContent = dados.erro;
  }
});

btnCancelar.addEventListener("click", async () => {
  const id = idCancelamentoInput.value;

  const resposta = await fetch(`http://localhost:3000/api/agendamento/${id}`, {
    method: "DELETE"
  });

  const dados = await resposta.json();

  if (resposta.ok) {
  mensagemCancelamento.textContent = dados.mensagem;
  mensagemCancelamento.style.color = "green";
} else {
  mensagemCancelamento.textContent = dados.erro;
  mensagemCancelamento.style.color = "red";
}
});

carregarProfissionais();