export interface ISchemaType {
    schema: {};
}


export default class ReviewSchema implements ISchemaType {
    schema = {
        "name": {
            itemProp: "name"
        },
        "rating-value": {
            itemProp: "ratingValue"
        },
        "review-count": {
            itemProp: "ratingCount"
        },
        "aggregate-rating":
        {
            itemProp: "aggregateRating",
            itemScope: null,
            itemType: "http://schema.org/AggregateRating"
        }
    }
}