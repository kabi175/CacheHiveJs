import {StoreRecord} from "./records";
import {NetworkManager} from "./network-manager";
import {CacheManager} from "./cache-manager";

type StoreManager<T extends StoreRecord> = NetworkManager<T> & CacheManager<T>;
