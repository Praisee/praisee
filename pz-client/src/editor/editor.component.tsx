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
    onBlur?: () => {}
    onFocus?: () => {}
}

export default class Editor extends React.Component<IProps, any> {
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
        this.refs.editor.focus();
    }

    render() {
        const classes = classNames('editor', this.props.className);
        const editorState = this.props.editorState || this.state.editorState;
        const MentionSuggestions = this._MentionSuggestions;

        return (
            <div className={classes}>
                {this._renderContentMenu()}

                <div className="editor-area" onClick={this._closeContentMenu.bind(this)}>
                    <DraftJsEditor
                        ref="editor"
                        editorState={editorState}
                        handleKeyCommand={this._updateRichStylingFromCommand.bind(this) }
                        onChange={this._updateEditor.bind(this) }
                        onBlur={this._onBlur.bind(this)}
                        onFocus={this.props.onFocus}
                        placeholder={!this.state.isContentMenuOpen ? this.props.placeholder : ''}
                        plugins={this._editorPlugins}
                        readOnly={this.state.isReadOnly || this.state.isContentMenuOpen}
                    />

                    <MentionSuggestions />
                </div>
            </div>
        );
    }

    private _willContentMenuBeRequested = false;
    private _blurDebounce = null;

    state = {
        isContentMenuOpen: false,
        isReadOnly: false,
        editorState: null
    };

    refs: any;

    private _editorPlugins;
    private _MentionSuggestions;

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

    componentWillUnmount() {
        clearTimeout(this._blurDebounce);
    }

    private _renderContentMenu() {
        if (!this.props.contentMenuButtons) {
            return;
        }

        return (
            <ContentMenu
                isOpen={this.state.isContentMenuOpen}
                onOpenWillBeRequested={this._contentMenuWillBeRequested.bind(this)}
                onOpenRequested={this._openContentMenu.bind(this)}
                onCloseRequested={this._closeContentMenu.bind(this)}>

                {this.props.contentMenuButtons}
            </ContentMenu>
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

        this.state = Object.assign({}, initialState, this.state, {
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

    private _contentMenuWillBeRequested() {
        this._willContentMenuBeRequested = true;
        this.props.onFocus();
    }

    private _openContentMenu() {
        this.setState({isContentMenuOpen: true});
        this._willContentMenuBeRequested = false;
    }

    private _closeContentMenu() {
        this.setState({isContentMenuOpen: false});
        this._willContentMenuBeRequested = false;

        setTimeout(() => {
            this.focus();
        }, 0);
    }

    private _onBlur() {
        if (this._blurDebounce) {
            clearTimeout(this._blurDebounce);
        }

        setTimeout(() => {
            if (this.state.isContentMenuOpen || this._willContentMenuBeRequested) {
                return;
            }

            this.props.onBlur();
        }, 50);
    }
}
