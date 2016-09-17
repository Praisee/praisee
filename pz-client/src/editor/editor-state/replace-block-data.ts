// This is a hack to replace block data because DraftJS doesn't allow us to do this
// without going through EditorState and pushing an undo state.

import * as Immutable from 'immutable';
import {EditorState} from 'draft-js';

var EditorBidiService = require('draft-js/lib/EditorBidiService');

export default function replaceBlockData(editorState: EditorState, blockKey: string, data: any) {
    const block = editorState.getCurrentContent().getBlockForKey(blockKey);

    if (!block) {
        throw new Error('Unable to find editor block for key: ' + blockKey);
    }

    const replacedBlock = block.set('data', Immutable.Map(data));

    const contentState = editorState.getCurrentContent().setIn(['blockMap', blockKey], replacedBlock);

    const directionMap = EditorBidiService.getDirectionMap(
        contentState,
        editorState.getDirectionMap()
    );

    const newEditorState = EditorState.set(editorState, {
        currentContent: contentState,
        directionMap,
        lastChangeType: editorState.getLastChangeType(),
        selection: (contentState as any).getSelectionAfter(),
        forceSelection: false,
        inlineStyleOverride: null
    });

    return newEditorState;
}
