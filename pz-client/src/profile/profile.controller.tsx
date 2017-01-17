import * as React from 'react';
import * as Relay from 'react-relay';
import { Component } from 'react';

export interface IProfileControllerProps {
    profile: {
        displayName: string;
        bio: string;
    }
}

export class Profile extends Component<IProfileControllerProps, any> {
    render() {
        return (
            <div className="profile-namespace">
                {this.props.profile.displayName}
                {this.props.profile.bio}
            </div>
        );
    }
}

export default Relay.createContainer(Profile, {
    fragments: {
        profile: () => Relay.QL`
            fragment on UserProfile {
                displayName
                bio
            }
        `
    }
});
