module.exports = function (Reviewer) {
    Reviewer.reputation = function (reviewerId, cb) {
        Reviewer.findById(reviewerId, function (err, reviewer) {
            if (err) return console.log(err);
            if (!reviewer) return cb("Not found");

            var ds = Reviewer.dataSource;
            var votesQuery = `SELECT Vote.upVote FROM Reviewer
                            JOIN Review ON Reviewer.Id = Review.ReviewerId
                            JOIN Vote ON Review.Id = Vote.ReviewerId
                            WHERE Reviewer.id = ${reviewerId}`;

            ds.connector.execute(votesQuery, function (err, result) {
                if (err) console.error(err);

                var reputation = 0;
                for (var i = result.length; i--;) {
                    reputation += result[i] ? 1 : -1;
                }
                console.info(reputation);
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
