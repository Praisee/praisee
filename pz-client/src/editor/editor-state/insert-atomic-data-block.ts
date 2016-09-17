/**
 * Allows for atomic blocks with arbitrary data.
 *
 * Based on source code from Megadraft:
 * https://raw.githubusercontent.com/globocom/megadraft/master/src/insertDataBlock.js
 */

import * as Immutable from 'immutable';

import {genKey, EditorState, ContentBlock, Modifier, BlockMapBuilder} from 'draft-js';

export default function insertAtomicDataBlock(editorState: EditorState, data: any): [EditorState, string] {
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();

    const afterRemoval = Modifier.removeRange(
        contentState,
        selectionState,
        'backward'
    );

    const targetSelection = afterRemoval.getSelectionAfter();
    const afterSplit = Modifier.splitBlock(afterRemoval, targetSelection);
    const insertionTarget = afterSplit.getSelectionAfter();

    const preparedContentState = Modifier.setBlockType(
        afterSplit,
        insertionTarget,
        'atomic'
    );

    const block = new ContentBlock({
        key: genKey(),
        type: 'atomic',
        text: '',
        characterList: Immutable.List(),
        data: Immutable.Map(data)
    });


    const fragmentArray = [
        block,
        new ContentBlock({
            key: genKey(),
            type: 'unstyled',
            text: '',
            characterList: Immutable.List()
        })
    ];

    const fragment = BlockMapBuilder.createFromArray(fragmentArray);

    const contentStateWithAtomicBlock = Modifier.replaceWithFragment(
        preparedContentState,
        insertionTarget,
        fragment
    );

    const contentStateWithSelection = contentStateWithAtomicBlock.merge({
        selectionBefore: selectionState,
        selectionAfter: contentStateWithAtomicBlock.getSelectionAfter().set('hasFocus', true)
    });

    return [
        EditorState.push(editorState, contentStateWithSelection as any, 'insert-fragment'),
        insertionTarget.getStartKey()
    ];
}
