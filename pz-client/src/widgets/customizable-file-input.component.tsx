import * as React from 'react';
import classNames from 'classnames';

export interface IProps {
    children?: any
    name?: string
    value?: any
    className?: string
    accept?: string
    acceptImages?: boolean
    multiple?: boolean
    onChange?: (files: Array<File>) => void
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
    };

    static defaultProps = {
        onChange: () => {}
    };

    render() {
        const classes = classNames(this.props.className, 'customizable-file-input');

        const accept = this.props.acceptImages ?
            'images/*' : this.props.accept;

        const value = this.props.value || '';

        return (
            <span className={classes}>
                {this.props.children}

                <input
                    type="file"
                    name={this.props.name}
                    value={value}
                    className="customizable-file-input-hidden-input"
                    onChange={this._onFilesSelected.bind(this)}
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
}
