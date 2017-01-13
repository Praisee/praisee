import * as React from 'react';
import ContentBlock = Draft.Model.ImmutableData.ContentBlock;
import createMentionSuggestions from 'pz-client/src/editor/mention-plugin/mention-suggestions';
import {ClickableMentionLink, EditableMentionLink} from 'pz-client/src/editor/mention-plugin/mention-link-component';

var createMentionsPlugin = require('draft-js-mention-plugin').default as Function;

export default function createMentionPlugin({isEditable}: {isEditable: boolean}) {
    // TODO: Disabled Mention plugin because it is very sick :(
    // This plugin seems to have a lot of issues.
    //
    // First, we tried to allow triggering mentions when the user typed in an
    // uppercase letter, but that broke it.
    //
    // Then it broken more recently when a user tried to @ mention a user which was
    // not a supported feature yet. So it created a mention entity with no data
    // and subsequently would fail the entire render.
    //
    // We need to revisit this plugin when it is more stable
    // Last tested with v2 beta 1
    //
    //

    return {
        MentionSuggestions: () => React.createElement('span')
    };

    // const mentionsPlugin = createMentionsPlugin({
    //     entityMutability: 'IMMUTABLE',
    //     mentionComponent: isEditable ? EditableMentionLink : ClickableMentionLink
    // });
    //
    // const {MentionSuggestions: PluginMentionSuggestions} = mentionsPlugin;
    //
    // const [mentionsDecorator, mentionSuggestionsDecorator] = mentionsPlugin.decorators;
    //
    // // const taggerTrigger = {
    // //     strategy: taggerTriggerStrategy,
    // //     component: mentionSuggestionsDecorator.component
    // // };
    //
    // return Object.assign({}, mentionsPlugin, {
    //     // MentionSuggestions: fixMentionSuggestions(MentionSuggestions),
    //     MentionSuggestions: createMentionSuggestions(PluginMentionSuggestions),
    //
    //     decorators: [
    //         mentionsDecorator,
    //         // taggerTrigger
    //         mentionSuggestionsDecorator
    //     ]
    // });
}

// const taggerTriggers = /(\s|^)([@#]\w+|[A-Z]\w{1,})/g;
//
// export function taggerTriggerStrategy(contentBlock: ContentBlock, decorateRange: (start, end) => void) {
//     findWithRegex(taggerTriggers, contentBlock, (start, end) => {
//         decorateRange(start, end);
//     });
// }
//
// function findWithRegex(regex, contentBlock, callback) {
//     const text = contentBlock.getText();
//     let matchArr, start;
//     while ((matchArr = regex.exec(text)) !== null) {
//         start = matchArr.index;
//         callback(start, start + matchArr[0].length);
//     }
// }
//
// function fixMentionSuggestions(MentionSuggestions) {
//     const originalComponentDidUpdate = MentionSuggestions.componentDidUpdate;
//
//     MentionSuggestions.componentDidUpdate = function(...args) {
//         const searches = this.props.store.getAllSearches();
//
//         if (!searches) {
//             this.closeDropdown();
//             return;
//         }
//
//         if (!searches.has(this.activeOffsetKey)) {
//             this.closeDropdown();
//             return;
//         }
//
//         return originalComponentDidUpdate(...args);
//     };
//
//     return MentionSuggestions;
// }
