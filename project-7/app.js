let tasks = []; //initial tasks
let currentView = "list";
let timerInterval = null;
let timeLeft = 25 * 60; // 25 minutes in seconds
let initialTime = 25 * 60;
let focusedTaskId = null;
let currentChart = null;

//dom access
const taskForm = document.getElementById("taskForm");
const taskContainer = document.getElementById("task");
const subTaskList = document.getElementById("subTaskList");
const viewButtons = document.querySelectorAll(".nav-btn[data-view");
const viewSections = document.querySelectorAll(".view-section");

//init function
document.addEventListener("DOMContentLoaded", () => {
  loadTasks();
  setupEventListeners();
  setupTheme();
  renderApp();
});

//main logic
function loadTasks() {
  //retrieve from local storage
  const data = localStorage.getItem("taskmate_data");
  if (data) {
    tasks = JSON.parse(data); //string to array
  }
}

function saveTasks() {
  localStorage.setItem("tasksmate_data", JSON.stringify(tasks));
  renderApp();
}

function renderApp() {
  //stat update
  updateSidebarCount();
  viewSections.forEach((ele) => ele.classList.remove("active"));
  const activeSection = document.getElementById(`view-${currentView}`);
  if (activeSection) activeSection.classList.add("active");

  viewButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === currentView);
  });

  //condition render
  if (currentView === "list") renderListView();
  if (currentView === "board") renderKanbanBoard();
  if (currentView === "timer") updateTimerUI();
  if (currentView === "analytics") renderCharts();

  if (window.lucide) lucide.createIcons();
}

//logic part
function renderListView() {
  taskContainer.innerHTML = ""; //cleared list

  const searchTerm = document.getElementById("search").toLowerCase();
  const filterStatus = document.getElementById("filterStatus").value;

  const filteredTasks = tasks.filter((task) => {
    const matchedSearch = task.title.toLowerCase().includes(searchTerm);

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && task.status !== "done") ||
      (filterStatus === "completed" && task.status === "done");
  });
  if (filteredTasks.length === 0) {
    taskContainer.innerHTML = "no task found";
    return;
  }
  filteredTasks.forEach((task) => {
    const taskElement = createTaskElement(task);
    taskContainer.appendChild(taskElement);
  });
}

function createTaskElement(task) {
  const div = document.createElement("div");
  div.className = `task ${task.status === "done" ? "completed" : ""}`;

  // Calculate Progress (e.g., "2/4 steps")
  const totalSteps = task.subtasks ? task.subtasks.length : 0;
  const doneSteps = task.subtasks
    ? task.subtasks.filter((s) => s.done).length
    : 0;
  const progressPercent = totalSteps > 0 ? (doneSteps / totalSteps) * 100 : 0;

  div.innerHTML = `
        <div style="flex:1">
            <div class="title">${task.title}</div>
            <div class="meta">${task.notes || ""}</div>
            
            ${
              totalSteps > 0
                ? `
            <div class="subtask-progress">
                <div class="progress-track">
                    <div class="progress-bar" style="width: ${progressPercent}%"></div>
                </div>
                <small>${doneSteps}/${totalSteps} steps</small>
            </div>`
                : ""
            }

            <div class="actions" style="margin-top: 8px;">
                <span class="chip">${task.priority}</span>
                <button class="btn ghost sm" onclick="fillEditForm('${task.id}')">Edit</button>
                <button class="btn ghost sm" onclick="deleteTask('${task.id}')">Delete</button>
            </div>
        </div>
        <input type="checkbox" ${task.status === "done" ? "checked" : ""} 
               onchange="toggleTaskStatus('${task.id}')">
    `;
  return div;
}

function renderKanbanBoard() {
  const columns = {
    todo: document.querySelector("#col-todo .kanban-list"),
    doing: document.querySelector("#col-doing .kanban-list"),
    done: document.querySelector("#col-done .kanban-list"),
  };

  Object.values(columns).forEach((col) => (col.innerHTML = ""));

  tasks.forEach((task) => {
    const card = document.createElement("div");
    card.className = "task";
    card.draggable = true;
    card.innerHTML = `<div class="title">${task.title}</div> <small>${task.priority}</small>`;

    card.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", task.id);
      card.classList.add("dragging");
    });
    card.addEventListener("dragned", () => card.classList.remove("dragging"));

    if (columns[task.status]) {
      columns[task.status].appendChild(card);
    }
  });

  Object.values(columns).forEach((col) => {
    col.addEventListener("dragover", (e) => {
      e.preventDefault();
      col.classList.add("drag-over");
    });
    col.addEventListener("dragleave", () => col.classList.remove("drag-over"));
    col.addEventListener("drop", (e) => {
      e.preventDefault();
      col.classList.remove("drag-over");
      const taskId = e.dataTransfer.getData("text/plain");
      const newStatus = col.dataset.status;
    });
  });
}

function setupEventListeners() {
  const select = document.getElementById("timertaskSelect");
  const changeBtn = document.getElementById("changeTaskBtn");

  if (select) {
    select.addEventListener("change", (e) => {
      if (e.target.value) startFocusSession(e.target.value);
    });
  }

  if (changeBtn) {
    changeBtn.addEventListener("click", () => {
      focusedTaskId = null;
      document.getElementById("timerTaskSelect").parentElement.style.display =
        "block";
      document.getElementById("activeTaskDisplay").style.display = "none";
      document.getElementById("taskSelect").value = "";
    });
  }
}
