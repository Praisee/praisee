import * as React from 'react';
import {Component, ReactNode} from 'react';

export default class SchemaInjector {
    constructor(private schema: ISchemaType) { }

    inject(baseElement: React.ReactElement<any>) {
        return this._modifyElement(baseElement);
    }

    private _modifyElement(element) {
        if (React.isValidElement(element)) {
            let props = this._setPropsFromSchema(element);
            let modifiedChildren = this._modifyChildren(element);
            return React.cloneElement(element, props, modifiedChildren);
        }

        return element;
    }

    private _modifyChildren(element: React.ReactElement<any>) {
        return React.Children.map(element.props.children, (child) => this._modifyElement(child));
    }

    private _setPropsFromSchema(element: React.ReactElement<any>) {
        let props = Object.assign({}, element.props);

        //Loop to match classNames to schema properties
        for (let schemaKey of Object.keys(this.schema)) {
            if (element.props.className !== schemaKey) {
                continue;
            }

            for (let schemaProperty of Object.keys(this.schema[schemaKey])) {
                if (this.schema[schemaKey][schemaProperty] === false) {
                    continue;
                }
                props[schemaProperty] = this.schema[schemaKey][schemaProperty];
            }
            return props;
        }
    }
}

export interface ISchemaType {
    [className: string]: {
        property: string,
        typeof?: string
    }
}