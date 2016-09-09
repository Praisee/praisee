import {IAppRepositoryAuthorizers} from 'pz-server/src/app/repositories';
import {ITypes} from 'pz-server/src/graphql/types';
import convertTextToData from 'pz-server/src/content/text-to-data-converter';
import * as graphql from 'graphql';

var {
    GraphQLBoolean,
    GraphQLNonNull,
    GraphQLInputObjectType,
    GraphQLString
} = graphql;

export default function CommunityItemTypes(repositoryAuthorizers: IAppRepositoryAuthorizers, nodeInterface, types: ITypes) {
    const InputContentDataType = new GraphQLInputObjectType({
        name: 'InputContentData',

        fields: {
            type: { type: new GraphQLNonNull(GraphQLString) },
            version: { type: new GraphQLNonNull(GraphQLString) },
            value: { type: new GraphQLNonNull(GraphQLString) },
            isJson: { type: GraphQLBoolean, defaultValue: false }
        }
    });

    return {
        InputContentDataType
    };
}

export type TInputContentData = string | {
    type: string
    version: string
    isJson: boolean
    value: any
}

export const parseInputContentData = (inputContentData: TInputContentData) => {
    if (typeof inputContentData === 'string') {
        return convertTextToData(inputContentData);

    } else {

        return {
            type: inputContentData.type,
            version: inputContentData.version,
            value: inputContentData.isJson ?
                JSON.parse(inputContentData.value) : inputContentData.value,
        };
    }
};