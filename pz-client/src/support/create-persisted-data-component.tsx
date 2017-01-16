import * as React from 'react';

export interface IDataPersister<TPersistedData> {
    (persistedData: TPersistedData): any
}

export interface IDataReloader<TPersistedData> {
    (element: any): TPersistedData | null
}

interface IPersistedDataProps<TPersistedData> {
    persistedData: TPersistedData | null
}

export type TPersistedDataProps<TProps, TPersistedData> = TProps & IPersistedDataProps<TPersistedData>;

export interface IHasPersistedDataKey<T> {
    persistedDataKey?: T
}

export interface IElementToPersistedDataGetter<TPersistedData> {
    (element: any): TPersistedData
}

export function createPersistedDataComponent<TPersistedData, TProps, TState>(
        fromComponent: any,
        dataPersister: IDataPersister<TProps>,
        dataReloader: IDataReloader<TPersistedData>
    ) {

    return class PersistedDataComponent extends React.Component<TPersistedDataProps<TProps, TPersistedData>, TState> {
        render() {
            const reloadedData = dataReloader(this.props);

            return React.createElement(
                fromComponent,
                Object.assign({}, this.props, {
                    persistedData: reloadedData,
                    ref: 'wrappedComponent'
                })
            );
        }

        refs: {wrappedComponent: any};

        componentWillUnmount() {
            dataPersister(this.refs.wrappedComponent)
        }
    }
}

export function createMemoryLoaders<TProps extends IHasPersistedDataKey<any>, TPersistedData>(
        createPersistableData: IElementToPersistedDataGetter<TPersistedData>
    ): [IDataPersister<TProps>, IDataReloader<TPersistedData>] {

    let persistedData = new Map<any, TPersistedData>();

    const persister = (element: any) => {
        if (!element.props || !element.props.persistedDataKey) {
            // console.log('Cannot persist data', element.props, element.props.persistedDataKey);
            return;
        }

        // console.log('Persisting for key', element.props.persistedDataKey, 'data', createPersistableData(element));

        persistedData.set(element.props.persistedDataKey, createPersistableData(element));
    };

    const reloader = (props: TPersistedDataProps<TProps, TPersistedData>) => {
        if (!props || !props.persistedDataKey) {
            // console.log('Cannot reload data', props, props.persistedDataKey);
            return null;
        }

        // console.log('Reloading for key', props.persistedDataKey, 'data', persistedData.get(props.persistedDataKey));

        return persistedData.get(props.persistedDataKey);
    };

    return [persister, reloader];
}
