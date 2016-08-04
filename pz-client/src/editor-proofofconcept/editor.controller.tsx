import * as React from 'react';
import * as Relay from 'react-relay';

import CreateCommunityItemMutation from 'pz-client/src/editor-proofofconcept/create-community-item-mutation';

interface IProps {
    relay: any

    communityItem?: {
        id: number
        type: string,
        summary: string,
        body: string
    }

    viewer?: {
        myCommunityItems: {
            edges: Array<{
                node: {
                    id: number,
                    summary: string,
                    body: string
                }
            }>
        }
    }
}

class Editor extends React.Component<IProps, any> {
    render() {
        const myCommunityItems = this.props.viewer.myCommunityItems.edges;

        return (
            <div className="editor-proofofconcept-namespace">
                <form onSubmit={this._saveCommunityItem.bind(this)}>
                    <button>Save</button>
                </form>

                <div>
                    Community Items:
                    <ul>
                        {myCommunityItems.map(({node: communityItem}) => (
                            <li key={communityItem.id}>
                                {communityItem.summary}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    }

    private _saveCommunityItem(event) {
        event.preventDefault();

        this.props.relay.commitUpdate(new CreateCommunityItemMutation({
            type: 'question',
            summary: 'Will this work??? ' + Date.now().valueOf(),
            body: 'This is a test.',

            viewer: this.props.viewer
        }));
    }
}

export let CreateItemEditor = Relay.createContainer(Editor, {
    fragments: {
        viewer: () => Relay.QL`
            fragment on Viewer {
                myCommunityItems(first: 10) {
                    edges {
                        node {
                            id,
                            type,
                            summary,
                            body
                        }
                    }
                },
                
                ${CreateCommunityItemMutation.getFragment('viewer')}
            }
        `
    }
});

export let UpdateItemEditor = Relay.createContainer(Editor, {
    fragments: {
        review: () => Relay.QL`
            fragment on CommunityItem {
                id,
                type,
                summary,
                body
            }
        `
    }
});
