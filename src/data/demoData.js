/** Sample records used only by the mock backend. Dates are relative to creation time. */
export const createDemoData = () => ({
  // A bookmark's parentId points to one of these folder IDs.
  folders: [
    { id: "work", title: "Work", color: "blue" },
    { id: "dev", title: "Development", color: "purple" },
    { id: "inspiration", title: "Inspiration", color: "orange" },
    { id: "personal", title: "Personal", color: "green" },
  ],
  // Sample rows: [title, URL, folder ID, icon].
  bookmarks: [
    ["MDN Web Docs", "https://developer.mozilla.org", "dev", "M"],
    ["Figma — Team design", "https://www.figma.com", "work", "F"],
    ["GitHub", "https://github.com", "dev", "G"],
    ["Awwwards — Digital inspiration", "https://www.awwwards.com", "inspiration", "W"],
    ["Notion — My workspace", "https://www.notion.so", "work", "N"],
    ["CSS-Tricks", "https://css-tricks.com", "dev", "#"],
    ["Are.na — Collect ideas", "https://www.are.na", "inspiration", "A"],
    ["YouTube", "https://www.youtube.com", "personal", "▶"],
    // Turn each row into a bookmark object; i is the row's zero-based index.
  ].map((b, i) => ({
    id: `b${i}`,
    title: b[0],
    url: b[1],
    parentId: b[2],
    icon: b[3],
    dateAdded: Date.now() - i * 86400000,
  })),
  // mayDisable=false demonstrates an extension managed by the browser.
  extensions: [
    {
      id: "e1",
      name: "uBlock Origin",
      description: "A cleaner, quieter browsing experience.",
      version: "1.60.0",
      enabled: true,
      permissions: ["webRequest", "storage", "tabs"],
      icon: "U",
      mayDisable: true,
    },
    {
      id: "e2",
      name: "React Developer Tools",
      description: "Explore application components and state.",
      version: "5.3.1",
      enabled: true,
      permissions: ["storage", "scripting"],
      icon: "⚛",
      mayDisable: true,
    },
    {
      id: "e3",
      name: "Bitwarden",
      description: "Your passwords, always within reach.",
      version: "2024.10.0",
      enabled: true,
      permissions: ["tabs", "clipboardWrite", "storage"],
      icon: "B",
      mayDisable: true,
    },
    {
      id: "e4",
      name: "Dark Reader",
      description: "A little more comfort for your eyes.",
      version: "4.9.92",
      enabled: false,
      permissions: ["tabs", "storage"],
      icon: "D",
      mayDisable: true,
    },
    {
      id: "e5",
      name: "Browser component",
      description: "An example of a browser-managed extension.",
      version: "1.0",
      enabled: true,
      permissions: ["storage"],
      icon: "◈",
      mayDisable: false,
    },
  ],
  // One history record per URL, containing a list of individual visits.
  history: [
    ["GitHub · BrowserTools", "https://github.com", "Today"],
    [
      "JavaScript documentation | MDN",
      "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
      "Today",
    ],
    ["Figma — Dashboard", "https://www.figma.com/files", "Today"],
    ["Brave Browser", "https://brave.com", "Yesterday"],
    [
      "CSS grid layout",
      "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout",
      "Yesterday",
    ],
    ["Awwwards — Sites of the day", "https://www.awwwards.com", "Yesterday"],
  ].map((h, i) => ({
    id: `h${i}`,
    title: h[0],
    url: h[1],
    lastVisitTime: Date.now() - i * 14400000,
    visitCount: 9 - i,
    // Generate visits one hour apart. "typed" means entered in the address bar.
    visits: Array.from({ length: 9 - i }, (_, j) => ({
      visitId: `v${i}-${j}`,
      visitTime: Date.now() - i * 14400000 - j * 3600000,
      transition: j ? "link" : "typed",
    })),
  })),
});
