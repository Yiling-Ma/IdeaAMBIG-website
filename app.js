"use strict";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
let examples = [], results = [], activeTask = 1, activeSubset = "real", sortColumn = 0;

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function renderExample() {
  const example = examples.find(e => e.subset === $("#example-subset").value && e.type === $("#example-type").value);
  if (!example) return;
  $("#example-category").textContent = example.category;
  $("#example-title").textContent = example.title;
  $("#example-source").href = example.source;
  $("#example-spec").textContent = example.specification;
  $("#example-reference").textContent = example.reference;
  $(".reference").open = false;
  const panel = $("#task-panel");
  panel.replaceChildren();
  panel.setAttribute("aria-labelledby", `task-tab-${activeTask}`);
  if (activeTask === 1) {
    panel.append(element("h4", "Gold readiness annotation"), element("p", "NOT_READY", "readiness-label"), element("p", "This specification contains one annotated implementation-critical defect. Select Target defect to inspect the unresolved decision."));
  } else if (activeTask === 2) {
    panel.append(element("h4", `${example.type} · ${example.category}`), element("p", example.blocker));
  } else {
    panel.append(element("h4", "Gold clarification action · annotated defect supplied"), element("p", example.clarification));
    if (example.evidence) panel.append(element("p", `Information to seek: ${example.evidence}`));
  }
}

function renderResults() {
  const body = $("#results-body"); body.replaceChildren();
  const maxima = [0,1,2].map(i => Math.max(...results.map(r => r[activeSubset][i])));
  const sorted = [...results].sort((a,b) => b[activeSubset][sortColumn] - a[activeSubset][sortColumn]);
  sorted.forEach(result => {
    const row = element("tr");
    if (result.model === "GPT-5.6-Sol") row.className = "winner";
    const name = element("th", undefined);name.scope = "row";
    name.append(element("span", result.model), element("small", result.group));
    row.append(name);
    result[activeSubset].forEach((value, i) => row.append(element("td", value.toFixed(1), value === maxima[i] ? "best" : "")));
    body.append(row);
  });
  $("#results-sample").textContent = activeSubset === "real"
    ? "Task 1: 100 READY + 100 NOT_READY specifications. Tasks 2–3: 163 real-world instances."
    : "Task 1: 100 READY + 100 NOT_READY specifications. Tasks 2–3: a fixed sample of 200 synthetic instances.";
  $$("[data-sort]").forEach(button => button.closest("th").setAttribute("aria-sort", Number(button.dataset.sort) === sortColumn ? "descending" : "none"));
}

$(".menu-toggle").addEventListener("click", () => {
  const isOpen = $(".menu-toggle").getAttribute("aria-expanded") === "true";
  $(".menu-toggle").setAttribute("aria-expanded", String(!isOpen));
  $(".menu-toggle").setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
  $("#nav-links").classList.toggle("open", !isOpen);
});
$$("#nav-links a").forEach(link => link.addEventListener("click", () => {
  $("#nav-links").classList.remove("open");$(".menu-toggle").setAttribute("aria-expanded", "false");
}));
document.addEventListener("keydown", event => {
  if (event.key === "Escape") {$("#nav-links").classList.remove("open");$(".menu-toggle").setAttribute("aria-expanded", "false");}
});

$$("[data-task]").forEach(button => button.addEventListener("click", () => {
  activeTask = Number(button.dataset.task);
  $$("[data-task]").forEach(tab => {tab.setAttribute("aria-selected", String(tab === button));tab.tabIndex = tab === button ? 0 : -1;});
  renderExample();
}));
$(".example-tabs").addEventListener("keydown", event => {
  const tabs = $$("[data-task]");let index = tabs.indexOf(document.activeElement);
  if (index < 0) return;
  if (event.key === "ArrowRight") index = (index + 1) % tabs.length;
  else if (event.key === "ArrowLeft") index = (index + tabs.length - 1) % tabs.length;
  else if (event.key === "Home") index = 0;
  else if (event.key === "End") index = tabs.length - 1;
  else return;
  event.preventDefault();tabs[index].focus();tabs[index].click();
});
$("#example-subset").addEventListener("change", renderExample);
$("#example-type").addEventListener("change", renderExample);
$$("[data-subset]").forEach(button => button.addEventListener("click", () => {
  activeSubset = button.dataset.subset;
  $$("[data-subset]").forEach(b => {b.classList.toggle("active", b === button);b.setAttribute("aria-pressed", String(b === button));});
  renderResults();
}));
$$("[data-sort]").forEach(button => button.addEventListener("click", () => {sortColumn = Number(button.dataset.sort);renderResults();}));
$$("[data-copy]").forEach(button => button.addEventListener("click", async () => {
  const original = button.textContent;
  try {
    await navigator.clipboard.writeText(document.getElementById(button.dataset.copy).textContent);
    button.textContent = "Copied";$("#copy-status").textContent = `${original} copied to clipboard.`;
  } catch {
    const range = document.createRange();range.selectNodeContents(document.getElementById(button.dataset.copy));
    const selection = window.getSelection();selection.removeAllRanges();selection.addRange(range);
    button.textContent = "Text selected";$("#copy-status").textContent = "Text selected. Use your browser's Copy command.";
  }
  setTimeout(() => {button.textContent = original;}, 2500);
}));

async function loadData(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Unable to load ${path}`);
  return response.json();
}
loadData("data/examples.json").then(data => {examples = data;renderExample();}).catch(() => {
  $("#example-title").textContent = "Examples could not be loaded.";
  $("#example-spec").textContent = "Please reload this page or browse the released dataset on GitHub using the link above.";
});
loadData("data/results.json").then(data => {results = data;renderResults();}).catch(() => {
  const cell = element("td", "Results could not be loaded. Please reload or consult the paper.");cell.colSpan = 4;
  const row = element("tr");row.append(cell);$("#results-body").append(row);
});
