// import Immutable from 'immutable';
//
// import {IDraftjs08BlockEntityRange} from 'pz-server/src/content/draftjs-data';
//
// export interface IEntityMapper {
//     (entity: Immutable.Map, entityKey: string): Promise<Immutable.Map>
// }
//
// export async function mapEntities(content: Immutable.Map, mapper: IEntityMapper): Promise<Immutable.Map> {
//     const entityMap = content.get('entityMap');
//
//     const promisedEntities = entityMap.entries.map(
//         async ([entityKey, entity]) => [entityKey, await mapper(entity, entityKey)]
//     );
//
//     const entities = await Promise.all(promisedEntities);
//
//     return content.set('entityMap', Immutable.Map(entities))
// }
//
// export interface ITextFromEntitiesMapper {
//     (textFragment: string, entity: Immutable.Map): Promise<string>
// }
//
// export async function mapTextFromEntities(content: Immutable.Map, mapper: ITextFromEntitiesMapper): Promise<Immutable.Map> {
//     // Looks like we'll probably need to use an AST since this gets complicated in
//     // a hurry when the text offsets change.
//
//     // Otherwise we'll have to update the offsets for each range we modify
//
//     // Perhaps Draft JS has some utility methods to make this easier.
//     // This seems possible with DraftJs' Modifier module
//
//     // const blocks = content.get('blocks');
//     //
//     // const promisedBlocks = blocks.flatMap((block) => {
//     //     return block.get('entryRanges').map((entryRange: IDraftjs08BlockEntityRange) => (
//     //         [block, ]
//     //     ));
//     // });
//
//     // return content.update('blocks', (blocks) => (
//     //     blocks.map((block) => {
//     //         let text = block.get('text');
//     //
//     //         const entityRanges = (block
//     //             .get('entityRanges')
//     //             .map((entityRange: IDraftjs08BlockEntityRange) => {
//     //             })
//     //         );
//     //
//     //         return block.merge({
//     //             text: block.get('text'),
//     //             entityRanges: block.get('entityRanges')
//     //         })
//     //     })
//     // ));
// }
//
// export function getEntityByKey(content: Immutable.Map, entityKey: string) {
//     return content.getIn(['entityMap', entityKey]);
// }
//
// function replaceStringBetween(string: string, start: number, end: number, substring: string) {
//     return string.substring(0, start) + substring + string.substring(end);
// }
