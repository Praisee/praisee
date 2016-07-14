import * as React from 'react';
import {Component, ReactNode} from 'react';

export class SchemaInjector {
    constructor(private schema: {}) { }

    inject(baseNode: any) {
        let modifiedChildren = React.Children.map(baseNode.props.children, (element) => this._modifyElement(element));
        return React.cloneElement(baseNode, {}, modifiedChildren);
    }

    private _modifyElement(element, index = null) {
        if (React.isValidElement(element)) {
            let props: any = {};

            for (let key of Object.keys(this.schema)) {
                if (element.props.className == key) {
                    props = this.schema[key];
                    if (index != null) {
                        props.key = "__review" + index;
                    }
                    if (this.schema[key].itemScope) {
                        props.itemScope = "itemScope";
                    }
                    break;
                }
            }

            if (Array.isArray(element.props.children) && element.props.children.length > 0) {
                return React.cloneElement(element, props, this._modifyElement(element.props.children));
            }

            return React.cloneElement(element, props);
        }

        if (Array.isArray(element)) {
            return element.map((subElement, index) => {
                if (subElement && !subElement.key) {
                    return this._modifyElement(subElement, index);
                }
                return this._modifyElement(subElement);
            });
        }

        return element;
    }
}

export interface ISchemaType {
    [className: string]: {
        property: string,
        typeof?: string
    }
}