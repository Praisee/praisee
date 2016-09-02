export interface ITrackedEventType {
    eventType: string
    data: any
}

export function isTrackedEvent(object: any): object is ITrackedEventType {
    return object && isValidTrackedEventType(object.eventType) && object.data;
}

export function isValidTrackedEventType(eventType: string) {
    switch (eventType) {
        case 'ItemViewEvent':
            return true;
    }

    return false;
}

export interface IItemViewEvent extends ITrackedEventType {
    eventType: 'ItemViewEvent',

    data: {
        itemType: string
        itemId: number
        userId: number
        context: any
    }
}

export function isItemViewEvent(trackedEvent: ITrackedEventType): trackedEvent is ITrackedEventType {
    return trackedEvent.eventType === 'ItemViewEvent';
}
