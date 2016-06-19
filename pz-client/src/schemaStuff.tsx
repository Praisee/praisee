import * as React from 'react';
import {Component, ReactNode} from 'react';

export class Review extends Component<any, any> {
    schema: ISchema;

    constructor(props, context, schema: ISchema) {
        super(props, context);
        this.schema = new ReviewSchema();
    };

    render() {
        let injectedJSX = this.schema.inject(
            <div className="testing">
                <span className="name"> Microwave abc </span>
                <div className="aggregate-value">
                    <span className="rating-value">3.5</span>/5 with <span className="review-count"> 8793 </span> reviews
                </div>
            </div>
        );
        return injectedJSX;
    }
}

class ReviewSchema implements ISchema {
    schema = {
        "name": {
            itemProp: "name"
        },
        "rating-value": {
            itemProp: "ratingValue"
        },
        "review-count": {
            itemProp: "ratingCount"
        },
    }

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
                if (!subElement.key) {
                    return this._modifyElement(subElement, index);
                }
                return this._modifyElement(subElement);
            });
        }

        return element;
    }
}

interface ISchema {
    inject(elements: React.ReactNode);
}