import * as React from 'react';

var classNames = require('classnames');

export interface IProps {
    children?: any
    name?: string
    value?: any
    className?: string
    accept?: string
    acceptImages?: boolean
    multiple?: boolean
    onChange?: (files: Array<File>) => void
    disableStyles?: boolean
}

export default class CustomizableFileInput extends React.Component<IProps, any> {
    static propTypes = {
        children: React.PropTypes.any.isRequired,
        name: React.PropTypes.string,
        value: React.PropTypes.any,
        accept: React.PropTypes.string,
        acceptImages: React.PropTypes.bool,
        multiple: React.PropTypes.bool,
        onChange: React.PropTypes.func,
        disableStyles: React.PropTypes.bool
    };

    static defaultProps = {
        onChange: () => {}
    };

    render() {
        const classes = classNames(this.props.className, 'customizable-file-input');

        const {containerStyles, hiddenInputStyles} = this._getStyles();

        const accept = this.props.acceptImages ?
            'images/*' : this.props.accept;

        const value = this.props.value || '';

        return (
            <span className={classes} style={containerStyles}>
                {this.props.children}

                <input
                    type="file"
                    name={this.props.name}
                    value={value}
                    className="customizable-file-input-hidden-input"
                    onChange={this._onFilesSelected.bind(this)}
                    style={hiddenInputStyles}
                    accept={accept}
                    multiple={this.props.multiple}
                />
            </span>
        );
    }

    private _onFilesSelected(event) {
        const files = event && event.target && event.target.files;

        if (!files || !files.length) {
            return;
        }

        return this.props.onChange(files);
    }

    private _getStyles() {
        let containerStyles = void(0), hiddenInputStyles = void(0);

        if (this.props.disableStyles) {
            return {containerStyles, hiddenInputStyles};
        }

        containerStyles = {
            overflow: 'hidden',
            position: 'relative'
        };

        hiddenInputStyles = {
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            zIndex: 10,
            opacity: 0
        };

        return {containerStyles, hiddenInputStyles};
    }
}
