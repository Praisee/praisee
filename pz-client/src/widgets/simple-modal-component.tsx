import * as React from 'react';

import { Modal as ReactstrapModal, ModalHeader, ModalBody } from 'reactstrap';

import classNames from 'classnames';

interface IProps {
    className?: string
}

export default class SimpleModal extends React.Component<IProps, any> {
    state = {
        isVisible: false
    };

    show = () => {
        this.setState({isVisible: true});
    };

    hide = () => {
        this.setState({isVisible: false});
    };

    render() {
        if (!this.state.isVisible) {
            return (<span />);
        }

        const classes = classNames('app-simple-modal', this.props.className);

        return (
            <ReactstrapModal className={classes}
                             isOpen={this.state.isVisible}
                             toggle={this.hide.bind(this)}>

                <ModalBody>
                    <button
                        className="simple-modal-hide-button"
                        onClick={this.hide.bind(this)}
                    />

                    {this.props.children}
                </ModalBody>
            </ReactstrapModal>
        );
    }
}
