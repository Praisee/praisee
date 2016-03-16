module.exports = function(datasource) {
    var express = require('express');
    var router = express.Router();

    router.get('/', function(req, res) {
        datasource.getAll(function(error, results) {
            if (error) return res.status(500).send({ error: error });

            res.json(results);
        });
    });

    router.get('/:id', function(req, res) {
        datasource.getByID(req.params.id, function(error, results) {
            if (error) return res.status(500).send({ error: error });
            if (!results) return res.status(404).send({ error: "Item with ID " + req.params.id + " not found" });

            res.json(results);
        });
    });

    router.post('/', function(req, res, next) {
        if (!req.body.name)
            return res.status(400).send({ error: "Please atleast provide a 'name'" });

        datasource.create(req.body, function(error, results) {
            if (error) return res.status(500).send({ error: error });
            if (!results) return res.status(404).send({ error: "Could not create product" });

            res.json(results);
        });
    });

    router.put('/', function(req, res, next) {
        if (!req.params.id)
            return res.status(400).send({ error: "Please provide a product ID to update" });
    });

    router.put('/:id', function(req, res, next) {
        datasource.update(req.params.id, req.body, function(error, results) {
            if (error) return res.status(500).send({ error: error });
            if (!results) return res.status(404).send({ error: "Item with ID " + req.params.id + " not found" });

            res.json(results);
        });
    });

    //Get property for room
    // router.get('/:id/:property', function (req, res) {
    //     rooms.get(req.params.id, function (err, resData) {
    //         if (err) return res.status(500).send({ error: err });
    //         var propName = req.params.property;
    //         var returnObj = {};
    //         returnObj[propName] = resData[propName];
    //         res.json(returnObj);
    //     });
    // });

    return router;
};
