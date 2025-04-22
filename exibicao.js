import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

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

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

let dadosSalas = [];
let indiceAtual = 0;
let intervaloCarrossel;
let carrosselPausado = false;

function carregarSalas() {
  const tabelaAndamento = document.querySelector("#tabelaAndamento tbody");
  tabelaAndamento.innerHTML = "";
  const salasRef = ref(database, "salas");

  onValue(salasRef, (snapshot) => {
    dadosSalas = [];

    snapshot.forEach((childSnapshot) => {
      const dados = childSnapshot.val();
      dados.key = childSnapshot.key;
      dadosSalas.push(dados);
    });

    // Filtrar dados válidos antes de ordenar
    dadosSalas = dadosSalas.filter((s) => s.periodoInicio);

    dadosSalas.sort(
      (a, b) => new Date(a.periodoInicio) - new Date(b.periodoInicio)
    );

    indiceAtual = 0;
    exibirCarrossel();

    clearInterval(intervaloCarrossel);
    if (!carrosselPausado) {
      intervaloCarrossel = setInterval(exibirCarrossel, 3000);
    }
  });
}

function exibirCarrossel() {
  const tabelaAndamento = document.querySelector("#tabelaAndamento tbody");
  tabelaAndamento.innerHTML = "";

  const total = dadosSalas.length;
  if (total === 0) return;

  const fim = Math.min(indiceAtual + 7, total);
  const itemsToShow = dadosSalas.slice(indiceAtual, fim);

  itemsToShow.forEach((dados) => {
    const inicioFormatado = formatarDataIsoParaPtBr(dados.periodoInicio);
    const fimFormatado = formatarDataIsoParaPtBr(dados.periodoFim);

    const linha = document.createElement("tr");
    linha.innerHTML = `
      <td>${dados.curso || ""}</td>
      <td>${inicioFormatado}</td>
      <td>${fimFormatado}</td>
      <td>${dados.professor || ""}</td>
      <td>${dados.sala || ""}</td>
    `;

    tabelaAndamento.appendChild(linha);
  });

  indiceAtual += 7;
  if (indiceAtual >= total) {
    indiceAtual = 0;
  }
}

function formatarDataIsoParaPtBr(data) {
  if (!data || typeof data !== "string") return "";
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

function pausarCarrossel() {
  clearInterval(intervaloCarrossel);
  carrosselPausado = true;
}

function retomarCarrossel() {
  clearInterval(intervaloCarrossel);
  intervaloCarrossel = setInterval(exibirCarrossel, 3000);
  carrosselPausado = false;
}

document.addEventListener("DOMContentLoaded", () => {
  carregarSalas();

  // Botão que redireciona
  const botaoExibicao = document.getElementById("botaoexibicao");
  if (botaoExibicao) {
    botaoExibicao.addEventListener("click", function () {
      window.location.href = "formulario.html";
    });
  }

  // Botão de pausar/retomar carrossel
  const botaopausar = document.getElementById("botaopausar");
  if (botaopausar) {
    botaopausar.addEventListener("click", function () {
      if (carrosselPausado) {
        retomarCarrossel();
        botaopausar.textContent = "Pausar Exibição";
      } else {
        pausarCarrossel();
        botaopausar.textContent = "Retomar Exibição";
      }
    });
  }

  // Botão de exportar para Excel
  const botaoExportar = document.getElementById("btnExportar");
  if (botaoExportar) {
    botaoExportar.addEventListener("click", () => {
      const tabela = document.getElementById("tabelaAndamento");

      if (!tabela) {
        alert("Tabela não encontrada.");
        return;
      }

      const html = tabela.outerHTML;
      const url = "data:application/vnd.ms-excel," + encodeURIComponent(html);

      const link = document.createElement("a");
      link.href = url;
      link.download = "cursos_em_andamento.xls";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  retomarCarrossel(); // inicia o carrossel ao carregar a página
});
