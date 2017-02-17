import {RichUtils, EditorState, Modifier} from 'draft-js';

export default function createRemoveHeadingOnEnterPlugin() {
    return {
        handleReturn: (event, {getEditorState, setEditorState}) => {
            setTimeout(() => {
                const editorState = getEditorState();

                // This is hacked code copied from RichUtils.toggleBlockType

                var selection = editorState.getSelection();
                var startKey = selection.getStartKey();
                var endKey = selection.getEndKey();
                var content = editorState.getCurrentContent();
                var target = selection;

                // Triple-click can lead to a selection that includes offset 0 of the
                // following block. The `SelectionState` for this case is accurate, but
                // we should avoid toggling block type for the trailing block because it
                // is a confusing interaction.
                if (startKey !== endKey && selection.getEndOffset() === 0) {
                    var blockBefore = content.getBlockBefore(endKey);
                    if (!blockBefore) {
                        throw new Error('blockBefore must be defined');
                    }

                    endKey = blockBefore.getKey();
                    target = target.merge({
                        anchorKey: startKey,
                        anchorOffset: selection.getStartOffset(),
                        focusKey: endKey,
                        focusOffset: blockBefore.getLength(),
                        isBackward: false,
                    });
                }

                var hasAtomicBlock = content.getBlockMap()
                    .skipWhile((_, k) => k !== startKey)
                    .reverse()
                    .skipWhile((_, k) => k !== endKey)
                    .some(v => v.getType() === 'atomic');

                if (hasAtomicBlock) {
                    return editorState;
                }

                const currentBlockType = content.getBlockForKey(startKey).getType();
                const typeToSet = currentBlockType.startsWith('header') ?
                    'unstyled' : currentBlockType;

                const newEditorState = EditorState.push(
                    editorState,
                    Modifier.setBlockType(content, target, typeToSet),
                    'change-block-type'
                );

                setEditorState(newEditorState);
            });
        }
    };
}
