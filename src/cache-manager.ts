import {StoreRecord} from "./records";

export interface CacheManager<T extends StoreRecord> {
    peek: (arg0: T) => T;
    peekAll: (arg0: T) => Array<T>;
    remove: (arg0: T) => void;
    removeAll: (arg0: T) => void;
}
