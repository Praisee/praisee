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
            [`rating-${rating}-stars`]: rating,
            'edit-rating-preselected': preselectedRating,
            [`edit-rating-preselected-${preselectedRating}-stars`]: preselectedRating
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
        const classes = classNames('edit-rating-star', 'rating-star', `rating-star-${rating}`);

        return (
            <button
                className={classes}
                onClick={handleClick(() => this._onChangeRating(rating))}
                onMouseOver={() => this._preselectRating(rating)}
                onMouseOut={() => this._preselectRating(null)}
            />
        );
    }

    _onChangeRating(rating) {
        this.props.onChange && this.props.onChange(rating);
    }

    _preselectRating(rating) {
        this.setState({preselectedRating: rating});
    }
}
