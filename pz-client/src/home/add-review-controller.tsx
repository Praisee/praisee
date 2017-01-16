import * as React from 'react';
import * as Relay from 'react-relay';
import ReviewEditor from 'pz-client/src/community-item/review-editor-component';
import SignInUpOverlay from 'pz-client/src/user/sign-in-up-overlay-component';
import appInfo from 'pz-client/src/app/app-info';
import {Link} from 'react-router';
import routePaths from 'pz-client/src/router/route-paths';

const logoUrl = appInfo.addresses.getImage('praisee-logo.svg');

interface IProps {
    viewer
}

class AddReview extends React.Component<IProps, any> {
    render() {
        return (
            <div className="add-review-namespace">
                <SignInUpOverlay>
                    <Link to={routePaths.index()}>
                        <img className="praisee-logo" src={logoUrl} alt="Praisee" />
                    </Link>

                    <ReviewEditor
                        topic={null}
                        fromTopic={null}
                        viewer={this.props.viewer}
                        autoFocus={true}
                        persistedDataKey="addReview"
                    />
                </SignInUpOverlay>
            </div>
        );
    }
}

export default Relay.createContainer(AddReview, {
    fragments: {
        viewer: () => Relay.QL`
            fragment on Viewer {
                ${ReviewEditor.getFragment('viewer')}
            }
        `
    }
});
