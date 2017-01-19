import { Component } from 'react';
import * as React from 'react';
import * as Relay from 'react-relay';

class TrustAndReputationStats extends Component<TrustAndReputationStatsProps, any>{
    render() {
        return (
            <div className="avatar-stats">
                {this._renderReputation()}
                {this._renderTrust()}
            </div>
        );
    }

    private _renderReputation() {
        const {displayName, reputation} = this.props.user;

        if (this.props.showReputation)
            return (
                <span className="reputation" title={`${displayName} has ${reputation} total reputation.`}>
                    {reputation || 0}

                    <i className="reputation-icon"></i>
                </span>
            );
    }

    private _renderTrust() {
        const {displayName, trusterCount} = this.props.user;
        const singular = trusterCount === 1;

        const hint = `${trusterCount} ${singular ? "person" : "people"} trust${singular ? "s" : ""} ${displayName}`;

        if (this.props.showTrusts) {
            return (
                <span className="trusters" title={hint}>
                    {trusterCount || 0}

                    <i className="trusters-icon"></i>
                </span>
            );
        }
    }
}

export default Relay.createContainer(TrustAndReputationStats, {
    fragments: {
        user: () => Relay.QL`
            fragment on UserInterface {
                displayName
                reputation
                trusterCount
            }
        `
    }
});

interface IUser {
    displayName: string;
    reputation: number;
    trusterCount: number;
}

export interface TrustAndReputationStatsProps {
    user: IUser;
    showReputation: boolean;
    showTrusts: boolean;
}