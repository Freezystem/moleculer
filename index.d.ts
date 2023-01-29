import type { EventEmitter2 } from "eventemitter2";

import type { Base as BaseCacher, CacherKeygen } from "./src/cachers";
export * as Cachers from "./src/cachers";
export type {
	CacherOptions,
	CacherKeygen,
	MemoryCacherOptions,
	MemoryLRUCacherOptions,
	RedisCacherOptions
} from "./src/cachers";

import type { Base as BaseLogger, LogLevels } from "./src/loggers";
export * as Loggers from "./src/loggers";
export type { LogLevels } from "./src/loggers";

/**
 * Moleculer uses global.Promise as the default promise library
 * If you are using a third-party promise library (e.g. Bluebird), you will need to
 * assign type definitions to use for your promise library.  You will need to have a .d.ts file
 * with the following code when you compile:
 *
 * - import Bluebird from "bluebird";
 *   declare module "moleculer" {
 *     type Promise<T> = Bluebird<T>;
 *   }
 */

export type GenericObject = { [name: string]: any };

export declare class LoggerFactory {
	constructor(broker: ServiceBroker);
	init(opts: LoggerConfig | LoggerConfig[]): void;
	stop(): void;
	getLogger(bindings: GenericObject): LoggerInstance;
	getBindingsKey(bindings: GenericObject): string;

	broker: ServiceBroker;
}

export interface LoggerBindings {
	nodeID: string;
	ns: string;
	mod: string;
	svc: string;
	ver: string | void;
}

export declare class LoggerInstance {
	fatal(...args: any[]): void;
	error(...args: any[]): void;
	warn(...args: any[]): void;
	info(...args: any[]): void;
	debug(...args: any[]): void;
	trace(...args: any[]): void;
}

export type ActionHandler<T = any> = (ctx: Context<any, any>) => Promise<T> | T;
export type ActionParamSchema = { [key: string]: any };
export type ActionParamTypes =
	| "any"
	| "array"
	| "boolean"
	| "custom"
	| "date"
	| "email"
	| "enum"
	| "forbidden"
	| "function"
	| "number"
	| "object"
	| "string"
	| "url"
	| "uuid"
	| boolean
	| string
	| ActionParamSchema;
export type ActionParams = { [key: string]: ActionParamTypes };

export interface HotReloadOptions {
	modules?: string[];
}

export interface TracerExporterOptions {
	type: string;
	options?: GenericObject;
}

export interface TracerOptions {
	enabled?: boolean;
	exporter?: string | TracerExporterOptions | (TracerExporterOptions | string)[] | null;
	sampling?: {
		rate?: number | null;
		tracesPerSecond?: number | null;
		minPriority?: number | null;
	};

	actions?: boolean;
	events?: boolean;

	errorFields?: string[];
	stackTrace?: boolean;

	defaultTags?: GenericObject | Function | null;

	tags?: {
		action?: TracingActionTags;
		event?: TracingEventTags;
	};
}

export declare class Tracer {
	constructor(broker: ServiceBroker, opts: TracerOptions | boolean);

	broker: ServiceBroker;
	logger: LoggerInstance;
	opts: GenericObject;

	exporter: BaseTraceExporter[];

	isEnabled(): boolean;
	shouldSample(span: Span): boolean;

	startSpan(name: string, opts?: GenericObject): Span;

	// getCurrentSpan(): Span | null;
	getCurrentTraceID(): string | null;
	getActiveSpanID(): string | null;
}

export interface SpanLogEntry {
	name: string;
	fields: GenericObject;
	time: number;
	elapsed: number;
}

export declare class Span {
	constructor(tracer: Tracer, name: string, opts: GenericObject);

	tracer: Tracer;
	logger: LoggerInstance;
	opts: GenericObject;
	meta: GenericObject;

	name: string;
	id: string;
	traceID: string;
	parentID: string | null;

	service?: {
		name: string;
		version: string | number | null | undefined;
	};

	priority: number;
	sampled: boolean;

	startTime: number | null;
	finishTime: number | null;
	duration: number | null;

	error: Error | null;

	logs: SpanLogEntry[];
	tags: GenericObject;

	start(time?: number): Span;
	addTags(obj: GenericObject): Span;
	log(name: string, fields?: GenericObject, time?: number): Span;
	setError(err: Error): Span;
	finish(time?: number): Span;
	startSpan(name: string, opts?: GenericObject): Span;
}

export type TracingActionTagsFuncType = (ctx: Context, response?: any) => GenericObject;
export type TracingActionTags =
	| TracingActionTagsFuncType
	| {
			params?: boolean | string[];
			meta?: boolean | string[];
			response?: boolean | string[];
	  };

export type TracingEventTagsFuncType = (ctx: Context) => GenericObject;
export type TracingEventTags =
	| TracingEventTagsFuncType
	| {
			params?: boolean | string[];
			meta?: boolean | string[];
	  };

export type TracingSpanNameOption = string | ((ctx: Context) => string);

export interface TracingOptions {
	enabled?: boolean;
	tags?: TracingActionTags | TracingEventTags;
	spanName?: TracingSpanNameOption;
	safetyTags?: boolean;
}

export interface TracingActionOptions extends TracingOptions {
	tags?: TracingActionTags;
}

export interface TracingEventOptions extends TracingOptions {
	tags?: TracingEventTags;
}

export declare class BaseTraceExporter {
	opts: GenericObject;
	tracer: Tracer;
	logger: LoggerInstance;

	constructor(opts: GenericObject);
	init(tracer: Tracer): void;

	spanStarted(span: Span): void;
	spanFinished(span: Span): void;

	flattenTags(obj: GenericObject, convertToString?: boolean, path?: string): GenericObject;
	errorToObject(err: Error): GenericObject;
}

export namespace TracerExporters {
	class Base extends BaseTraceExporter {}
	class Console extends BaseTraceExporter {}
	class Datadog extends BaseTraceExporter {}
	class Event extends BaseTraceExporter {}
	class EventLegacy extends BaseTraceExporter {}
	class Jaeger extends BaseTraceExporter {}
	class Zipkin extends BaseTraceExporter {}
}

export interface MetricsReporterOptions {
	type: string;
	options?: MetricReporterOptions;
}

export interface MetricRegistryOptions {
	enabled?: boolean;
	collectProcessMetrics?: boolean;
	collectInterval?: number;
	reporter?: string | MetricsReporterOptions | (MetricsReporterOptions | string)[] | null;
	defaultBuckets?: number[];
	defaultQuantiles?: number[];
	defaultMaxAgeSeconds?: number;
	defaultAgeBuckets?: number;
	defaultAggregator?: string;
}

export type MetricSnapshot = GaugeMetricSnapshot | InfoMetricSnapshot | HistogramMetricSnapshot;
export interface BaseMetricPOJO {
	type: string;
	name: string;
	description?: string;
	labelNames: string[];
	unit?: string;
	values: MetricSnapshot[];
}

export declare class BaseMetric {
	type: string;
	name: string;
	description?: string;
	labelNames: string[];
	unit?: string;
	aggregator: string;

	lastSnapshot: GenericObject | null;
	dirty: boolean;
	values: Map<string, GenericObject>;

	constructor(opts: BaseMetricOptions, registry: MetricRegistry);
	setDirty(): void;
	clearDirty(): void;
	get(labels?: GenericObject): GenericObject | null;
	reset(labels?: GenericObject, timestamp?: number): GenericObject | null;
	resetAll(timestamp?: number): GenericObject | null;
	clear(): void;
	hashingLabels(labels?: GenericObject): string;
	snapshot(): MetricSnapshot[];
	generateSnapshot(): MetricSnapshot[];
	changed(value: any | null, labels?: GenericObject, timestamp?: number): void;
	toObject(): BaseMetricPOJO;
}

export interface GaugeMetricSnapshot {
	value: number;
	labels: GenericObject;
	timestamp: number;
}

export declare class GaugeMetric extends BaseMetric {
	increment(labels?: GenericObject, value?: number, timestamp?: number): void;
	decrement(labels?: GenericObject, value?: number, timestamp?: number): void;
	set(value: number, labels?: GenericObject, timestamp?: number): void;
	generateSnapshot(): GaugeMetricSnapshot[];
}

export declare class CounterMetric extends BaseMetric {
	increment(labels?: GenericObject, value?: number, timestamp?: number): void;
	set(value: number, labels?: GenericObject, timestamp?: number): void;
	generateSnapshot(): GaugeMetricSnapshot[];
}

export interface InfoMetricSnapshot {
	value: any;
	labels: GenericObject;
	timestamp: number;
}

export declare class InfoMetric extends BaseMetric {
	set(value: any | null, labels?: GenericObject, timestamp?: number): void;
	generateSnapshot(): InfoMetricSnapshot[];
}

export interface HistogramMetricSnapshot {
	labels: GenericObject;
	count: number;
	sum: number;
	timestamp: number;

	buckets?: {
		[key: string]: number;
	};

	min?: number | null;
	mean?: number | null;
	variance?: number | null;
	stdDev?: number | null;
	max?: number | null;
	quantiles?: {
		[key: string]: number;
	};
}

export declare class HistogramMetric extends BaseMetric {
	buckets: number[];
	quantiles: number[];
	maxAgeSeconds?: number;
	ageBuckets?: number;

	observe(value: number, labels?: GenericObject, timestamp?: number): void;
	generateSnapshot(): HistogramMetricSnapshot[];

	static generateLinearBuckets(start: number, width: number, count: number): number[];
	static generateExponentialBuckets(start: number, factor: number, count: number): number[];
}

export namespace MetricTypes {
	class Base extends BaseMetric {}
	class Counter extends CounterMetric {}
	class Gauge extends GaugeMetric {}
	class Histogram extends HistogramMetric {}
	class Info extends InfoMetric {}
}

export interface BaseMetricOptions {
	type: string;
	name: string;
	description?: string;
	labelNames?: string[];
	unit?: string;
	aggregator?: string;
	[key: string]: unknown;
}

export interface MetricListOptions {
	type: string | string[];
	includes: string | string[];
	excludes: string | string[];
}

export declare class MetricRegistry {
	broker: ServiceBroker;
	logger: LoggerInstance;
	dirty: boolean;
	store: Map<string, BaseMetric>;
	reporter: MetricBaseReporter[];

	constructor(broker: ServiceBroker, opts?: MetricRegistryOptions);
	init(broker: ServiceBroker): void;
	stop(): void;
	isEnabled(): boolean;
	register(opts: BaseMetricOptions): BaseMetric | null;

	hasMetric(name: string): boolean;
	getMetric(name: string): BaseMetric;

	increment(name: string, labels?: GenericObject, value?: number, timestamp?: number): void;
	decrement(name: string, labels?: GenericObject, value?: number, timestamp?: number): void;
	set(name: string, value: any | null, labels?: GenericObject, timestamp?: number): void;
	observe(name: string, value: number, labels?: GenericObject, timestamp?: number): void;

	reset(name: string, labels?: GenericObject, timestamp?: number): void;
	resetAll(name: string, timestamp?: number): void;

	timer(name: string, labels?: GenericObject, timestamp?: number): () => number;

	changed(
		metric: BaseMetric,
		value: any | null,
		labels?: GenericObject,
		timestamp?: number
	): void;

	list(opts?: MetricListOptions): BaseMetricPOJO[];
}

export interface MetricReporterOptions {
	includes?: string | string[];
	excludes?: string | string[];

	metricNamePrefix?: string;
	metricNameSuffix?: string;

	metricNameFormatter?: (name: string) => string;
	labelNameFormatter?: (name: string) => string;

	[key: string]: any;
}

export declare class MetricBaseReporter {
	opts: MetricReporterOptions;

	constructor(opts: MetricReporterOptions);
	init(registry: MetricRegistry): void;

	matchMetricName(name: string): boolean;
	formatMetricName(name: string): string;
	formatLabelName(name: string): string;
	metricChanged(metric: BaseMetric, value: any, labels?: GenericObject, timestamp?: number): void;
}

export namespace MetricReporters {
	class Base extends MetricBaseReporter {}
	class Console extends MetricBaseReporter {}
	class CSV extends MetricBaseReporter {}
	class Event extends MetricBaseReporter {}
	class Datadog extends MetricBaseReporter {}
	class Prometheus extends MetricBaseReporter {}
	class StatsD extends MetricBaseReporter {}
}

export interface BulkheadOptions {
	enabled?: boolean;
	concurrency?: number;
	maxQueueSize?: number;
}

export type ActionCacheEnabledFuncType = (ctx: Context<any, any>) => boolean;

export interface ActionCacheOptions<TParams = unknown, TMeta extends object = object> {
	enabled?: boolean | ActionCacheEnabledFuncType;
	ttl?: number;
	keys?: string[];
	keygen?: CacherKeygen<TParams, TMeta>;
	lock?: {
		enabled?: boolean;
		staleTime?: number;
	};
}

export type ActionVisibility = "published" | "public" | "protected" | "private";

export type ActionHookBefore = (ctx: Context<any, any>) => Promise<void> | void;
export type ActionHookAfter = (ctx: Context<any, any>, res: any) => Promise<any> | any;
export type ActionHookError = (ctx: Context<any, any>, err: Error) => Promise<void> | void;

export interface ActionHooks {
	before?: string | ActionHookBefore | (string | ActionHookBefore)[];
	after?: string | ActionHookAfter | (string | ActionHookAfter)[];
	error?: string | ActionHookError | (string | ActionHookError)[];
}

export interface RestSchema {
	path?: string;
	method?: "GET" | "POST" | "DELETE" | "PUT" | "PATCH";
	fullPath?: string;
	basePath?: string;
}

export interface ActionSchema {
	name?: string;
	rest?: RestSchema | RestSchema[] | string | string[];
	visibility?: ActionVisibility;
	params?: ActionParams;
	service?: Service;
	cache?: boolean | ActionCacheOptions;
	handler?: ActionHandler;
	tracing?: boolean | TracingActionOptions;
	bulkhead?: BulkheadOptions;
	circuitBreaker?: BrokerCircuitBreakerOptions;
	retryPolicy?: RetryPolicyOptions;
	fallback?: string | FallbackHandler;
	hooks?: ActionHooks;

	[key: string]: any;
}

export interface EventSchema {
	name?: string;
	group?: string;
	params?: ActionParams;
	service?: Service;
	tracing?: boolean | TracingEventOptions;
	bulkhead?: BulkheadOptions;
	handler?: ActionHandler;
	context?: boolean;

	[key: string]: any;
}

export type ServiceActionsSchema<S = ServiceSettingSchema> = {
	[key: string]: ActionSchema | ActionHandler | boolean;
} & ThisType<Service<S>>;

export declare class BrokerNode {
	id: string;
	instanceID: string | null;
	available: boolean;
	local: boolean;
	lastHeartbeatTime: number;
	config: GenericObject;
	client: GenericObject;
	metadata: GenericObject;

	ipList: string[];
	port: number | null;
	hostname: string | null;
	udpAddress: string | null;

	rawInfo: GenericObject;
	services: [GenericObject];

	cpu: number | null;
	cpuSeq: number | null;

	seq: number;
	offlineSince: number | null;

	heartbeat(payload: GenericObject): void;
	disconnected(): void;
}

export declare class Context<P = unknown, M extends object = {}, L = GenericObject> {
	constructor(broker: ServiceBroker, endpoint: Endpoint);
	id: string;
	broker: ServiceBroker;
	endpoint: Endpoint | null;
	action: ActionSchema | null;
	event: EventSchema | null;
	service: Service | null;
	nodeID: string | null;

	eventName: string | null;
	eventType: string | null;
	eventGroups: string[] | null;

	options: CallingOptions;

	parentID: string | null;
	caller: string | null;

	tracing: boolean | null;
	span: Span | null;

	needAck: boolean | null;
	ackID: string | null;

	locals: L;

	level: number;

	params: P;
	meta: M;

	requestID: string | null;

	cachedResult: boolean;

	setEndpoint(endpoint: Endpoint): void;
	setParams(newParams: P, cloning?: boolean): void;
	call<TResult>(actionName: string): Promise<TResult>;
	call<TResult, TParams>(
		actionName: string,
		params: TParams,
		opts?: CallingOptions
	): Promise<TResult>;

	mcall<T>(
		def: Record<string, MCallDefinition>,
		opts?: MCallCallingOptions
	): Promise<Record<string, T>>;
	mcall<T>(def: MCallDefinition[], opts?: MCallCallingOptions): Promise<T[]>;

	emit<D>(eventName: string, data: D, opts: GenericObject): Promise<void>;
	emit<D>(eventName: string, data: D, groups: string[]): Promise<void>;
	emit<D>(eventName: string, data: D, groups: string): Promise<void>;
	emit<D>(eventName: string, data: D): Promise<void>;
	emit(eventName: string): Promise<void>;

	broadcast<D>(eventName: string, data: D, opts: GenericObject): Promise<void>;
	broadcast<D>(eventName: string, data: D, groups: string[]): Promise<void>;
	broadcast<D>(eventName: string, data: D, groups: string): Promise<void>;
	broadcast<D>(eventName: string, data: D): Promise<void>;
	broadcast(eventName: string): Promise<void>;

	copy(endpoint: Endpoint): this;
	copy(): this;

	startSpan(name: string, opts?: GenericObject): Span;
	finishSpan(span: Span, time?: number): void;

	toJSON(): GenericObject;

	static create(
		broker: ServiceBroker,
		endpoint: Endpoint,
		params: GenericObject,
		opts: GenericObject
	): Context;
	static create(broker: ServiceBroker, endpoint: Endpoint, params: GenericObject): Context;
	static create(broker: ServiceBroker, endpoint: Endpoint): Context;
	static create(broker: ServiceBroker): Context;
}

export interface ServiceSettingSchema {
	$noVersionPrefix?: boolean;
	$noServiceNamePrefix?: boolean;
	$dependencyTimeout?: number;
	$shutdownTimeout?: number;
	$secureSettings?: string[];
	[name: string]: any;
}

export type ServiceEventLegacyHandler = (
	payload: any,
	sender: string,
	eventName: string,
	ctx: Context
) => void | Promise<void>;

export type ServiceEventHandler = (ctx: Context) => void | Promise<void>;

export interface ServiceEvent {
	name?: string;
	group?: string;
	params?: ActionParams;
	context?: boolean;
	debounce?: number;
	throttle?: number;
	handler?: ServiceEventHandler | ServiceEventLegacyHandler;
}

export type ServiceEvents<S = ServiceSettingSchema> = {
	[key: string]: ServiceEventHandler | ServiceEventLegacyHandler | ServiceEvent;
} & ThisType<Service<S>>;

export type ServiceMethods = { [key: string]: (...args: any[]) => any } & ThisType<Service>;

export type CallMiddlewareHandler = (
	actionName: string,
	params: any,
	opts: CallingOptions
) => Promise<any>;
export type Middleware = {
	[name: string]:
		| ((handler: ActionHandler, action: ActionSchema) => any)
		| ((handler: ActionHandler, event: ServiceEvent) => any)
		| ((handler: ActionHandler) => any)
		| ((service: Service) => any)
		| ((broker: ServiceBroker) => any)
		| ((handler: CallMiddlewareHandler) => CallMiddlewareHandler);
};

export type MiddlewareInit = (broker: ServiceBroker) => Middleware;
export interface MiddlewareCallHandlerOptions {
	reverse?: boolean;
}

export interface MiddlewareHandler {
	list: Middleware[];

	add(mw: string | Middleware | MiddlewareInit): void;
	wrapHandler(method: string, handler: ActionHandler, def: ActionSchema): typeof handler;
	callHandlers(method: string, args: any[], opts: MiddlewareCallHandlerOptions): Promise<void>;
	callSyncHandlers(method: string, args: any[], opts: MiddlewareCallHandlerOptions): void;
	count(): number;
	wrapMethod(
		method: string,
		handler: ActionHandler,
		bindTo?: any,
		opts?: MiddlewareCallHandlerOptions
	): typeof handler;
}

export interface ServiceHooksBefore {
	[key: string]: string | ActionHookBefore | (string | ActionHookBefore)[];
}

export interface ServiceHooksAfter {
	[key: string]: string | ActionHookAfter | (string | ActionHookAfter)[];
}

export interface ServiceHooksError {
	[key: string]: string | ActionHookError | (string | ActionHookError)[];
}

export interface ServiceHooks {
	before?: ServiceHooksBefore;
	after?: ServiceHooksAfter;
	error?: ServiceHooksError;
}

export interface ServiceDependency {
	name: string;
	version?: string | number;
}

export type StartedStoppedHandler = () => Promise<void[]> | Promise<void> | void;
export interface ServiceSchema<S = ServiceSettingSchema> {
	name: string;
	version?: string | number;
	settings?: S;
	dependencies?: string | ServiceDependency | (string | ServiceDependency)[];
	metadata?: any;
	actions?: ServiceActionsSchema;
	mixins?: Partial<ServiceSchema>[];
	methods?: ServiceMethods;
	hooks?: ServiceHooks;

	events?: ServiceEvents;
	created?: (() => void) | (() => void)[];
	started?: StartedStoppedHandler | StartedStoppedHandler[];
	stopped?: StartedStoppedHandler | StartedStoppedHandler[];

	[name: string]: any;
}

export type ServiceAction = <T = Promise<any>, P extends GenericObject = GenericObject>(
	params?: P,
	opts?: CallingOptions
) => T;

export interface ServiceActions {
	[name: string]: ServiceAction;
}

export interface WaitForServicesResult {
	services: string[];
	statuses: { name: string; available: boolean }[];
}

export declare class Service<S = ServiceSettingSchema> implements ServiceSchema<S> {
	constructor(broker: ServiceBroker, schema?: ServiceSchema<S>);

	protected parseServiceSchema(schema: ServiceSchema<S>): void;

	name: string;
	fullName: string;
	version?: string | number;
	settings: S;
	metadata: GenericObject;
	dependencies: string | ServiceDependency | (string | ServiceDependency)[];
	schema: ServiceSchema<S>;
	originalSchema: ServiceSchema<S>;
	broker: ServiceBroker;
	logger: LoggerInstance;
	actions: ServiceActions;
	Promise: PromiseConstructorLike;

	_init(): void;
	_start(): Promise<void>;
	_stop(): Promise<void>;

	/**
	 * Call a local event handler. Useful for unit tests.
	 *
	 * @param eventName The event name
	 * @param params The event parameters
	 * @param opts The event options
	 */
	emitLocalEventHandler(eventName: string, params?: any, opts?: any): any;

	/**
	 * Wait for the specified services to become available/registered with this broker.
	 *
	 * @param serviceNames The service, or services, we are waiting for.
	 * @param timeout The total time this call may take. If this time has passed and the service(s)
	 * 						    are not available an error will be thrown. (In milliseconds)
	 * @param interval The time we will wait before once again checking if the service(s) are available (In milliseconds)
	 */
	waitForServices(
		serviceNames: string | string[] | ServiceDependency[],
		timeout?: number,
		interval?: number
	): Promise<WaitForServicesResult>;

	[key: string]: any;

	/**
	 * Apply `mixins` list in schema. Merge the schema with mixins schemas. Returns with the mixed schema
	 *
	 * @param schema Schema containing the mixins to merge
	 */
	applyMixins(schema: ServiceSchema): ServiceSchema;

	/**
	 * Merge two Service schema
	 *
	 * @param mixinSchema Mixin schema
	 * @param svcSchema Service schema
	 */
	mergeSchemas(mixinSchema: ServiceSchema, svcSchema: ServiceSchema): ServiceSchema;

	/**
	 * Merge `settings` property in schema
	 *
	 * @param src Source schema property
	 * @param target Target schema property
	 */
	mergeSchemaSettings(src: GenericObject, target: GenericObject): GenericObject;

	/**
	 * Merge `metadata` property in schema
	 *
	 * @param src Source schema property
	 * @param target Target schema property
	 */
	mergeSchemaMetadata(src: GenericObject, target: GenericObject): GenericObject;

	/**
	 * Merge `mixins` property in schema
	 *
	 * @param src Source schema property
	 * @param target Target schema property
	 */
	mergeSchemaUniqArray(src: GenericObject, target: GenericObject): GenericObject;

	/**
	 * Merge `dependencies` property in schema
	 *
	 * @param src Source schema property
	 * @param target Target schema property
	 */
	mergeSchemaDependencies(src: GenericObject, target: GenericObject): GenericObject;

	/**
	 * Merge `hooks` property in schema
	 *
	 * @param src Source schema property
	 * @param target Target schema property
	 */
	mergeSchemaHooks(src: GenericObject, target: GenericObject): GenericObject;

	/**
	 * Merge `actions` property in schema
	 *
	 * @param src Source schema property
	 * @param target Target schema property
	 */
	mergeSchemaActions(src: GenericObject, target: GenericObject): GenericObject;

	/**
	 * Merge `methods` property in schema
	 *
	 * @param src Source schema property
	 * @param target Target schema property
	 */
	mergeSchemaMethods(src: GenericObject, target: GenericObject): GenericObject;

	/**
	 * Merge `events` property in schema
	 *
	 * @param src Source schema property
	 * @param target Target schema property
	 */
	mergeSchemaEvents(src: GenericObject, target: GenericObject): GenericObject;

	/**
	 * Merge `started`, `stopped`, `created` event handler properties in schema
	 *
	 * @param src Source schema property
	 * @param target Target schema property
	 */
	mergeSchemaLifecycleHandlers(src: GenericObject, target: GenericObject): GenericObject;

	/**
	 * Merge unknown properties in schema
	 *
	 * @param src Source schema property
	 * @param target Target schema property
	 */
	mergeSchemaUnknown(src: GenericObject, target: GenericObject): GenericObject;

	/**
	 * Return a versioned full service name.
	 *
	 * @param name The name
	 * @param version The version
	 */
	static getVersionedFullName(name: string, version?: string | number): string;
}

export type CheckRetryable = (err: Errors.MoleculerError | Error) => boolean;

export interface BrokerCircuitBreakerOptions {
	enabled?: boolean;
	threshold?: number;
	windowTime?: number;
	minRequestCount?: number;
	halfOpenTime?: number;
	check?: CheckRetryable;
}

export interface RetryPolicyOptions {
	enabled?: boolean;
	retries?: number;
	delay?: number;
	maxDelay?: number;
	factor?: number;
	check?: CheckRetryable;
}

export interface BrokerRegistryOptions {
	strategy?: Function | string;
	strategyOptions?: GenericObject;
	preferLocal?: boolean;
	discoverer?: RegistryDiscovererOptions | BaseDiscoverer | string;
}

export interface RegistryDiscovererOptions {
	type: string;
	options: DiscovererOptions;
}

export interface DiscovererOptions extends GenericObject {
	heartbeatInterval?: number;
	heartbeatTimeout?: number;
	disableHeartbeatChecks?: boolean;
	disableOfflineNodeRemoving?: boolean;
	cleanOfflineNodesTimeout?: number;
}

export interface BrokerTransitOptions {
	maxQueueSize?: number;
	disableReconnect?: boolean;
	disableVersionCheck?: boolean;
	maxChunkSize?: number;
}

export interface BrokerTrackingOptions {
	enabled?: boolean;
	shutdownTimeout?: number;
}

export interface LogLevelConfig {
	[module: string]: boolean | LogLevels;
}

export interface LoggerConfig {
	type: string;
	options?: GenericObject;
}

export interface BrokerOptions {
	namespace?: string | null;
	nodeID?: string | null;

	logger?: BaseLogger | LoggerConfig | LoggerConfig[] | boolean | null;
	logLevel?: LogLevels | LogLevelConfig | null;

	transporter?: Transporter | string | GenericObject | null;
	requestTimeout?: number;
	retryPolicy?: RetryPolicyOptions;

	contextParamsCloning?: boolean;
	maxCallLevel?: number;
	heartbeatInterval?: number;
	heartbeatTimeout?: number;

	tracking?: BrokerTrackingOptions;

	disableBalancer?: boolean;

	registry?: BrokerRegistryOptions;

	circuitBreaker?: BrokerCircuitBreakerOptions;

	bulkhead?: BulkheadOptions;

	transit?: BrokerTransitOptions;

	uidGenerator?: () => string;

	errorHandler?: ((err: Error, info: any) => void) | null;

	cacher?: boolean | BaseCacher | string | GenericObject | null;
	serializer?: Serializer | string | GenericObject | null;
	validator?: boolean | BaseValidator | ValidatorNames | ValidatorOptions | null;
	errorRegenerator?: Errors.Regenerator | null;

	metrics?: boolean | MetricRegistryOptions;
	tracing?: boolean | TracerOptions;

	internalServices?:
		| boolean
		| {
				[key: string]: Partial<ServiceSchema>;
		  };
	internalMiddlewares?: boolean;

	dependencyInterval?: number;
	dependencyTimeout?: number;

	hotReload?: boolean | HotReloadOptions;

	middlewares?: (Middleware | string)[];

	replCommands?: GenericObject[] | null;
	replDelimiter?: string;

	metadata?: GenericObject;

	ServiceFactory?: typeof Service;
	ContextFactory?: typeof Context;
	Promise?: PromiseConstructorLike;

	created?: (broker: ServiceBroker) => void;
	started?: (broker: ServiceBroker) => void;
	stopped?: (broker: ServiceBroker) => void;

	/**
	 * If true, process.on("beforeExit/exit/SIGINT/SIGTERM", ...) handler won't be registered!
	 * You have to register this manually and stop broker in this case!
	 */
	skipProcessEventRegistration?: boolean;

	maxSafeObjectSize?: number;
}

export interface NodeHealthStatus {
	cpu: {
		load1: number;
		load5: number;
		load15: number;
		cores: number;
		utilization: number;
	};
	mem: {
		free: number;
		total: number;
		percent: number;
	};
	os: {
		uptime: number;
		type: string;
		release: string;
		hostname: string;
		arch: string;
		platform: string;
		user: string;
	};
	process: {
		pid: NodeJS.Process["pid"];
		memory: NodeJS.MemoryUsage;
		uptime: number;
		argv: string[];
	};
	client: {
		type: string;
		version: string;
		langVersion: NodeJS.Process["version"];
	};
	net: {
		ip: string[];
	};
	time: {
		now: number;
		iso: string;
		utc: string;
	};
}

export type FallbackHandler = (ctx: Context, err: Errors.MoleculerError) => Promise<any>;
export type FallbackResponse = string | number | GenericObject;
export type FallbackResponseHandler = (ctx: Context, err: Errors.MoleculerError) => Promise<any>;

export interface ContextParentSpan {
	id: string;
	traceID: string;
	sampled: boolean;
}

export interface CallingOptions {
	timeout?: number;
	retries?: number;
	fallbackResponse?: FallbackResponse | FallbackResponse[] | FallbackResponseHandler;
	nodeID?: string;
	meta?: GenericObject;
	parentSpan?: ContextParentSpan;
	parentCtx?: Context;
	requestID?: string;
	tracking?: boolean;
	paramsCloning?: boolean;
	caller?: string;
}

export interface MCallCallingOptions extends CallingOptions {
	settled?: boolean;
}

export interface CallDefinition<P extends GenericObject = GenericObject> {
	action: string;
	params: P;
}

export interface MCallDefinition<P extends GenericObject = GenericObject>
	extends CallDefinition<P> {
	options?: CallingOptions;
}

export interface Endpoint {
	broker: ServiceBroker;

	id: string;
	node: GenericObject;

	local: boolean;
	state: boolean;
}

export interface ActionEndpoint extends Endpoint {
	service: Service;
	action: ActionSchema;
}

export interface EventEndpoint extends Endpoint {
	service: Service;
	event: EventSchema;
}

export interface PongResponse {
	nodeID: string;
	elapsedTime: number;
	timeDiff: number;
}

export interface PongResponses {
	[name: string]: PongResponse;
}

export interface ServiceSearchObj {
	name: string;
	version?: string | number;
}

export declare class ServiceBroker {
	constructor(options?: BrokerOptions);

	options: BrokerOptions;

	Promise: PromiseConstructorLike;
	ServiceFactory: typeof Service;
	ContextFactory: typeof Context;

	started: boolean;

	namespace: string;
	nodeID: string;
	instanceID: string;

	logger: LoggerInstance;

	services: Service[];

	localBus: EventEmitter2;

	scope: AsyncStorage;
	metrics: MetricRegistry;

	middlewares: MiddlewareHandler;

	registry: ServiceRegistry;

	cacher?: BaseCacher;
	serializer?: Serializer;
	validator?: BaseValidator;
	errorRegenerator?: Errors.Regenerator;

	tracer: Tracer;

	transit?: Transit;

	start(): Promise<void>;
	stop(): Promise<void>;

	errorHandler(err: Error, info: GenericObject): void;

	wrapMethod(
		method: string,
		handler: ActionHandler,
		bindTo?: any,
		opts?: MiddlewareCallHandlerOptions
	): typeof handler;
	callMiddlewareHookSync(
		name: string,
		args: any[],
		opts: MiddlewareCallHandlerOptions
	): Promise<void>;
	callMiddlewareHook(name: string, args: any[], opts: MiddlewareCallHandlerOptions): void;

	isMetricsEnabled(): boolean;
	isTracingEnabled(): boolean;

	getLogger(module: string, props?: GenericObject): LoggerInstance;
	fatal(message: string, err?: Error, needExit?: boolean): void;

	loadServices(folder?: string, fileMask?: string): number;
	loadService(filePath: string): Service;
	createService(schema: ServiceSchema, schemaMods?: ServiceSchema): Service;
	destroyService(service: Service | string | ServiceSearchObj): Promise<void>;

	getLocalService(name: string | ServiceSearchObj): Service;
	waitForServices(
		serviceNames: string | string[] | ServiceSearchObj[],
		timeout?: number,
		interval?: number,
		logger?: LoggerInstance
	): Promise<void>;

	findNextActionEndpoint(
		actionName: string,
		opts?: GenericObject,
		ctx?: Context
	): ActionEndpoint | Errors.MoleculerRetryableError;

	call<T>(actionName: string): Promise<T>;
	call<T, P>(actionName: string, params: P, opts?: CallingOptions): Promise<T>;

	mcall<T>(
		def: Record<string, MCallDefinition>,
		opts?: MCallCallingOptions
	): Promise<Record<string, T>>;
	mcall<T>(def: MCallDefinition[], opts?: MCallCallingOptions): Promise<T[]>;

	emit<D>(eventName: string, data: D, opts: GenericObject): Promise<void>;
	emit<D>(eventName: string, data: D, groups: string[]): Promise<void>;
	emit<D>(eventName: string, data: D, groups: string): Promise<void>;
	emit<D>(eventName: string, data: D): Promise<void>;
	emit(eventName: string): Promise<void>;

	broadcast<D>(eventName: string, data: D, opts: GenericObject): Promise<void>;
	broadcast<D>(eventName: string, data: D, groups: string[]): Promise<void>;
	broadcast<D>(eventName: string, data: D, groups: string): Promise<void>;
	broadcast<D>(eventName: string, data: D): Promise<void>;
	broadcast(eventName: string): Promise<void>;

	broadcastLocal<D>(eventName: string, data: D, opts: GenericObject): Promise<void>;
	broadcastLocal<D>(eventName: string, data: D, groups: string[]): Promise<void>;
	broadcastLocal<D>(eventName: string, data: D, groups: string): Promise<void>;
	broadcastLocal<D>(eventName: string, data: D): Promise<void>;
	broadcastLocal(eventName: string): Promise<void>;

	ping(): Promise<PongResponses>;
	ping(nodeID: string | string[], timeout?: number): Promise<PongResponse>;

	getHealthStatus(): NodeHealthStatus;
	getLocalNodeInfo(): BrokerNode;

	getCpuUsage(): Promise<any>;
	generateUid(): string;

	hasEventListener(eventName: string): boolean;
	getEventListener(eventName: string): EventEndpoint[];

	getConstructorName(obj: any): string;

	MOLECULER_VERSION: string;
	PROTOCOL_VERSION: string;
	[key: string]: any;

	static MOLECULER_VERSION: string;
	static PROTOCOL_VERSION: string;
	static INTERNAL_MIDDLEWARES: string[];
	static defaultOptions: BrokerOptions;
	static Promise: PromiseConstructorLike;
}

export declare class Packet {
	constructor(type: string, target: string, payload?: any);
}

export namespace Packets {
	type PROTOCOL_VERSION = "4";
	type PACKET_UNKNOWN = "???";
	type PACKET_EVENT = "EVENT";
	type PACKET_REQUEST = "REQ";
	type PACKET_RESPONSE = "RES";
	type PACKET_DISCOVER = "DISCOVER";
	type PACKET_INFO = "INFO";
	type PACKET_DISCONNECT = "DISCONNECT";
	type PACKET_HEARTBEAT = "HEARTBEAT";
	type PACKET_PING = "PING";
	type PACKET_PONG = "PONG";

	type PACKET_GOSSIP_REQ = "GOSSIP_REQ";
	type PACKET_GOSSIP_RES = "GOSSIP_RES";
	type PACKET_GOSSIP_HELLO = "GOSSIP_HELLO";

	const PROTOCOL_VERSION: PROTOCOL_VERSION;
	const PACKET_UNKNOWN: PACKET_UNKNOWN;
	const PACKET_EVENT: PACKET_EVENT;
	const PACKET_REQUEST: PACKET_REQUEST;
	const PACKET_RESPONSE: PACKET_RESPONSE;
	const PACKET_DISCOVER: PACKET_DISCOVER;
	const PACKET_INFO: PACKET_INFO;
	const PACKET_DISCONNECT: PACKET_DISCONNECT;
	const PACKET_HEARTBEAT: PACKET_HEARTBEAT;
	const PACKET_PING: PACKET_PING;
	const PACKET_PONG: PACKET_PONG;

	const PACKET_GOSSIP_REQ: PACKET_GOSSIP_REQ;
	const PACKET_GOSSIP_RES: PACKET_GOSSIP_RES;
	const PACKET_GOSSIP_HELLO: PACKET_GOSSIP_HELLO;

	interface PacketPayload {
		ver: PROTOCOL_VERSION;
		sender: string | null;
	}

	interface Packet {
		type:
			| PACKET_UNKNOWN
			| PACKET_EVENT
			| PACKET_DISCONNECT
			| PACKET_DISCOVER
			| PACKET_INFO
			| PACKET_HEARTBEAT
			| PACKET_REQUEST
			| PACKET_PING
			| PACKET_PONG
			| PACKET_RESPONSE
			| PACKET_GOSSIP_REQ
			| PACKET_GOSSIP_RES
			| PACKET_GOSSIP_HELLO;
		target?: string;
		payload: PacketPayload;
	}
}

export declare class Transporter {
	constructor(opts?: GenericObject);
	hasBuiltInBalancer: boolean;

	init(
		transit: Transit,
		messageHandler: (cmd: string, msg: string) => void,
		afterConnect: (wasReconnect: boolean) => void
	): void;
	connect(): Promise<any>;
	disconnect(): Promise<any>;
	onConnected(wasReconnect?: boolean): Promise<any>;

	makeSubscriptions(topics: GenericObject[]): Promise<void>;
	subscribe(cmd: string, nodeID?: string): Promise<void>;
	subscribeBalancedRequest(action: string): Promise<void>;
	subscribeBalancedEvent(event: string, group: string): Promise<void>;
	unsubscribeFromBalancedCommands(): Promise<void>;

	incomingMessage(cmd: string, msg: Buffer): Promise<void>;
	receive(cmd: string, data: Buffer): Promise<void>;

	prepublish(packet: Packet): Promise<void>;
	publish(packet: Packet): Promise<void>;
	publishBalancedEvent(packet: Packet, group: string): Promise<void>;
	publishBalancedRequest(packet: Packet): Promise<void>;
	send(topic: string, data: Buffer, meta: GenericObject): Promise<void>;

	getTopicName(cmd: string, nodeID?: string): string;
	makeBalancedSubscriptions(): Promise<void>;

	serialize(packet: Packet): Buffer;
	deserialize(type: string, data: Buffer): Packet;
}

export declare class Serializer {
	constructor(opts?: any);
	init(broker: ServiceBroker): void;
	serialize(obj: GenericObject, type?: string): Buffer;
	deserialize(buf: Buffer, type?: string): GenericObject;
}

export declare const Serializers: {
	Base: typeof Serializer;
	JSON: typeof Serializer;
	CBOR: typeof Serializer;
	MsgPack: typeof Serializer;
	Notepack: typeof Serializer;
	resolve: (type: string | GenericObject | Serializer) => Serializer;
};

export declare class BaseValidator {
	constructor();
	init(broker: ServiceBroker): void;
	compile(schema: GenericObject): Function;
	validate(params: GenericObject, schema: GenericObject): boolean;
	middleware(): (handler: ActionHandler, action: ActionSchema) => any;
	convertSchemaToMoleculer(schema: any): GenericObject;
}

export declare abstract class BaseStrategy {
	constructor(registry: ServiceRegistry, broker: ServiceBroker, opts?: object);
	select(list: any[], ctx?: Context): Endpoint;
}

export type ValidatorNames = "Fastest";

export declare class RoundRobinStrategy extends BaseStrategy {}
export declare class RandomStrategy extends BaseStrategy {}
export declare class CpuUsageStrategy extends BaseStrategy {}
export declare class LatencyStrategy extends BaseStrategy {}
export declare class ShardStrategy extends BaseStrategy {}

export namespace Strategies {
	class Base extends BaseStrategy {}
	class RoundRobin extends RoundRobinStrategy {}
	class Random extends RandomStrategy {}
	class CpuUsage extends CpuUsageStrategy {}
	class Latency extends LatencyStrategy {}
	class Shard extends ShardStrategy {}
}

export declare abstract class BaseDiscoverer {
	constructor(opts?: DiscovererOptions);

	transit?: Transit;
	localNode?: BrokerNode;

	heartbeatTimer: NodeJS.Timeout;
	checkNodesTimer: NodeJS.Timeout;
	offlineTimer: NodeJS.Timeout;

	init(registry: ServiceRegistry): void;

	stop(): Promise<void>;
	startHeartbeatTimers(): void;
	stopHeartbeatTimers(): void;
	disableHeartbeat(): void;
	beat(): Promise<void>;
	checkRemoteNodes(): void;
	checkOfflineNodes(): void;
	heartbeatReceived(nodeID: string, payload: GenericObject): void;
	processRemoteNodeInfo(nodeID: string, payload: GenericObject): BrokerNode;
	sendHeartbeat(): Promise<void>;
	discoverNode(nodeID: string): Promise<BrokerNode | void>;
	discoverAllNodes(): Promise<BrokerNode[] | void>;
	localNodeReady(): Promise<void>;
	sendLocalNodeInfo(nodeID: string): Promise<void>;
	localNodeDisconnected(): Promise<void>;
	remoteNodeDisconnected(nodeID: string, isUnexpected: boolean): void;
}

export namespace Discoverers {
	class Base extends BaseDiscoverer {}
	class Local extends BaseDiscoverer {}
	class Redis extends BaseDiscoverer {}
	class Etcd3 extends BaseDiscoverer {}
}

export interface ValidatorOptions {
	type: string;
	options?: GenericObject;
}

export namespace Validators {
	class Base extends BaseValidator {}
	class Fastest extends BaseValidator {}
}

export namespace Transporters {
	class Base extends Transporter {}
	class Fake extends Base {}
	class NATS extends Base {}
	class MQTT extends Base {}
	class Redis extends Base {}
	class AMQP extends Base {}
	class Kafka extends Base {}
	class STAN extends Base {}
	class TCP extends Base {}
}

export namespace Errors {
	class MoleculerError extends Error {
		code: number;
		type: string;
		data: any;
		retryable: boolean;

		constructor(message: string, code: number, type: string, data: any);
		constructor(message: string, code: number, type: string);
		constructor(message: string, code: number);
		constructor(message: string);
	}
	class MoleculerRetryableError extends MoleculerError {}
	class MoleculerServerError extends MoleculerRetryableError {}
	class MoleculerClientError extends MoleculerError {}

	class ServiceNotFoundError extends MoleculerRetryableError {
		constructor(data: any);
	}
	class ServiceNotAvailableError extends MoleculerRetryableError {
		constructor(data: any);
	}

	class RequestTimeoutError extends MoleculerRetryableError {
		constructor(data: any);
	}
	class RequestSkippedError extends MoleculerError {
		constructor(data: any);
	}
	class RequestRejectedError extends MoleculerRetryableError {
		constructor(data: any);
	}

	class QueueIsFullError extends MoleculerRetryableError {
		constructor(data: any);
	}
	class ValidationError extends MoleculerClientError {
		constructor(message: string, type: string, data: GenericObject);
		constructor(message: string, type: string);
		constructor(message: string);
	}
	class MaxCallLevelError extends MoleculerError {
		constructor(data: any);
	}

	class ServiceSchemaError extends MoleculerError {
		constructor(message: string, data: any);
	}

	class BrokerOptionsError extends MoleculerError {
		constructor(message: string, data: any);
	}

	class GracefulStopTimeoutError extends MoleculerError {
		constructor(data: any);
	}

	class ProtocolVersionMismatchError extends MoleculerError {
		constructor(data: any);
	}

	class InvalidPacketDataError extends MoleculerError {
		constructor(data: any);
	}

	interface PlainMoleculerError extends MoleculerError {
		nodeID?: string;

		[key: string]: any;
	}

	class Regenerator {
		init(broker: ServiceBroker): void;
		restore(plainError: PlainMoleculerError, payload: GenericObject): Error;
		extractPlainError(err: Error): PlainMoleculerError;
		restoreCustomError(
			plainError: PlainMoleculerError,
			payload: GenericObject
		): Error | undefined;
	}
}

export interface TransitRequest {
	action: string;
	nodeID: string;
	ctx: Context;
	resolve: (value: any) => void;
	reject: (reason: any) => void;
	stream: boolean;
}

export interface Transit {
	pendingRequests: Map<string, TransitRequest>;
	nodeID: string;
	logger: LoggerInstance;
	connected: boolean;
	disconnecting: boolean;
	isReady: boolean;
	tx: Transporter;

	afterConnect(wasReconnect: boolean): Promise<void>;
	connect(): Promise<void>;
	disconnect(): Promise<void>;
	ready(): Promise<void>;
	sendDisconnectPacket(): Promise<void>;
	makeSubscriptions(): Promise<void[]>;
	messageHandler(cmd: string, msg: GenericObject): boolean | Promise<void> | undefined;
	request(ctx: Context): Promise<void>;
	sendEvent(ctx: Context): Promise<void>;
	removePendingRequest(id: string): void;
	removePendingRequestByNodeID(nodeID: string): void;
	sendResponse(nodeID: string, id: string, data: GenericObject, err: Error): Promise<void>;
	sendResponse(nodeID: string, id: string, data: GenericObject): Promise<void>;
	discoverNodes(): Promise<void>;
	discoverNode(nodeID: string): Promise<void>;
	sendNodeInfo(info: BrokerNode, nodeID?: string): Promise<void | void[]>;
	sendPing(nodeID: string, id?: string): Promise<void>;
	sendPong(payload: GenericObject): Promise<void>;
	processPong(payload: GenericObject): void;
	sendHeartbeat(localNode: BrokerNode): Promise<void>;
	subscribe(topic: string, nodeID: string): Promise<void>;
	publish(packet: Packet): Promise<void>;
}

export interface ActionCatalogListOptions {
	onlyLocal?: boolean;
	onlyAvailable?: boolean;
	skipInternal?: boolean;
	withEndpoints?: boolean;
}

export declare class ServiceRegistry {
	broker: ServiceBroker;
	metrics: MetricRegistry;
	logger: LoggerInstance;

	opts: BrokerRegistryOptions;

	StrategyFactory: BaseStrategy;

	nodes: any;
	services: any;
	actions: any;
	events: any;

	getServiceList(opts?: ActionCatalogListOptions): ServiceSchema[];
}

export declare class AsyncStorage {
	broker: ServiceBroker;
	store: Map<string, any>;

	constructor(broker: ServiceBroker);

	enable(): void;
	disable(): void;
	stop(): void;
	getAsyncId(): number;
	setSessionData(data: any): void;
	getSessionData(): any | null;
}

export declare const CIRCUIT_CLOSE: string;
export declare const CIRCUIT_HALF_OPEN: string;
export declare const CIRCUIT_OPEN: string;

export declare const MOLECULER_VERSION: string;
export declare const PROTOCOL_VERSION: string;
export declare const INTERNAL_MIDDLEWARES: string[];

export declare const METRIC: {
	TYPE_COUNTER: "counter";
	TYPE_GAUGE: "gauge";
	TYPE_HISTOGRAM: "histogram";
	TYPE_INFO: "info";
};

export namespace Utils {
	function isFunction(func: unknown): func is Function;
	function isString(str: unknown): str is string;
	function isObject(obj: unknown): obj is object;
	function isPlainObject(obj: unknown): obj is object;
	function isDate(date: unknown): date is Date;
	function flatten<T>(arr: readonly T[] | readonly T[][]): T[];
	function humanize(millis?: number | null): string;
	function generateToken(): string;
	function removeFromArray<T>(arr: T[], item: T): T[];
	function getNodeID(): string;
	function getIpList(): string[];
	function isPromise<T>(promise: unknown): promise is Promise<T>;
	function polyfillPromise(P: typeof Promise): void;
	function clearRequireCache(filename: string): void;
	function match(text: string, pattern: string): boolean;
	function deprecate(prop: unknown, msg?: string): void;
	function safetyObject(obj: unknown, options?: { maxSafeObjectSize?: number }): any;
	function dotSet<T extends object>(obj: T, path: string, value: unknown): T;
	function makeDirs(path: string): void;
	function parseByteString(value: string): number;
}
