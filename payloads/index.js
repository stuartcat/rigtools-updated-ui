onerror = alert;

const uiTemplate = `

`;

if (localStorage.getItem("userdefIds") === null)
  localStorage.setItem("userdefIds", JSON.stringify([]));

Array.prototype.remove = function (item) {
  if (this.indexOf(item) === -1) throw new Error("not in array");
  this.splice(this.indexOf(item), 1);
};

// modified from https://github.com/mdn/dom-examples/tree/main/popover-api/toast-popovers
function makeToast(msg, time) {
  const popover = document.createElement("article");
  popover.popover = "manual";
  popover.classList.add("toast");
  popover.classList.add("newest");
  popover.textContent = msg;
  popover.style.translate = "-50%";

  document.body.appendChild(popover);
  popover.showPopover();

  setTimeout(() => {
    popover.hidePopover();
    setTimeout(() => {
      popover.remove();
    }, 500);
  }, time * 1000);

  popover.addEventListener("toggle", (event) => {
    if (event.newState === "open") {
      moveToasts();
    }
  });
}

// modified from https://github.com/mdn/dom-examples/tree/main/popover-api/toast-popovers (CC0-1.0)
function moveToasts() {
  const toasts = document.querySelectorAll(".toast");

  toasts.forEach((toast) => {
    if (toast.classList.contains("newest")) {
      toast.style.top = `5px`;
      toast.classList.remove("newest");
    } else {
      const prevValue = toast.style.top.replace("px", "");
      const newValue = parseInt(prevValue) + toast.clientHeight + 10;
      toast.style.top = `${newValue}px`;
    }
  });
}

function makeDialog(title, msg, oncancel, onconfirm) {
  const dialog = document.createElement("dialog");
  const confirmBtn = document.createElement("button");
  const cancelBtn = document.createElement("button");
  const head = document.createElement("h1");
  const body = document.createElement("div");
  const foot = document.createElement("div");

  // put it all together
  dialog.appendChild(head);
  dialog.appendChild(body);
  dialog.appendChild(foot);
  foot.appendChild(confirmBtn);
  foot.appendChild(cancelBtn);
  document.body.appendChild(dialog);

  head.textContent = title;

  // styling
  body.style.overflowY = "scroll";
  body.style.color = "rgb(220 220 220)";
  body.style.fontSize = "1rem";
  body.style.borderRadius = "10px";
  body.style.padding = "10px";
  body.style.marginBottom = "10px";

  if (Array.isArray(msg)) {
    body.style.border = "solid 2px #1d1d1d";
    msg.forEach((value) => {
      let item = document.createElement("p");
      item.textContent = value;
      body.appendChild(item);
    });
  } else {
    body.style.border = "solid 2px #2d2d2d";
    body.textContent = msg;
  }

  foot.style.height = "fit-content";
  foot.style.marginTop = "auto";
  foot.style.display = "flex";
  foot.style.flexDirection = "row-reverse";

  // buttons
  confirmBtn.classList.add("confirmBtn");
  confirmBtn.addEventListener("click", () => {
    dialog.close();
    onconfirm();
    setTimeout(() => dialog.remove(), 1000);
  });
  confirmBtn.textContent = "Confirm";

  cancelBtn.classList.add("cancelBtn");
  cancelBtn.addEventListener("click", () => {
    dialog.close();
    oncancel();
    setTimeout(() => dialog.remove(), 1000);
  });
  cancelBtn.textContent = "Cancel";

  dialog.showModal();
}

async function extensionExists(id) {
  return new Promise((resolve) =>
    chrome.management.getAll((extensions) =>
      resolve(extensions.some((ext) => ext.id === id))
    )
  );
}

// if (chrome.fileManagerPrivate) {
// chrome.fileManagerPrivate.openURL();
// }
const managementTemplate = `
<title>Untitled Document</title>
<link rel="icon" type="image/x-icon" href="https://raw.githubusercontent.com/T3M1N4L/rigtools-updated-ui/refs/heads/main/docs.ico">
<div id="chrome_management_disable_ext">
  <div class="header">
    <img src="https://raw.githubusercontent.com/T3M1N4L/rigtools-updated-ui/refs/heads/main/rigtools-bounce.gif" alt="Rigtools Logo" class="logo" />
    <h1> chrome.management Disable Extensions </h1>
  </div>
  <p class="description">Original repo: https://github.com/t3m1n4l/rigtools-updated-ui</p>
  <br />
  <p>Extensions</p>
  <button id="current-extension">Disable injected extension</button>
  <button id="rmv-cmn-blt">Remove Bloat</button>
  <button id="disable-userdef-exts">Disable user defined list of extensions</button>
  <!-- Moved tab buttons to default capabilities with a conditon of chrome.tabs.executescript -->
  <br /><br />
  <ul class="extlist">
  </ul>
  <!-- <input type="" class="extnum" /><button disabled id="toggler">Toggle extension</button>
<!-- <input type="text" class="extnum" /><button disabled id="toggler">Toggle extension</button>
<br/><br/> -->
  <div style="height: 50px"></div>
</div>

`;
 let savedExtList = [];
 const kFiles = [
  "/var/lib/devicesettings/owner.key",
  "/home/chronos/Local State"
]
async function readFile(path) {
  return (await fetch("file://" + path)).arrayBuffer();
}
async function findLastPolicyFile() {
  const kDevicePolicy = "/var/lib/devicesettings/policy.";
  let foundSomething = false;
  let i = 0;
  while (true){
    try {
      console.log("Trying " + kDevicePolicy + i);
      await readFile(kDevicePolicy + i);
      foundSomething = true;
    } catch {
      if (foundSomething) {
        return kDevicePolicy + (i - 1);
      }
    }
    i++;
  }
}
function doesNeedFileAccess() {
  const sc = chrome.runtime.getManifest().permissions;
  return sc.includes("activeTab") || sc.includes("<all_urls>");
}
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
function normalizeStringPosix(path, allowAboveRoot) {
  var res = '';
  var lastSegmentLength = 0;
  var lastSlash = -1;
  var dots = 0;
  var code;
  for (var i = 0; i <= path.length; ++i) {
    if (i < path.length)
      code = path.charCodeAt(i);
    else if (code === 47 /*/*/)
      break;
    else
      code = 47 /*/*/;
    if (code === 47 /*/*/) {
      if (lastSlash === i - 1 || dots === 1) {
        // NOOP
      } else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 /*.*/ || res.charCodeAt(res.length - 2) !== 46 /*.*/) {
          if (res.length > 2) {
            var lastSlashIndex = res.lastIndexOf('/');
            if (lastSlashIndex !== res.length - 1) {
              if (lastSlashIndex === -1) {
                res = '';
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
              }
              lastSlash = i;
              dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = '';
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0)
            res += '/..';
          else
            res = '..';
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0)
          res += '/' + path.slice(lastSlash + 1, i);
        else
          res = path.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === 46 /*.*/ && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}
function _format(sep, pathObject) {
  var dir = pathObject.dir || pathObject.root;
  var base = pathObject.base || (pathObject.name || '') + (pathObject.ext || '');
  if (!dir) {
    return base;
  }
  if (dir === pathObject.root) {
    return dir + base;
  }
  return dir + sep + base;
}
var posix = {
  // path.resolve([from ...], to)
  resolve: function resolve() {
    var resolvedPath = '';
    var resolvedAbsolute = false;
    var cwd;
    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path;
      if (i >= 0)
        path = arguments[i];
      else {
        if (cwd === undefined)
          cwd = process.cwd();
        path = cwd;
      }
      assertPath(path);
      // Skip empty entries
      if (path.length === 0) {
        continue;
      }
      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charCodeAt(0) === 47 /*/*/;
    }
    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)
    // Normalize the path
    resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);
    if (resolvedAbsolute) {
      if (resolvedPath.length > 0)
        return '/' + resolvedPath;
      else
        return '/';
    } else if (resolvedPath.length > 0) {
      return resolvedPath;
    } else {
      return '.';
    }
  },
  normalize: function normalize(path) {
    assertPath(path);
    if (path.length === 0) return '.';
    var isAbsolute = path.charCodeAt(0) === 47 /*/*/;
    var trailingSeparator = path.charCodeAt(path.length - 1) === 47 /*/*/;
    // Normalize the path
    path = normalizeStringPosix(path, !isAbsolute);
    if (path.length === 0 && !isAbsolute) path = '.';
    if (path.length > 0 && trailingSeparator) path += '/';
    if (isAbsolute) return '/' + path;
    return path;
  },
  isAbsolute: function isAbsolute(path) {
    assertPath(path);
    return path.length > 0 && path.charCodeAt(0) === 47 /*/*/;
  },
  join: function join() {
    if (arguments.length === 0)
      return '.';
    var joined;
    for (var i = 0; i < arguments.length; ++i) {
      var arg = arguments[i];
      assertPath(arg);
      if (arg.length > 0) {
        if (joined === undefined)
          joined = arg;
        else
          joined += '/' + arg;
      }
    }
    if (joined === undefined)
      return '.';
    return posix.normalize(joined);
  },
  relative: function relative(from, to) {
    assertPath(from);
    assertPath(to);
    if (from === to) return '';
    from = posix.resolve(from);
    to = posix.resolve(to);
    if (from === to) return '';
    // Trim any leading backslashes
    var fromStart = 1;
    for (; fromStart < from.length; ++fromStart) {
      if (from.charCodeAt(fromStart) !== 47 /*/*/)
        break;
    }
    var fromEnd = from.length;
    var fromLen = fromEnd - fromStart;
    // Trim any leading backslashes
    var toStart = 1;
    for (; toStart < to.length; ++toStart) {
      if (to.charCodeAt(toStart) !== 47 /*/*/)
        break;
    }
    var toEnd = to.length;
    var toLen = toEnd - toStart;
    // Compare paths to find the longest common path from root
    var length = fromLen < toLen ? fromLen : toLen;
    var lastCommonSep = -1;
    var i = 0;
    for (; i <= length; ++i) {
      if (i === length) {
        if (toLen > length) {
          if (to.charCodeAt(toStart + i) === 47 /*/*/) {
            // We get here if `from` is the exact base path for `to`.
            // For example: from='/foo/bar'; to='/foo/bar/baz'
            return to.slice(toStart + i + 1);
          } else if (i === 0) {
            // We get here if `from` is the root
            // For example: from='/'; to='/foo'
            return to.slice(toStart + i);
          }
        } else if (fromLen > length) {
          if (from.charCodeAt(fromStart + i) === 47 /*/*/) {
            // We get here if `to` is the exact base path for `from`.
            // For example: from='/foo/bar/baz'; to='/foo/bar'
            lastCommonSep = i;
          } else if (i === 0) {
            // We get here if `to` is the root.
            // For example: from='/foo'; to='/'
            lastCommonSep = 0;
          }
        }
        break;
      }
      var fromCode = from.charCodeAt(fromStart + i);
      var toCode = to.charCodeAt(toStart + i);
      if (fromCode !== toCode)
        break;
      else if (fromCode === 47 /*/*/)
        lastCommonSep = i;
    }
    var out = '';
    // Generate the relative path based on the path difference between `to`
    // and `from`
    for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
      if (i === fromEnd || from.charCodeAt(i) === 47 /*/*/) {
        if (out.length === 0)
          out += '..';
        else
          out += '/..';
      }
    }
    // Lastly, append the rest of the destination (`to`) path that comes after
    // the common path parts
    if (out.length > 0)
      return out + to.slice(toStart + lastCommonSep);
    else {
      toStart += lastCommonSep;
      if (to.charCodeAt(toStart) === 47 /*/*/)
        ++toStart;
      return to.slice(toStart);
    }
  },
  _makeLong: function _makeLong(path) {
    return path;
  },
  dirname: function dirname(path) {
    assertPath(path);
    if (path.length === 0) return '.';
    var code = path.charCodeAt(0);
    var hasRoot = code === 47 /*/*/;
    var end = -1;
    var matchedSlash = true;
    for (var i = path.length - 1; i >= 1; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
        if (!matchedSlash) {
          end = i;
          break;
        }
      } else {
        // We saw the first non-path separator
        matchedSlash = false;
      }
    }
    if (end === -1) return hasRoot ? '/' : '.';
    if (hasRoot && end === 1) return '//';
    return path.slice(0, end);
  },
  basename: function basename(path, ext) {
    if (ext !== undefined && typeof ext !== 'string') throw new TypeError('"ext" argument must be a string');
    // assertPath(path);
    var start = 0;
    var end = -1;
    var matchedSlash = true;
    var i;
    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
      if (ext.length === path.length && ext === path) return '';
      var extIdx = ext.length - 1;
      var firstNonSlashEnd = -1;
      for (i = path.length - 1; i >= 0; --i) {
        var code = path.charCodeAt(i);
        if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            start = i + 1;
            break;
          }
        } else {
          if (firstNonSlashEnd === -1) {
            // We saw the first non-path separator, remember this index in case
            // we need it if the extension ends up not matching
            matchedSlash = false;
            firstNonSlashEnd = i + 1;
          }
          if (extIdx >= 0) {
            // Try to match the explicit extension
            if (code === ext.charCodeAt(extIdx)) {
              if (--extIdx === -1) {
                // We matched the extension, so mark this as the end of our path
                // component
                end = i;
              }
            } else {
              // Extension does not match, so our result is the entire path
              // component
              extIdx = -1;
              end = firstNonSlashEnd;
            }
          }
        }
      }
      if (start === end) end = firstNonSlashEnd; else if (end === -1) end = path.length;
      return path.slice(start, end);
    } else {
      for (i = path.length - 1; i >= 0; --i) {
        if (path.charCodeAt(i) === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            start = i + 1;
            break;
          }
        } else if (end === -1) {
          // We saw the first non-path separator, mark this as the end of our
          // path component
          matchedSlash = false;
          end = i + 1;
        }
      }
      if (end === -1) return '';
      return path.slice(start, end);
    }
  },
  extname: function extname(path) {
    assertPath(path);
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;
    for (var i = path.length - 1; i >= 0; --i) {
      var code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
        // If this is our first dot, mark it as the start of our extension
        if (startDot === -1)
          startDot = i;
        else if (preDotState !== 1)
          preDotState = 1;
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }
    if (startDot === -1 || end === -1 ||
      // We saw a non-dot character immediately before the dot
      preDotState === 0 ||
      // The (right-most) trimmed path component is exactly '..'
      preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      return '';
    }
    return path.slice(startDot, end);
  },
  format: function format(pathObject) {
    if (pathObject === null || typeof pathObject !== 'object') {
      throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject);
    }
    return _format('/', pathObject);
  },
  parse: function parse(path) {
    assertPath(path);
    var ret = { root: '', dir: '', base: '', ext: '', name: '' };
    if (path.length === 0) return ret;
    var code = path.charCodeAt(0);
    var isAbsolute = code === 47 /*/*/;
    var start;
    if (isAbsolute) {
      ret.root = '/';
      start = 1;
    } else {
      start = 0;
    }
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    var i = path.length - 1;
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;
    // Get non-dir info
    for (; i >= start; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
        // If this is our first dot, mark it as the start of our extension
        if (startDot === -1) startDot = i; else if (preDotState !== 1) preDotState = 1;
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }
    if (startDot === -1 || end === -1 ||
      // We saw a non-dot character immediately before the dot
      preDotState === 0 ||
      // The (right-most) trimmed path component is exactly '..'
      preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      if (end !== -1) {
        if (startPart === 0 && isAbsolute) ret.base = ret.name = path.slice(1, end); else ret.base = ret.name = path.slice(startPart, end);
      }
    } else {
      if (startPart === 0 && isAbsolute) {
        ret.name = path.slice(1, startDot);
        ret.base = path.slice(1, end);
      } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
      }
      ret.ext = path.slice(startDot, end);
    }
    if (startPart > 0) ret.dir = path.slice(0, startPart - 1); else if (isAbsolute) ret.dir = '/';
    return ret;
  },
  sep: '/',
  delimiter: ':',
  win32: null,
  posix: null
};
const slides = [];
let activeSlideIdx = 0;
const handleCallbacks_ = [];
const WAIT_FOR_FINISH = 1;
requestAnimationFrame(function a(t) {
  for (const cb of handleCallbacks_) {
    let m;
    if ((m = cb.f.apply(null, [t - cb.t]))) {
      if (m === 1) {
        return;
      } else {
        handleCallbacks_.splice(handleCallbacks_.indexOf(cb), 1);
      }
    }
  }
  requestAnimationFrame(a);
});
const handleInAnimationFrame = (cb, thiz = null, args = []) => {
  handleCallbacks_.push({
    f: cb,
    t: performance.now(),
  });
};

// class ExtensionCapabilities {
//   static setupSlides(activeidx = 0) {
//     if (chrome.management) {
//       slides.push(document.querySelector("#chrome_management_disable_ext"));
//     }
//     slides.push(document.querySelector("#ext_default"));
//     for (let i = 0; i < slides.length; i++) {
//       if (i === activeidx) {
//         slides[i].style.display = "block";
//       } else {
//         slides[i].style.display = "none";
//       }
//     }
//     activeSlideIdx = activeidx;

//     onkeydown = function (ev) {
//       if (ev.repeat) return;

//       if (this.getSelection() && this.getSelection().anchorNode.tagName) {
//         return;
//       }
//       if (ev.key.toLowerCase().includes("left")) {
//         activeSlideIdx--;
//         if (activeSlideIdx < 0) {
//           activeSlideIdx += slides.length;
//         }
//         activeSlideIdx %= slides.length;
//         ev.preventDefault();
//       }
//       if (ev.key.toLowerCase().includes("right")) {
//         activeSlideIdx++;
//         if (activeSlideIdx < 0) {
//           activeSlideIdx += slides.length;
//         }
//         activeSlideIdx %= slides.length;
//         ev.preventDefault();
//       }
//       ExtensionCapabilities.setActiveSlideIndex(activeSlideIdx);
//     };
//   }
//   static setActiveSlideIndex(idx) {
//     function a(t) {
//       const seconds = t / 1000;
//       if (seconds >= 0.2) {
//         // slides[i].style.display = "none";
//         return true;
//       }
//       slides[idx].style.opacity = String(seconds / 0.2);
//     }
//     for (let i = 0; i < slides.length; i++) {
//       if (i === idx) {
//         slides[i].style.display = "";
//       } else {
//         if (slides[i].style.display === "block") {
//           slides[i].style.position = "absolute";
//           const m = i;
//           handleInAnimationFrame(function (t) {
//             const seconds = t / 1000;
//             if (0.8 - seconds <= 0) {
//               slides[i].style.display = "none";
//               handleInAnimationFrame(a);
//               return true;
//             }
//             slides[i].style.opacity = String((0.2 - seconds) / 0.2);
//           });
//         }
//         // slides[i].style.display = "none";
//       }
//     }
//   }

//   activate() {}
// }
class DefaultExtensionCapabilities {
  static template = `
  <title>Untitled Document</title>
  <link rel="icon" type="image/x-icon" href="https://raw.githubusercontent.com/T3M1N4L/rigtools-updated-ui/refs/heads/main/docs.ico">
  <div id="ext_default">
    <div id="default_extension_capabilities">
      <div class="header">
        <img src="https://raw.githubusercontent.com/T3M1N4L/rigtools-updated-ui/refs/heads/main/rigtools-bounce.gif" alt="Rigtools Logo" class="logo" />
        <h1> Default Extension Capabilities </h1>
      </div>
      <div id="tabs-buttons">
        <p>On tab update</p>
        <div id="toggleable-buttons"> <!-- do not change these ids, used in button listener -->
          <button id="eruda">Eruda</button>
          <button id="chii">Chii</button>
          <button id="adblock">Adblock</button>
          <button id="edpuzzle">Edpuzzle hax</button>
          <button id="invidious">Fix Invidious (Invidirect)</button>
        </div>
      </div>
      <div id="other-buttons">
        <p>Other scripts</p>
        <button id="swamp">Swamp</button>
        <button id="update">Update Rigtools</button>
        <button id="hstfld">History Flood</button>
      </div>
      <h2>Evaluate code</h1>
        <div class="container">
          <textarea id="code" placeholder="Enter JavaScript to inject"></textarea>
        </div>
        <button id="code-run">Run</button>
         <h2> Riienrollment </h2>
        <button id="forreenroll"> Download zip </button>
        <div id="code-output"></div>

    </div>
    <div id="extension_tabs_default">
      <button id="tabreload">Refresh Tabs</button>
      <ul>

      </ul>
      <input id="TabURLInput" /> <button id="TabURLSubmit">Create</button>

    </div>
  </div>
  `; // TODO: Fix Navigator (For now I removed it)
  updateTabList() {
    if (this.disarmed) {
      return;
    }

    if (this.tabListInProgress) {
      // console.log("In progress tablist building!");
      return;
    }
    this.tabListInProgress = true;

    const tablist = document.body.querySelector("#extension_tabs_default ul");

    tablist.innerHTML = "";
    const thiz = this;
    chrome.windows.getAll(function (win) {
      win.forEach(function (v) {
        chrome.tabs.query({ windowId: v.id }, function (tabInfos) {
          tabInfos.forEach(function (info) {
            const div = document.createElement("div");
            div.className = "tablist-item";
            div.innerHTML = `<img ${
              chrome.tabs && (info.favIconUrl?.length ?? 0) > 0
                ? `src="${info.favIconUrl}"`
                : ""
            }/><span class="tab-name">${info.title} (${info.url})</span>`;
            if (chrome.scripting || chrome.tabs.executeScript) {
              const runButton = document.createElement("button");
              runButton.textContent = "Run";
              runButton.onclick = () => runCode(true, info.id);
              div.appendChild(runButton);
            }
            // const navButton = document.createElement("button");
            // navButton.className = "navigate";
            // navButton.textContent = "Navigate";
            const previewButton = document.createElement("button");
            previewButton.textContent = "Preview";

            // navButton.onclick = function (ev) {
            //   const inp = div.querySelector("input");
            //   chrome.tabs.update(info.id, {
            //     url: inp.value,
            //   });
            // };
            previewButton.onclick = () => {
              thiz.disarm = true;

              thiz.previewing = true;

              chrome.windows.update(
                info.windowId,
                {
                  focused: true,
                },
                function () {
                  chrome.tabs.update(info.id, { active: true });
                }
              );
              window.currentTimeout = setTimeout(function m() {
                clearTimeout(window.currentTimeout);

                chrome.tabs.getCurrent(function (tab) {
                  chrome.windows.update(
                    tab.windowId,
                    {
                      focused: true,
                    },
                    function () {
                      chrome.tabs.update(tab.id, { active: true });
                      thiz.disarm = false;
                      thiz.previewing = false;
                    }
                  );
                });
              }, 100);
            };

            // div.appendChild(navButton);
            div.appendChild(previewButton);
            tablist.appendChild(div);
          });
          thiz.tabListInProgress = false;
        });
      });
    });
  }
  activate() {
    document.body.insertAdjacentHTML(
      "beforeend",
      DefaultExtensionCapabilities.template
    );
    // document.close();
    document.body
      .querySelector("#ext_default")
      .querySelectorAll("button")
      .forEach(function (btn) {
        // alert("prepping button " + btn.id);
        btn.addEventListener("click", this.onBtnClick_.bind(this, btn));
      }, this);
      document.body.querySelector("#forreenroll")
        .addEventListener('click', async function handler_(tar) {
          console.log(!('JSZip' in window));
          if (!('JSZip' in window)) {
            await DefaultExtensionCapabilities.evalCode(await (await fetch("https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js")).text());
            setTimeout(handler_); // Run in the next task
            return;
          }
          console.log("creating zip");
          const zipFile = new JSZip();
          for (const f of kFiles) {
            let buffer;
            try {
              buffer = await readFile(f);
            }
            catch (e) {
              console.log("could not read file " + f);
              continue;
            }
            zipFile.file(posix.basename(f), new Uint8Array(buffer));
          }
          zipFile.file(posix.basename(await findLastPolicyFile()), await readFile(await findLastPolicyFile()));
          const url = URL.createObjectURL(await zipFile.generateAsync({ type: "blob" }));
          const aelem = document.createElement('a');
          aelem.href = url;
          aelem.download = "";
          aelem.click();
        })

    this.updateTabList();
    for (let i in chrome.tabs) {
      if (i.startsWith("on")) {
        chrome.tabs[i].addListener(() => {
          this.updateTabList();
        });
      }
    }
    // document.body.querySelector('')
  }
  static getFS() {
    return new Promise(function (resolve) {
      webkitRequestFileSystem(TEMPORARY, 2 * 1024 * 1024, resolve);
    });
  }
  static async writeFile(file, data) {
    const fs = await DefaultExtensionCapabilities.getFS();
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
  static async evalCode(code) {
    const url = await DefaultExtensionCapabilities.writeFile("src.js", code);
    let script =
      document.body.querySelector("#evaluate_elem") ??
      document.createElement("script");
    script.remove();
    script = document.createElement("script");
    script.id = "evaluate_elem";
    script.src = url;
    document.body.appendChild(script);
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
        DefaultExtensionCapabilities.evalCode(x);
      }
      case "tabreload": {
        this.updateTabList();
      }
    }
  }
}
class HostPermissions {
  activate() {}
}
function createExtensionCard(name, id, enabled, icon_url) {
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

function createExtensionCardAll(enabled = true) {
  const li = document.createElement("li");
  li.className = "extension-card-all";
  li.innerHTML = `
      <img class="extension-icon" src="https://raw.githubusercontent.com/T3M1N4L/T3M1N4L/refs/heads/main/images/XOsX.gif"/>
      <span class="extension-name">All Extensions</span>
      <label class="toggle-switch">
          <input type="checkbox" ${enabled ? "checked" : ""}>
          <span class="slider"></span>
      </label>
  `;
  return li;
}

function updateExtensionStatus(extlist_element) {
  return new Promise(function (resolve, reject) {
    extlist_element.innerHTML = "";
    let cardAll = createExtensionCardAll();
    let cardInputAll = cardAll.querySelector("input");

    cardInputAll.addEventListener("change", (event) => {
      cardInputAll.disabled = true;
      chrome.management.getSelf(function (self) {
        chrome.management.getAll(function (extensions) {
          if (chrome.runtime.lastError) {
            alert(
              "Error loading extensions: " + chrome.runtime.lastError.message
            );
            return reject(chrome.runtime.lastError);
          }

          const promises = [];
          for (let i = 0; i < extensions.length; i++) {
            let extId = extensions[i].id;
            if (extId !== self.id) {
              promises.push(
                chrome.management.setEnabled(extId, event.target.checked)
              );
            }
          }
          Promise.all(promises)
            .then(() => {
              cardInputAll.disabled = false;
              resolve();
            })
            .catch((error) => {
              alert("Error enabling/disabling extensions: " + error.message);
              reject(error);
            });
        });
      });
    });

    extlist_element.appendChild(cardAll);

    chrome.management.getAll(function (extlist) {
      if (chrome.runtime.lastError) {
        alert("Error loading extensions: " + chrome.runtime.lastError.message);
        return reject(chrome.runtime.lastError);
      }

      const ordlist = [];
      extlist.forEach(function (extension) {
        if (extension.id === new URL(new URL(location.href).origin).host) {
          return;
        }
        ordlist.push(extension);

        const icon =
          extension.icons?.find((ic) => ic.size === 128) ??
          extension.icons?.at(-1);

        let card = createExtensionCard(
          extension.name,
          extension.id,
          extension.enabled,
          icon?.url ||
            "https://raw.githubusercontent.com/T3M1N4L/T3M1N4L/refs/heads/main/images/XOsX.gif"
        );

        let cardInput = card.querySelector("input");

        cardInput.addEventListener("change", (event) => {
          chrome.management.setEnabled(
            extension.id,
            event.target.checked,
            (result) => {
              if (chrome.runtime.lastError) {
                alert(
                  "Error updating extension status: " +
                    chrome.runtime.lastError.message
                );
              }
            }
          );
        });

        card.querySelector(".extension-icon").addEventListener("click", () => {
          userdefIds = JSON.parse(localStorage.getItem("userdefIds"));
          if (userdefIds.includes(extension.id)) {
            userdefIds.remove(extension.id);
            localStorage.setItem("userdefIds", JSON.stringify(userdefIds));
            makeToast("removed " + extension.shortName + " from the list", 2);
          } else {
            userdefIds.push(extension.id);
            localStorage.setItem("userdefIds", JSON.stringify(userdefIds));
            makeToast("added " + extension.shortName + " to the list", 2);
          }

          if (localStorage.getItem("userdefIds") === JSON.stringify([])) {
            document
              .querySelector("#disable-userdef-exts")
              .setAttribute("style", "display: none;");
          } else {
            document
              .querySelector("#disable-userdef-exts")
              .setAttribute("style", "display: inline;");
          }
        });

        extlist_element.appendChild(card);
      });
      savedExtList = ordlist;
      resolve();
    });
  });
}

const fileManagerPrivateTemplate = `
  <div id="fileManagerPrivate_cap">
    <div id="FMP_openURL">
      <button id="btn_FMP_openURL">Open URL in Skiovox window</button>
    </div>
  </div>

`;
const htmlStyle = `
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');
      body {
        font-family: monospace, sans-serif;
        background-color: #000000;
        color: #fff;
        margin: 0;
        padding: 20px;
      }
      body::-webkit-scrollbar {
        display: none;
      }
      p {
        margin: 5px auto;
      }
      #chrome_management_disable_ext, #ext_default {
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
        background-color: #0a0a0a;
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
      /*   background-color: #0a0a0a; */
        border: 2px solid #0a0a0a;
        margin-bottom: 10px;
        padding: 15px;
        border-radius: 8px;
        display: flex;
        justify-content: start;
        align-items: center;
      }
      .extension-card:has(input:checked) {
        background-color: #0a0a0a;
        border: 2px solid #0000;
      }
      .extension-card-all {
      /*   background-color: #0a0a0a; */
        border: 2px solid #0a0a0a;
        margin-bottom: 10px;
        padding: 15px;
        border-radius: 8px;
        display: flex;
        justify-content: start;
        align-items: center;
      }
      .extension-card-all:has(input:checked) {
        background-color: #0a0a0a;
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
        border: 2px solid #0a0a0a;
      }
      .header {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .logo {
        width: 4em; /* Adjust this size as needed */
        height: auto;
        margin-right: 10px;
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
        background-color: #a200ff;
        border: 2px solid #222;
      }
      input:checked+.slider:before {
        transform: translateX(24px);
      }
      .tablist-item {
        border: 2px solid #0a0a0a;
        margin-bottom: 10px;
        padding: 15px;
        border-radius: 8px;
        display: flex;
        justify-content: start;
        align-items: center;
      }
      .tablist-item img {
        max-width: 25px;
        margin-right: 10px;
      }
      .tablist-item span {
        padding: 10px, 0;
        text-overflow: ellipsis;
        width: 100%;
        white-space: nowrap;
        overflow: hidden;
        word-break: break-all;
      }
      .tablist-item span:hover {
        overflow: visible; 
        white-space: normal;
        height:auto;  
      }
      button {
        background-color: #810aff;
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
        background-color: #A324ED;
      }
      button:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
      }
      #toggleable-buttons button {
        position: relative;
        transition: background-color 0.3s, color 0.3s;
        overflow: hidden;
        font-family: Arial;
        font-size: medium;
        font-weight: bold;
        border: none;
        padding: 9px 15px 9px 60px;
        text-align: center;
        border-radius: 5px;
        margin: 4px 2px;
        cursor: pointer;
      }
      #toggleable-buttons button::before {
        content: '';
        position: absolute;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
        width: 40px;
        height: 20px;
        background-color: rgba(255,255,255,0.5);
        border-radius: 10px;
        transition: background-color 0.3s;
      }
      #toggleable-buttons button::after {
        content: '';
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        width: 16px;
        height: 16px;
        background-color: #fff;
        border-radius: 50%;
        transition: left 0.3s, background-color 0.3s;
      }
      #toggleable-buttons button[toggled="true"] {
      }
      #toggleable-buttons button[toggled="true"]::before {
        background-color: #a200ff;
      }
      #toggleable-buttons button[toggled="true"]::after {
        left: 32px;
        background-color: #ffffff;
      }
      #current-extension, #rmv-cmn-blt, #disable-userdef-exts {
        background-color: #ff564a;
        font-family: Arial;
        font-size: medium;
        font-weight: bold;
      }
      #disable-userdef-exts {
        position: relative;
      }
      #eruda{
        background-color: #752bff;
        font-family: Arial;
        font-size: medium;
        font-weight: bold;
      }
      #eruda:hover{
        background-color: #6525db;
      }
      #chii{
        background-color: #9bdb25;
        font-family: Arial;
        font-size: medium;
        font-weight: bold;
      }
      #chii:hover{
        background-color: #abeb35;
      }
       #edpuzzle{
        background-color: #ffce2e;
        font-family: Arial;
        font-size: medium;
        font-weight: bold;
      }
      #edpuzzle:hover{
        background-color: #e3b622;
      }
      #invidious{
        background-color: #121212;
        font-family: Arial;
        font-size: medium;
        font-weight: bold;
      }
      #invidious:hover{
        background-color: #080808;
      }
      #adblock {
        background-color: #ff4d4d;
        font-family: Arial;
        font-size: medium;
        font-weight: bold;
      }
      #adblock:hover {
        background-color: #ff5d5d;
      }
      #swamp{
        background-color: #00a5df;
        font-family: Arial;
        font-size: medium;
        font-weight: bold;
      }
      #swamp:hover{
        background-color: #0084b3;
      }
      #hstfld{
        background-color: #37de64;
        font-family: Arial;
        font-size: medium;
        font-weight: bold;
      }
      #hstfld:hover{
        background-color: #34ba58;
      }
      #update{
        background-color: #9442ff;
        font-family: Arial;
        font-size: medium;
        font-weight: bold;
      }
      #update:hover{
        background-color: #823ddb;
      }
      #current-extension:hover, #rmv-cmn-blt:hover, #disable-userdef-exts:hover {
        background-color: #e04338;
      }
      .container {
        display: flex;
        gap: 10px;
      }
      #code-run {
        align-self: flex-start;
        background-color: #810aff;
        color: white;
        border: none;
        cursor: pointer;
      }
      #code {
        background: #0a0a0a;
        color: white;
        width: 100%;
        min-height: 50px;
        height: 200px;
        resize: both;
        border: 1px solid #6f08ff;
        border-radius: 5px;
        font-family: monospace;
      }
      .footer {
        position: fixed;
        bottom: 5px;
        right: 10px;
        color: #ffffff;
      }
      input[type='checkbox'] {
        accent-color: #6f08ff !important;
      }
      input[id='TabURLInput'] {
        background-color: #0a0a0a !important;
        border-color: #6f08ff !important;
        border-style: solid;
        border-radius: 3px;
      }
      .toast[popover]:popover-open {
        opacity: 1;
        top: 5px;
        left: 50%;
      }
      @starting-style {
        .toast[popover]:popover-open {
          opacity: 0;
          transform: translateY(-100%);
        }
      }
      .toast[popover] {
        position: fixed;
        inset: unset;
        padding: 5px 10px;
        text-align: center;
        border-radius: 5px;
        opacity: 0;
        transition: all 0.5s allow-discrete;
        font-weight: bold;
        background: #7200f2;
        color: white;
        border: 2px solid rgb(255 255 255 / 0.6);
        white-space: pre-wrap;
      }
      dialog[open] {
        opacity: 1;
        transform: scale(1);
      }
      dialog {
        opacity: 0;
        padding: 30px;
        padding-bottom: 15px;
        border: 2px solid #2d2d2d;
        transform: scale(0.95);
        background: #000;
        border-radius: 10px;
        transition: overlay 0.7s allow-discrete, display 0.7s allow-discrete, opacity 0.7s allow-discrete, transform 0.5s allow-discrete;
        min-width: 50vw;
        min-height: 60vh;
        max-width: 50vw;
        max-height: 60vh;
        display: flex;
        flex-direction: column;
      }
      @starting-style {
        dialog[open] {
          opacity: 0;
          transform: scale(0.95);
        }
      }
      dialog::backdrop {
        background: transparent;
        backdrop-filter: blur(0px);
        transition: all 0.5s allow-discrete;
      }
      dialog[open]::backdrop {
        background-color: rgb(0 0 0 / 0.25);
        backdrop-filter: blur(3px);
      }
      @starting-style {
        dialog[open]::backdrop {
          background-color: transparent;
          backdrop-filter: blur(0px);
        }
      }
      dialog div {
        min-width: auto;
        width: auto;
        height: fit-content;
        font-family: 'Inter', sans-serif;
        white-space: pre-wrap;
        padding: none;
      }
      dialog p {
        margin-bottom: 9px;
        padding: 9px;
        border: 2px solid rgb(114 0 242 / 0.5);
        color: inherit;
        font-family: inherit;
        font-size: inherit;
        font-weight: 700;
        border-radius: 5px;
        width: auto;
      }
      dialog h1 {
        font-family: 'Inter', sans-serif;
        font-size: 1.5rem;
        color: white;
        font-weight: 900;
        margin-bottom: 25px;
        margin-top: 0;
      }
      dialog button {
        border: 2px solid rgb(255 255 255 / 0.6);
        font-weight: bold;
        font-family: 'Inter', sans-serif;
        font-size: 1rem;
        transition: background-color 0.2s, border 0.2s, transform 0.05s;
        margin-left: 5px;
      }
      dialog button:active {
        transform: scale(0.95);
      }
      dialog button:hover {
        border: 2px solid rgb(255 255 255 / 0.8);
      }
      .confirmBtn {
        background: hsl(268 100 47);
      }
      .cancelBtn {
        background: hsl(2 90 50);
      }
      .confirmBtn:hover {
        background: hsl(268 100 57);
      }
      .cancelBtn:hover {
        background: hsl(2 90 60);
      }
.prahit-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 10px; 
}


.prahit-image {
  max-width: 90%;
  max-height: 90%;
  border-radius: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
  -webkit-animation-name: shake;
  -webkit-animation-duration: 0.5s;
  -webkit-transform-origin:50% 50%;
  -webkit-animation-iteration-count: infinite;
}
@-webkit-keyframes shake {
  0% { -webkit-transform: translate(5px, 3px) rotate(0deg); }
  10% { -webkit-transform: translate(-5px, -6px) rotate(-3deg); }
  20% { -webkit-transform: translate(-8px, 0px) rotate(3deg); }
  30% { -webkit-transform: translate(0px, 6px) rotate(0deg); }
  40% { -webkit-transform: translate(3px, -4px) rotate(3deg); }
  50% { -webkit-transform: translate(-3px, 6px) rotate(-3deg); }
  60% { -webkit-transform: translate(-8px, 3px) rotate(0deg); }
  70% { -webkit-transform: translate(5px, 3px) rotate(-3deg); }
  80% { -webkit-transform: translate(-3px, -3px) rotate(3deg); }
  90% { -webkit-transform: translate(5px, 6px) rotate(0deg); }
  100% { -webkit-transform: translate(3px, -6px) rotate(-3deg); }
}


.prahit-textbox {
  background-color: rgba(0, 0, 0, 0.8); 
  color: white;
  padding: 10px;
  border-radius: 5px;
  font-size: 16px;
  max-width: 80%; 
  margin: 0 auto;
}

@-webkit-keyframes snowflakes-fall{0%{top:-10%}100%{top:100%}}@-webkit-keyframes snowflakes-shake{0%,100%{-webkit-transform:translateX(0);transform:translateX(0)}50%{-webkit-transform:translateX(80px);transform:translateX(80px)}}@keyframes snowflakes-fall{0%{top:-10%}100%{top:100%}}@keyframes snowflakes-shake{0%,100%{transform:translateX(0)}50%{transform:translateX(80px)}}.snowflake{position:fixed;top:-10%;z-index:9999;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:default;-webkit-animation-name:snowflakes-fall,snowflakes-shake;-webkit-animation-duration:10s,3s;-webkit-animation-timing-function:linear,ease-in-out;-webkit-animation-iteration-count:infinite,infinite;-webkit-animation-play-state:running,running;animation-name:snowflakes-fall,snowflakes-shake;animation-duration:10s,3s;animation-timing-function:linear,ease-in-out;animation-iteration-count:infinite,infinite;animation-play-state:running,running}.snowflake:nth-of-type(0){left:1%;-webkit-animation-delay:0s,0s;animation-delay:0s,0s}.snowflake:nth-of-type(1){left:10%;-webkit-animation-delay:1s,1s;animation-delay:1s,1s}.snowflake:nth-of-type(2){left:20%;-webkit-animation-delay:6s,.5s;animation-delay:6s,.5s}.snowflake:nth-of-type(3){left:30%;-webkit-animation-delay:4s,2s;animation-delay:4s,2s}.snowflake:nth-of-type(4){left:40%;-webkit-animation-delay:2s,2s;animation-delay:2s,2s}.snowflake:nth-of-type(5){left:50%;-webkit-animation-delay:8s,3s;animation-delay:8s,3s}.snowflake:nth-of-type(6){left:60%;-webkit-animation-delay:6s,2s;animation-delay:6s,2s}.snowflake:nth-of-type(7){left:70%;-webkit-animation-delay:2.5s,1s;animation-delay:2.5s,1s}.snowflake:nth-of-type(8){left:80%;-webkit-animation-delay:1s,0s;animation-delay:1s,0s}.snowflake:nth-of-type(9){left:90%;-webkit-animation-delay:3s,1.5s;animation-delay:3s,1.5s}.snowflake:nth-of-type(10){left:25%;-webkit-animation-delay:2s,0s;animation-delay:2s,0s}.snowflake:nth-of-type(11){left:65%;-webkit-animation-delay:4s,2.5s;animation-delay:4s,2.5s}
.snowflake {
  z-index: 99;
  color: #ffffff;
  font-size: 1em;
  font-family: Arial, sans-serif;
  text-shadow: 0 0 5px #000000;
  opacity: 0.7;
}
  
    </style>
  `;

onload = async function x() {
  let foundNothing = true;
  document.open();
  this.document.write(htmlStyle);
  document.close();

  if (chrome.fileManagerPrivate) {
    chrome.fileManagerPrivate.openURL("data:text/html,<h1>Hello</h1>");
    document.write(fileManagerPrivateTemplate);
    document.body.querySelector("#btn_FMP_openURL").onclick = function (ev) {};
  }

  if (chrome.management.setEnabled) {
    document.body.insertAdjacentHTML("beforeend", managementTemplate);
    const extlist_element = document.querySelector(".extlist");

    await updateExtensionStatus(extlist_element);
    const container_extensions = document.body.querySelector(
      "#chrome_management_disable_ext"
    );

    container_extensions.querySelector("#current-extension").onclick =
      async function df(e) {
        try {
          const grabidtokill = chrome.runtime.id;
          chrome.management.setEnabled(grabidtokill, false);
        } catch {
          alert("unsuccessful");
        }
      };

    container_extensions.querySelector("#rmv-cmn-blt").onclick = function df() {
      const bloatIds = [
        "cgbbbjmgdpnifijconhamggjehlamcif",
        "lfkbbmclnpaihpaajhohhfdjelchkikf",
        "ncbofnhmmfffmcdmbjfaigepkgmjnlne",
        "pohmgobdeajemcifpoldnnhffjnnkhgf",
        "becdplfalooflanipjoblcmpaekkbbhe",
        "feepmdlmhplaojabeoecaobfmibooaid",
        "adkcpkpghahmbopkjchobieckeoaoeem",
        "haldlgldplgnggkjaafhelgiaglafanh",
        "filgpjkdmjinmjbepbpmnfobmjmgimon",
        "kkbmdgjggcdajckdlbngdjonpchpaiea",
        "njdniclgegijdcdliklgieicanpmcngj",
        "hpkdokakjglppeekfeekmebfahadnflp",
      ];

      let exts = {};
      let extlngth = 0;
      function getLength() {
        return new Promise((resolve) => {
          bloatIds.forEach((id, i) => {
            extensionExists(id).then((res) => {
              if (res) extlngth++;
              if (bloatIds.length - 1 === i) resolve();
            });
          });
        });
      }

      function initExtObj() {
        return new Promise((resolve) => {
          bloatIds.forEach((id) =>
            chrome.management.get(id, (e) => {
              Object.assign(exts, JSON.parse(`{"${e.id}":"${e.shortName}"}`));
              if (Object.keys(exts).length == extlngth) resolve();
            })
          );
        });
      }

      getLength().then(() =>
        initExtObj().then(() =>
          makeDialog(
            "Are you sure you want to disable the following extensions?",
            Object.values(exts),
            function () {},
            function () {
              let disabledExts = [];
              Object.keys(exts).forEach((id) => {
                chrome.management.get(id, (e) => {
                  if (e.enabled) {
                    if (id == chrome.runtime.id) return;

                    disabledExts.push(e.shortName);
                    chrome.management.setEnabled(id, false);
                  }
                });
              });

              setTimeout(() => {
                if (!disabledExts.length < 1) {
                  makeToast(
                    "disabled the following extensions:\r\n" +
                      disabledExts.join("\r\n"),
                    disabledExts.length
                  );
                  updateExtensionStatus(extlist_element);
                }
              }, 250);
            }
          )
        )
      );
    };

    if (localStorage.getItem("userdefIds") == JSON.stringify([])) {
      container_extensions
        .querySelector("#disable-userdef-exts")
        .setAttribute("style", "display: none;");
    }

    container_extensions.querySelector("#disable-userdef-exts").onclick =
      function df(e) {
        let exts = {};
        function initExtObj() {
          let idlist = JSON.parse(localStorage.getItem("userdefIds"));
          return new Promise((resolve) => {
            idlist.forEach((id) => {
              chrome.management.get(id, (e) => {
                Object.assign(exts, JSON.parse(`{"${e.id}":"${e.shortName}"}`));
                if (Object.keys(exts).length == idlist.length) resolve();
              });
            });
          });
        }

        initExtObj().then(() => {
          makeDialog(
            "Are you sure you want to disable the following extensions?",
            Object.values(exts),
            function () {},
            function () {
              let disabledExts = [];
              JSON.parse(localStorage.getItem("userdefIds")).forEach((id) => {
                chrome.management.get(id, (e) => {
                  if (e.enabled) {
                    if (id == chrome.runtime.id) return;

                    disabledExts.push(e.shortName);
                    chrome.management.setEnabled(id, false);
                  }
                });
              });

              setTimeout(() => {
                if (!disabledExts.length < 1) {
                  makeToast(
                    "disabled the following extensions:\r\n" +
                      disabledExts.join("\r\n"),
                    disabledExts.length
                  );
                  updateExtensionStatus(extlist_element);
                }
              }, 250);
            }
          );
        });
      };
  } // End of management if statement
  const otherFeatures = window.chrome.runtime.getManifest();
  const permissions = otherFeatures.permissions;

  new DefaultExtensionCapabilities().activate();
  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <title>Untitled Document</title>
      <link rel="icon" type="image/x-icon" href="https://raw.githubusercontent.com/T3M1N4L/rigtools-updated-ui/refs/heads/main/docs.ico">
      <div class="footer"><strong>silly</strong></div>
      `
  );

  const ScriptButtons = document.querySelector("#other-buttons");

  ScriptButtons.querySelector("#swamp").onclick = async function df(e) {
    fetch(
      "https://raw.githubusercontent.com/T3M1N4L/rigtools-updated-ui/refs/heads/main/scripts/swamp-ultra.js"
    )
      .then((res) => res.text())
      .then(eval);
  };

  ScriptButtons.querySelector("#update").onclick = async function df(e) {
    (async () => {
      const fs = await new Promise(function (resolve) {
        webkitRequestFileSystem(PERSISTENT, 2 * 1024 * 1024, resolve);
      });

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

      const url = await writeFile(
        "rigtools.html",
        `${await fetch(
          "https://raw.githubusercontent.com/T3M1N4L/rigtools-updated-ui/refs/heads/main/payloads/index.html"
        ).then((res) => res.text())}<script src="./rigtools.js"></script>`
      );

      await writeFile(
        "rigtools.js",
        await fetch(
          "https://raw.githubusercontent.com/T3M1N4L/rigtools-updated-ui/refs/heads/main/payloads/index.js"
        ).then((res) => res.text())
      );

      chrome.tabs.create({ url });
    })();
  };

  ScriptButtons.querySelector("#hstfld").onclick = async function df(e) {
    document.title = "Untitled Document";
    let link =
      document.querySelector("link[rel~='icon']") ||
      document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
    link.href =
      "https://raw.githubusercontent.com/T3M1N4L/rigtools-updated-ui/refs/heads/main/docs.ico";

    let num = prompt(
      "How Times Do You Want This Page To Show Up In your History?"
    );
    let done = false;
    const x = window.location.href;
    for (let i = 1; i <= num; i++) {
      history.pushState(0, 0, i === num ? x : i.toString());
      if (i === num) done = true;
    }
    if (done) {
      alert(
        "Flooding Successful!\n " +
          window.location.href +
          " \nIs Now In Your History " +
          num +
          (num == 1 ? " time." : " Times.")
      );
    }
  };

  const TabButtons = document.querySelector("#tabs-buttons");

  if (chrome.tabs.executeScript) {
    // Declare a single listener for tab updates
    function listenerApp(callback) {
      const func = (id, changeInfo) => {
        if (changeInfo.status === "complete") {
          chrome.tabs.get(id, (tab) => {
            if (tab) {
              callback(tab);
            }
          });
        }
      };
      chrome.tabs.onUpdated.addListener(func);
      return func;
    }

    const scripts = {}; // script to be ran on tab
    const conditions = {}; // (tab) => {}
    const listeners = {}; // map for removing listeners

    scripts.eruda = `
    fetch("https://cdn.jsdelivr.net/npm/eruda").then(res => res.text()).then((data) => {
      eval(data);
      if (!window.erudaLoaded) {
        eruda.init({
          defaults: {
            displaySize: 45,
            theme: "AMOLED"
          }
        });
        window.erudaLoaded = true;
      }
    });
  `;

    scripts.chii = `
    const script = document.createElement('script');
    script.src = 'https://chii.liriliri.io/playground/target.js';
    script.setAttribute('embedded', 'true');
    document.head.appendChild(script);
  `;

    scripts.adblock = `
    (function(){
      /* Ad-B-Gone: Bookmarklet that removes obnoxious ads from pages */
      var selectors = [
      /* By ID: */
      '#sidebar-wrap', '#advert', '#xrail', '#middle-article-advert-container',
      '#sponsored-recommendations', '#around-the-web', '#sponsored-recommendations',
      '#taboola-content', '#taboola-below-taboola-native-thumbnails', '#inarticle_wrapper_div',
      '#rc-row-container', '#ads', '#at-share-dock', '#at4-share', '#at4-follow', '#right-ads-rail',
      'div#ad-interstitial', 'div#advert-article', 'div#ac-lre-player-ph',
      /* By Class: */
      '.ad', '.avert', '.avert__wrapper', '.middle-banner-ad', '.advertisement',
      '.GoogleActiveViewClass', '.advert', '.cns-ads-stage', '.teads-inread', '.ad-banner',
      '.ad-anchored', '.js_shelf_ads', '.ad-slot', '.antenna', '.xrail-content',
      '.advertisement__leaderboard', '.ad-leaderboard', '.trc_rbox_outer', '.ks-recommended',
      '.article-da', 'div.sponsored-stories-component', 'div.addthis-smartlayers',
      'div.article-adsponsor', 'div.signin-prompt', 'div.article-bumper', 'div.video-placeholder',
      'div.top-ad-container', 'div.header-ad', 'div.ad-unit', 'div.demo-block', 'div.OUTBRAIN',
      'div.ob-widget', 'div.nwsrm-wrapper', 'div.announcementBar', 'div.partner-resources-block',
      'div.arrow-down', 'div.m-ad', 'div.story-interrupt', 'div.taboola-recommended',
      'div.ad-cluster-container', 'div.ctx-sidebar', 'div.incognito-modal', '.OUTBRAIN', '.subscribe-button',
      '.ads9', '.leaderboards', '.GoogleActiveViewElement', '.mpu-container', '.ad-300x600', '.tf-ad-block',
      '.sidebar-ads-holder-top', '.ads-one', '.FullPageModal__scroller',
      '.content-ads-holder', '.widget-area', '.social-buttons', '.ac-player-ph',
      /* Other: */
      'aside#sponsored-recommendations', 'aside[role="banner"]', 'aside',
      'amp-ad', 'span[id^=ad_is_]', 'div[class*="indianapolis-optin"]', 'div[id^=google_ads_iframe]',
      'div[data-google-query-id]', 'section[data-response]', 'ins.adsbygoogle', 'div[data-google-query-id]',
      'div[data-test-id="fullPageSignupModal"]', 'div[data-test-id="giftWrap"]' ];
      for(let i in selectors) {
          let nodesList = document.querySelectorAll(selectors[i]);
          for(let i = 0; i < nodesList.length; i++) {
              let el = nodesList[i];
              if(el && el.parentNode)
              el.parentNode.removeChild(el);
          }
      }
    })();
  `;

    scripts.edpuzzle = `
    fetch("https://cdn.jsdelivr.net/gh/Miner49ur/shorthand@main/edpuzzlingscript.js").then(r => r.text()).then(r => {
      if (!window.edpuzzlesLoaded) {
        eval(r);
        window.edpuzzlesLoaded = true;
      }
    });
  `;
    scripts.invidious = `
    fetch("https://raw.githubusercontent.com/T3M1N4L/rigtools-updated-ui/refs/heads/main/scripts/invidirect.js").then(r => r.text()).then(r => {
      eval(r);
    });
  `;
    conditions.edpuzzle = (tab) => tab.url.match(/edpuzzle\.com\/assignments/g);
    conditions.invidious = (tab) =>
      tab.url.match(/^(?:https?:\/\/)(?:inv|invidious)\.[^\/]+\/.*watch\?v=/);

    const ToggleButtons = TabButtons.querySelector("#toggleable-buttons");

    ToggleButtons.querySelectorAll("button").forEach(
      (b) =>
        (b.onclick = () => {
          const id = b.id;

          if (b.hasAttribute("toggled")) {
            // toggle off
            if (id in listeners)
              chrome.tabs.onUpdated.removeListener(listeners[id]);
            b.removeAttribute("toggled");
          } else {
            // toggle on
            const script = scripts[id] || "";
            const condition = conditions[id] || ((tab) => true);
            const func = listenerApp((tab) => {
              if (condition(tab)) {
                chrome.tabs.executeScript(tab.id, { code: script });
              }
            });

            listeners[id] = func;

            b.setAttribute("toggled", "true");
          }
        })
    );
  } else {
    TabButtons.style.display = "none";
  }

  document
    .querySelector("#code-run")
    .addEventListener("click", () => runCode(false));
}; // End of onload function

const runCode = async (onTab, tabId = "") => {
  const codeTextarea = document.querySelector("#code");
  let code = codeTextarea.value.trim();

  const outputDiv = document.querySelector("#code-output");

  // Check for "prahit" and display the container and snowflakes
  if (code.toLowerCase() === "prahit") {
    // Create a container for the image and text box
    const container = document.createElement("div");
    container.className = "prahit-container"; // Add a class for styling

    // Create the image element (prahit image)
    const overlayImage = document.createElement("img");
    overlayImage.src =
      "https://raw.githubusercontent.com/T3M1N4L/rigtools-updated-ui/refs/heads/main/prahit.png";
    overlayImage.alt = "Prahit Image";
    overlayImage.className = "prahit-image"; // Add a class for styling

    // Create the text box
    const textBox = document.createElement("div");
    textBox.textContent = "I made my own oil rigging stock market tools.";
    textBox.className = "prahit-textbox"; // Add a class for styling

    // Add the image and text box to the container
    container.appendChild(overlayImage);
    container.appendChild(textBox);

    // Add the container to the body
    document.body.appendChild(container);

    // Add snowflakes (prahit images) to the body outside of the container
    const snowflakesDiv = document.createElement("div");
    snowflakesDiv.className = "snowflakes";
    snowflakesDiv.setAttribute("aria-hidden", "true");

    // Add snowflakes with "prahit" image
    for (let i = 0; i < 14; i++) {
      const snowflake = document.createElement("div");
      snowflake.className = "snowflake";
      
      const snowflakeImage = document.createElement("img");
      snowflakeImage.width = 30;
      snowflakeImage.src = "https://raw.githubusercontent.com/T3M1N4L/rigtools-updated-ui/refs/heads/main/prahit.png";
      snowflake.appendChild(snowflakeImage);
      
      snowflakesDiv.appendChild(snowflake);
    }

    document.body.appendChild(snowflakesDiv);

    // Now, add the explosion image to cover the entire screen
    const explosionImage = document.createElement("img");
    explosionImage.src = "https://raw.githubusercontent.com/ssoggycat/soggy.cat/refs/heads/main/team/assets/images/boom.awebp";
    explosionImage.style.position = "fixed";  // Fixed positioning to cover the screen
    explosionImage.style.top = "0";
    explosionImage.style.left = "0";
    explosionImage.style.width = "100%";  // Cover the full width of the screen
    explosionImage.style.height = "100%"; // Cover the full height of the screen
    explosionImage.style.zIndex = "9999"; // Make sure it is on top of other elements
    explosionImage.style.display = "none"; // Initially hidden
    document.body.appendChild(explosionImage);

    // Explosion sound (short duration)
    const explode = new Audio("https://raw.githubusercontent.com/ssoggycat/soggy.cat/refs/heads/main/team/assets/audio/boom.mp3");

    // Background music (cats.ogg - long duration)
    const catsMusic = new Audio("https://raw.githubusercontent.com/ssoggycat/soggy.cat/refs/heads/main/team/assets/audio/cats.ogg");
    catsMusic.loop = true;  // Enable looping for the background music

    // Function to show explosion and play both sounds at the same time
    function showExplosionAndPlayMusic() {
      // Show the explosion image
      explosionImage.style.display = 'block';

      // Play the explosion sound and background music at the same time
      explode.play();
      catsMusic.play();

      // Hide explosion image after 1.5 seconds (duration of explosion effect)
      setTimeout(function() {
        explosionImage.style.display = 'none';
      }, 1500);  // 1.5 seconds for explosion duration

      // Stop the explosion sound after 1.5 seconds (it will automatically stop)
      setTimeout(function() {
        explode.pause();  // Pause the explosion sound
        explode.currentTime = 0;  // Reset the sound to the start for next time
      }, 1500);  // Stop explosion sound after 1.5 seconds
    }

    // Trigger the explosion and sound effect
    showExplosionAndPlayMusic();

    // Stop execution here to avoid running further code
    return;
  }

  if (onTab) {
    code = chrome.tabs.executeScript
      ? `;chrome.tabs.executeScript(
          ${tabId},
          { code: ${JSON.stringify(code)} }
        )`
      : chrome.scripting
      ? `chrome.scripting.executeScript({
          target: {tabId: ${tabId}},
          func: () => {${code}}
        });`
      : `alert("something went wrong, runCode was executed on a tab without proper permissions")`;
  }

  try {
    const originalLog = console.log;
    console.log = (...args) => {
      outputDiv.innerHTML += args.join(" ") + "<br>";
    };

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

    const url = await writeFile("src.js", code);
    let script =
      document.body.querySelector("#evaluate_elem") ??
      document.createElement("script");
    script.remove();
    script = document.createElement("script");
    script.id = "evaluate_elem";
    script.src = url;
    document.body.appendChild(script);

    console.log = originalLog;
  } catch (error) {
    outputDiv.innerHTML = `Error: ${error}`;
  }
};
