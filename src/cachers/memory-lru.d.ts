import BaseCacher = require("./base");
import type { MemoryCacherOptions } from "./memory";

export interface MemoryLRUCacherOptions extends MemoryCacherOptions {
	max?: number;
}

declare class MemoryLRUCacher extends BaseCacher {
	opts: MemoryLRUCacherOptions;

	constructor(opts?: MemoryLRUCacherOptions);

	tryLock(key: string | string[], ttl?: number): Promise<() => Promise<void>>;

	lock(key: string | string[], ttl?: number): Promise<() => Promise<void>>;
}

export = MemoryLRUCacher;
