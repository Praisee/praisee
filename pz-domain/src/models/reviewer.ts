exports = function(Reviewer) {
    Reviewer.reputation = function(reviewerId, cb) {
        Reviewer.findById(reviewerId, function(err, reviewer) {
            reviewer.reviews((err, reviews) => {
                reviews.forEach((r) => console.log(r));
                cb(null, reviews);
            });
        });
    };

    Reviewer.remoteMethod(
        "reputation",
        {
            http: { path: "/reputation", verb: "get" },
            accepts: { arg: "id", type: "number", http: { source: "query" } },
            returns: { arg: "reputation", type: "number" }
        }
    );
};
