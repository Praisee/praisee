import * as React from 'react';
import * as Relay from 'react-relay';
import {Component} from 'react';

export interface IHomeControllerProps {
    params: any,
    
    viewer: {
        topics: Array<any>
    }
}

export class HomeController extends Component<IHomeControllerProps, any> {
    state = {counter: 0};
    
    private _counterTimer;
    
    render() {
        return (
            <div>
                <p>Counter: {this.state.counter}</p>
                
                <h2>Topics</h2>
                <ul>
                    {this.props.viewer.topics.map(topic => (
                        <li key={topic.id}>{topic.name}</li>
                    ))}
                </ul>
            </div>
        )
    }
    
    componentDidMount() {
        this._counterTimer = setInterval(() => {
            this.setState({counter: this.state.counter + 1})
        }, 1000);
    }
    
    componentWillUnmount() {
        if (this._counterTimer) {
            clearInterval(this._counterTimer);
        }
    }
}

export default Relay.createContainer(HomeController, {
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
