import query from 'pz-domain/src/query';
import promisify from 'pz-support/src/promisify';

export interface IReviewer extends IModel {
    reputation: Function
}

module.exports = function (Reviewer: IReviewer) {
    Reviewer.reputation = function (reviewerId: number, finish: ICallback) {
        promisify(Reviewer.findById, Reviewer)(reviewerId)
            .then((reviewer) => {
                if (!reviewer) {
                    throw new Error("Not found");
                }
        
                const votesQuery = `
                    SELECT SUM(
                        CASE
                            WHEN Vote.upVote = true THEN 1
                            ELSE -1
                        END
                    ) as reputation
                    FROM Reviewer
                    JOIN Review ON Reviewer.Id = Review.ReviewerId
                    JOIN Vote ON Review.Id = Vote.ReviewerId
                    WHERE Reviewer.id = $1
                `;
        
                return query(Reviewer, votesQuery, reviewerId);
            })
            .then((result: Array<any>) => {
                return Number(result.length ? result[0].reputation : 0);
            })
            
            .then(response => finish(null, response))
            .catch(error => finish(error))
        ;
    };
    
    Reviewer.remoteMethod(
        "reputation",
        {
            http: {path: "/:id/reputation", verb: "get"},
            accepts: {arg: "id", type: "number", required: true},
            returns: {arg: "reputation", type: "number"}
        }
    );
};
