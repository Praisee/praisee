import * as React from 'react';
import * as Relay from 'react-relay';
import appInfo from 'pz-client/src/app/app-info';
import {Link} from 'react-router';
import routePaths from 'pz-client/src/router/route-paths';
import {Alert} from 'reactstrap';
import Cookies from 'js-cookie';

interface IProps {
}

export default class BhPhotoGiveawayToastController extends React.Component<IProps, any> {
    render() {
        return (
            <div className="bh-photo-giveaway-toast-namespace">
                <Alert color="warning" isOpen={this.state.toastIsOpen} toggle={this._dismissToast.bind(this)}>
                    <Link className="toast-container" to={routePaths.marketing.bhPhotoGiveaway()}>
                        Hey you! Want to win a $100 B&amp;H Photo gift card? All you
                        have to do is add a review to enter. Learn more here!
                    </Link>
                </Alert>

                {this.props.children}
            </div>
        );
    }

    state = {
        toastIsOpen: false
    };

    componentDidMount() {
        if (!Cookies.get('hideBhPhotoGiveawayToast')) {
            this.setState({toastIsOpen: true})
        }
    }

    private _dismissToast() {
        Cookies.set('hideBhPhotoGiveawayToast', true);
        this.setState({toastIsOpen: false})
    }
}
