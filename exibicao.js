import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import PptxGenJS from "https://cdn.jsdelivr.net/npm/pptxgenjs@3.11.0/+esm";

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

  const botaoExibicao = document.getElementById("botaoexibicao");
  if (botaoExibicao) {
    botaoExibicao.addEventListener("click", function () {
      window.location.href = "formulario.html";
    });
  }

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

  retomarCarrossel();
});

async function exportarParaPptx() {
  let pptx = new PptxGenJS();

  const snapshot = await getSnapshot();
  let dadosSalasExport = [];

  snapshot.forEach((childSnapshot) => {
    const dados = childSnapshot.val();
    dados.key = childSnapshot.key;
    dadosSalasExport.push(dados);
  });

  dadosSalasExport = dadosSalasExport
    .filter((s) => s.periodoInicio)
    .sort((a, b) => new Date(a.periodoInicio) - new Date(b.periodoInicio));

  for (let i = 0; i < dadosSalasExport.length; i += 4) {
    let slide = pptx.addSlide();
    let pageData = dadosSalasExport.slice(i, i + 4);

    let tableRows = [
      [
        { text: "Curso", options: cellHeaderStyle() },
        { text: "Período de Início", options: cellHeaderStyle() },
        { text: "Período de Término", options: cellHeaderStyle() },
        { text: "Professor", options: cellHeaderStyle() },
        { text: "Sala", options: cellHeaderStyle() },
      ],
    ];

    pageData.forEach((dados) => {
      tableRows.push([
        { text: dados.curso || "", options: cellBodyStyle() },
        {
          text: formatarDataIsoParaPtBr(dados.periodoInicio),
          options: cellBodyStyle(),
        },
        {
          text: formatarDataIsoParaPtBr(dados.periodoFim),
          options: cellBodyStyle(),
        },
        { text: dados.professor || "", options: cellBodyStyle() },
        { text: dados.sala || "", options: cellBodyStyle() },
      ]);
    });

    slide.addTable(tableRows, {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 5,
    });
  }

  pptx.writeFile("cursos_em_andamento_completo.pptx");
}

function cellHeaderStyle() {
  return {
    bold: true,
    fill: "FF6600",
    color: "FFFFFF",
    align: "center",
    border: [{ color: "000000" }],
    fontSize: 18,
  };
}

function cellBodyStyle() {
  return {
    fill: "F1F1F1",
    color: "000000",
    align: "center",
    border: [{ color: "000000" }],
    fontSize: 18,
  };
}

function getSnapshot() {
  return new Promise((resolve) => {
    const salasRef = ref(database, "salas");
    onValue(
      salasRef,
      (snapshot) => {
        resolve(snapshot);
      },
      { onlyOnce: true }
    );
  });
}

// Deixar função disponível para onclick do HTML
window.exportarParaPptx = exportarParaPptx;
