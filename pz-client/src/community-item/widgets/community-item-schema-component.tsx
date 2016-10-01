import * as React from 'react';
import * as Relay from 'react-relay';
import renderJsonLdSchema from 'pz-client/src/support/render-json-ld-schema';

export interface IProps {
    communityItem: {
        id: number
        __typename: string
        user: { displayName: string }
        summary: string
        body: string
        createdAt: Date
        commentCount: number
        comments: any
        topics: Array<{ id: string, name: string, routePath: string }>
        routePath: string

        reviewedTopic: {
            name
        }

        reviewRating
    }
}

class CommunityItemSchema extends React.Component<IProps, any> {
    render() {
        const communityItem = this.props.communityItem;

        if (communityItem.__typename === 'ReviewCommunityItem') {
            return renderJsonLdSchema({
                '@context': 'http://schema.org',
                '@type': 'Review',
                'itemReviewed': communityItem.reviewedTopic.name,
                'author': communityItem.user.displayName,
                'datePublished': communityItem.createdAt,
                'name': communityItem.summary,
                'reviewBody': communityItem.body,
                'reviewRating': {
                    '@type': 'Rating',
                    'ratingValue': communityItem.reviewRating
                }
            });

        } else {

            return (<span />)
        }
    }
}

export default Relay.createContainer(CommunityItemSchema, {
    fragments: {
        communityItem: () => Relay.QL`
            fragment on CommunityItemInterface {
                __typename
                createdAt
                summary
                body
                user {
                    displayName
                }
                
                ... on ReviewCommunityItem {
                    reviewedTopic {
                        name
                    }
                    
                    reviewRating
                }
            }
        `
    }
});
