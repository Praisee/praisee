import { IRepository, IRepositoryRecord } from 'pz-server/src/support/repository';
import {ITrackedEventType} from './tracked-event-types';

export interface ITrackedEvent extends IRepositoryRecord {
    recordType: 'TrackedEvent'

    id?: number
    eventType?: string
    data?: any
    createdAt?: Date
    updatedAt?: Date
}

export interface IEventDataCriteria {
    [eventDataField: string]: any
}

export interface ITrackedEvents extends IRepository {
    findById(id: number): Promise<ITrackedEvent>
    getCountForTypeWithMatchingData(eventType: string, eventDataCriteria: IEventDataCriteria): Promise<number>
    create(event: ITrackedEventType): Promise<ITrackedEvent>
}

