import * as React from 'react';
import * as Relay from 'react-relay';
import ValidationMap = __React.ValidationMap;
import {IIsomorphicContextProps} from 'pz-client/src/app/isomorphic-context.component.tsx';

export interface IAppControllerProps {
    viewer: {
        topics: Array<any>
    }
}

export class AppController extends React.Component<IAppControllerProps, any> {
    //set context stuff here
    
    constructor(props?, context?) {
        super(props, context);
    }
    
    render() {
        return (
            <div className="app-namespace">
                {this.props.children}

                <h2>Topics</h2>
                <ul>
                    {this.props.viewer.topics.map(topic => (
                        <li key={topic.id}>{topic.name}</li>
                    ))}
                </ul>
            </div>
        );
    }
}

export var appContainer = Relay.createContainer(AppController, {
    fragments: {
        viewer: () => Relay.QL`
            fragment on Viewer {
                topics {
                    id,
                    name
                }
            }
        `
    }
});

export default class AppRenderer extends React.Component<any, any> {
    context: IIsomorphicContextProps;

    static contextTypes: ValidationMap<any> = {
        relayRenderer: React.PropTypes.func.isRequired
    };
    
    render() {
        return this.context.relayRenderer(appContainer);
    }
}
