const SECTIONS = [
  { id: "vendors", type: "vendor", title: "Boutique Vendors",
    blurb: "Storefronts that order titles from labels and distributors so you can preorder and buy domestic, import and out-of-print releases in one place." },
  { id: "labels", type: "label", title: "Boutique Film Labels",
    blurb: "Companies that license and produce their own physical releases, sold on their own site and/or through partner vendors." },
  { id: "shelf", type: "shelf", title: "Shelf Starters",
    blurb: "General retailers selling mainstream studio catalog at a discount — good for filling gaps, not a focus on boutique releases." },
  { id: "packaging", type: "packaging", title: "Packaging",
    blurb: "Makers of premium steelbooks and collector packaging." },
];

const collapsedParents = new Set(COMPANIES.filter((c) => c.parent).map((c) => c.parent));
let lastFilter = "";

function entryRow(c, { isChild = false, childCount = 0, collapsed = false } = {}) {
  const tag = c.region ? `<span class="tag">[${c.region}]</span>` : "";
  const countBadge = childCount > 0 ? `<span class="tag count-badge">[${childCount}]</span>` : "";
  const nameHtml = c.url
    ? `<a href="${c.url}" target="_blank" rel="noopener">${c.name}</a>`
    : `${c.name}`;
  const desc = c.description || "Details coming soon.";

  const marker = childCount > 0
    ? `<span class="marker toggle" data-toggle="${c.name}">${collapsed ? "[*]" : "[x]"}</span>`
    : `<span class="marker">[-]</span>`;

  return `
    <div class="list-row${isChild ? " child-row" : ""}" data-name="${c.name.toLowerCase()}">
      ${marker}
      <div class="entry-body">
        <span class="name">${nameHtml}</span> ${tag}${countBadge}
        <div class="desc">${desc}</div>
      </div>
    </div>`;
}

function matchesQuery(c, q) {
  return !q || c.name.toLowerCase().includes(q) || (c.description || "").toLowerCase().includes(q);
}

function render(filter) {
  lastFilter = filter || "";
  const root = document.getElementById("sections");
  root.innerHTML = "";
  const q = lastFilter.trim().toLowerCase();
  let total = 0;

  SECTIONS.forEach((section) => {
    const sectionEntries = COMPANIES.filter((c) => c.type === section.type);
    const byParent = {};
    const topLevel = [];
    sectionEntries.forEach((c) => {
      if (c.parent) {
        (byParent[c.parent] ||= []).push(c);
      } else {
        topLevel.push(c);
      }
    });

    const groups = topLevel
      .map((parent) => {
        const children = (byParent[parent.name] || []).slice().sort((a, b) => a.name.localeCompare(b.name));
        const parentMatches = matchesQuery(parent, q);
        const visibleChildren = parentMatches ? children : children.filter((c) => matchesQuery(c, q));
        if (q && !parentMatches && visibleChildren.length === 0) return null;
        return { parent, children: visibleChildren };
      })
      .filter(Boolean)
      .sort((a, b) => a.parent.name.localeCompare(b.parent.name));

    total += groups.reduce((sum, g) => sum + 1 + g.children.length, 0);

    const sectionEl = document.createElement("section");
    sectionEl.className = "section";
    sectionEl.id = section.id;

    const rowsHtml = groups.length
      ? groups.map((g) => {
          const collapsed = collapsedParents.has(g.parent.name);
          const parentRow = entryRow(g.parent, { childCount: g.children.length, collapsed });
          const childRows = !collapsed && g.children.length
            ? g.children.map((c) => entryRow(c, { isChild: true })).join("")
            : "";
          return parentRow + childRows;
        }).join("")
      : `<p class="empty-note">No matches in this section.</p>`;

    sectionEl.innerHTML = `
      <div class="section-head">
        <h2>${section.title}</h2>
      </div>
      <p class="section-blurb">${section.blurb}</p>
      ${rowsHtml}
    `;

    root.appendChild(sectionEl);
  });

  document.getElementById("count-line").textContent =
    q ? `${total} result(s) for "${filter}"` : `${COMPANIES.length} companies tracked`;
}

document.addEventListener("DOMContentLoaded", () => {
  render("");
  document.getElementById("search").addEventListener("input", (e) => render(e.target.value));
  document.getElementById("sections").addEventListener("click", (e) => {
    const toggle = e.target.closest(".toggle");
    if (!toggle) return;
    const name = toggle.dataset.toggle;
    if (collapsedParents.has(name)) collapsedParents.delete(name);
    else collapsedParents.add(name);
    render(lastFilter);
  });
});
