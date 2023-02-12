import type { EventEmitter2 } from "eventemitter2";

import ServiceBroker = require("./src/service-broker");
export { ServiceBroker };
export type { ServiceBrokerOptions } from "./src/service-broker";

import Context = require("./src/context");
export { Context };

export * as Loggers from "./src/loggers";
export type { LogLevels } from "./src/loggers";
export type { Logger, LoggerConfig } from "./src/logger-factory";

export * as Cachers from "./src/cachers";

export * as Transporters from "./src/transporters";

export * as Serializers from "./src/serializers";

export * as Strategies from "./src/strategies";

export * as Validators from "./src/validators";
export type { ValidatorNames } from "./src/validators";

export * as TracerExporters from "./src/tracing/exporters";

export * as MetricTypes from "./src/metrics/types";

export * as MetricReporters from "./src/metrics/reporters";

import Transit = require("./src/transit");
export { Transit };

export * as Discoverers from "./src/registry/discoverers";

export * as Errors from "./src/errors";

export * as Utils from "./src/utils";

export type {
	CIRCUIT_CLOSE,
	CIRCUIT_HALF_OPEN,
	CIRCUIT_HALF_OPEN_WAIT,
	CIRCUIT_OPEN
} from "./src/constants";

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

export interface LoggerBindings {
	nodeID: string;
	ns: string;
	mod: string;
	svc: string;
	ver: string | void;
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
	logger: Logger;
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

export type CheckRetryable = (err: MoleculerError | Error) => boolean;

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

export type FallbackHandler = (ctx: Context, err: MoleculerError) => Promise<any>;
export type FallbackResponse = string | number | GenericObject;
export type FallbackResponseHandler = (ctx: Context, err: MoleculerError) => Promise<any>;

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

export interface ValidatorOptions {
	type: string;
	options?: GenericObject;
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
	logger: Logger;

	opts: BrokerRegistryOptions;

	StrategyFactory: BaseStrategy;

	nodes: any;
	services: any;
	actions: any;
	events: any;

	getServiceList(opts?: ActionCatalogListOptions): ServiceSchema[];
}

export declare const MOLECULER_VERSION: string;
export declare const PROTOCOL_VERSION: string;
export declare const INTERNAL_MIDDLEWARES: string[];

export declare const METRIC: {
	TYPE_COUNTER: "counter";
	TYPE_GAUGE: "gauge";
	TYPE_HISTOGRAM: "histogram";
	TYPE_INFO: "info";
};
