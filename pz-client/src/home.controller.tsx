import * as React from 'react';
import {Component} from 'react';

interface IState {
    counter: number
}

export default class Home extends Component<{}, IState> {
    state = {counter: 0};
    
    render() {
        return (
            <div>
                Heya, world!!!: "{this.state.counter}"
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

