import * as React from 'react';
import handleClick from 'pz-client/src/support/handle-click';
import classNames from 'classnames';

export interface IProps {
    rating: number | null
    onChange?: (rating: number) => any
}

export default class EditRating extends React.Component<IProps, any> {
    render() {
        const rating = this.props.rating;
        const preselectedRating = this.state.preselectedRating;

        const classes = classNames('edit-rating', {
            'edit-rating-blank': !rating,
            [`rating-${this._ratingToClassName(rating)}-stars`]: rating,
            'edit-rating-preselected': preselectedRating,
            [`edit-rating-preselected-${this._ratingToClassName(preselectedRating)}-stars`]: preselectedRating
        });

        return (
            <div className={classes}>
                {this._renderRatingButton(1)}
                {this._renderRatingButton(2)}
                {this._renderRatingButton(3)}
                {this._renderRatingButton(4)}
                {this._renderRatingButton(5)}
            </div>
        );
    }

    state = {
        preselectedRating: null
    };

    _renderRatingButton(rating: number) {
        const createStarButton = (rating: number) => {
            const classes = classNames(
                'edit-rating-star',
                'rating-star',
                `rating-star-${this._ratingToClassName(rating)}`
            );

            return (
                <button
                    className={classes}
                    onClick={handleClick(() => this._onChangeRating(rating))}
                    onMouseOver={() => this._preselectRating(rating)}
                    onMouseOut={() => this._preselectRating(null)}
                />
            );
        };

        let halfStarButton;

        if (rating > 1) {
            const previousStar = rating - 1;
            halfStarButton = createStarButton(previousStar + 0.5);
        }

        const fullStarButton = createStarButton(rating);

        return (
            <span className="rating-star-group">
                {halfStarButton}
                {fullStarButton}
            </span>
        );
    }

    _onChangeRating(rating) {
        this.props.onChange && this.props.onChange(rating);
    }

    _preselectRating(rating) {
        this.setState({preselectedRating: rating});
    }

    _ratingToClassName(rating: number) {
        if (!rating) {
            return '';
        }

        return rating.toString().replace('.', '-');
    }
}
