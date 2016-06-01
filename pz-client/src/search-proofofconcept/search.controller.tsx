import * as React from 'react';
import {Component} from 'react';
import SearchClient from 'pz-client/src/search-proofofconcept/search-client';

var Autosuggest = require('react-autosuggest');

export default class Search extends Component<any, any> {
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
            <Autosuggest suggestions={suggestions}
                         onSuggestionsUpdateRequested={this._onSuggestionsUpdateRequested.bind(this)}
                         getSuggestionValue={this._getSuggestionValue.bind(this)}
                         renderSuggestion={this._renderSuggestion.bind(this)}
                         inputProps={inputProps} />
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

    _renderSuggestion(suggestion) {
        return (
            <span>{suggestion.title}</span>
        );
    }
}
