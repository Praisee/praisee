import * as React from 'react';

import {
    EditorState as DraftJsEditorState,
    RichUtils,
    convertFromRaw
} from 'draft-js';

import createMentionPlugin from 'pz-client/src/editor/mention-plugin/create-mention-plugin';
import createDecoratorFromPlugins from 'pz-client/src/editor/create-decorator-from-plugins';

import ContentMenu from 'pz-client/src/editor/content-menu/content-menu.component';

var classNames = require('classnames');

var DraftJsEditor = require('draft-js-plugins-editor').default;
var createToolbarPlugin = require('draft-js-toolbar-plugin').default;
var createLinkifyPlugin = require('draft-js-linkify-plugin').default;

export interface IProps {
    className?: string
    editorState?: any
    placeholder?: any
    initialRawContentState?: any
    plugins?: Array<any>
    contentMenuButtons?: any
    onChange?: (editorState) => {}
    onBlur?: (blurEvent) => {}
    onFocus?: (focusEvent) => {}
}

export default class Editor extends React.Component<IProps, any> {
    private _editorPlugins;
    private _MentionSuggestions;

    static propTypes = {
        editorState: React.PropTypes.object,
        placeholder: React.PropTypes.any,
        initialRawContentState: React.PropTypes.any,
        onChange: React.PropTypes.func,
        onBlur: React.PropTypes.func,
        plugins: React.PropTypes.array,
        ccontentMenuButtons: React.PropTypes.any
    };

    static defaultProps = {
        onChange: () => {},
        onBlur: () => {}
    };

    focus() {
        (this.refs as any).editor.focus();
    }

    constructor(props, state) {
        super(props, state);

        const mentionPlugin = createMentionPlugin();

        this._MentionSuggestions = mentionPlugin.MentionSuggestions;

        const additionalPlugins = props.plugins || [];

        this._editorPlugins = [
            createToolbarPlugin({ clearTextActions: true }),
            createLinkifyPlugin({ target: 'noopener noreferrer' }),
            mentionPlugin,
            ...additionalPlugins
        ];

        if (!props.editorState) {
            this._initializeEditorState(state);
        }
    }

    render() {
        const classes = classNames('editor', this.props.className);
        const editorState = this.props.editorState || this.state.editorState;
        const MentionSuggestions = this._MentionSuggestions;

        return (
            <div className={classes}>
                <ContentMenu>
                    {this.props.contentMenuButtons}
                </ContentMenu>

                <div className="editor-area">
                    <DraftJsEditor
                        ref="editor"
                        editorState={editorState}
                        handleKeyCommand={this._updateRichStylingFromCommand.bind(this) }
                        onChange={this._updateEditor.bind(this) }
                        onBlur={this.props.onBlur}
                        onFocus={this.props.onFocus}
                        placeholder={this.props.placeholder}
                        plugins={this._editorPlugins}
                    />

                    <MentionSuggestions />
                </div>
            </div>
        );
    }

    private _initializeEditorState(initialState) {
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

        this.state = Object.assign({}, initialState, {
            editorState
        });
    }

    private _updateEditor(editorState) {
        if (!this.props.editorState) {
            this.setState({ editorState });
        }

        this.props.onChange(editorState);
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
