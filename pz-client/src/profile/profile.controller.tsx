import * as React from 'react';
import * as Relay from 'react-relay';
import { Component } from 'react';
import { DateDisplay } from 'pz-client/src/widgets/date-display.component'
import appInfo from 'pz-client/src/app/app-info';
import TrustButton from 'pz-client/src/user/trust-button';
import TrustReputationStats from 'pz-client/src/user/trust-reputation-stats';

export interface IProfileControllerProps {
    profile: {
        bio: string;
        createdAt: string;
        user: {
            displayName: string;
            image: string;
        }
    }
}

const unknownAvatarUrl = appInfo.addresses.getImage('unknown-avatar.png');

export class Profile extends Component<IProfileControllerProps, any> {

    render() {

        return (
            <div className="profile-namespace">
                {this._renderTopSection()}
            </div>
        );
    }

    private _renderTopSection(){
        let {bio, createdAt, user} = this.props.profile;
        let {displayName, image} = user;
        let memberSince = new Date(createdAt);

        return (
            <div>
                <img className="avatar-image"
                    src={`${image}?d=retro`}
                    onError={this._loadDefaultImage.bind(this)} />
                    
                <TrustReputationStats user={user} showReputation={true} showTrusts={true} />
                
                <h2 className="name">{displayName}</h2>

                <TrustButton user={user} />
                
                <div className="member-since">
                    Praisee member since 
                    <DateDisplay 
                        date={createdAt}
                        type="date-created"
                        style={{ display: "inline-block" }}
                        format="MM-DD-YYYY"
                    />
                    
                </div>
                <p>{bio}</p>
            </div>
        )        
    }

    private _loadDefaultImage(event) {
        event.target.src = unknownAvatarUrl;
    }
}

export default Relay.createContainer(Profile, {
    fragments: {
        profile: () => Relay.QL`
            fragment on UserProfile {
                bio
                createdAt
                user {
                    displayName
                    image
                    ${TrustButton.getFragment('user')}
                    ${TrustReputationStats.getFragment('user')}
                }
            }
        `
    }
});
