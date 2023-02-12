import type MetricRegistry = require("../registry");
import type BaseMetric = require("../types/base");

declare namespace MetricBaseReporter {
	export interface MetricReporterOptions {
		includes?: string | string[];
		excludes?: string | string[];

		metricNamePrefix?: string;
		metricNameSuffix?: string;

		metricNameFormatter?: (name: string) => string;
		labelNameFormatter?: (name: string) => string;

		[key: string]: any;
	}
}

declare abstract class MetricBaseReporter {
	opts: MetricBaseReporter.MetricReporterOptions;

	constructor(opts: MetricBaseReporter.MetricReporterOptions);

	init(registry: MetricRegistry): void;

	matchMetricName(name: string): boolean;

	formatMetricName(name: string): string;

	formatLabelName(name: string): string;

	metricChanged(
		metric: BaseMetric,
		value: any,
		labels?: Record<string, any>,
		timestamp?: number
	): void;
}
export = MetricBaseReporter;
