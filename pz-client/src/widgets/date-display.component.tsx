import {Component} from 'react';
import * as React from 'react';
import * as Relay from 'react-relay';
import SchemaInjector, {ISchemaType} from 'pz-client/src/support/schema-injector';
var moment = require('moment'); //TODO: Figure out why momentJS doesnt work with import statement

export class DateDisplay extends Component<IDateDisplayProps, any>{
    schemaInjector: SchemaInjector;
    moment;

    constructor(props, context) {
        super(props, context);
        this.schemaInjector = new SchemaInjector(dateSchema);
        this.moment = moment(props.date);
    }

    render() {
        const {type} = this.props;

        return this.schemaInjector.inject(
            <div className="date">
                <meta content={this.moment.format("YYYY-MM-DDThh:mm:ss")} className={type} />
                {this.moment.format("LL")}
            </div>
        );
    }
}

export interface IDateDisplayProps {
    date: string | Date,
    type: DateType
}

export type DateType =
    "date-published"
    | "date-created"
    | "date-modified"
    | "comment-time";

var dateSchema: ISchemaType = {
    "date": {
        property: "date",
        typeof: "Date"
    },
    "date-created": {
        property: "dateCreated"
    },
    "date-published": {
        property: "datePublished"
    },
    "date-modified": {
        property: "dateModified"
    },
    "comment-time": {
        property: "commentTime"
    }
}