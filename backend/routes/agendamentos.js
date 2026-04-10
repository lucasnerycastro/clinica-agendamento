const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const profissionaisPath = path.join(__dirname, "../data/profissionais.json");
const agendamentosPath = path.join(__dirname, "../data/agendamentos.json");

router.get("/profissionais", (req, res) => {
  fs.readFile(profissionaisPath, "utf8", (erro, dados) => {
    if (erro) {
      return res.status(500).json({ erro: "Erro ao ler profissionais." });
    }

    let profissionais = JSON.parse(dados);

    const especialidade = req.query.especialidade;

    if (especialidade) {
      profissionais = profissionais.filter(
        (profissional) =>
          profissional.especialidade.toLowerCase() === especialidade.toLowerCase()
      );
    }

    res.json(profissionais);
  });
});

router.post("/agendar", (req, res) => {
  const { nome, cpf, profissionalId, dataHora } = req.body;

  if (!nome || !cpf || !profissionalId || !dataHora) {
    return res.status(400).json({
      erro: "Nome, CPF, profissional e data/hora são obrigatórios."
    });
  }

  fs.readFile(agendamentosPath, "utf8", (erroLeitura, dadosAgendamentos) => {
    if (erroLeitura) {
      return res.status(500).json({ erro: "Erro ao ler agendamentos." });
    }

    fs.readFile(profissionaisPath, "utf8", (erroProfissionais, dadosProfissionais) => {
      if (erroProfissionais) {
        return res.status(500).json({ erro: "Erro ao ler profissionais." });
      }

      const agendamentos = JSON.parse(dadosAgendamentos);
      const profissionais = JSON.parse(dadosProfissionais);

      const profissional = profissionais.find(
        (p) => p.id === Number(profissionalId)
      );

      if (!profissional) {
        return res.status(404).json({ erro: "Profissional não encontrado." });
      }

      if (!profissional.datasDisponiveis.includes(dataHora)) {
        return res.status(400).json({
          erro: "Data/hora não disponível para este profissional."
        });
      }

      const agendamentoExistente = agendamentos.find(
        (a) => a.profissionalId === Number(profissionalId) && a.dataHora === dataHora
      );

      if (agendamentoExistente) {
        return res.status(400).json({ erro: "Este horário já foi agendado." });
      }

      const novoAgendamento = {
        id: agendamentos.length + 1,
        nome,
        cpf,
        profissionalId: Number(profissionalId),
        profissionalNome: profissional.nome,
        especialidade: profissional.especialidade,
        dataHora
      };

      agendamentos.push(novoAgendamento);

      fs.writeFile(
        agendamentosPath,
        JSON.stringify(agendamentos, null, 2),
        "utf8",
        (erroEscrita) => {
          if (erroEscrita) {
            return res.status(500).json({ erro: "Erro ao salvar agendamento." });
          }

          res.status(201).json({
            mensagem: "Agendamento realizado com sucesso.",
            agendamento: novoAgendamento
          });
        }
      );
    });
  });
});
router.get("/agendamento/:cpf", (req, res) => {
  const cpf = req.params.cpf;

  fs.readFile(agendamentosPath, "utf8", (erro, dados) => {
    if (erro) {
      return res.status(500).json({ erro: "Erro ao ler agendamentos." });
    }

    const agendamentos = JSON.parse(dados);

    const resultado = agendamentos.filter((a) => a.cpf === cpf);

    if (resultado.length === 0) {
      return res.status(404).json({ erro: "Nenhum agendamento encontrado." });
    }

    res.json(resultado);
  });
});  
router.delete("/agendamento/:id", (req, res) => {
  const id = Number(req.params.id);

  fs.readFile(agendamentosPath, "utf8", (erro, dados) => {
    if (erro) {
      return res.status(500).json({ erro: "Erro ao ler agendamentos." });
    }

    let agendamentos = JSON.parse(dados);

    const novoArray = agendamentos.filter((a) => a.id !== id);

    if (agendamentos.length === novoArray.length) {
      return res.status(404).json({ erro: "Agendamento não encontrado." });
    }

    fs.writeFile(
      agendamentosPath,
      JSON.stringify(novoArray, null, 2),
      "utf8",
      (erroEscrita) => {
        if (erroEscrita) {
          return res.status(500).json({ erro: "Erro ao cancelar agendamento." });
        }

        res.json({ mensagem: "Agendamento cancelado com sucesso." });
      }
    );
  });
});       
module.exports = router;