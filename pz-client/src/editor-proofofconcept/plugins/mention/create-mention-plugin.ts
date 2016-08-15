import ContentBlock = Draft.Model.ImmutableData.ContentBlock;
import createMentionSuggestions from 'pz-client/src/editor-proofofconcept/plugins/mention/mention-suggestions';

var createMentionsPlugin = require('draft-js-mention-plugin').default as Function;

export default function createMentionPlugin() {
    const mentionsPlugin = createMentionsPlugin({
        entityMutability: 'IMMUTABLE'
    });

    const {MentionSuggestions: PluginMentionSuggestions} = mentionsPlugin;

    const [mentionsDecorator, mentionSuggestionsDecorator] = mentionsPlugin.decorators;

    // const taggerTrigger = {
    //     strategy: taggerTriggerStrategy,
    //     component: mentionSuggestionsDecorator.component
    // };

    return Object.assign({}, mentionsPlugin, {
        // MentionSuggestions: fixMentionSuggestions(MentionSuggestions),
        MentionSuggestions: createMentionSuggestions(PluginMentionSuggestions),

        decorators: [
            mentionsDecorator,
            // taggerTrigger
            mentionSuggestionsDecorator
        ]
    });
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
