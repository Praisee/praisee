import {IAppRepositoryAuthorizers} from 'pz-server/src/app/repositories';
import * as graphqlRelay from 'graphql-relay';
import * as graphql from 'graphql';
import {ITypes} from 'pz-server/src/graphql/types';
import ExtendableError from 'pz-server/src/support/extendable-error';

var {
    GraphQLBoolean,
    GraphQLID,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLInputObjectType,
    GraphQLSchema,
    GraphQLString,
    GraphQLUnionType,
    GraphQLInterfaceType
} = graphql;

var {
    connectionDefinitions,
    fromGlobalId,
    nodeDefinitions,
    connectionArgs,
    globalId,
    connectionFromArray,
    connectionFromPromisedArray,
    globalIdField,
    mutationWithClientMutationId
} = graphqlRelay;

export function getResponseErrorTypes(repositoryAuthorizers: IAppRepositoryAuthorizers, nodeInterface, types: ITypes) {
    const topicsAuthorizer = repositoryAuthorizers.topics;

    const ResponseErrorInterfaceType = new GraphQLInterfaceType({
        name: 'ResponseErrorInterfaceType',

        fields: () => ({
            id: {
                type: new GraphQLNonNull(GraphQLID)
            },

            message: {
                type: new GraphQLNonNull(GraphQLString)
            }
        }),

        resolveType: interfaceTypeResolver
    });

    const responseErrorTypeTuples = [
        defineErrorType(
            'NotAuthenticated',
            () => ({})
        ),

        defineErrorType(
            'NotOwner',
            () => ({})
        ),

        defineErrorType(
            'InvalidInput',

            () => ({
                elementName: {
                    type: GraphQLString,
                    resolve: async ({name}) => name
                }
            })
        ),

        defineErrorType(
            'OffensiveInput',

            () => ({
                elementName: {
                    type: GraphQLString,
                    resolve: async ({name}) => name
                }
            })
        ),

        defineErrorType(
            'NotFound',
            () => ({})
        ),

        defineErrorType(
            'BadRequest',
            () => ({})
        ),
    ];

    function defineErrorType(errorType: string, valueFields: () => ({})) {
        return ([
            errorType,

            new GraphQLObjectType({
                name: errorType + 'ResponseError',

                fields: () => {
                    return Object.assign({
                        id: globalIdField(errorType + 'ResponseError'),

                        message: {
                            type: new GraphQLNonNull(GraphQLString),
                        },

                    }, valueFields());
                },

                interfaces: [nodeInterface, ResponseErrorInterfaceType]
            })
        ]);
    }

    //Assigns the elements of the array to an object using the responseErrorType as the map keys
    const responseErrorTypeMap = (responseErrorTypeTuples
        .reduce((responseErrorTypeMap, [responseErrorType, graphqlType]) => {
            responseErrorTypeMap[responseErrorType] = graphqlType;
            return responseErrorTypeMap;
        }, {})
    );

    function interfaceTypeResolver(responseError) {
        return responseErrorTypeMap[responseError.responseErrorType];
    }

    return {
        ResponseErrorInterfaceType,
        responseErrorTypes: responseErrorTypeMap
    };
}

export function addErrorToResponse(responseErrors, errorType: string, errorData: any) {
    let responseError = Object.assign({}, errorData, {
        responseErrorType: errorType,
        message: errorData.message
    });
    responseErrors.push(responseError);
}

/*
{
    responseErrors: [
        {
            type: 'NotAuthenticatedResponseError',
            message: 'You need to be logged in to do that'
        },
        {
            type: 'ValidationError',
            message: 'You need to provide a summary',
            elementName: 'summary'
        },
        {
            type: 'ValidationError',
            message: 'You need to provide a body',
            elementName: 'summary'
        },
    ]
}
*/
