import * as React from 'react';
import ValidationMap = __React.ValidationMap;
import {IIsomorphicContextProps} from 'pz-client/src/isomorphic-context.component.tsx';

export interface IAppControllerProps {
}

export default class AppController extends React.Component<IAppControllerProps, any> {
    //set context stuff here
    
    context: IIsomorphicContextProps;
    
    static contextTypes: ValidationMap<any> = {
        loopbackApp: React.PropTypes.object.isRequired
    };
    
    constructor(props?, context?) {
        super(props, context);
        
        this.state = {
            topics: []
        };
    }
    
    render() {
        return (
            <div className="app-namespace">
                {this.props.children}
                
                <h2>Topics</h2>
                <ul>
                    {this.state.topics.map(topic => (
                        <li key={topic.id}>{topic.name}</li>
                    ))}
                </ul>
            </div>
        );
    }
    
    componentDidMount() {
        this.context.loopbackApp.models.Topic.find().then(topics => {
            this.setState({topics});
        });
    }
}

