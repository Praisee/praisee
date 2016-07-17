import {Component} from 'react';
import * as React from 'react';
import * as Relay from 'react-relay';
import {SchemaInjector, ISchemaType} from 'pz-client/src/support/schema-injector';
import * as moment from 'moment';

export class DateDisplay extends Component<IDateDisplayProps, any>{
    schemaInjector: SchemaInjector;
    moment: moment.Moment;

    constructor(props, context) {
        super(props, context);
        this.schemaInjector = new SchemaInjector(dateSchema);
        this.moment = moment(this.props.date);
    }

    render() {
        const {type} = this.props;

        return this.schemaInjector.inject(
            <div className="date">
                <meta content={this.moment.format("CCYY-MM-DDThh:mm:ss")} className={type}>
                {this.moment.format("LL")}
                </meta>
            </div>
        );
    }
}

export interface IDateDisplayProps {
    date: Date,
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