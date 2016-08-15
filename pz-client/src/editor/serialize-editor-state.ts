import {convertToRaw} from 'draft-js';
import EditorState = Draft.Model.ImmutableData.EditorState;

export default function serializeEditorState(editorState: EditorState) {
    return {
        type: 'draftjs',
        version: '0.8.0',
        isJson: true,
        value: JSON.stringify(convertToRaw(editorState.getCurrentContent()))
    }
}
