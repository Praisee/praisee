import * as React from 'react';
import appInfo from 'pz-client/src/app/app-info';
import SuggestionsClient, {ISearchSuggestionResult} from 'pz-client/src/search/suggestions-client';

import {fromJS} from 'immutable';

export default function createMentionSuggestions(PluginMentionSuggestions) {
    return class MentionSuggestions extends React.Component<any, any> {
        private _suggester = new SuggestionsClient(appInfo.addresses.getMentionSuggestionsApi());

        private _hasUnmounted = false;

        public state = {
            suggestions: fromJS([])
        };

        render() {
            return (
                <PluginMentionSuggestions
                    onSearchChange={this._onSuggestionsUpdateRequested.bind(this)}
                    suggestions={this.state.suggestions}
                />
            );
        }

        componentWillUnmount() {
            this._hasUnmounted = true;
        }

        private _onSuggestionsUpdateRequested({value}) {
            this._suggester.getSuggestions(value).then(suggestions => {
                if (this._hasUnmounted) {
                    return;
                }

                const pluginSuggestions = fromJS(
                    suggestions.map(suggestion => this._suggestionToPluginFormat(suggestion))
                );

                this.setState({suggestions: pluginSuggestions});
            });
        }

        private _suggestionToPluginFormat(suggestion: ISearchSuggestionResult) {
            return {
                name: suggestion.title,
                type: suggestion.type,
                id: suggestion.id,
                link: suggestion.routePath
            }
        }
    }
}

var mentions = fromJS([
    {
        name: 'Matthew Russell',
        type: 'topic',
        id: 1
    },
    {
        name: 'Julian Krispel-Samsel',
        type: 'topic',
        id: 2
    },
    {
        name: 'Jyoti Puri',
        type: 'topic',
        id: 3
    },
    {
        name: 'Max Stoiber',
        type: 'topic',
        id: 4
    },
    {
        name: 'Nik Graf',
        type: 'topic',
        id: 5
    },
    {
        name: 'Pascal Brandt',
        type: 'topic',
        id: 6
    },
]);
