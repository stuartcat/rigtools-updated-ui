var socket = null;
var lastDataSent = null;
var using = null;
let iframe = document.createElement('iframe');
document.body.appendChild(iframe);
window.open = iframe.contentWindow.open.bind(window);
var hw = prompt("Paste url here", "https://www.gimkit.com/join");
let win = window.open(hw);
alert(win);
const nativeSend = win.WebSocket.prototype.send;
win.WebSocket.prototype.send = function (_0x1844a0) {
  nativeSend.call(this, _0x1844a0);
  var _0x135c5c = new TextDecoder("utf-8");
  if (_0x1844a0 != 0x2 && _0x135c5c.decode(_0x1844a0).includes("answer")) {
    lastDataSent = _0x1844a0;
  }
  socket = this;
};
setInterval(() => {
  win.document.onkeydown = _0x330610 => {
    if (_0x330610.repeat) {
      return;
    }
    if (_0x330610.key == ';') {
      using = lastDataSent;
      win.alert("Saved.");
    } else {
      if (_0x330610.key == 'u') {
        if (using) {
          socket.send(using);
        }
        ;
      }
    }
    ;
  };
});
win.alert("Started.");
document.write("Keep this tab open. Close tab to stop hacks.");
