import * as React from 'react';
import SuggestionsClient from 'pz-client/src/search/suggestions-client';
import {ISuggestionResult} from 'pz-server/src/search/suggestion-results';
import classNames from 'classnames';
import appInfo from 'pz-client/src/app/app-info';

var Autosuggest = require('react-autosuggest');

const searchClasses = {
    container:                   'container',
    containerOpen:               'container-open',
    input:                       'review-topic-selector-input',
    suggestionsContainer:        'suggestions-container',
    suggestionsList:             'suggestions-list',
    suggestion:                  'suggestion',
    suggestionFocused:           'suggestion-focused',
    sectionContainer:            'section-container',
    sectionTitle:                'section-title',
};

export interface IProps {
    initialValue?: string
    placeholder?: string
    onTopicSelected?: (serverId: number) => any
    onNewTopicSelected?: (topicName: string) => any
    autoFocus?: boolean
}

export default class ReviewTopicSelector extends React.Component<IProps, any> {
    search: SuggestionsClient;

    private _hasUnmounted = false;

    constructor(props, state) {
        super(props, state);

        this.search = new SuggestionsClient(appInfo.addresses.getReviewableTopicSuggestionsApi());

        this.state = {
            value: props.initialValue || '',
            suggestions: [],
            currentValueIsNotReviewable: false,
            hasFocus: false,
            shouldShowInput: props.autoFocus || false
        }
    }

    render() {
        const { value, suggestions } = this.state;

        const classes = classNames('review-topic-selector', {
            'review-topic-selector-has-focus': this.state.hasFocus,
            'review-topic-selector-has-input': value && value.length,
            'review-topic-selector-has-suggestions': suggestions.length
        });

        return (
            <div className={classes}>
                {this._renderCallToActionOrInput()}
            </div>
        );
    }

    private _renderCallToActionOrInput() {
        if (this.state.shouldShowInput) {
            return this._renderInput();
        }

        const showInput = () => this.setState({shouldShowInput: true});

        return (
            <button className="review-topic-selector-call-to-action"
                    onClick={showInput}>

                <i className="review-topic-selector-call-to-action-icon" />

                <span className="review-topic-selector-call-to-action-label">
                    Add your review
                </span>
            </button>
        );
    }

    private _renderInput() {
        const { value, suggestions } = this.state;

        const inputProps = {
            placeholder: this.props.placeholder || 'What product would you like to review?',
            value,
            onChange: this._updateValue.bind(this),
            onFocus: this._onFocus.bind(this),
            onBlur: this._onBlur.bind(this),
            autoFocus: true
        };

        return (
            <div className="review-topic-selector-container">
                <i className="review-topic-selector-icon" />

                <Autosuggest
                    suggestions={suggestions}
                    inputProps={inputProps}
                    onSuggestionsFetchRequested={this._getSuggestionsForValue.bind(this)}
                    onSuggestionsClearRequested={this._clearSuggestions.bind(this)}
                    getSuggestionValue={this._getSuggestionValue.bind(this)}
                    renderSuggestion={this._renderSuggestion.bind(this)}
                    onSuggestionSelected={this._onTopicSelected.bind(this)}
                    focusInputOnSuggestionClick={false}
                    focusFirstSuggestion={true}
                    theme={searchClasses}
                />
            </div>
        );
    }

    private _renderSuggestion(suggestion: any) {
        let title = suggestion.title;

        if (suggestion.isNewSuggestion) {
            title = `Add ${suggestion.value}`;
        }

        return (
            <span className="suggestion-link">
                {title}
            </span>
        );
    }

    componentWillUnmount() {
        this._hasUnmounted = true;
    }

    private _updateValue(_, {newValue}) {
        this.setState({
            value: newValue
        });
    }

    private _setSuggestions(currentValue, suggestions: Array<any>) {
        if (!currentValue) {
            this.setState({suggestions});
            return;
        }

        const indexOfValueInSuggestions = suggestions.findIndex(
            suggestion => suggestion.title.toLowerCase() === currentValue.toLowerCase()
        );

        if (indexOfValueInSuggestions !== -1) {
            const exactMatchSuggestion = suggestions[indexOfValueInSuggestions];

            if (exactMatchSuggestion.isCategory) {
                let suggestionsWithoutCategory = suggestions.slice();
                suggestionsWithoutCategory.splice(indexOfValueInSuggestions, 1);

                this.setState({suggestions: suggestionsWithoutCategory});

            } else {

                this.setState({suggestions});
            }

            return;
        }

        this.setState({
            suggestions: [
                ...suggestions,
                {isNewSuggestion: true, value: currentValue}
            ]
        });
    }

    private async _getSuggestionsForValue({value}) {
        const suggestions = await this.search.getSuggestions(value) || [];

        if (this._hasUnmounted) {
            return;
        }

        this._setSuggestions(value, suggestions);
    }

    private _clearSuggestions() {
        if (this._hasUnmounted) {
            return;
        }

        this._setSuggestions(this.state.value, []);
    }

    private _getSuggestionValue(suggestion) {
        return suggestion.isNewSuggestion ? suggestion.value : suggestion.title;
    }

    private _onFocus() {
        this.setState({hasFocus: true});
    }

    private _onBlur(_, {focusedSuggestion}) {
        this.setState({hasFocus: false});
    }

    private _onTopicSelected(_, {suggestion}) {
        if (suggestion.isNewSuggestion) {
            if (!this.props.onTopicSelected) {
                return;
            }

            this.props.onNewTopicSelected(suggestion.value);

        } else {

            if (!this.props.onTopicSelected) {
                return;
            }

            this.props.onTopicSelected(suggestion.id);
        }
    }
}
