import * as React from 'react';

export interface IProps {
}

export default class ContentMenu extends React.Component<IProps, any> {
    render() {
        return (
            <div className="editor-content-menu">
                {this.props.children}
            </div>
        );
    }
}
