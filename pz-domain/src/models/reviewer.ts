module.exports = function (Reviewer) {
    Reviewer.reputation = function (reviewerId, cb) {
        Reviewer.findById(reviewerId, function (err, reviewer) {
            if (err) { return console.log(err); }
            if (!reviewer) { return cb("Not found"); }

            const ds = Reviewer.dataSource;
            const votesQuery = `SELECT Vote.upVote FROM Reviewer
                                JOIN Review ON Reviewer.Id = Review.ReviewerId
                                JOIN Vote ON Review.Id = Vote.ReviewerId
                                WHERE Reviewer.id = ${reviewerId}`;

            ds.connector.execute(votesQuery, (err, result) => {
                if (err) { return console.error(err); }

                let reputation = 0;
                for (let vote of result) {
                    reputation += vote ? 1 : -1;
                }

                cb(err, reputation);
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
