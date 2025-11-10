const STORAGE_KEY = "vibepay-chat-state";
const GOALS_LIBRARY = [
  {
    id: "emergency-fund",
    title: "Montar reserva de emergência",
    tip: "Separe 10% da renda para sua reserva. Meta inicial: 3 meses de despesas."
  },
  {
    id: "debts",
    title: "Quitar dívidas de curto prazo",
    tip: "Mapeie juros acima de 8% ao mês e priorize negociações."
  },
  {
    id: "education",
    title: "Investir em educação",
    tip: "Reserve um valor mensal para cursos ou certificações que tragam aumento de renda."
  },
  {
    id: "leisure",
    title: "Planejar lazer sem culpa",
    tip: "Crie um envelope digital para viagens e experiências."
  }
];

const CATEGORY_KEYWORDS = {
  Alimentação: ["café", "restaurante", "almoço", "lanche", "mercado", "supermercado", "pizza", "ifood"],
  Transporte: ["uber", "99", " gasolina", "combustível", "ônibus", "metrô", "passagem"],
  Moradia: ["aluguel", "condomínio", "luz", "energia", "água", "internet"],
  Saúde: ["farmácia", "consulta", "remédio", "psicólogo", "dentista"],
  Lazer: ["cinema", "show", "streaming", "netflix", "spotify"],
  Educação: ["curso", "faculdade", "livro", "pós"],
  Investimentos: ["investi", "tesouro", "cdb", "ações", "cript"],
  Salário: ["salário", "folha", "pagamento"],
  Freelance: ["freela", "projeto", "cliente"],
  Outros: []
};

const INITIAL_STATE = {
  transactions: [],
  goals: [GOALS_LIBRARY[0], GOALS_LIBRARY[3]],
  createdAt: new Date().toISOString()
};

const chatLogEl = document.getElementById("chat-log");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const resetBtn = document.getElementById("reset-btn");
const goalsList = document.getElementById("goals-list");
const transactionsList = document.getElementById("transactions-list");
const summaryIncome = document.getElementById("summary-income");
const summaryExpense = document.getElementById("summary-expense");
const summaryBalance = document.getElementById("summary-balance");
const suggestions = document.querySelectorAll("[data-suggest]");

let state = loadState();
let conversationLoaded = false;

init();

function init() {
  renderGoals();
  renderTransactions();
  renderSummary();
  ensureWelcomeMessage();
  setupEvents();
}

function setupEvents() {
  chatForm.addEventListener("submit", handleSubmit);
  resetBtn.addEventListener("click", resetSession);
  suggestions.forEach((btn) =>
    btn.addEventListener("click", () => {
      chatInput.value = btn.dataset.suggest;
      chatInput.focus();
    })
  );
}

function ensureWelcomeMessage() {
  if (conversationLoaded) return;
  appendMessage(
    "bot",
    "Olá! Sou o seu copiloto financeiro. Digite um gasto, uma dúvida ou peça uma dica para começarmos."
  );
  conversationLoaded = true;
}

function handleSubmit(event) {
  event.preventDefault();
  const message = chatInput.value.trim();
  if (!message) return;

  chatInput.value = "";
  appendMessage("user", message);
  window.requestAnimationFrame(() => processMessage(message));
}

function appendMessage(role, content) {
  const messageEl = document.createElement("article");
  messageEl.className = `message ${role}`;
  messageEl.innerHTML = sanitize(content);
  chatLogEl.appendChild(messageEl);
  chatLogEl.scrollTop = chatLogEl.scrollHeight;
}

function processMessage(message) {
  const lower = message.toLowerCase();

  if (isResetIntent(lower)) {
    resetSession();
    appendMessage("bot", "Beleza, começamos do zero! Pode registrar um novo movimento.");
    return;
  }

  if (isSummaryQuestion(lower)) {
    const summaryReply = generateSummaryAnswer(lower);
    appendMessage("bot", summaryReply);
    return;
  }

  if (isGoalQuestion(lower)) {
    appendMessage("bot", buildGoalsReply());
    return;
  }

  const transaction = parseTransaction(message);
  if (transaction) {
    state.transactions.push(transaction);
    persistState();
    renderTransactions();
    renderSummary();
    appendMessage("bot", buildTransactionReply(transaction));
    appendMessage("bot", buildInsightReply(transaction));
  } else {
    appendMessage(
      "bot",
      "Ainda não entendi esse comando. Tente algo como " +
        '"gastei R$75 com mercado" ou "recebi R$500 de freelance".'
    );
  }
}

function parseTransaction(text) {
  const amountMatch = text.match(/(?:r\$\s*)?(-?\d+[\d.,]*)/i);
  if (!amountMatch) return null;

  const normalized = amountMatch[1].replace(/\./g, "").replace(",", ".");
  const amount = Number.parseFloat(normalized);
  if (Number.isNaN(amount)) return null;

  const type = detectTransactionType(text);
  const category = detectCategory(text, type);
  const description = text.replace(/r\$\s*\d+[\d.,]*/i, "").trim();

  return {
    id: crypto.randomUUID(),
    amount,
    type,
    category,
    description: description || "Movimento registrado",
    createdAt: new Date().toISOString()
  };
}

function detectTransactionType(text) {
  const lowered = text.toLowerCase();
  if (/(receb|entrou|ganhei|salário|paguei salário)/.test(lowered)) return "income";
  if (/investi|apliquei/.test(lowered)) return "investment";
  return "expense";
}

function detectCategory(text, type) {
  if (type === "income") {
    if (/salár/.test(text)) return "Salário";
    if (/freel|projeto|cliente/.test(text)) return "Freelance";
    return "Outros";
  }

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((keyword) => text.toLowerCase().includes(keyword))) {
      return category;
    }
  }
  return "Outros";
}

function renderSummary() {
  const { income, expense } = state.transactions.reduce(
    (acc, transaction) => {
      if (transaction.type === "income") acc.income += transaction.amount;
      else acc.expense += transaction.amount;
      return acc;
    },
    { income: 0, expense: 0 }
  );

  summaryIncome.textContent = formatCurrency(income);
  summaryExpense.textContent = formatCurrency(expense);
  summaryBalance.textContent = formatCurrency(income - expense);
}

function renderTransactions() {
  transactionsList.innerHTML = "";
  const recent = [...state.transactions].slice(-5).reverse();

  if (recent.length === 0) {
    const empty = document.createElement("li");
    empty.className = "transaction-item";
    empty.textContent = "Ainda sem transações";
    transactionsList.appendChild(empty);
    return;
  }

  recent.forEach((transaction) => {
    const item = document.createElement("li");
    item.className = "transaction-item";

    const meta = document.createElement("div");
    meta.className = "meta";
    const description = document.createElement("strong");
    description.textContent = `${transaction.category} • ${transaction.description}`;
    const date = document.createElement("span");
    date.textContent = formatDate(transaction.createdAt);

    meta.appendChild(description);
    meta.appendChild(date);

    const amount = document.createElement("span");
    amount.className = "amount";
    const prefix = transaction.type === "income" ? "+" : "-";
    amount.textContent = `${prefix} ${formatCurrency(transaction.amount)}`;

    item.appendChild(meta);
    item.appendChild(amount);
    transactionsList.appendChild(item);
  });
}

function renderGoals() {
  goalsList.innerHTML = "";
  state.goals.forEach((goal) => {
    const item = document.createElement("li");
    item.className = "goal-item";
    const title = document.createElement("strong");
    title.textContent = goal.title;
    const tip = document.createElement("span");
    tip.textContent = goal.tip;
    item.appendChild(title);
    item.appendChild(tip);
    goalsList.appendChild(item);
  });
}

function buildTransactionReply(transaction) {
  const verb = transaction.type === "income" ? "registrado como receita" : "registrado como gasto";
  return `Pronto! ${verb} em ${transaction.category} no valor de ${formatCurrency(transaction.amount)}.`;
}

function buildInsightReply(transaction) {
  const totalCategory = state.transactions
    .filter((item) => item.category === transaction.category && item.type === transaction.type)
    .reduce((acc, item) => acc + item.amount, 0);

  if (transaction.type === "income") {
    return `Dica rápida: considere destinar 10% (${formatCurrency(transaction.amount * 0.1)}) para a sua reserva ou investimentos.`;
  }

  if (totalCategory > 400 && transaction.category === "Alimentação") {
    return "Alerta: seus gastos com alimentação estão acima de R$ 400 neste mês. Que tal planejar as compras da semana?";
  }

  return `Saldo atual: ${summaryBalance.textContent}. Continue me contando suas movimentações!`;
}

function isSummaryQuestion(message) {
  return /quanto|qual|quanto já/.test(message) && /gastei|gastos|saldo|recebi/.test(message);
}

function generateSummaryAnswer(message) {
  const categoryMatch = message.match(/em ([a-zçã]+)\?/i);
  const { income, expense } = state.transactions.reduce(
    (acc, transaction) => {
      if (transaction.type === "income") acc.income += transaction.amount;
      else acc.expense += transaction.amount;
      return acc;
    },
    { income: 0, expense: 0 }
  );

  if (categoryMatch) {
    const category = capitalize(categoryMatch[1]);
    const total = state.transactions
      .filter((item) => item.category === category && item.type === "expense")
      .reduce((acc, item) => acc + item.amount, 0);

    if (total === 0) {
      return `Você ainda não registrou gastos em ${category}.`;
    }
    return `Até agora, você gastou ${formatCurrency(total)} em ${category}.`;
  }

  return `Você recebeu ${formatCurrency(income)}, gastou ${formatCurrency(expense)} e está com saldo de ${formatCurrency(income - expense)}.`;
}

function isGoalQuestion(message) {
  return /meta|metas|objetivo|objetivos/.test(message);
}

function buildGoalsReply() {
  const list = state.goals
    .map((goal) => `• <strong>${goal.title}</strong>: ${goal.tip}`)
    .join("<br>");
  return `Aqui vão suas metas atuais:<br>${list}`;
}

function isResetIntent(message) {
  return /reset|apagar|começar do zero/.test(message);
}

function formatCurrency(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function resetSession() {
  state = structuredClone(INITIAL_STATE);
  persistState();
  transactionsList.innerHTML = "";
  renderGoals();
  renderTransactions();
  renderSummary();
  chatLogEl.innerHTML = "";
  conversationLoaded = false;
  ensureWelcomeMessage();
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(INITIAL_STATE);
    const parsed = JSON.parse(raw);
    parsed.transactions ??= [];
    parsed.goals ??= INITIAL_STATE.goals;
    return parsed;
  } catch (error) {
    console.warn("Não foi possível carregar o estado salvo.", error);
    return structuredClone(INITIAL_STATE);
  }
}

function persistState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function sanitize(html) {
  const template = document.createElement("template");
  template.innerHTML = html;
  return template.innerHTML;
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
