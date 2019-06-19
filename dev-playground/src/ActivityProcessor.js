import { TimeSeries } from "pondjs";

export function processActivities(activities) {
	let wattHours = 0;
	let startDate = new Date().getTime();
	let endDate = new Date(0).getTime();

	activities.forEach(a => {
		wattHours += a.energyWattHours;

		if (Date.parse(a.datetime) < startDate)
			startDate = Date.parse(a.datetime);
		else if (Date.parse(a.datetime) > endDate)
			endDate = Date.parse(a.datetime);
	});

	return {
		text: {
			wattHours, startDate: new Date(startDate).toLocaleDateString(),
			endDate: new Date(endDate).toLocaleDateString(),
			wattsPerDay: wattHours / ((endDate - startDate) / (86400000))
		},
		graphData: new TimeSeries(transformToGraphData(activities))
	};
}

function transformToGraphData(activities) {
	return {
		name: "Watt hours",
		columns: ["time", "watts"],
		points: activities.map(a => [Date.parse(a.datetime), a.energyWattHours])
			.sort((a, b) => a[0] - b[0])
	};
}
