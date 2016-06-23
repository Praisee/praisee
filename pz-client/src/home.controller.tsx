import * as React from 'react';
import * as Relay from 'react-relay';
import {Component} from 'react';
import * as util from 'util';

export interface IHomeControllerProps {
    params: any,
    
    viewer: {
        topics: Array<any>
    }
}

export class HomeController extends Component<IHomeControllerProps, any> {
    state = {counter: 0};
    
    render() {
        return (
            <div>
                Heya, world!!!: "{this.state.counter}" - {util.inspect(this.props.params)}

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
        setInterval(() => {
            this.setState({counter: this.state.counter + 1})
        }, 1000);
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
