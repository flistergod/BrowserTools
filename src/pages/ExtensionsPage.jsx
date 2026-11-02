import { useState } from "react";
import PageHeading from "../components/PageHeading.jsx";
import Stats from "../components/Stats.jsx";
import Library from "../components/Library.jsx";
import Modal from "../components/Modal.jsx";
import { useLibrary } from "../hooks/useLibrary.js";

/** Browser-controlled restrictions apply in live mode; localhost uses sample records. */
export default function ExtensionsPage({ data, mutate, confirm, busy }) {
  const controls = useLibrary(data.extensions);
  const [details, setDetails] = useState(null);
  const items = controls.items.filter((item) => {
    if (controls.filter === "enabled") return item.enabled;
    if (controls.filter === "disabled") return !item.enabled;
    return true;
  });
  const activeCount = data.extensions.filter((item) => item.enabled).length;
  const cards = [
    {
      icon: "⊞",
      label: "Installed extensions",
      value: data.extensions.length,
      note: "Your toolkit",
    },
    { icon: "◉", label: "Active", value: activeCount, note: "Ready to use" },
    {
      icon: "◌",
      label: "Disabled",
      value: data.extensions.length - activeCount,
      note: "On pause",
    },
  ];
  const filters = [
    { id: "all", label: "All" },
    { id: "enabled", label: "Active" },
    { id: "disabled", label: "Disabled" },
  ];

  function uninstall(item) {
    confirm({
      message: `Uninstall “${item.name}”${data.mode === "real" ? " from this browser? Brave will also ask you to confirm." : " from the demonstration?"}`,
      operation: (api) => api.uninstall(item.id),
      successMessage: "Extension removed.",
    });
  }

  return (
    <>
      <PageHeading
        title="Your extensions"
        description="Choose the tools that are part of your day."
      />
      <Stats cards={cards} />
      <Library
        name="Extensions"
        controls={controls}
        filters={filters}
        count={items.length}
        total={data.extensions.length}
      >
        <div className="extension-grid">
          {items.map((item) => (
            <article className="extension-card" key={item.id}>
              <div className="extension-top">
                <span className="favicon purple">{item.icon}</span>
                <div>
                  <strong>{item.name}</strong>
                  <small>Version {item.version}</small>
                </div>
                <button
                  className={`toggle ${item.enabled ? "on" : ""}`}
                  role="switch"
                  aria-checked={item.enabled}
                  aria-label={`Enable ${item.name}`}
                  disabled={
                    busy ||
                    (item.enabled
                      ? !item.mayDisable
                      : item.mayEnable === false || item.isSelf)
                  }
                  onClick={() =>
                    mutate(
                      (api) => api.setEnabled(item.id, !item.enabled),
                      item.enabled ? "Extension disabled." : "Extension enabled.",
                    )
                  }
                >
                  <span />
                </button>
              </div>
              <p>{item.description}</p>
              <div className="extension-bottom">
                <button onClick={() => setDetails(item)}>Permissions ↗</button>
                {item.mayDisable ? (
                  <button onClick={() => uninstall(item)} disabled={busy}>
                    Uninstall
                  </button>
                ) : (
                  <small>
                    {item.isSelf ? "BrowserTools (protected)" : "Managed by the browser"}
                  </small>
                )}
              </div>
            </article>
          ))}
        </div>
      </Library>
      {details && (
        <Modal title={details.name} onClose={() => setDetails(null)}>
          <p>
            {data.mode === "real"
              ? "Declared API and website permissions:"
              : "Simulated permissions for this extension:"}
          </p>
          {details.permissions.map((permission) => (
            <span className="permission" key={permission}>
              {permission}
            </span>
          ))}
        </Modal>
      )}
    </>
  );
}
