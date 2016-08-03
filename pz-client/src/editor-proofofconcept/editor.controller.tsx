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
}

class Editor extends React.Component<IProps, any> {
    render() {
        return (
            <div className="editor-proofofconcept-namespace">
                <form onSubmit={this._saveCommunityItem.bind(this)}>
                    <button>Save</button>
                </form>
            </div>
        );
    }

    private _saveCommunityItem(event) {
        event.preventDefault();

        this.props.relay.commitUpdate(new CreateCommunityItemMutation({
            type: 'question',
            summary: 'Will this work???',
            body: 'This is a test.'
        }));
    }
}

export let CreateItemEditor = Relay.createContainer(Editor, {
    fragments: {}
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
