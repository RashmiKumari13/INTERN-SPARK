const STORAGE_KEY = "focuslist.tasks.v1";
const THEME_KEY = "focuslist.theme.v1";

const demoTasks = [
  {
    id: createId(),
    title: "Polish DOM interactions",
    priority: "high",
    dueDate: offsetDate(1),
    completed: false,
    createdAt: Date.now() - 3_600_000,
  },
  {
    id: createId(),
    title: "Capture app screenshots",
    priority: "medium",
    dueDate: offsetDate(2),
    completed: false,
    createdAt: Date.now() - 2_600_000,
  },
  {
    id: createId(),
    title: "Draft short documentation",
    priority: "low",
    dueDate: "",
    completed: true,
    createdAt: Date.now() - 1_600_000,
  },
];

let tasks = loadTasks();
let activeFilter = "all";
let editingId = null;

const elements = {
  form: document.querySelector("#taskForm"),
  taskInput: document.querySelector("#taskInput"),
  prioritySelect: document.querySelector("#prioritySelect"),
  dueDate: document.querySelector("#dueDate"),
  submitButton: document.querySelector("#submitButton"),
  cancelEdit: document.querySelector("#cancelEdit"),
  searchInput: document.querySelector("#searchInput"),
  sortSelect: document.querySelector("#sortSelect"),
  filterButtons: document.querySelectorAll("[data-filter]"),
  taskList: document.querySelector("#taskList"),
  emptyState: document.querySelector("#emptyState"),
  taskTotal: document.querySelector("#taskTotal"),
  activeCount: document.querySelector("#activeCount"),
  doneCount: document.querySelector("#doneCount"),
  highCount: document.querySelector("#highCount"),
  dueSoonCount: document.querySelector("#dueSoonCount"),
  progressLabel: document.querySelector("#progressLabel"),
  progressMeter: document.querySelector("#progressMeter"),
  clearDone: document.querySelector("#clearDone"),
  resetDemo: document.querySelector("#resetDemo"),
  themeToggle: document.querySelector("#themeToggle"),
};

initializeTheme();
bindEvents();
render();

function bindEvents() {
  elements.form.addEventListener("submit", handleSubmit);
  elements.cancelEdit.addEventListener("click", cancelEditing);
  elements.searchInput.addEventListener("input", render);
  elements.sortSelect.addEventListener("change", render);
  elements.clearDone.addEventListener("click", clearCompleted);
  elements.resetDemo.addEventListener("click", resetDemoTasks);
  elements.themeToggle.addEventListener("click", toggleTheme);

  elements.filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      elements.filterButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      render();
    });
  });

  elements.taskList.addEventListener("click", (event) => {
    const control = event.target.closest("[data-action]");
    if (!control) return;

    const taskId = control.dataset.id;
    const action = control.dataset.action;

    if (action === "toggle") toggleTask(taskId);
    if (action === "edit") startEditing(taskId);
    if (action === "delete") deleteTask(taskId);
  });
}

function handleSubmit(event) {
  event.preventDefault();

  const title = elements.taskInput.value.trim();
  if (!title) return;

  if (editingId) {
    tasks = tasks.map((task) =>
      task.id === editingId
        ? {
            ...task,
            title,
            priority: elements.prioritySelect.value,
            dueDate: elements.dueDate.value,
          }
        : task,
    );
    cancelEditing(false);
  } else {
    tasks.unshift({
      id: createId(),
      title,
      priority: elements.prioritySelect.value,
      dueDate: elements.dueDate.value,
      completed: false,
      createdAt: Date.now(),
    });
    elements.form.reset();
    elements.prioritySelect.value = "medium";
  }

  saveTasks();
  render();
}

function render() {
  const visibleTasks = getVisibleTasks();
  elements.taskList.replaceChildren(...visibleTasks.map(createTaskCard));
  elements.emptyState.classList.toggle("hidden", visibleTasks.length > 0);
  updateStats();
  refreshIcons();
}

function createTaskCard(task) {
  const card = document.createElement("li");
  card.className = `task-card${task.completed ? " completed" : ""}`;
  card.dataset.priority = task.priority;

  const toggleButton = document.createElement("button");
  toggleButton.className = "task-check";
  toggleButton.type = "button";
  toggleButton.dataset.action = "toggle";
  toggleButton.dataset.id = task.id;
  toggleButton.setAttribute("aria-pressed", String(task.completed));
  toggleButton.setAttribute("aria-label", task.completed ? "Mark task active" : "Mark task done");
  toggleButton.title = task.completed ? "Mark active" : "Mark done";
  toggleButton.append(createIcon("check"));

  const copy = document.createElement("div");
  copy.className = "task-copy";

  const title = document.createElement("div");
  title.className = "task-title";
  title.textContent = task.title;

  const meta = document.createElement("div");
  meta.className = "task-meta";
  meta.append(createPill(task.priority, task.priority));

  if (task.dueDate) {
    const due = createPill(formatDate(task.dueDate), getDueClass(task.dueDate));
    meta.append(due);
  }

  copy.append(title, meta);

  const actions = document.createElement("div");
  actions.className = "task-actions";
  actions.append(
    createActionButton("edit", task.id, "Edit task", "pencil"),
    createActionButton("delete", task.id, "Delete task", "trash-2", "danger"),
  );

  card.append(toggleButton, copy, actions);
  return card;
}

function createActionButton(action, id, label, iconName, extraClass = "") {
  const button = document.createElement("button");
  button.className = `icon-button ${extraClass}`.trim();
  button.type = "button";
  button.dataset.action = action;
  button.dataset.id = id;
  button.title = label;
  button.setAttribute("aria-label", label);
  button.append(createIcon(iconName));
  return button;
}

function createIcon(name) {
  const icon = document.createElement("i");
  icon.dataset.lucide = name;
  icon.setAttribute("aria-hidden", "true");
  return icon;
}

function setButtonIcon(button, name) {
  const nextIcon = createIcon(name);
  const currentIcon = button.querySelector("svg, i");

  if (currentIcon) {
    currentIcon.replaceWith(nextIcon);
  } else {
    button.prepend(nextIcon);
  }
}

function createPill(text, type) {
  const pill = document.createElement("span");
  pill.className = `pill ${type}`;
  pill.textContent = text;
  return pill;
}

function getVisibleTasks() {
  const query = elements.searchInput.value.trim().toLowerCase();
  const priorityWeight = { high: 0, medium: 1, low: 2 };

  return tasks
    .filter((task) => {
      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "active" && !task.completed) ||
        (activeFilter === "done" && task.completed);
      const matchesSearch = task.title.toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      if (elements.sortSelect.value === "priority") {
        return priorityWeight[a.priority] - priorityWeight[b.priority];
      }
      if (elements.sortSelect.value === "due") {
        return dueSortValue(a.dueDate) - dueSortValue(b.dueDate);
      }
      return b.createdAt - a.createdAt;
    });
}

function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const active = total - completed;
  const high = tasks.filter((task) => task.priority === "high" && !task.completed).length;
  const dueSoon = tasks.filter((task) => !task.completed && isDueSoon(task.dueDate)).length;
  const progress = total ? Math.round((completed / total) * 100) : 0;
  const circumference = 314;

  elements.taskTotal.textContent = `${total} ${total === 1 ? "task" : "tasks"}`;
  elements.activeCount.textContent = active;
  elements.doneCount.textContent = completed;
  elements.highCount.textContent = high;
  elements.dueSoonCount.textContent = dueSoon;
  elements.progressLabel.textContent = `${progress}%`;
  elements.progressMeter.style.strokeDashoffset = String(circumference - (progress / 100) * circumference);
}

function startEditing(taskId) {
  const task = tasks.find((item) => item.id === taskId);
  if (!task) return;

  editingId = taskId;
  elements.taskInput.value = task.title;
  elements.prioritySelect.value = task.priority;
  elements.dueDate.value = task.dueDate;
  elements.submitButton.querySelector("span").textContent = "Save Task";
  setButtonIcon(elements.submitButton, "save");
  elements.cancelEdit.classList.remove("hidden");
  elements.taskInput.focus();
  refreshIcons();
}

function cancelEditing(shouldRender = true) {
  editingId = null;
  elements.form.reset();
  elements.prioritySelect.value = "medium";
  elements.submitButton.querySelector("span").textContent = "Add Task";
  setButtonIcon(elements.submitButton, "plus");
  elements.cancelEdit.classList.add("hidden");
  if (shouldRender) {
    render();
  }
}

function toggleTask(taskId) {
  tasks = tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task));
  saveTasks();
  render();
}

function deleteTask(taskId) {
  tasks = tasks.filter((task) => task.id !== taskId);
  if (editingId === taskId) cancelEditing(false);
  saveTasks();
  render();
}

function clearCompleted() {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  render();
}

function resetDemoTasks() {
  tasks = demoTasks.map((task) => ({ ...task, id: createId() }));
  cancelEditing(false);
  saveTasks();
  render();
}

function toggleTheme() {
  const isDark = document.body.classList.toggle("dark");
  localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  setButtonIcon(elements.themeToggle, isDark ? "moon" : "sun");
  refreshIcons();
}

function initializeTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const shouldUseDark = savedTheme ? savedTheme === "dark" : prefersDark;

  document.body.classList.toggle("dark", shouldUseDark);
  setButtonIcon(elements.themeToggle, shouldUseDark ? "moon" : "sun");
}

function loadTasks() {
  const storedTasks = localStorage.getItem(STORAGE_KEY);
  if (!storedTasks) {
    return demoTasks;
  }

  try {
    const parsedTasks = JSON.parse(storedTasks);
    return Array.isArray(parsedTasks) ? parsedTasks : demoTasks;
  } catch {
    return demoTasks;
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function formatDate(value) {
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
}

function getDueClass(value) {
  if (!value) return "";
  const today = startOfToday();
  const due = new Date(`${value}T00:00:00`);
  return due < today ? "overdue" : "";
}

function isDueSoon(value) {
  if (!value) return false;
  const today = startOfToday();
  const due = new Date(`${value}T00:00:00`);
  const threeDays = 3 * 24 * 60 * 60 * 1000;
  return due >= today && due.getTime() - today.getTime() <= threeDays;
}

function dueSortValue(value) {
  return value ? new Date(`${value}T00:00:00`).getTime() : Number.MAX_SAFE_INTEGER;
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function createId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function offsetDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}
