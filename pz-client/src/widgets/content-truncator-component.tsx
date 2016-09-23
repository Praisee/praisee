import * as React from 'react';
import * as ReactDom from 'react-dom';
import classNames from 'classnames';
import onResize from 'pz-client/src/support/on-resize';
import ExpandButton from 'pz-client/src/widgets/expand-button-component';

interface IProps {
    truncateToHeight: number
    heightMargin?: number
    className?: string
}

export default class ContentTruncator extends React.Component<IProps, any> {
    defaultProps = {
        heightMargin: 0
    };

    render() {
        const isTruncated = this._isTruncated();

        const classes = classNames('content-truncator', this.props.className, {
            'content-truncator-is-truncated': isTruncated,
            'content-truncator-is-truncatable': this.state.shouldTruncate
        });

        const {truncateToHeight} = this.props;
        const contentStyles = isTruncated ? {maxHeight: truncateToHeight} : void(0);

        return (
            <div className={classes}>
                {/* TODO: Add the ability to have "header" content if truncated */}

                <div ref="content"
                     className="content-truncator-content"
                     onClick={this._expand.bind(this)}
                     style={contentStyles}>

                    {this.props.children}
                </div>

                <ExpandButton
                    className="content-truncator-toggle"
                    onExpand={this._toggleTruncation.bind(this)}
                />
            </div>
        );
    }

    state = {
        shouldTruncate: true,
        allowTruncation: true
    };

    refs: any;

    private _cancelResizeEventHandler;

    componentDidMount () {
        this._updateContentDimensions();
        this._cancelResizeEventHandler = onResize(this._updateContentDimensions.bind(this));
    }

    componentWillUnmount () {
        this._cancelResizeEventHandler();
    }

    private _isTruncated() {
        return this.state.shouldTruncate && this.state.allowTruncation;
    }

    private _toggleTruncation() {
        this.setState({allowTruncation: !this.state.allowTruncation});
    }

    private _expand() {
        this.setState({allowTruncation: false});
    }

    private _getContentHeight() {
        const content = ReactDom.findDOMNode(this.refs.content);
        return content.scrollHeight;
    }

    private _updateContentDimensions() {
        const {truncateToHeight, heightMargin} = this.props;
        const maxHeight = truncateToHeight + heightMargin;
        const contentHeight = this._getContentHeight();

        if (contentHeight < maxHeight) {
            if (this.state.shouldTruncate) {
                this.setState({shouldTruncate: false});
            }

            return;
        }

        this.setState({shouldTruncate: true});
    }
}
