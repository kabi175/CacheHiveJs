import unfetch from "unfetch";
import {URL} from "url";
import {StoreRecord} from "./records";

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestProperties {
    url: URL;
    method: RequestMethod,
    headers: Record<string, string>;
}

export type NetworkOperation =
    'find'
    | 'findAll'
    | 'delete'
    | 'deleteAll'
    | 'update'
    | 'updateAll'
    | 'create'
    | 'createAll'

export type RequestAdapter<StoreRecord> = (record: StoreRecord | Array<StoreRecord>, operation: NetworkOperation) => RequestProperties;
export type RequestSerializer<StoreRecord> = (payload: StoreRecord | Array<StoreRecord>) => any;
export type ResponseSerializer<StoreRecord> = (payload: any) => StoreRecord | Array<StoreRecord>


export interface INetWorkManager<T extends StoreRecord> {
    requestSerializer: RequestSerializer<StoreRecord>;
    responseSerializer: ResponseSerializer<StoreRecord>;
    adapter: RequestAdapter<StoreRecord>;
    find: (record: StoreRecord) => Promise<StoreRecord>;
    findAll: (record: StoreRecord) => Promise<Array<StoreRecord>>;
}

export interface Options {
    host: String,
}


export class NetworkManager<T extends StoreRecord> implements INetWorkManager<StoreRecord> {

    private static readonly AcceptedResponses = [200, 201]
    private static readonly DefaultMethodsMapping: Record<NetworkOperation, RequestMethod> = {
        'find': 'GET',
        'findAll': 'GET',
        'update': 'PATCH',
        'updateAll': 'PATCH',
        'delete': 'DELETE',
        'deleteAll': 'DELETE',
        'create': 'POST',
        'createAll': 'POST',
    }

    private readonly name: String;
    private readonly options: Options;

    constructor(name: String, options: Options) {
        this.name = name;
        this.options = options;
    }

    responseSerializer(payload: any): StoreRecord | Array<StoreRecord> {
        return payload as StoreRecord;
    }

    requestSerializer(record: StoreRecord | Array<StoreRecord>): any {
        return record
    }

    adapter(record: StoreRecord | Array<StoreRecord>, operation: NetworkOperation): RequestProperties {
        let url;
        if (['find', 'update', 'find'].includes(operation) && !(record instanceof Array)) url = `${this.options.host}/${this.name}/${record.id}`;
        else url = `${this.options.host}/${this.name.concat('s')}`;

        return {
            url: new URL(url),
            method: NetworkManager.DefaultMethodsMapping[operation],
            headers: {}
        }
    }

    async find(record: StoreRecord) {
        const operation = 'find';
        const result = await this.getData(record, operation);

        if (result instanceof Array) {
            throw new Error('')
        }
        return result;
    }

    async findAll(record: StoreRecord): Promise<Array<StoreRecord>> {
        const operation = 'findAll';
        const result = await this.getData(record, operation);

        if (!(result instanceof Array)) {
            throw new Error('')
        }

        return result;
    }

    private async getData(record: StoreRecord, operation: NetworkOperation) {
        const requestProperties = this.adapter(record, operation);
        const response = await unfetch(requestProperties.url, {
            method: requestProperties.method,
            headers: requestProperties.headers,
            body: this.requestSerializer(record),
        })

        if (!response.ok || NetworkManager.AcceptedResponses.includes(response.status)) {
            throw new Error('')
        }

        if (response.headers.get('Content-Type') !== 'application/json') {
            throw  new Error('')
        }

        return this.responseSerializer(response);
    }
}