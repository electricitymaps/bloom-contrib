const handler = require("./CodeHandler");

//TODO REMOVE ME
const comparisonEngine = require("./ComparisonEngine");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const server = require("http").Server(app);
const port = 3001;
const helmet = require("helmet");
const io = require("socket.io")(server, { pingInterval: 5000 });

let resolveWebView = null;

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader(
		"Access-Control-Allow-Methods",
		"GET, POST, OPTIONS, PUT, PATCH, DELETE"
	);
	res.setHeader(
		"Access-Control-Allow-Headers",
		"X-Requested-With, Content-Type, Accept"
	);
	next();
});

app.options("*", (req, res) => res.sendStatus(200));

server.listen(port, err => {
	if (err) throw err;
	console.log("Server Running");
});

app.get("/test", (err, res) => {
	res.status(200);
	res.json(
		comparisonEngine.compareIntegration(
			handler.readCode("d47117a0-9293-11e9-ad86-49d0fe50ea66")
		)
	);
	res.end();
});

let socket = null;

io.on("connection", s => {
	console.log("New websocket connection ", s.handshake.headers.origin);
	socket = s;
	socket.emit("setIntegrations", handler.files);
	socket.emit("setCode", handler.readCode(s.handshake.query.name));
});

app.post("/evaluate-code", async (req, res) => {
	res.status(200);
	console.log(
		"----------------------------------------------------------------------------" +
			"\nRequest Start |\n---------------"
	);
	res.json(
		await handler.evaluate(
			req.body.code,
			req.body.authDetails,
			req.body.env,
			req.body.id,
			req.body.stateInjection
		)
	);
	console.log(
		"Request End\n--------------------------------------------------------------------------"
	);
	res.end();
});

app.get("/oauth_callback", (req, res) => {
	console.log("callback");
	resolveWebView();
	res.send('<script type="text/javascript">window.close()</script>');
});

const setWebView = webView => (resolveWebView = webView);

const emitOpenUrl = url => socket.emit("openUrl", url);

const emitResults = results => socket.emit("setResults", results);

const emitCode = code => socket.emit("setCode", code);

const emitError = error => socket.emit("evaluation-error", error);

module.exports.emitOpenUrl = emitOpenUrl;
module.exports.emitResults = emitResults;
module.exports.emitCode = emitCode;
module.exports.emitError = emitError;
module.exports.setWebView = setWebView;
