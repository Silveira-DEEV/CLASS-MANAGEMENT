document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggleFormBtn");
  const formContainer = document.getElementById("formContainer");
  const div1 = document.getElementById("div1");
  const div2 = document.getElementById("div2");
  const btnContainerHeader = document.getElementById("btnContainerHeader");

  let originalParent = toggleBtn.parentElement;

  toggleBtn.addEventListener("click", () => {
    const isHidden = formContainer.style.display === "none";

    formContainer.style.display = isHidden ? "block" : "none";

    if (isHidden) {
      toggleBtn.textContent = "Ocultar Formulário";
      div1.classList.remove("oculto");
      div2.classList.remove("tabelas-centralizadas");
      originalParent.insertBefore(toggleBtn, originalParent.firstChild);
    } else {
      toggleBtn.textContent = "Registrar Turma";
      div1.classList.add("oculto");
      div2.classList.add("tabelas-centralizadas");
      btnContainerHeader.appendChild(toggleBtn);
    }
  });

  carregarSalas();
});

const firebaseConfig = {
  apiKey: "AIzaSyB8fw3yHAOTIUqNws8S_579FFKSY4ZRZfU",
  authDomain: "projeto-salas.firebaseapp.com",
  databaseURL:
    "https://projeto-salas-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "projeto-salas",
  storageBucket: "projeto-salas.appspot.com",
  messagingSenderId: "55494640837",
  appId: "1:55494640837:web:b00713624afc202bfb5cac",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

function trataCampo(valor) {
  const val = valor.trim();
  return val === "" ? null : val;
}

document
  .getElementById("salaForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const curso = trataCampo(document.getElementById("curso").value);
    const inicio = document.getElementById("periodoInicio").value;
    const fim = document.getElementById("periodoFim").value;
    const professor = trataCampo(document.getElementById("professor").value);
    const sala = trataCampo(document.getElementById("sala").value);

    const resultado = `
    Curso: ${curso || ""} <br>
    Período: ${inicio} até ${fim} <br>
    Professor: ${professor || ""} <br>
    Sala: ${sala || ""}
  `;
    document.getElementById("resultado").innerHTML = resultado;

    const dadosSala = {
      curso,
      periodoInicio: inicio,
      periodoFim: fim,
      professor,
      sala,
    };

    database
      .ref("salas")
      .once("value")
      .then((snapshot) => {
        let duplicado = false;

        snapshot.forEach((child) => {
          const salaExistente = child.val();
          if (
            salaExistente.curso === dadosSala.curso &&
            salaExistente.periodoInicio === dadosSala.periodoInicio &&
            salaExistente.periodoFim === dadosSala.periodoFim &&
            salaExistente.professor === dadosSala.professor &&
            salaExistente.sala === dadosSala.sala
          ) {
            duplicado = true;
          }
        });

        if (duplicado) {
          document.getElementById("resultado").textContent =
            "⚠️ Sala já registrada.";
        } else {
          dadosSala.dataRegistro = new Date().toISOString();
          database
            .ref("salas/")
            .push(dadosSala)
            .then(() => {
              document.getElementById("resultado").textContent =
                "✅ Sala registrada com sucesso!";
              document.getElementById("salaForm").reset();
              carregarSalas();
            })
            .catch((error) => {
              console.error("Erro ao salvar:", error);
              document.getElementById("resultado").textContent =
                "❌ Erro ao registrar sala.";
            });
        }
      });
  });

function carregarSalas() {
  const tabelaAndamento = document.querySelector("#tabelaAndamento tbody");
  const tabelaInicio = document.querySelector("#tabelaInicio tbody");

  tabelaAndamento.innerHTML = "";
  tabelaInicio.innerHTML = "";

  database
    .ref("salas")
    .once("value")
    .then((snapshot) => {
      const dadosSalas = [];

      snapshot.forEach((child) => {
        const dados = child.val();
        dados.key = child.key;
        dadosSalas.push(dados);
      });

      dadosSalas.sort((a, b) => {
        const dataA = new Date(a.periodoInicio);
        const dataB = new Date(b.periodoInicio);
        return dataA - dataB;
      });

      dadosSalas.forEach((dados) => {
        const inicioFormatado = formatarDataIsoParaPtBr(dados.periodoInicio);
        const fimFormatado = formatarDataIsoParaPtBr(dados.periodoFim);

        const linha = document.createElement("tr");
        linha.innerHTML = `
        <td>${dados.curso || ""}</td>
        <td>${inicioFormatado || ""}</td>
        <td>${fimFormatado || ""}</td>
        <td>${dados.professor || ""}</td>
        <td>${dados.sala || ""}</td>
        <td>
          <button class="excluir-btn" onclick="excluirSala('${
            dados.key
          }')">Excluir</button> 
          <button class="editar-btn" onclick="editarSala(this, '${
            dados.key
          }')">Editar</button>
        </td>
      `;

        const hoje = new Date();
        const dataInicio = new Date(dados.periodoInicio);

        const fimVazio =
          !dados.periodoFim ||
          (typeof dados.periodoFim === "string" &&
            dados.periodoFim.trim() === "");

        if (fimVazio) {
          if (dataInicio <= hoje) {
            tabelaAndamento.appendChild(linha); // Já começou
          } else {
            tabelaInicio.appendChild(linha); // Ainda vai começar
          }
        } else {
          tabelaAndamento.appendChild(linha); // Tem data de fim, então está em andamento
        }
      });
    });
}

function editarSala(botaoEditar, salaId) {
  const linha = botaoEditar.closest("tr");

  if (botaoEditar.textContent === "Editar") {
    for (let i = 0; i < 5; i++) {
      const cell = linha.cells[i];
      const valorAtual = cell.textContent;
      const input = document.createElement("input");
      input.value = valorAtual;
      input.style.width = "100%";
      cell.innerHTML = "";
      cell.appendChild(input);
    }

    botaoEditar.textContent = "Salvar";
  } else {
    const novosDados = {
      curso: trataCampo(linha.cells[0].querySelector("input").value),
      periodoInicio: formatarDataPtBrParaIso(
        linha.cells[1].querySelector("input").value
      ),
      periodoFim: formatarDataPtBrParaIso(
        linha.cells[2].querySelector("input").value
      ),
      professor: trataCampo(linha.cells[3].querySelector("input").value),
      sala: trataCampo(linha.cells[4].querySelector("input").value),
    };

    firebase
      .database()
      .ref("salas/" + salaId)
      .update(novosDados)
      .then(() => {
        console.log("Sala atualizada com sucesso!");
        carregarSalas();
      })
      .catch((error) => {
        console.error("Erro ao atualizar sala: ", error);
      });

    botaoEditar.textContent = "Editar";
  }
}

function excluirSala(salaId) {
  const db = firebase.database();
  const salaRef = db.ref("salas/" + salaId);
  salaRef
    .remove()
    .then(() => {
      console.log("Sala excluída com sucesso!");
      carregarSalas();
    })
    .catch((error) => {
      console.error("Erro ao excluir a sala: ", error);
    });
}

function formatarDataPtBrParaIso(dataBr) {
  const [dia, mes, ano] = dataBr.split("/");
  return `${ano}-${mes}-${dia}`;
}

function formatarDataIsoParaPtBr(dataIso) {
  if (!dataIso) return "";
  const [ano, mes, dia] = dataIso.split("-");
  return `${dia}/${mes}/${ano}`;
}

document.getElementById("botaoexibicao").addEventListener("click", function () {
  window.location.href = "exibicao.html"; // Redireciona para exibicao.html
});
