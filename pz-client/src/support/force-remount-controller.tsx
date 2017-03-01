import * as React from 'react';

interface IProps {}

export default class ForceRemountController extends React.Component<IProps, any> {
    render() {
        return (
            <div className="force-remount-namespace" key={'force-remount-' + Math.random()}>
                {this.props.children}
            </div>
        );
    }
}
