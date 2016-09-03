import * as React from 'react';
import NotFoundError from 'pz-client/src/app/not-found-error.component';

export default class App extends React.Component<any, any> {
    //set context stuff here

    static contextTypes: React.ValidationMap<any> = {
        notFoundHandler: React.PropTypes.func
    };

    static childContextTypes = {
        showNotFoundError: React.PropTypes.func
    };

    getChildContext() {
        return {
            showNotFoundError: this._showNotFoundError.bind(this)
        };
    }

    state = {
        showNotFoundError: false,
        notFoundErrorMessage: null
    };

    render() {
        let content = this.props.children;

        if (this.state.showNotFoundError) {
            content = this.state.notFoundErrorMessage;
        }

        return (
            <div className="app-namespace">
                {content}
            </div>
        );
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.children !== this.props.children) {
            this.setState({showNotFoundError: false, notFoundErrorMessage: null});
        }
    }

    private _showNotFoundError(errorMessage?) {
        const context: any = this.context;

        const notFoundErrorMessage = (
            <NotFoundError>
                {errorMessage}
            </NotFoundError>
        );

        if (context.notFoundHandler) {
            context.notFoundHandler(notFoundErrorMessage);

        } else {

            setTimeout(() => {
                this.setState({
                    showNotFoundError: true,
                    notFoundErrorMessage: notFoundErrorMessage
                });
            });
        }
    }
}
