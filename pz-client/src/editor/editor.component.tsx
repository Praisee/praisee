import * as React from 'react';

import {
    EditorState as DraftJsEditorState,
    RichUtils,
    convertFromRaw
} from 'draft-js';

import createMentionPlugin from 'pz-client/src/editor/mention-plugin/create-mention-plugin';
import createDecoratorFromPlugins from 'pz-client/src/editor/create-decorator-from-plugins';

var DraftJsEditor = require('draft-js-plugins-editor').default;
var createToolbarPlugin = require('draft-js-toolbar-plugin').default;
var createLinkifyPlugin = require('draft-js-linkify-plugin').default;

export interface IProps {
    placeholder?: any
    initialRawContentState?: any
    onChange?: (editorState) => {}
    onBlur?: (blurEvent) => {}
    onFocus?: (focusEvent) => {}
}

export default class Editor extends React.Component<IProps, any> {
    private _editorPlugins;
    private _MentionSuggestions;
    private _ctrls: {
            editor?: HTMLInputElement;
        } = {};

    constructor(props, state) {
        super(props, state);
        const mentionPlugin = createMentionPlugin();

        this._MentionSuggestions = mentionPlugin.MentionSuggestions;

        this._editorPlugins = [
            createToolbarPlugin({ clearTextActions: true }),
            createLinkifyPlugin({ target: 'noopener noreferrer' }),
            mentionPlugin
        ];

        let editorState;

        if (this.props.initialRawContentState) {
            const contentState = convertFromRaw(this.props.initialRawContentState);
            editorState = DraftJsEditorState.createWithContent(
                contentState,
                createDecoratorFromPlugins(this._editorPlugins)
            );

        } else {

            editorState = DraftJsEditorState.createEmpty()
        }

        this.state = {
            editorState
        };
    }

    render() {
        const {editorState} = this.state;
        const MentionSuggestions = this._MentionSuggestions;

        return (
            <div className="editor-area">
                <DraftJsEditor
                    editorState={editorState}
                    handleKeyCommand={this._updateRichStylingFromCommand.bind(this) }
                    onChange={this._updateEditor.bind(this) }
                    onBlur={this._onBlur.bind(this) }
                    onFocus={this._onFocus.bind(this) }
                    placeholder={this.props.placeholder}
                    plugins={this._editorPlugins}
                    ref={(editor) => this._ctrls.editor = editor}
                    />

                <MentionSuggestions />
            </div>
        );
    }

    private _onBlur(event) {
        if(this.props.onBlur)
            this.props.onBlur(event);
    }

    private _onFocus(event) {
        if(this.props.onFocus)
            this.props.onFocus(event);
    }
    
    public focus() {
        this._ctrls.editor.focus();
    }

    private _updateEditor(editorState) {
        this.setState({ editorState });

        if (this.props.onChange) {
            this.props.onChange(editorState);
        }
    }

    private _updateRichStylingFromCommand(command) {
        const newState = RichUtils.handleKeyCommand(this.state.editorState, command);

        if (newState) {
            this._updateEditor(newState);
            return true;
        }

        return false;
    }
}
