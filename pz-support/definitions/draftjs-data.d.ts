import RawDraftContentState = Draft.Model.Encoding.RawDraftContentState;

export interface IDraftjs08Data extends RawDraftContentState {}

// export interface IDraftjs08Data {
//     entityMap: {
//         [key: string]: IDraftjs08Entity
//     }
//
//     blocks: Array<IDraftjs08Block>
// }
//
// export interface IDraftjs08Entity {
//     type: string,
//     mutability: 'MUTABLE' | 'SEGMENTED' | 'IMMUTABLE'
//     data: any
// }
//
// export interface IDraftjs08Block {
//     key: string
//     text: string
//     type: string
//     depth: number
//     inlineStyleRanges: any
//     entityRanges: Array<IDraftjs08BlockEntityRange>
//     data: any
// }
//
// export interface IDraftjs08BlockEntityRange {
//     key: number
//     offset: number
//     length: number
// }
