const schema = [
  {
    id: "identity",
    title: "Identity",
    fields: [
      {
        key: "fullName",
        label: "Full name",
        type: "text",
        placeholder: "Ada Lovelace",
      },
      {
        key: "role",
        label: "Professional title",
        type: "text",
        placeholder: "Computing Pioneer",
      },
      {
        key: "summary",
        label: "Summary",
        type: "textarea",
        placeholder: "2-3 sentence professional snapshot",
        rows: 3,
      },
    ],
  },
  {
    id: "contact",
    title: "Contact",
    fields: [
      {
        key: "email",
        label: "Email",
        type: "email",
        placeholder: "ada@example.com",
      },
      { key: "phone", label: "Phone", type: "tel", placeholder: "+1 555 0100" },
      {
        key: "location",
        label: "Location",
        type: "text",
        placeholder: "London, UK",
      },
      {
        key: "website",
        label: "Portfolio / Website",
        type: "url",
        placeholder: "https://",
      },
    ],
  },
  {
    id: "skills",
    title: "Skills",
    fields: [
      {
        key: "skills",
        label: "Key skills (comma separated)",
        type: "text",
        placeholder: "Systems design, Data viz, Leadership",
      },
    ],
  },
  {
    id: "experience",
    title: "Experience",
    repeatable: true,
    fields: [
      { key: "company", label: "Company", type: "text" },
      { key: "title", label: "Role", type: "text" },
      {
        key: "period",
        label: "Period",
        type: "text",
        placeholder: "2022 - Present",
      },
      {
        key: "highlights",
        label: "Highlights (bullet per line)",
        type: "textarea",
        rows: 3,
      },
    ],
  },
  {
    id: "education",
    title: "Education",
    repeatable: true,
    fields: [
      { key: "school", label: "Institution", type: "text" },
      { key: "degree", label: "Degree", type: "text" },
      { key: "period", label: "Period", type: "text" },
      { key: "details", label: "Details", type: "textarea", rows: 2 },
    ],
  },
];

const templates = {
  minimal: {
    label: "Minimal",
    className: "template-minimal",
    render: (data) => `
      <header>
        <h1>${data.fullName || "Your Name"}</h1>
        <p class="text-muted">${data.role || "Title"}</p>
        <p>${joinValues(
          [data.email, data.phone, data.location, data.website],
          " · ",
        )}</p>
      </header>
      <section>
        <h2>Summary</h2>
        <p>${data.summary || defaultSummary()}</p>
      </section>
      ${drawListSection(
        "Experience",
        data.experience,
        (item) => `
          <div class="mb-3">
            <div class="fw-bold">${item.title || "Role"}</div>
            <div>${item.company || "Company"}</div>
            <div class="text-muted small">${item.period || "Timeline"}</div>
            ${drawHighlights(item.highlights)}
          </div>
      `,
      )}
      ${drawListSection(
        "Education",
        data.education,
        (item) => `
          <div class="mb-3">
            <div class="fw-bold">${item.degree || "Degree"}</div>
            <div>${item.school || "School"}</div>
            <div class="text-muted small">${item.period || "Timeline"}</div>
            <p>${item.details || ""}</p>
          </div>
      `,
      )}
      ${drawSkills(data.skillsArray)}
    `,
  },
  card: {
    label: "Card",
    className: "template-card",
    render: (data) => `
      <header>
        <h1>${data.fullName || "Your Name"}</h1>
        <p class="lead mb-2">${data.role || "Title"}</p>
        <div style="margin-top: 1rem;">
          ${drawBadges(
            cleanValues([data.email, data.phone, data.location, data.website]),
          )}
        </div>
      </header>
      <section>
        <h2>About</h2>
        <p>${data.summary || defaultSummary()}</p>
      </section>
      <section>
        <h2>Experience</h2>
        ${drawCardList(
          data.experience,
          (item) => `
            <div>
              <div class="fw-semibold">${item.title || "Role"}</div>
              <div class="text-muted small">${item.company || "Company"} · ${
                item.period || "Timeline"
              }</div>
              ${drawHighlights(item.highlights)}
            </div>
        `,
        )}
      </section>
      <section>
        <h2>Education</h2>
        ${drawCardList(
          data.education,
          (item) => `
            <div>
              <div class="fw-semibold">${item.degree || "Degree"}</div>
              <div class="text-muted small">${item.school || "School"} · ${
                item.period || "Timeline"
              }</div>
              <p class="mb-0">${item.details || ""}</p>
            </div>
        `,
        )}
      </section>
      ${drawSkills(data.skillsArray)}
    `,
  },
};

const state = {
  data: {},
  templateKey: "minimal",
};

// Styles injected into the PDF export
const EXPORT_STYLES = `
  body { font-family: "Inter", sans-serif; margin: 0; padding: 40px; color: #1e293b; background: white; }
  h1 { font-size: 2.5rem; margin-bottom: 0.5rem; font-weight: 800; color: #0f172a; }
  h2 { font-size: 1.1rem; letter-spacing: 0.05em; text-transform: uppercase; color: #047857; margin-top: 2rem; border-bottom: 2px solid #ecfdf5; padding-bottom: 0.5rem; font-weight: 700; }
  p { line-height: 1.6; color: #334155; margin-bottom: 1rem; }
  ul { padding-left: 1.25rem; }
  .text-muted { color: #64748b; }
  .badge { background: #f3f4f6; color: #374151; padding: 4px 8px; border-radius: 99px; display: inline-block; font-size: 0.8em; margin-right: 4px; }
  .badge-skill { background: #ecfdf5; color: #047857; }
  .template-card .card-item { border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
`;

const form = document.getElementById("resumeForm");
const preview = document.getElementById("resumePreview");
const templateSelect = document.getElementById("templateSelect");
const downloadBtn = document.getElementById("downloadBtn");
const resetBtn = document.getElementById("resetBtn");
const themeToggle = document.getElementById("themeToggle");
const atsBtn = document.getElementById("atsBtn");
const atsScoreDisplay = document.getElementById("atsScore");
const atsModal = document.getElementById("atsModal");
const closeModal = document.getElementById("closeModal");
const modalScoreDisplay = document.getElementById("modalScoreDisplay");
const circleProgress = document.querySelector(".circle-progress");
const atsFeedback = document.getElementById("atsFeedback");
const templateCount = document.getElementById("templateCount");
const sectionCount = document.getElementById("sectionCount");
const fieldProgress = document.getElementById("fieldProgress");
const sectionNav = document.getElementById("sectionNav");
const liveMeta = document.getElementById("liveMeta");
const previewStage = document.querySelector(".preview-stage");
const previewBgButtons = document.querySelectorAll("[data-preview-bg]");

const collections = {};
const navButtons = new Map();
let sectionObserver;

startApp();

function startApp() {
  setupTemplates();
  buildForm();
  bindUI();

  // Set default preview background
  setPreviewBg("plain");

  drawPreview();
  refreshStats();
}

function setupTemplates() {
  templateSelect.innerHTML = "";

  Object.entries(templates).forEach(([key, template]) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = template.label;
    templateSelect.appendChild(option);
  });

  templateSelect.value = state.templateKey;
  templateSelect.addEventListener("change", (e) => {
    state.templateKey = e.target.value;
    drawPreview();
  });
}

function buildForm() {
  sectionObserver = new IntersectionObserver(watchSections, {
    root: document.querySelector("#editorPanel"),
    threshold: 0.1,
  });

  schema.forEach((section) => {
    const wrapper = document.createElement("section");
    wrapper.className = "form-section";
    wrapper.dataset.section = section.id;
    wrapper.id = section.id;

    const heading = document.createElement("div");
    heading.className = "form-section-title";
    heading.textContent = section.title;
    wrapper.appendChild(heading);

    if (section.repeatable) {
      const collection = document.createElement("div");
      collection.className = "group-collection";
      collection.dataset.collection = section.id;
      collections[section.id] = collection;
      wrapper.appendChild(collection);

      const controls = document.createElement("div");
      controls.className = "repeater-controls";
      const addBtn = document.createElement("button");
      addBtn.type = "button";
      addBtn.className = "btn btn-outline";
      addBtn.textContent = `Add ${section.title}`;
      addBtn.addEventListener("click", () => addRepeater(section, collection));
      controls.appendChild(addBtn);
      wrapper.appendChild(controls);

      addRepeater(section, collection);
    } else {
      const sectionBody = document.createElement("div");
      sectionBody.className = "form-body";
      section.fields.forEach((field) => {
        sectionBody.appendChild(buildField(section, field));
      });
      wrapper.appendChild(sectionBody);
    }

    form.appendChild(wrapper);
    addSectionLink(section);
    sectionObserver.observe(wrapper);
  });
}

function buildField(section, field, index = null) {
  const fieldId =
    index !== null
      ? `${section.id}-${field.key}-${index}`
      : `${section.id}-${field.key}`;
  const container = document.createElement("div");
  container.className = "form-group";

  const label = document.createElement("label");
  label.className = "form-label";
  label.htmlFor = fieldId;
  label.textContent = field.label;

  let input;
  if (field.type === "textarea") {
    input = document.createElement("textarea");
    input.rows = field.rows || 4;
    input.className = "form-control";
  } else {
    input = document.createElement("input");
    input.type = field.type;
    input.className = "form-control";
  }
  input.placeholder = field.placeholder || "";
  input.id = fieldId;
  input.dataset.section = section.id;
  input.dataset.key = field.key;
  if (index !== null) {
    input.dataset.index = index;
  }
  input.addEventListener("input", handleInput);

  container.appendChild(label);
  container.appendChild(input);
  return container;
}

function handleInput(event) {
  const { section, key, index } = event.target.dataset;
  const value = event.target.value;

  if (isRepeater(section)) {
    const idx = Number(index);
    state.data[section] = state.data[section] || [];
    state.data[section][idx] = state.data[section][idx] || {};
    state.data[section][idx][key] = value;
  } else {
    state.data[key] = value;
  }
  drawPreview();
  refreshStats();
}

function isRepeater(sectionId) {
  return schema.find((section) => section.id === sectionId)?.repeatable;
}

function addRepeater(section, collection) {
  const index = collection.childElementCount;
  const card = document.createElement("div");
  card.className = "repeater-card";
  card.dataset.index = index;

  section.fields.forEach((field) => {
    card.appendChild(buildField(section, field, index));
  });

  if (index > 0) {
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "btn-close";
    removeBtn.innerHTML = "&times;"; // Close symbol
    removeBtn.title = "Remove Item";
    removeBtn.style.position = "absolute";
    removeBtn.style.top = "8px";
    removeBtn.style.right = "8px";

    removeBtn.addEventListener("click", () => removeRepeater(section.id, card));
    card.appendChild(removeBtn);
  }

  collection.appendChild(card);
}

function removeRepeater(sectionId, card) {
  const collection = card.parentElement;
  collection.removeChild(card);
  // Re-index remaining items to ensure consistent state
  Array.from(collection.children).forEach((child, idx) => {
    child.dataset.index = idx;
    child.querySelectorAll("[data-index]").forEach((input) => {
      input.dataset.index = idx;
    });
  });
  if (state.data[sectionId]) {
    state.data[sectionId].splice(Number(card.dataset.index), 1);
  }
  drawPreview();
  refreshStats();
}

function drawPreview() {
  const template = templates[state.templateKey];
  const prepared = prepareData();
  preview.className = `resume-preview ${template.className}`;
  preview.innerHTML = template.render(prepared);
  refreshMeta();
}

function prepareData() {
  const payload = { ...state.data };
  payload.skillsArray = (payload.skills || "")
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

  payload.experience = (payload.experience || []).map((item = {}) => ({
    ...item,
    highlights: (item.highlights || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
  }));

  payload.education = (payload.education || []).map((item = {}) => ({
    ...item,
  }));

  return payload;
}

function drawListSection(title, items = [], renderer) {
  if (!items.length) return "";
  return `
    <section>
      <h2>${title}</h2>
      ${items.map(renderer).join("")}
    </section>
  `;
}

function drawCardList(items = [], renderer) {
  if (!items.length)
    return `<p class="text-muted">Add entries in the form.</p>`;
  return items
    .map(
      (item) => `
      <div class="card-item">
        ${renderer(item)}
      </div>
    `,
    )
    .join("");
}

function drawHighlights(highlights = []) {
  const filtered = (Array.isArray(highlights) ? highlights : [])
    .map((line) => line.trim())
    .filter(Boolean);
  if (!filtered.length) return "";
  return `
    <ul>
      ${filtered.map((line) => `<li>${line}</li>`).join("")}
    </ul>
  `;
}

function drawSkills(skills = []) {
  if (!skills?.length) return "";
  return `
    <section>
      <h2>Skills</h2>
      <div style="display: flex; flex-wrap: wrap;">
        ${skills
          .map((skill) => `<span class="badge badge-skill">${skill}</span>`)
          .join("")}
      </div>
    </section>
  `;
}

function drawBadges(items) {
  if (!items.length) return "";
  return items.map((item) => `<span class="badge">${item}</span>`).join("");
}

function joinValues(values, separator = " ") {
  return values.filter(Boolean).join(separator);
}

function cleanValues(values = []) {
  return values.filter(Boolean);
}

function defaultSummary() {
  return "Seasoned professional focused on measurable business value and elegant systems.";
}

function bindUI() {
  if (sectionCount) {
    sectionCount.textContent = schema.length;
  }

  previewBgButtons.forEach((btn) =>
    btn.addEventListener("click", () => {
      // Toggle Active State
      previewBgButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      setPreviewBg(btn.dataset.previewBg);
    }),
  );
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }
}

function toggleTheme() {
  const isDark = document.body.dataset.theme === "dark";
  document.body.dataset.theme = isDark ? "" : "dark";
  themeToggle.textContent = isDark ? "Dark Mode" : "Light Mode";
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }

  if (atsBtn) {
    atsBtn.addEventListener("click", openATSModal);
  }
  if (closeModal) {
    closeModal.addEventListener("click", () =>
      atsModal.classList.add("hidden"),
    );
  }

  // Close modal on outside click
  window.addEventListener("click", (e) => {
    if (e.target === atsModal) {
      atsModal.classList.add("hidden");
    }
  });
}

function toggleTheme() {
  const isDark = document.body.dataset.theme === "dark";
  document.body.dataset.theme = isDark ? "" : "dark";
  themeToggle.textContent = isDark ? "Dark Mode" : "Light Mode";
}

function openATSModal() {
  atsModal.classList.remove("hidden");
  refreshATS();
}

function refreshATS() {
  const { score, feedback } = calculateATS(state.data);

  // Update Header Badge
  if (atsScoreDisplay) atsScoreDisplay.textContent = score;

  // Update Modal
  if (modalScoreDisplay) modalScoreDisplay.textContent = score;

  // Update Circle Progress
  if (circleProgress) {
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    circleProgress.style.strokeDashoffset = offset;

    // Color coding based on score
    if (score >= 80) circleProgress.style.stroke = "var(--brand-500)";
    else if (score >= 50)
      circleProgress.style.stroke = "#f59e0b"; // Amber
    else circleProgress.style.stroke = "#ef4444"; // Red
  }

  // Update Feedback List
  if (atsFeedback) {
    atsFeedback.innerHTML = feedback
      .map(
        (item) => `
      <div class="feedback-item ${item.type}">
        <div class="feedback-icon">${item.type === "success" ? "✓" : "!"}</div>
        <div>${item.msg}</div>
      </div>
    `,
      )
      .join("");
  }
}

function calculateATS(data) {
  let score = 0;
  const feedback = [];

  // 1. Contact Info (20 pts)
  let contactScore = 0;
  if (data.email) contactScore += 5;
  if (data.phone) contactScore += 5;
  if (data.location) contactScore += 5;
  if (data.website) contactScore += 5;

  score += contactScore;
  if (contactScore === 20)
    feedback.push({ type: "success", msg: "Contact information is complete." });
  else
    feedback.push({
      type: "warning",
      msg: "Add email, phone, location, and website for better reachability.",
    });

  // 2. Summary (15 pts)
  const summaryLen = (data.summary || "").split(/\s+/).filter(Boolean).length;
  if (summaryLen >= 20) {
    score += 15;
    feedback.push({ type: "success", msg: "Summary is of good length." });
  } else {
    feedback.push({
      type: "warning",
      msg: `Summary is too short (${summaryLen}/20 words recommended).`,
    });
  }

  // 3. Experience (35 pts)
  const exp = data.experience || [];
  if (exp.length >= 1) {
    score += 15;
    const hasBullets = exp.some(
      (e) =>
        (e.highlights || "").includes("•") ||
        (e.highlights || "").includes("-"),
    );
    const hasKeywords = exp.some((e) =>
      /managed|led|created|developed|designed|increased/i.test(
        e.highlights || "",
      ),
    );

    if (
      hasBullets ||
      (data.experience || []).some((x) => (x.highlights || "").includes("\n"))
    ) {
      score += 10;
      feedback.push({
        type: "success",
        msg: "Experience uses detailed formatting.",
      });
    } else {
      feedback.push({
        type: "warning",
        msg: "Use bullet points in experience highlights.",
      });
    }

    if (hasKeywords) {
      score += 10;
      feedback.push({ type: "success", msg: "Strong action verbs found." });
    } else {
      feedback.push({
        type: "warning",
        msg: "Use varied action verbs (e.g., Led, Created, Managed).",
      });
    }
  } else {
    feedback.push({
      type: "warning",
      msg: "Add at least one work experience entry.",
    });
  }

  // 4. Skills (20 pts)
  const skillsLen = (data.skills || "").split(",").filter(Boolean).length;
  if (skillsLen >= 5) {
    score += 20;
    feedback.push({ type: "success", msg: "Good number of skills listed." });
  } else {
    score += skillsLen * 4;
    feedback.push({
      type: "warning",
      msg: `Add more skills (Goal: 5+, Current: ${skillsLen}).`,
    });
  }

  // 5. Education (10 pts)
  if ((data.education || []).length > 0) {
    score += 10;
    feedback.push({ type: "success", msg: "Education section present." });
  } else {
    feedback.push({ type: "warning", msg: "Add education details." });
  }

  return { score: Math.min(100, score), feedback };
}

function addSectionLink(section) {
  if (!sectionNav) return;
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = section.title;
  button.addEventListener("click", () => {
    document.getElementById(section.id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
  sectionNav.appendChild(button);
  navButtons.set(section.id, button);
}

function watchSections(entries) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      setActiveSection(entry.target.id);
    }
  });
}

function setActiveSection(sectionId) {
  navButtons.forEach((button, id) => {
    button.classList.toggle("active", id === sectionId);
  });
}

function setPreviewBg(mode) {
  if (!previewStage) return;
  previewStage.classList.remove("grid");
  if (mode === "grid") {
    previewStage.classList.add("grid");
  }
}

function refreshStats() {
  const filled = countFilled();
  /* 
     Logic: e.g. total possible fields vs filled. 
     For now we just count raw filled inputs relative to an arbitrary 'good' number or total inputs.
  */
  const totalInputs = form.querySelectorAll("input, textarea").length;
  const percentage =
    totalInputs > 0 ? Math.round((filled / totalInputs) * 100) : 0;

  if (fieldProgress) {
    fieldProgress.textContent = `${percentage}%`;
  }
  refreshSections();
  refreshMeta();
  refreshATS(); // Recalculate score on update
}

function countFilled() {
  let filled = 0;
  form
    .querySelectorAll("input[data-key], textarea[data-key]")
    .forEach((input) => {
      if (input.value.trim()) {
        filled += 1;
      }
    });
  return filled;
}

function refreshSections() {
  schema.forEach((section) => {
    const complete = sectionHasData(section);
    const navButton = navButtons.get(section.id);
    if (navButton) {
      navButton.classList.toggle("is-complete", complete);
    }
  });
}

function sectionHasData(section) {
  if (section.repeatable) {
    return (state.data[section.id] || []).some((entry) =>
      section.fields.some((field) => entry?.[field.key]?.trim()),
    );
  }
  return section.fields.some((field) => state.data[field.key]?.trim());
}

function refreshMeta() {
  const completed = schema.filter(sectionHasData).length;
  const filled = countFilled();
  if (liveMeta) {
    liveMeta.textContent = `Live Preview · ${completed}/${schema.length} sections active`;
  }
}

async function savePdf() {
  const template = templates[state.templateKey];
  const prepared = prepareData();

  if (!window.html2canvas || !window.jspdf) {
    console.warn("PDF libraries unavailable.");
    return;
  }

  const exportNode = buildExportNode(template, prepared);
  document.body.appendChild(exportNode);
  await waitFrame();

  try {
    const canvas = await window.html2canvas(exportNode, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
    });
    const imgData = canvas.toDataURL("image/png");
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "pt", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(
      pageWidth / canvas.width,
      pageHeight / canvas.height,
    );
    const imgWidth = canvas.width * ratio;
    const imgHeight = canvas.height * ratio;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(`${(prepared.fullName || "resume").replace(/\s+/g, "-")}.pdf`);
  } catch (error) {
    console.error("PDF export failed", error);
  } finally {
    document.body.removeChild(exportNode);
  }
}

function buildExportNode(template, prepared) {
  const node = document.createElement("div");
  node.className = `resume-preview ${template.className}`;
  node.style.position = "absolute";
  node.style.left = "-9999px";
  node.style.top = "0";
  node.style.width = "794px"; /* A4 width 96dpi */
  node.style.background = "#ffffff";
  node.style.padding = "0";
  node.innerHTML = template.render(prepared);

  // Inject export specific styles
  const styleTag = document.createElement("style");
  styleTag.textContent = EXPORT_STYLES;
  node.appendChild(styleTag);

  return node;
}

function waitFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

if (downloadBtn) {
  downloadBtn.addEventListener("click", savePdf);
}

//reset function

if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    form.reset();
    state.data = {};
    Object.entries(collections).forEach(([sectionId, collections]) => {
      collections.innerHTML = "";
      const section = schema.find((s) => s.id === sectionId);
      addRepeater(section, collections);
    });
    drawPreview();
    refreshStats();
  });
}
