onerror = alert;


const uiTemplate = `

`;
// if (chrome.fileManagerPrivate) {
  // chrome.fileManagerPrivate.openURL();
// }
const managementTemplate = `

<div id="chrome_management_disable_ext">
<h1> chrome.management Disable Extensions </h1>
<p class ="description">this funny was granted by the members of silly goober money gang</p>
<p class ="description">we love casting fun times</p>
<br/>
<button id="current-extension">Disable injected extension</button>
<br/><br/>
<ul class="extlist">
</ul>
<!-- <input type="text" class="extnum" /><button disabled id="toggler">Toggle extension</button>
<br/><br/> -->
</div>

`;
let savedExtList = [];
const slides = [];
let activeSlideIdx = 0;
const handleCallbacks_ = [];
const WAIT_FOR_FINISH = 1;
requestAnimationFrame(function a(t) {
  for (const cb of handleCallbacks_) {
    let m;
    if ( m = (cb.f.apply(null, [t - cb.t]))) {
      if (m === 1) {
        return;
      }else {
      handleCallbacks_.splice(handleCallbacks_.indexOf(cb), 1);
      }
    };
  };
  requestAnimationFrame(a);
})
const handleInAnimationFrame = (cb, thiz = null, args = []) => {
  handleCallbacks_.push({
    f: cb,
    t: performance.now()
  });
}

class ExtensionCapabilities {
  static setupSlides(activeidx = 0) {
    if (chrome.management) {
  slides.push(document.querySelector('#chrome_management_disable_ext'));
    }
    slides.push(document.querySelector('#ext_default'));
    for (let i = 0; i < slides.length; i++) {
      if (i === activeidx) {
        slides[i].style.display = "block";
      }
      else {
        slides[i].style.display = "none";
      }
    }
    activeSlideIdx = activeidx;
    
    onkeydown = function (ev) {
      if (ev.repeat) return;
      
      if (this.getSelection() && this.getSelection().anchorNode.tagName) {
        return;
      }
      if (ev.key.toLowerCase().includes("left")) {
        activeSlideIdx--;
        if (activeSlideIdx < 0) {
          activeSlideIdx += (slides.length);
        }
        activeSlideIdx %= (slides.length);
        ev.preventDefault();
      }
      if (ev.key.toLowerCase().includes("right")) {
        activeSlideIdx++;
        if (activeSlideIdx < 0) {
          activeSlideIdx += (slides.length);
        }
        activeSlideIdx %= (slides.length);    
        ev.preventDefault();

      }
      ExtensionCapabilities.setActiveSlideIndex(activeSlideIdx);
    }
  }
  static setActiveSlideIndex(idx) {
    function a(t) {
      const seconds = t/1000;
      if (seconds >= 0.2) {
        // slides[i].style.display = "none";
        return true;
      }
      slides[idx].style.opacity = String((seconds)/(0.2));

    }
    for (let i = 0; i < slides.length; i++) {
      if (i === idx) {
        
        slides[i].style.display = "block";
        
      }
      else {
        if (slides[i].style.display === "block") {
          slides[i].style.position = "absolute";
          const m = i;
          handleInAnimationFrame(function (t) {
            const seconds = t/1000;
            if (0.8 - seconds <= 0) {
              
              slides[i].style.display = "none";
              handleInAnimationFrame(a);
              return true;
            }
            slides[i].style.opacity = String(( (0.2 - seconds) / 0.2));
            
          })
        }
        // slides[i].style.display = "none";
      }
    }
  }
  
  activate () {}
}
class DefaultExtensionCapabilities extends ExtensionCapabilities {
  static template = `
  <div id="ext_default">
  <div id="default_extension_capabilities">
    <h1> Default Extension Capabilities </h1>

    <h2>Evaluate code</h1>
    <input type="text" id="code_input"/><button id="code_evaluate">Evaluate</button>
    
  </div>
  <div id="extension_tabs_default">
    <button id="tabreload"> Refresh Tabs</button>
    <h1> Update tabs </h1>
    <ol>
    
    </ol>
    <input id="TabURLInput" /> <button id="TabURLSubmit">Create</button>
    
  </div>
  </div>
  `; // TODO: Fix Navigator (For now I removed it)
  updateTabList(tablist, isTabTitleQueryable, tabStatus) {
    if (this.disarmed) {
      return;
    }

    if (this.tabListInProgress) {
      console.log("In progress tablist building!");
      // setTimeout(this.updateTabList.bind(this, tablist, isTabTitleQueryable, tabStatus));
      return;
    }
    this.tabListInProgress = true;
    tablist.innerHTML = "";
    const thiz = this;
    chrome.windows.getAll(function (win) {
      win.forEach(function (v) {
        chrome.tabs.query({windowId: v.id}, function (tabInfos) {
          tabInfos.forEach(function (info) {
            const listItem = document.createElement("li");
            listItem.textContent = isTabTitleQueryable
              ? `${info.title} (${info.url})`
              : "(not available)";
            listItem.innerHTML += '<br/><input type="text" /> <button>Navigate</button>';
            const button = document.createElement("button");
            button.innerHTML = "Preview";
            listItem.querySelector('button').onclick = function (ev) {
              const inp = listItem.querySelector('input');
            chrome.tabs.update(info.id, {
              "url": inp.value
            });
            }
            button.onclick = () => {
              thiz.disarm = true;

              thiz.previewing = true;

              chrome.windows.update(info.windowId, {
                focused: true
              }, function () {
                chrome.tabs.update(info.id, { active: true });
               
              });
              window.currentTimeout = setTimeout(function m() {
                clearTimeout(window.currentTimeout);
                
                chrome.tabs.getCurrent(function (tab) {
                  chrome.windows.update(tab.windowId, {
                    focused: true
                  }, function () {
                    chrome.tabs.update(tab.id, { active: true });
                    thiz.disarm = false;
                    thiz.previewing = false;
                  });
                  
                });
              }, 100);
            };
            tablist.appendChild(listItem);
            tablist.appendChild(button);
          });
          thiz.tabListInProgress = false;
          if (isTabTitleQueryable) {
            tabStatus.style.display = "none";
          } else {
            tabStatus.textContent =
              "(Some data might not be available, because the extension doesn't have the 'tabs' permission)";
          }
        });
      })
    });
  }
  activate() {
    document.write(DefaultExtensionCapabilities.template);
    // document.close();
     document.body.querySelector("#ext_default").querySelectorAll('button').forEach(function (btn) {
       // alert("prepping button " + btn.id);
      btn.addEventListener("click", this.onBtnClick_.bind(this, btn));
     }, this);
    
    this.updateTabList(document.body.querySelector('#extension_tabs_default').querySelector('ol'), (!!chrome.runtime.getManifest().permissions.includes('tabs')));
    for (var i in chrome.tabs) {
      if (i.startsWith('on')) {
        chrome.tabs[i].addListener(function (ev) {
          this.updateTabList(document.body.querySelector('#extension_tabs_default').querySelector('ol'), (!!chrome.runtime.getManifest().permissions.includes('tabs')));
        })
      }
    }
    // document.body.querySelector('')
  }
  static getFS() {
    return new Promise(function (resolve) {
      webkitRequestFileSystem(TEMPORARY, 2 * 1024 * 1024, resolve);
    });
  }
  /**
   * @param {HTMLButtonElement} b
   */
  async onBtnClick_(b) {
    switch (b.id) {
      case "code_evaluate": {
        console.log("Evaluating code!");
        const x = document.querySelector("#code_input").value;
        const fs = await DefaultExtensionCapabilities.getFS();
        function writeFile(file, data) {
          return new Promise((resolve, reject) => {
            fs.root.getFile(file, { create: true }, function (entry) {
              entry.remove(function () {
                fs.root.getFile(file, { create: true }, function (entry) {
                  entry.createWriter(function (writer) {
                    writer.write(new Blob([data]));
                    writer.onwriteend = resolve.bind(null, entry.toURL());
                  });
                });
              });
            });
          });
        }

        const url = await writeFile("src.js", x);
        let script =
          document.body.querySelector("#evaluate_elem") ??
          document.createElement("script");
        script.remove();
        script = document.createElement("script");
        script.id = "evaluate_elem";
        script.src = url;
        document.body.appendChild(script);
      }
      case "tabreload":{
        this.updateTabList(document.body.querySelector('#extension_tabs_default').querySelector('ol'), (!!chrome.runtime.getManifest().permissions.includes('tabs')));
      }
    }
  }
}
class HostPermissions {
  activate() {}
}
function createExtensionCard(name, id, enabled) {
  const li = document.createElement('li');
  li.className = 'extension-card';
  li.innerHTML = `
      <span class="extension-name">${name} (${id})</span>
      <label class="toggle-switch">
          <input type="checkbox" ${enabled ? 'checked' : ''}>
          <span class="slider"></span>
      </label>
  `;
  return li;
}
function updateExtensionStatus(extlist_element) {
  return new Promise(function (resolve, reject) {
    extlist_element.innerHTML = "";
    chrome.management.getAll(function (extlist) {
      const ordlist = [];
      let e = 0;
      extlist.forEach(function (e) {
        if (e.id === new URL(new URL(location.href).origin).host) {
          return;
        }
        ordlist.push(e);

        let card = createExtensionCard(e.name, e.id, e.enabled)

        card.querySelector('input').addEventListener('change', (event) => {
          chrome.management.setEnabled(e.id, event.target.checked);
          // setTimeout(function () {
          //   updateExtensionStatus(extlist_element);
          // }, 200);
        });
        // const itemElement = document.createElement("li");
        // itemElement.textContent = `${e.name} (${e.id}) `;
        // const aElem = document.createElement('a');
        // aElem.href = "javascript:void(0)";
        // aElem.innerText = `${e.enabled ? "enabled" : "disabled"}`;
        // aElem.onclick = function () {
        //   // alert(e.enabled);
        //   chrome.management.setEnabled(e.id, !e.enabled);
        //   setTimeout(function () {
        //     updateExtensionStatus(extlist_element);
        //   }, 200);
        // }
        // // e++;
        // itemElement.appendChild(aElem);
        extlist_element.appendChild(card);
        resolve();
      });
      savedExtList = ordlist;
    });
  });
}
const fileManagerPrivateTemplate = `
  <div id="fileManagerPrivate_cap">
    <div id="FMP_openURL">
      <button id="btn_FMP_openURL">Open URL in Skiovox window</button>
    </div>
  </div>

`
const htmlStyle = `<style> body {font-family: Arial, sans-serif;background-color: #202124;color: #fff;margin: 0;padding: 20px;}#chrome_management_disable_ext {max-width: 800px;margin: 0 auto;}h1 {font-size: 24px;margin-bottom: 20px;}.description {margin-bottom: 20px;color: #9aa0a6;}.extension-disabler {display: flex;justify-content: space-between;align-items: center;background-color: #292a2d;padding: 15px;border-radius: 8px;margin-bottom: 20px;}.extlist {list-style-type: none;padding: 0;}.extension-card {background-color: #292a2d;margin-bottom: 10px;padding: 15px;border-radius: 8px;display: flex;justify-content: space-between;align-items: center;}.extension-name {font-weight: bold;}.toggle-switch {position: relative;display: inline-block;width: 60px;height: 34px;}.toggle-switch input {opacity: 0;width: 0;height: 0;}.slider {position: absolute;cursor: pointer;top: 0;left: 0;right: 0;bottom: 0;background-color: #ccc;transition: .4s;border-radius: 34px;}.slider:before {position: absolute;content: "";height: 26px;width: 26px;left: 4px;bottom: 4px;background-color: white;transition: .4s;border-radius: 50%;}input:checked + .slider {background-color: #2196F3;}input:checked + .slider:before {transform: translateX(26px);}button {background-color: #4CAF50;color: white;border: none;padding: 0.5rem 1rem;border-radius: 5px;cursor: pointer;transition: background-color 0.3s;}button:hover {background-color: #45a049;}button:disabled {background-color: #cccccc;cursor: not-allowed;}#current-extension {background-color: #f44336;font-family: Arial;font-size: medium;font-weight: bold;}#current-extension:hover {background-color: #da190b;} </style>`;

onload = async function x() {
  let foundNothing = true;
  document.open();
  this.document.write(htmlStyle);
  if (chrome.fileManagerPrivate) {
    // alert(1);
    chrome.fileManagerPrivate.openURL("data:text/html,<h1>Hello</h1>");
    document.write(fileManagerPrivateTemplate);
    document.body.querySelector('#btn_FMP_openURL').onclick = function (ev) {
    };
  }
  if (chrome.management.setEnabled) {
    this.document.write(managementTemplate);
    // createStyleTag();
    const extlist_element = document.querySelector(".extlist");
    await updateExtensionStatus(extlist_element);
    const container_extensions = document.body.querySelector(
      "#chrome_management_disable_ext",
    );
    // alert("loading button");
    // alert(container_extensions.querySelector("button"));

    container_extensions.querySelector("#current-extension").onclick = async function df(e) {
      try {
        var grabidtokill = chrome.runtime.id;
        chrome.management.setEnabled(grabidtokill, false);
      } catch {
        alert("unsuccessful");
      }
    };
    
    // container_extensions.querySelector("#toggler").onclick = async function dx(e) {
    //   // open();
    //   container_extensions.querySelector("#toggler").disabled = true;
      
    //   let id = container_extensions.querySelector(".extnum").value;
    //   container_extensions.querySelector(".extnum").value = "";
    //   try {
    //     id = parseInt(id);
    //   } catch {
    //     return;
    //   }
    //   if (!savedExtList[id - 1]) {
    //     alert("Select extension from list!");
    //     container_extensions.querySelector("#toggler").disabled = false;
    //     return;
    //   }
    //   await new Promise(function (resolve) {
    //     chrome.management.setEnabled(
    //       savedExtList[id - 1].id,
    //       !savedExtList[id - 1].enabled,
    //       resolve,
    //     );
    //   });

    //   container_extensions.querySelector("#toggler").disabled = false;
    //   await updateExtensionStatus(extlist_element);
    // };
    // container_extensions.querySelector("#toggler").disabled = false;
  }
  const otherFeatures = window.chrome.runtime.getManifest();
  const permissions = otherFeatures.permissions;
  
  new DefaultExtensionCapabilities().activate();
  document.close();
  ExtensionCapabilities.setupSlides();
};