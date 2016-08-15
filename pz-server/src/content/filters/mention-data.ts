import {ITopics, ITopic} from 'pz-server/src/topics/topics';
import {ICommunityItems, ICommunityItem} from 'pz-server/src/community-items/community-items';

import {IDraftjs08Data} from 'pz-server/src/content/draftjs-data';

import * as Immutable from 'immutable';
import {IVanityRoutePaths} from 'pz-server/src/vanity-route-paths/vanity-route-paths';

export async function updateMentionData(
        content: IDraftjs08Data,
        routePaths: IVanityRoutePaths,
        topics: ITopics,
        communityItems: ICommunityItems
    ): Promise<IDraftjs08Data> {

    //
    let entitiesToUpdate = new Map();
    let mentionedTopicIds = [];
    let mentionedCommunityItemIds = [];

    let entityMap = Immutable.fromJS(content.entityMap);

    entityMap.forEach((entity, entityKey) => {
        if (entity.get('type') !== 'mention') {
            return;
        }

        const entityData = entity.getIn(['data', 'mention']).toJS();

        entitiesToUpdate.set(entityKey, entityData);

        const mentionedType = entityData.type;
        const mentionedId = entityData.id;

        if (mentionedType === 'topic') {
            mentionedTopicIds.push(mentionedId);
        } else if (mentionedType === 'communityItem') {
            mentionedCommunityItemIds.push(mentionedId);
        }
    });

    if (!entitiesToUpdate.size) {
        return content;
    }

    const mentionedTopics = mentionedTopicIds.length ?
        await topics.findAllByIds(mentionedTopicIds) : [];

    const mentionedCommunityItems = mentionedCommunityItemIds.length ?
        await communityItems.findAllByIds(mentionedCommunityItemIds): [];

    let mentionedRecords = [...mentionedTopics, ...mentionedCommunityItems];

    const recordRoutePaths = await routePaths.findAllTuplesByRecords(mentionedRecords);

    let mentionedTopicMap = new Map();
    let mentionedCommunityItemMap = new Map();

    mentionedTopics.forEach(mentionedTopic => {
        mentionedTopicMap.set(mentionedTopic.id, {
            record: mentionedTopic
        })
    });

    mentionedCommunityItems.forEach(mentionedCommunityItem => {
        mentionedCommunityItemMap.set(mentionedCommunityItem.id, {
            record: mentionedCommunityItem
        })
    });

    recordRoutePaths.forEach(([record, routePathRecord]) => {
        const routePath = routePathRecord.routePath;

        if (record.recordType === 'Topic') {
            const data = mentionedTopicMap.get(record.id);

            mentionedTopicMap.set(
                record.id,
                Object.assign({}, data, {routePath})
            );

        } else if (record.recordType === 'CommunityItem') {

            const data = mentionedCommunityItemMap.get(record.id);

            mentionedCommunityItemMap.set(
                record.id,
                Object.assign({}, data, {routePath})
            );
        }
    });

    entitiesToUpdate.forEach((entityData, entityKey) => {
        const mentionedType = entityData.type;
        const mentionedId = entityData.id;

        if (mentionedType === 'topic' && mentionedTopicMap.has(mentionedId)) {
            const {record, routePath} = mentionedTopicMap.get(mentionedId);

            entityMap = entityMap.mergeIn([entityKey, 'data', 'mention'], {
                name: record.name,
                link: routePath
            })

        } else if (mentionedType === 'communityItem' && mentionedCommunityItemMap.has(mentionedId)) {
            const {record, routePath} = mentionedCommunityItemMap.get(mentionedId);

            entityMap = entityMap.mergeIn([entityKey, 'data', 'mention'], {
                name: record.summary,
                link: routePath
            })

        } else {

            entityMap = entityMap.remove(entityKey);
        }
    });

    return Object.assign({}, content, {
        entityMap: entityMap.toJS()
    });
}

export function cleanMentionData(content: IDraftjs08Data): IDraftjs08Data {
    let entityMap = Immutable.fromJS(content.entityMap);

    entityMap = entityMap.map((entity) => {
        if (entity.get('type') !== 'mention') {
            return entity;
        }

        return Immutable.Map({
            type: entity.get('type'),

            mutability: 'IMMUTABLE',

            data: Immutable.fromJS({
                mention: {
                    id: entity.getIn(['data', 'mention', 'id']),
                    type: entity.getIn(['data', 'mention', 'type'])
                }
            })
        });
    });

    return Object.assign({}, content, {
        entityMap: entityMap.toJS()
    });
}
