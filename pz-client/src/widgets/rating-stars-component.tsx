import * as React from 'react';
import classNames from 'classnames';

interface IProps {
    rating: number
}

export default class RatingStars extends React.Component<IProps, any> {
    render() {
        const roundedRating = Math.round(this.props.rating * 2) / 2;

        const reviewRatingClasses = classNames(
            'rating-stars',
            'rating-' + roundedRating.toString().replace('.', '-') + '-stars'
        );

        return (
            <span className={reviewRatingClasses}>
                <span className="rating-star rating-star-1" />
                <span className="rating-star rating-star-2" />
                <span className="rating-star rating-star-3" />
                <span className="rating-star rating-star-4" />
                <span className="rating-star rating-star-5" />
            </span>
        );
    }
}

