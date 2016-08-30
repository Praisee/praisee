import {Component} from 'react';

export default class Error extends Component<any, any>{
    constructor(props, context) {
        super(props, context);
    }

    render() {
        const {message} = this.props;

        return (
            <em className="error">{message}</em>
        );
    }
}