import * as React from 'react';
import {Component} from 'react';
import * as util from 'util';

interface ITopicState {
    counter: number
}

interface ITopicProps {
    counter: number
}

export default class TopicController extends Component<ITopicProps, ITopicState> {
    state = {counter: 0};
    
    render() {
        return (
            <div>
                Heya, world!!!: "{this.state.counter}" - {util.inspect(this.props)}
            </div>
        )
    }
    
    componentWillMount() {
        if (process['browser']) {
            setInterval(() => {
                this.setState({counter: this.state.counter + 1})
            }, 1000);
        }
    }
}

