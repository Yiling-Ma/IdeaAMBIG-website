"use strict";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
let examples = [], results = [], activeTask = 1, activeSubset = "real", sortColumn = 0;

const readable = value => String(value).replaceAll("_", " ");

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = readable(text);
  if (className) node.className = className;
  return node;
}

function renderExample() {
  const example = examples.find(e => e.subset === $("#example-subset").value && e.type === $("#example-type").value);
  if (!example) return;
  $("#example-category").textContent = readable(example.category);
  $("#example-title").textContent = readable(example.title);
  $("#example-source").href = example.source;
  $("#example-source").textContent = example.subset === "synthetic" ? "Reference report" : "Source evidence";
  $("#example-record").href = example.record_url;
  $("#example-spec-label").textContent = "Underspecified specification";
  $("#example-origin").textContent = example.subset === "synthetic" ? "Controlled synthetic · single injected defect" : "Real-world · reconstructed gap";
  $("#example-spec").textContent = readable(example.specification);
  const panel = $("#task-panel");
  panel.replaceChildren();
  panel.setAttribute("aria-labelledby", `task-tab-${activeTask}`);
  if (activeTask === 1) {
    panel.append(element("h4", "Gold readiness annotation"), element("p", "NOT READY", "readiness-label"), element("p", example.readiness_reason));
  } else if (activeTask === 2) {
    panel.append(element("h4", `${example.type} · ${example.category}`), element("p", example.blocker));
    if (example.source_context) panel.append(element("h4", "Evidence context"), element("p", example.source_context));
  } else {
    panel.append(element("h4", "Gold clarification action · annotated defect supplied"), element("p", example.action_type === "evidence_seeking" ? "Action type: Evidence seeking" : "Action type: Clarification question", "action-kind"), element("p", example.clarification));
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
    ? "Task 1: 100 READY + 100 NOT READY specifications. Tasks 2–3: 163 real-world instances."
    : "Task 1: 100 READY + 100 NOT READY specifications. Tasks 2–3: a fixed sample of 200 synthetic instances.";
  $$("[data-sort]").forEach(button => button.closest("th").setAttribute("aria-sort", Number(button.dataset.sort) === sortColumn ? "descending" : "none"));
}

const contentsToggle = $(".menu-toggle");
const contentsRail = $("#contents-rail");
const contentsBackdrop = $(".toc-backdrop");
const contentsLinks = $$(".contents-links a");
const contentsSections = $$("[data-toc-section]");
const drawerViewport = window.matchMedia("(max-width: 1099px)");

function setContentsOpen(open, returnFocus = false) {
  document.body.classList.toggle("contents-open", open);
  contentsToggle.setAttribute("aria-expanded", String(open));
  contentsToggle.setAttribute("aria-label", open ? "Close contents" : "Open contents");
  contentsBackdrop.hidden = !open;
  contentsRail.inert = drawerViewport.matches && !open;
  if (open) (contentsLinks.find(link => link.getAttribute("aria-current")) || contentsLinks[0]).focus({preventScroll: true});
  else if (returnFocus) contentsToggle.focus({preventScroll: true});
}

contentsToggle.addEventListener("click", () => setContentsOpen(contentsToggle.getAttribute("aria-expanded") !== "true"));
contentsBackdrop.addEventListener("click", () => setContentsOpen(false, true));
contentsLinks.forEach(link => link.addEventListener("click", () => {
  const target = document.getElementById(link.hash.slice(1));
  setContentsOpen(false);
  if (drawerViewport.matches && target) {
    target.setAttribute("tabindex", "-1");
    target.focus({preventScroll: true});
  }
}));
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && contentsToggle.getAttribute("aria-expanded") === "true") setContentsOpen(false, true);
  if (event.key === "Tab" && drawerViewport.matches && contentsToggle.getAttribute("aria-expanded") === "true") {
    const focusable = [contentsToggle, ...contentsLinks];
    const index = focusable.indexOf(document.activeElement);
    const next = (index + (event.shiftKey ? -1 : 1) + focusable.length) % focusable.length;
    event.preventDefault();focusable[next].focus();
  }
});
drawerViewport.addEventListener("change", () => setContentsOpen(false));
setContentsOpen(false);

let contentsFrame = 0;
function updateContents() {
  contentsFrame = 0;
  const marker = Math.max(120, window.innerHeight * 0.24);
  let active = contentsSections[0];
  for (const section of contentsSections) {
    if (section.getBoundingClientRect().top <= marker) active = section;
  }
  // The final section can be too short to reach the reading marker.
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 3) active = contentsSections[contentsSections.length - 1];
  for (const link of contentsLinks) {
    const current = link.hash === `#${active.id}`;
    if (current) {
      const changed = !link.hasAttribute("aria-current");
      link.setAttribute("aria-current", "location");
      if (changed) {
        const list = $(".contents-links"), itemBox = link.getBoundingClientRect(), listBox = list.getBoundingClientRect();
        if (itemBox.top < listBox.top) list.scrollTop -= listBox.top - itemBox.top + 8;
        else if (itemBox.bottom > listBox.bottom) list.scrollTop += itemBox.bottom - listBox.bottom + 8;
      }
    } else link.removeAttribute("aria-current");
  }
}
function scheduleContents() {if (!contentsFrame) contentsFrame = requestAnimationFrame(updateContents);}
window.addEventListener("scroll", scheduleContents, {passive: true});
window.addEventListener("resize", scheduleContents);
window.addEventListener("hashchange", scheduleContents);
new ResizeObserver(scheduleContents).observe($("main"));
updateContents();

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
loadData("data/examples.json?v=full-examples-1").then(data => {examples = data;renderExample();}).catch(() => {
  $("#example-title").textContent = "Examples could not be loaded.";
  $("#example-spec").textContent = "Please reload this page or browse the released dataset on GitHub using the link above.";
});
loadData("data/results.json").then(data => {results = data;renderResults();}).catch(() => {
  const cell = element("td", "Results could not be loaded. Please reload or consult the paper.");cell.colSpan = 4;
  const row = element("tr");row.append(cell);$("#results-body").append(row);
});
