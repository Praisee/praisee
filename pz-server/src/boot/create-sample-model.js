var async = require('async');
module.exports = function(app) {
    //data sources
    var postgres = app.dataSources["heroku-postgres"];

    //create all models
    async.parallel({
        reviewers: async.apply(createReviewers),
        products: async.apply(createProducts),
    }, function(err, results) {
        if (err) throw err;
        createReviews(results.reviewers, results.products, function(err, reviews) {
            if (err) throw err;
            createVotes(reviews, results.reviewers, (err) => {
                if (err) throw err;
                console.log('> models created sucessfully');
            });
        });
    });

    //create reviewers
    function createReviewers(cb) {
        postgres.automigrate('Reviewer', function(err) {
            if (err) return cb(err);
            var Reviewer = app.models.Reviewer;
            Reviewer.create([
                { email: 'foo@bar.com', password: 'foobar' },
                { email: 'john@doe.com', password: 'johndoe' },
                { email: 'jane@doe.com', password: 'janedoe' }
            ], cb);
        });
    }

    //create products
    function createProducts(cb) {
        postgres.automigrate('Product', function(err) {
            if (err) return cb(err);
            var Product = app.models.Product;
            Product.create([
                { name: 'Power Drill', brand: "Milwaukee", upc: "9-8765-432-1", category: "power tools" },
                { name: 'Note 5', brand: "Samsung", upc: '0-1234-5678-9', category: "mobile phones" },
                { name: 'G110', brand: "Logitech", upc: '0-1478-5236-9', category: "keyboards" },
            ], cb);
        });
    }

    //create reviews
    function createReviews(reviewers, products, cb) {
        postgres.automigrate('Review', function(err) {
            if (err) return cb(err);
            var Review = app.models.Review;
            var DAY_IN_MILLISECONDS = 1000 * 60 * 60 * 24;
            Review.create([
                {
                    date: Date.now() - (DAY_IN_MILLISECONDS * 4),
                    rating: 5,
                    content: 'Best drill evarrr',
                    reviewerId: reviewers[0].id,
                    productId: products[0].id
                },
                {
                    date: Date.now() - (DAY_IN_MILLISECONDS * 3),
                    rating: 5,
                    content: 'My wife and I have quite enjoyed this powered drill.',
                    reviewerId: reviewers[1].id,
                    productId: products[0].id,
                },
                {
                    date: Date.now() - (DAY_IN_MILLISECONDS * 2),
                    rating: 4,
                    content: 'Good phone but where is my SD card slot?!',
                    reviewerId: reviewers[1].id,
                    productId: products[1].id,
                },
                {
                    date: Date.now() - (DAY_IN_MILLISECONDS),
                    rating: 4,
                    content: 'Go hard or go home! This keyboard r0x',
                    reviewerId: reviewers[2].id,
                    productId: products[2].id,
                }
            ], cb);
        });
    }

    function createVotes(reviews, reviewers, cb) {
        postgres.automigrate('Vote', function(err) {
            if (err) return cb(err);
            var Vote = app.models.Vote;
            Vote.create([
                {
                    upVote: false,
                    reviewId: reviews[0].id,
                    reviewerId: reviewers[1].id
                },
                {
                    upVote: false,
                    reviewId: reviews[0].id,
                    reviewerId: reviewers[2].id
                },
                {
                    upVote: true,
                    reviewId: reviews[1].id,
                    reviewerId: reviewers[1].id
                },
                {
                    upVote: true,
                    reviewId: reviews[1].id,
                    reviewerId: reviewers[2].id
                },
                {
                    upVote: true,
                    reviewId: reviews[2].id,
                    reviewerId: reviewers[0].id
                },
                {
                    upVote: false,
                    reviewId: reviews[2].id,
                    reviewerId: reviewers[1].id
                }
            ], cb);
        });

    }
};