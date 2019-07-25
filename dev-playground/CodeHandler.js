const server = require("./server");
const fs = require("fs");
const path = require("path");
const definitions = require("../definitions");
const models = {
	transport: require("../co2eq/transportation")
};
const comparisonEngine = require("./ComparisonEngine");

const EXPORT_NAMES = [
	"connect",
	"collect",
	"disconnect",
	"config",
	"loggerExport"
];

//first line necessary as logger can be null, logger: logger is not an alternative.
const exportCode = `\n\nconst loggerExport = typeof logger !== "undefined" ? logger : undefined;
 \nexport {${EXPORT_NAMES.join(",")}};`;
let stub = null;

async function evaluate(code, authDetails, env, id, stateInjection) {
	console.log("Began Evaluating");
	const basePackage = "./integration-test/" + id;

	function createSessionPackage() {
		if (!fs.existsSync(basePackage)) {
			console.log("Creating session package: " + basePackage);
			fs.mkdirSync(basePackage);
			fs.appendFileSync(basePackage + "/integration.js", "");
			fs.appendFileSync(basePackage + "/env.js", "");
		} else console.log("Session package already exists");
	}

	function writeEnv() {
		return new Promise((resolve, reject) => {
			if (env)
				fs.writeFile(
					basePackage + "/env.js",
					`module.exports = ` + objectToCode(env),
					err => {
						if (err) {
							console.log("Env File Writing error:" + err);
							reject();
						}
						console.log("Wrote Env");
						resolve();
					}
				);
			else resolve("No env");
		});
	}

	function importIntegration() {
		return new Promise((resolve, reject) => {
			console.log("Deleting cached Integration module");
			delete require.cache[require.resolve(basePackage + "/integration.js")];
			console.log("Importing new integration");
			try {
				stub = require(basePackage + "/integration");
			} catch (e) {
				sendError(e);
			}
			if (stub) resolve();
			else reject();
		});
	}

	function writeCode() {
		return new Promise((resolve, reject) => {
			fs.writeFile(basePackage + "/integration.js", code + exportCode, err => {
				if (err) {
					console.log("File Writing error:" + err);
					reject();
				}
				console.log("Wrote Code");
				resolve();
			});
		});
	}
	createSessionPackage();
	return writeEnv().then(() =>
		writeCode().then(() =>
			importIntegration().then(() =>
				assessFunctions(stub, code, authDetails, stateInjection)
			)
		)
	);
}

function objectToCode(env) {
	return (
		"{" +
		Object.keys(env)
			.map(k => k + ':"' + env[k] + '"')
			.join(",") +
		"};"
	);
}

async function assessFunctions(stub, code, authDetails, stateInjection) {
	const requestLogin =
		authDetails.username !== null && authDetails.password !== null
			? () => {
					return {
						username: authDetails.username,
						password: authDetails.password
					};
			  }
			: () => {};

	const requestWebView = (url, callbackUrl) => {
		return new Promise((resolve, reject) => {
			if (!url) reject();

			server.setWebView(resolve);
			server.emitOpenUrl(url);
		});
	};

	console.log("Assessing Functions");

	try {
		if (stateInjection && Object.keys(stateInjection).length > 0) {
			console.log("Injecting state", stateInjection);

			const collectResult = await stub.collect(stateInjection, {
				logWarning: err => console.log(err)
			});
			server.emitResults(
				await {
					connect: {},
					collect: collectResult,
					disconnect: {},
					config: stub.config,
					modelledActivities: collectResult.activities.map(a =>
						a.activityType.includes("TRANSPORT")
							? models.transport.carbonIntensity(a)
							: //https://www.rensmart.com/Calculators/KWH-to-CO2 temporary
							  a.energyWattHours * 0.00028307
					),
					logs: stub.loggerExport ? stub.loggerExport.popLogs() : [],
					codeSimiliarity: comparisonEngine.compareIntegration(code)
				}
			);
		} else {
			console.log("No state injection found, executing normally.");
			const connectResult = await stub.connect(requestLogin, requestWebView);
			const collectResult = await stub.collect(connectResult, {
				logWarning: err => console.log(err)
			});

			server.emitResults(
				await {
					connect: connectResult,
					collect: collectResult,
					disconnect: await stub.disconnect(),
					config: stub.config,
					modelledActivities: collectResult.activities.map(a =>
						a.activityType.includes("TRANSPORT")
							? models.transport.carbonIntensity(a)
							: //https://www.rensmart.com/Calculators/KWH-to-CO2 temporary
							  a.energyWattHours * 0.00028307
					),
					logs: stub.loggerExport ? stub.loggerExport.popLogs() : [],
					codeSimiliarity: comparisonEngine.compareIntegration(code)
				}
			);
		}
	} catch (e) {
		sendError(e);
	}
}

function readCode(id) {
	console.log("Fetching last execution");
	let code = null;

	if (fs.existsSync("./integration-test/" + id))
		code = fs
			.readFileSync("./integration-test/" + id + "/integration.js")
			.toString()
			//Exports added on file write, removed to avoid duplication
			.replace(exportCode, "");
	return code;
}

function sendError(error) {
	console.log("Error whilst processing code", error);
	server.emitError(error);
}

let files = { all: {}, paths: [] };
[
	path.join("../integrations/electricity/"),
	path.join("../integrations/transportation/")
].forEach(dir =>
	fs.readdir(dir, (pErr, file) =>
		file.forEach(f =>
			fs.readFile(dir + f, { encoding: "utf-8" }, (fErr, data) => {
				files.all[f] = data;
				fs.readFile(dir + f, { encoding: "utf-8" }, (fErr, data) => {
					files.all[f] = data;
					files.paths.push(dir + f);
				});
				files.paths.push(dir + f);
			})
		)
	)
);

module.exports.evaluate = evaluate;
module.exports.readCode = readCode;
module.exports.files = files;
