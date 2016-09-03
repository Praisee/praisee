import * as React from 'react';

export interface IProps {
    children?: any
}

export default class NotFoundError extends React.Component<IProps, any> {
    render() {
        return (
            <div className="not-found-error">
                {this.props.children || 'Sorry, we could not find that :('}
            </div>
        );
    }
}
