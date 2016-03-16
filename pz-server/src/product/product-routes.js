import express from 'express';
import {NotFoundError, BadRequestError, runOrSendError} from 'pz-server/src/support/routerErrorHandlers';
const router = express.Router();

export default function(datasource) {

    router.get('/', runOrSendError(async function(req, res) {
        console.log("pre hit response");
        var results = await datasource.getAll();
        console.log("hit response");
        res.json(results);
    }));

    router.get('/:id', runOrSendError(async function(req, res) {
        var results = await datasource.getByID(req.params.id);
        if (!results) {
            throw new NotFoundError("Item with ID " + req.params.id + " not found");
        }
    }));

    router.post('/', runOrSendError(async function(req, res) {
        if (!req.body.name) {
            throw new BadRequestError("Please atleast provide a 'name'");
        }

        var result = await datasource.create(req.body);
        if (!result) {
            throw new Error("Server failed to create new product");
        }

        res.json(result);
    }));

    router.put('/', runOrSendError(async function(req, res) {
        if (!req.params.id) {
            throw new BadRequestError("Please provide a product ID to update");
        }
    }));

    router.put('/:id', runOrSendError(async function(req, res) {
        var result = await datasource.update(req.params.id, req.body);

        if (!result) {
            throw new NotFoundError("Item with ID " + req.params.id + " not found");
        }

        res.json(result);
    }));

    return router;
};