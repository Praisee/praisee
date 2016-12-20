import {EditorState, Modifier} from 'draft-js';

export default function prependText(editorState: EditorState, text: string) {
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();

    const textPrependedContentState = Modifier.insertText(
        contentState,
        selection,
        text
    );

    const textPrependedEditorState = EditorState.push(
        editorState,
        textPrependedContentState,
        'insert-characters'
    );

    return textPrependedEditorState;
}
