// script.js
import { db } from "./firebase-config.js";
import {
    collection,
    doc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");
const modal = document.getElementById("modal");
const modalDate = document.getElementById("modalDate");

const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");
const closeModal = document.getElementById("closeModal");
const saveData = document.getElementById("saveData");

const inputProspeccoes = document.getElementById("prospeccoes");
const inputVendas = document.getElementById("vendas");
const inputInstalacoes = document.getElementById("instalacoes");
const inputConcluidas = document.getElementById("concluidas");

let currentDate = new Date();
let selectedDate = null;

async function renderCalendar(date) {
    calendar.innerHTML = "";
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const firstWeekday = firstDay.getDay();
    const totalDays = lastDay.getDate();

    monthYear.textContent = date.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
    });

    for (let i = 0; i < firstWeekday; i++) {
        const empty = document.createElement("div");
        calendar.appendChild(empty);
    }

    for (let day = 1; day <= totalDays; day++) {
        const cell = document.createElement("div");
        cell.className =
            "p-2 text-center border rounded cursor-pointer hover:bg-orange-100 relative";

        const spanDay = document.createElement("div");
        spanDay.textContent = day;
        cell.appendChild(spanDay);

        // Exibe resumo do dia (busca Firestore)
        const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const docRef = doc(db, "metrics", key);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const resumo = document.createElement("div");
            resumo.className = "text-xs text-gray-600 mt-1";
            resumo.innerHTML = `
        <span>Prospects: ${data.prospeccoes ?? 0}</span>
        <span>Vendas: ${data.vendas ?? 0}</span>
        <span>Agendados: ${data.instalacoes} </ span>
        <span>Instalados: ${data.concluidas} </span>
      `;
            cell.appendChild(resumo);
        }

        cell.addEventListener("click", () => openModal(year, month, day));
        calendar.appendChild(cell);
    }
}

async function openModal(year, month, day) {
    selectedDate = new Date(year, month, day);
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    modalDate.textContent = selectedDate.toLocaleDateString("pt-BR");

    // Busca dados existentes do dia
    const docRef = doc(db, "metrics", key);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        inputProspeccoes.value = data.prospeccoes ?? 0;
        inputVendas.value = data.vendas ?? 0;
        inputInstalacoes.value = data.instalacoes ?? 0;
        inputConcluidas.value = data.concluidas ?? 0;
    } else {
        inputProspeccoes.value = "";
        inputVendas.value = "";
        inputInstalacoes.value = "";
        inputConcluidas.value = "";
    }

    modal.classList.remove("hidden");
}

closeModal.addEventListener("click", () => {
    modal.classList.add("hidden");
});

saveData.addEventListener("click", async () => {
    if (!selectedDate) return;

    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const day = selectedDate.getDate();
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const data = {
        prospeccoes: Number(inputProspeccoes.value) || 0,
        vendas: Number(inputVendas.value) || 0,
        instalacoes: Number(inputInstalacoes.value) || 0,
        concluidas: Number(inputConcluidas.value) || 0,
    };

    await setDoc(doc(db, "metrics", key), data);
    modal.classList.add("hidden");
    renderCalendar(currentDate);
});

prevMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(currentDate);
});

nextMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(currentDate);
});

renderCalendar(currentDate);
