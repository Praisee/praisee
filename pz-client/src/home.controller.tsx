import * as React from 'react';
import {Component} from 'react';
import * as util from 'util';

interface IState {
    counter: number
}

export default class Home extends Component<any, IState> {
    state = {counter: 0};
    
    render() {
        return (
            <div>
                Heya, world!!!: "{this.state.counter}" - {util.inspect(this.props.params)}
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

