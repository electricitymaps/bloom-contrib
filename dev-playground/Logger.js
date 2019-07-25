export class Logger {
	constructor() {
		this.logs = [];
		this.log = (level, message) => this.logs.push({ level, message });

		this.popLogs = () => {
			const tempLogs = this.logs;
			this.logs = [];
			return tempLogs;
		};
	}
}
