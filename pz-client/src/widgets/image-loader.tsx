import * as React from 'react';
import classNames from 'classnames';

export interface IProps {
    src: string
    placeholder?: any
    loadingPlaceholder?: any
    failurePlaceholder?: any
    className?: string
    alt?: string
}

export default class ImageLoader extends React.Component<IProps, any> {
    static propTypes = {
        src: React.PropTypes.any.isRequired,
        placeholder: React.PropTypes.object,
        loadingPlaceholder: React.PropTypes.object,
        failurePlaceholder: React.PropTypes.object
    };

    static defaultProps = {
        placeholder: null,
        loadingPlaceholder: null,
        failurePlaceholder: null
    };

    render() {
        if (this.state.hasFailed && this._getFailurePlaceholder()) {
            return this._getFailurePlaceholder();

        } else if (!this.state.hasLoaded && !this.state.isCached && this._getLoadingPlaceholder()) {
            return this._getLoadingPlaceholder();

        } else {

            return this._renderImage();
        }
    }

    state = {
        hasFailed: false,
        hasLoaded: false,
        isCached: false,
    };

    private _imagePreloader;
    private _isMounted = true;

    componentDidMount() {
        this._preloadImage(this.props.src);
        this._checkIfImageIsCached();
    }

    componentWillUpdate(nextProps) {
        if (this.props.src === nextProps.src) {
            return;
        }

        this.setState({
            hasFailed: false,
            hasLoaded: false,
            isCached: false,
        });

        this._preloadImage(nextProps.src);
        this._checkIfImageIsCached();
    }

    componentWillUnmount() {
        this._isMounted = true;

        if (this._imagePreloader) {
            this._imagePreloader.onload = null;
            this._imagePreloader.onerror = null;
            this._imagePreloader.src = '';
            this._imagePreloader = null;
        }
    }

    private _renderImage() {
        let className = classNames(this.props.className, {
            'image-loader-is-cached': this.state.isCached,
            'image-loader-has-loaded': this.state.hasLoaded && !this.state.isCached
        });

        const imgProps = Object.assign({}, this.props);
        delete imgProps.placeholder;
        delete imgProps.loadingPlaceholder;
        delete imgProps.failurePlaceholder;

        return (
            <img
                draggable={false}
                {...imgProps}
                className={className} />
        );
    }

    private _preloadImage(src) {
        this._imagePreloader = new Image();
        this._imagePreloader.onload = this._setStateToLoaded.bind(this);
        this._imagePreloader.onerror = this._setStateToFailure.bind(this);
        this._imagePreloader.src = src;
    }

    private _getLoadingPlaceholder() {
        return this.props.loadingPlaceholder || this.props.placeholder;
    }

    private _getFailurePlaceholder() {
        return this.props.failurePlaceholder || this.props.placeholder;
    }

    private _checkIfImageIsCached() {
        let image = this._imagePreloader;
        if (image.complete) {
            this.setState({isCached: true});
        }
    }

    private _setStateToLoaded(event) {
        if (!this._isMounted) {
            return;
        }

        this.setState({hasLoaded: true});
    }

    private _setStateToFailure(event) {
        event.preventDefault();

        if (!this._isMounted) {
            return;
        }

        this.setState({hasFailed: true});
    }
}
