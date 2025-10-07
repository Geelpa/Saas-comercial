// script.js
import { db } from "./firebase-config.js";
import {
    doc,
    setDoc,
    getDoc,
    collection,
    getDocs,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// ============================
// Elementos principais
// ============================
const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");
const modal = document.getElementById("modal");
const closeModalBtn = document.getElementById("closeModal");
const saveBtn = document.getElementById("saveBtn");
const form = document.getElementById("dataForm");

let currentDate = new Date();
let selectedDate = null;

// ============================
// Função principal: gerar calendário
// ============================
async function generateCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayIndex = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    // Nome do mês
    const monthNames = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    monthYear.textContent = `${monthNames[month]} ${year}`;

    // Carregar dados do Firestore
    const snapshot = await getDocs(collection(db, "metricas"));
    const registros = {};
    snapshot.forEach((doc) => {
        registros[doc.id] = doc.data();
    });

    // Gerar HTML dos dias (renderização em lote)
    let daysHTML = "";

    // Dias em branco antes do primeiro dia
    for (let i = 0; i < firstDayIndex; i++) {
        daysHTML += `<div class="w-12 h-12"></div>`;
    }

    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${year}-${month + 1}-${day}`;
        const data = registros[dateKey];

        const hasData = data ? "bg-orange-200 border-orange-400" : "bg-gray-50";
        const metrics = data
            ? `<div class='text-xs text-gray-600'>
          ${data.vendas ?? 0} vendas
        </div>`
            : "";

        daysHTML += `
      <div
        data-date="${dateKey}"
        class="day cursor-pointer w-12 h-12 flex flex-col justify-center items-center rounded-lg border ${hasData} hover:bg-orange-100 transition"
      >
        <span class="text-sm font-medium">${day}</span>
        ${metrics}
      </div>`;
    }

    // Renderizar tudo de uma vez
    calendar.innerHTML = daysHTML;

    // Adicionar evento de clique nos dias
    document.querySelectorAll(".day").forEach((el) => {
        el.addEventListener("click", () => openModal(el.dataset.date));
    });
}

// ============================
// Modal de edição dos dados
// ============================
async function openModal(dateKey) {
    selectedDate = dateKey;
    modal.classList.remove("hidden");

    const ref = doc(db, "metricas", dateKey);
    const snapshot = await getDoc(ref);

    if (snapshot.exists()) {
        const data = snapshot.data();
        form.prospeccoes.value = data.prospeccoes ?? 0;
        form.vendas.value = data.vendas ?? 0;
        form.instalacoes.value = data.instalacoes ?? 0;
        form.concluidas.value = data.concluidas ?? 0;
    } else {
        form.reset();
    }
}

closeModalBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
});

// ============================
// Salvar no Firestore
// ============================
saveBtn.addEventListener("click", async () => {
    if (!selectedDate) return;

    const data = {
        prospeccoes: Number(form.prospeccoes.value) || 0,
        vendas: Number(form.vendas.value) || 0,
        instalacoes: Number(form.instalacoes.value) || 0,
        concluidas: Number(form.concluidas.value) || 0,
    };

    await setDoc(doc(db, "metricas", selectedDate), data);

    modal.classList.add("hidden");
    generateCalendar(currentDate); // atualizar exibição
    calcularMétricas();
});

// ============================
// Navegação entre meses
// ============================
document.getElementById("prevMonth").addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    generateCalendar(currentDate);
});

document.getElementById("nextMonth").addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    generateCalendar(currentDate);
});

// ============================
// Cálculo de métricas gerais
// ============================
async function calcularMétricas() {
    const snapshot = await getDocs(collection(db, "metricas"));

    let totalProspeccoes = 0;
    let totalVendas = 0;
    let totalInstalacoes = 0;
    let totalConcluidas = 0;

    snapshot.forEach((doc) => {
        const d = doc.data();
        totalProspeccoes += d.prospeccoes || 0;
        totalVendas += d.vendas || 0;
        totalInstalacoes += d.instalacoes || 0;
        totalConcluidas += d.concluidas || 0;
    });

    const taxaSucesso =
        totalInstalacoes > 0
            ? ((totalConcluidas / totalInstalacoes) * 100).toFixed(2)
            : 0;

    document.getElementById("metricasResumo").innerHTML = `
    <p><b>Prospecções:</b> ${totalProspeccoes}</p>
    <p><b>Vendas:</b> ${totalVendas}</p>
    <p><b>Instalações:</b> ${totalInstalacoes}</p>
    <p><b>Concluídas:</b> ${totalConcluidas}</p>
    <p class="mt-2 text-orange-600 font-semibold">
      Taxa de sucesso: ${taxaSucesso}%
    </p>
  `;
}

// ============================
// Inicialização
// ============================
generateCalendar(currentDate);
calcularMétricas();
