import * as React from 'react';
import {Editor, EditorState, ContentState} from 'draft-js';
import classNames from 'classnames';
import createSingleLinePlugin from 'draft-js-single-line-plugin';

var DraftJsEditor = require('draft-js-plugins-editor').default;

interface IProps {
    initialValue?: string
    onChange?: (value: string) => any
    placeholder?: string
    onOverflow?: (truncatedWord: string) => any
    onFocus?: () => any
    onBlur?: () => any
    className?: string
}

const maxLength = 140;

export default class SummaryEditor extends React.Component<IProps, any> {
    render() {
        const classes = classNames('summary-editor', this.props.className);

        return (
            <div className={classes}>
                <DraftJsEditor
                    editorState={this.state.editorState}
                    onChange={this._updateEditorState.bind(this)}
                    spellCheck={true}
                    placeholder={this.props.placeholder}
                    stripPastedStyles={true}
                    onFocus={this.props.onFocus}
                    onBlur={this.props.onBlur}
                    plugins={this._editorPlugins}
                    readOnly={this.state.debounceEditing}
                />
            </div>
        );
    }

    _editorPlugins: Array<any>;
    _debounceEditingTimeout = null;

    constructor(props: IProps, state) {
        super(props, state);

        this.state = {
            editorState: this._createEditorStateFromText(props.initialValue),
            debounceEditing: false
        };

        this._editorPlugins = [
            createSingleLinePlugin()
        ];
    }

    componentWillUnmount() {
        if (this._debounceEditingTimeout) {
            clearTimeout(this._debounceEditingTimeout);
        }
    }

    private _createEditorStateFromText(text: string | null) {
        if (!text) {
            return EditorState.createEmpty();
        }

        const contentState = ContentState.createFromText(text);
        const textualEditorState = EditorState.createWithContent(contentState);
        const editorStateCursorAtEnd = EditorState.moveFocusToEnd(textualEditorState);

        return editorStateCursorAtEnd;
    }

    private _updateEditorState(editorState) {
        const {
            truncatedEditorState,
            truncatedText,
            overflowedText
        } = this._truncateEditorState(editorState);

        this.setState({editorState: truncatedEditorState});

        if (this.props.onChange) {
            this.props.onChange(truncatedText);
        }

        if (overflowedText) {
            // This is kind of a hack to prevent the last entered character from
            // being added when the last word is trimmed out
            this.setState({debounceEditing: true});

            if (this.props.onOverflow) {
                this.props.onOverflow(overflowedText);
            }
        }

        this._debounceEditingTimeout = setTimeout(() => {
            this.setState({debounceEditing: false})
        }, 50);
    }

    private _truncateEditorState(editorState):
        {truncatedEditorState: EditorState, truncatedText: string, overflowedText: string} {

        const fullText = editorState.getCurrentContent().getPlainText(' ');

        if (fullText.length <= maxLength) {
            return {
                truncatedEditorState: editorState,
                truncatedText: fullText,
                overflowedText: null
            };
        }

        const {truncatedText, overflowedText} = this._truncateTextAtLastWord(
            fullText, maxLength
        );

        const truncatedEditorState = this._createEditorStateFromText(truncatedText);

        return {
            truncatedEditorState,
            truncatedText,
            overflowedText
        };
    }

    // http://stackoverflow.com/a/5454303/786810
    private _truncateTextAtLastWord(text, maxLength): {truncatedText: string, overflowedText: string} {
        //trim the string to the maximum length
        const truncatedToChar = text.substr(0, maxLength);

        const truncateStart = Math.min(truncatedToChar.length, truncatedToChar.lastIndexOf(' '));

        //re-trim if we are in the middle of a word
        const truncatedToWord = truncatedToChar.substr(0, truncateStart);

        const overflowedText = text.substring(truncateStart).trim();

        if (!truncatedToWord.length) {
            // Fall back to basic truncation
            return {
                truncatedText: text.substring(0, maxLength),
                overflowedText: text.substring(maxLength)
            };
        }

        return {truncatedText: truncatedToWord, overflowedText};
    }
}
