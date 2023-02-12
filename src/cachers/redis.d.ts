import BaseCacher = require("./base");
import type { CacherOptions } from "./base";

export interface RedisCacherOptions extends CacherOptions {
	prefix?: string;
	redis?: Record<string, any>;
	redlock?: Record<string, any>;
	monitor?: boolean;
	pingInterval?: number;
}

declare class RedisCacher<TClient = any> extends BaseCacher {
	opts: RedisCacherOptions;

	client: TClient;

	prefix: string | null;

	constructor(opts?: string | RedisCacherOptions);

	tryLock(key: string | string[], ttl?: number): Promise<() => Promise<void>>;

	lock(key: string | string[], ttl?: number): Promise<() => Promise<void>>;
}

export = RedisCacher;
