import * as React from 'react';
import {Link} from 'react-router';
import handleClick from 'pz-client/src/support/handle-click';

function createMentionLinkComponent(isClickable) {
    const maybePreventClick = isClickable ? void(0) : handleClick((event) => event.preventDefault());

    return (props) => {
        const {mention, mentionPrefix, children, className} = props;

        return (
            <Link to={mention.get('link')}
                  onClick={maybePreventClick}
                  className={className}>

                {mentionPrefix}{children}
            </Link>
        );
    };
}

export var ClickableMentionLink = createMentionLinkComponent(true);
export var EditableMentionLink = createMentionLinkComponent(false);
