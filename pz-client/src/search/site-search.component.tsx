import * as React from 'react';
import {Component} from 'react';
import SuggestionsClient from 'pz-client/src/search/suggestions-client';
import {Link, withRouter} from 'react-router';
import {ISuggestionResult} from 'pz-server/src/search/suggestion-results';
import classNames from 'classnames';

var Autosuggest = require('react-autosuggest');

const searchClasses = {
    container:                   'container',
    containerOpen:               'container-open',
    input:                       'search-input',
    suggestionsContainer:        'suggestions-container',
    suggestionsList:             'suggestions-list',
    suggestion:                  'suggestion',
    suggestionFocused:           'suggestion-focused',
    sectionContainer:            'section-container',
    sectionTitle:                'section-title',
};

export interface ISiteSearchProps {
    router: {
        push(location)
    }
}

class SiteSearch extends Component<ISiteSearchProps, any> {
    search: SuggestionsClient;

    static propTypes = {
        router: React.PropTypes.object.isRequired
    };

    context: any;
    static contextTypes = {
        // TODO: This is a temporary hack to get the router location object
        // TODO: It is a deprecated method and will be fixed with v3.0 withRouter HOC
        // TODO: See https://github.com/reactjs/react-router/pull/3444
        location: React.PropTypes.object
    };

    private _hasUnmounted = false;

    constructor() {
        super();

        this.search = new SuggestionsClient();

        this.state = {
            value: '',
            suggestions: [],
            hasFocus: false
        };
    }

    render() {
        const { value, suggestions } = this.state;

        const inputProps = {
            placeholder: 'Find product reviews',
            value,
            onChange: this._updateValue.bind(this),
            onFocus: this._onFocus.bind(this),
            onBlur: this._offFocus.bind(this)
        };

        const classes = classNames('site-search', {
            'site-search-has-focus': this.state.hasFocus,
            'site-search-has-input': value && value.length,
            'site-search-has-suggestions': suggestions.length
        });

        return (
            <div className={classes}>
                <div className="search-input-container">
                    <i className="search-input-icon" />

                    <Autosuggest
                        suggestions={suggestions}
                        inputProps={inputProps}
                        onSuggestionsFetchRequested={this._onSuggestionsUpdateRequested.bind(this)}
                        onSuggestionsClearRequested={this._onSuggestionsClearRequested.bind(this)}
                        getSuggestionValue={this._getSuggestionValue.bind(this)}
                        renderSuggestion={this._renderSuggestion.bind(this)}
                        onSuggestionSelected={this._goToSuggestion.bind(this)}
                        focusInputOnSuggestionClick={false}
                        theme={searchClasses}
                    />
                </div>
            </div>
        );
    }

    componentDidMount() {
        this.setState({
            value: this._getLastSelectedSuggestionValue()
        });
    }

    componentWillUnmount() {
        this._hasUnmounted = true;
    }

    private _updateValue(_, { newValue }) {
        this.setState({
            value: newValue
        });
    }

    private _onSuggestionsUpdateRequested({ value }) {
        this.search.getSuggestions(value).then(suggestions => {
            if (this._hasUnmounted) {
                return;
            }

            this.setState({suggestions});
        });
    }

    private _onSuggestionsClearRequested() {
        if (this._hasUnmounted) {
            return;
        }

        this.setState({suggestions: []});
    }

    private _getSuggestionValue(suggestion) {
        return suggestion.title;
    }

    private _getLastSelectedSuggestionValue() {
        const location = this.context && this.context.location;

        if (!location || !location.state || !location.state._appSiteSearchSuggestion) {
            return '';
        }

        return location.state._appSiteSearchSuggestion.title || '';
    }

    private _renderSuggestion(suggestion: ISuggestionResult) {
        return (
            <span className="suggestion-link">
                {suggestion.title}
            </span>
        );
    }

    private _goToSuggestion(_, { suggestion }) {
        this.props.router.push({
            pathname: suggestion.routePath,
            state: {_appSiteSearchSuggestion: suggestion}
        });
    }

    private _onFocus() {
        this.setState({hasFocus: true});
    }

    private _offFocus() {
        this.setState({hasFocus: false});
    }
}

export default withRouter(SiteSearch);
