import * as React from 'react';
import {Component} from 'react';
import SearchClient from 'pz-client/src/search/search-client';
import {Link, withRouter} from 'react-router';
import {ISearchSuggestionResult} from 'pz-server/src/search/search-results';

var Autosuggest = require('react-autosuggest');

const searchClasses = {
    container:                   'container',
    containerOpen:               'container-open',
    input:                       'search-input',
    suggestionsContainer:        'suggestions-container',
    suggestion:                  'suggestion',
    suggestionFocused:           'suggestion-focused',
    sectionContainer:            'section-container',
    sectionTitle:                'section-title',
    sectionSuggestionsContainer: 'section-suggestions-container'
};

export interface ISiteSearchProps {
    router: {
        push(location)
    }
}

class SiteSearch extends Component<ISiteSearchProps, any> {
    search: SearchClient;
    
    static propTypes = {
        router: React.PropTypes.object.isRequired
    };

    constructor() {
        super();

        this.search = new SearchClient();

        this.state = {
            value: '',
            suggestions: []
        };
    }

    render() {
        const { value, suggestions } = this.state;

        const inputProps = {
            placeholder: 'What are you looking for?',
            value,
            onChange: this._updateValue.bind(this)
        };

        return (
            <div className="site-search">
                <Autosuggest
                    suggestions={suggestions}
                    inputProps={inputProps}
                    onSuggestionsUpdateRequested={this._onSuggestionsUpdateRequested.bind(this)}
                    getSuggestionValue={this._getSuggestionValue.bind(this)}
                    renderSuggestion={this._renderSuggestion.bind(this)}
                    onSuggestionSelected={this._goToSuggestion.bind(this)}
                    focusInputOnSuggestionClick={false}
                    theme={searchClasses}
                />
            </div>
        );
    }

    _updateValue(_, { newValue }) {
        this.setState({
            value: newValue
        });
    }

    _onSuggestionsUpdateRequested({ value }) {
        this.search.getSuggestions(value).then(suggestions => {
            this.setState({suggestions});
        });
    }

    _getSuggestionValue(suggestion) {
        return suggestion.title;
    }

    _renderSuggestion(suggestion: ISearchSuggestionResult) {
        return (
            <Link to={suggestion.routePath} className="suggestion-link">
                {suggestion.title}
            </Link>
        );
    }
    
    _goToSuggestion(_, { suggestion }) {
        this.props.router.push(suggestion.routePath);
    }
}

export default withRouter(SiteSearch);
