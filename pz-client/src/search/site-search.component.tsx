import * as React from 'react';
import {Component} from 'react';
import SearchClient from 'pz-client/src/search/search-client';
import {Link} from 'react-router';
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

export default class SiteSearch extends Component<any, any> {
    search: SearchClient;
    
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
            onChange: this._onChange.bind(this)
        };

        return (
            <div className="site-search">
                <Autosuggest
                    suggestions={suggestions}
                    onSuggestionsUpdateRequested={this._onSuggestionsUpdateRequested.bind(this)}
                    getSuggestionValue={this._getSuggestionValue.bind(this)}
                    renderSuggestion={this._renderSuggestion.bind(this)}
                    inputProps={inputProps}
                    theme={searchClasses}
                />
            </div>
        );
    }

    _onChange(event, { newValue }) {
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
        return suggestion.name;
    }

    _renderSuggestion(suggestion: ISearchSuggestionResult) {
        return (
            <Link to={suggestion.routePath}>{suggestion.title}</Link>
        );
    }
}
