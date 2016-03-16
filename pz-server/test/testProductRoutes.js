var expect = require("chai").expect;
var request = require('supertest');
var bodyParser = require('body-parser');
var app = require('express')();

var productMockRepo = {};

app.use(bodyParser.json());
var routes = require("pz-server/build/node_modules/pz-server/src/product/product-routes").default;
app.use('/api/v1/product/', routes(productMockRepo));

describe("/api/v1/product/", function() {
    describe("GET /", function() {
        it("should return all products from product repository", function(done) {
            productMockRepo.getAll = function(callback) {
                callback(null, ['product1', 'product2']);
            };

            request(app)
                .get('/api/v1/product/')
                .expect(200)
                .end(function(err, res) {
                    if (err) done(err);
                    expect(res.body).to.be.instanceof(Array);
                    expect(res.body.length).to.equal(2);
                    done(err);
                });
        });

        it("should return empty array if no product in product repository", function(done) {
            productMockRepo.getAll = function(callback) {
                callback(null, []);
            };

            request(app)
                .get('/api/v1/product/')
                .expect(200)
                .end(function(err, res) {
                    if (err) done(err);
                    expect(res.body).to.be.ok;
                    expect(res.body).to.be.instanceof(Array);
                    expect(res.body.length).to.equal(0);
                    done(err);
                });
        });

        it("should return 500 if there is an error in the product repository", function(done) {
            productMockRepo.getAll = function(callback) {
                callback({ error: "blah" }, null);
            };

            request(app)
                .get('/api/v1/product/')
                .expect(500)
                .end(function(err, res) {
                    if (err) done(err);
                    expect(res.body.error).to.be.ok;
                    expect(res.body.error).to.be.an('object');
                    done(err);
                });
        });
    });

    describe("GET /:id", function() {
        it("should return the document that the product repository returns", function(done) {
            productMockRepo.getByID = function(id, callback) {
                callback(null, { id: id });
            };

            request(app)
                .get('/api/v1/product/abc123')
                .expect(200)
                .end(function(err, res) {
                    if (err) done(err);
                    expect(res.body).to.be.ok;
                    expect(res.body).to.an('object');
                    expect(res.body.id).to.equal('abc123');
                    done(err);
                });
        });

        it("should return 500 if there is an error in the product repository", function(done) {
            productMockRepo.getByID = function(id, callback) {
                callback({ error: "blah" }, null);
            };

            request(app)
                .get('/api/v1/product/abc123')
                .expect(500)
                .end(function(err, res) {
                    if (err) done(err);
                    expect(res.body.error).to.be.ok;
                    done(err);
                });
        });

        it("should return 404 if the product repository returns null", function(done) {
            productMockRepo.getByID = function(id, callback) {
                callback(null, null);
            };

            request(app)
                .get('/api/v1/product/abc123')
                .expect(404)
                .end(function(err, res) {
                    if (err) done(err);
                    expect(res.body.error).to.be.ok;
                    done(err);
                });
        });
    });

    describe("PUT /:id", function() {
        it("should return the document that the product repository returns", function(done) {
            productMockRepo.update = function(id, obj, callback) {
                callback(null, { id: id });
            };

            request(app)
                .put('/api/v1/product/abc123')
                .expect(200)
                .end(function(err, res) {
                    if (err) done(err);
                    expect(res.body).to.be.ok;
                    expect(res.body).to.an('object');
                    expect(res.body.id).to.equal('abc123');
                    done(err);
                });
        });

        it("should return 400 error if ID not provided", function(done) {
            productMockRepo.update = function(id, obj, callback) {
                callback(null, null);
            };

            request(app)
                .put('/api/v1/product/')
                .expect(400)
                .end(function(err, res) {
                    if (err) done(err);
                    expect(res.body.error).to.be.ok;
                    done(err);
                });
        });

        it("should return 500 if there is an error in the product repository", function(done) {
            productMockRepo.update = function(id, obj, callback) {
                callback({ error: "blah" }, null);
            };

            request(app)
                .put('/api/v1/product/abc123')
                .expect(500)
                .end(function(err, res) {
                    if (err) done(err);
                    expect(res.body.error).to.be.ok;
                    done(err);
                });
        });

        it("should return 404 if the product repository returns null", function(done) {
            productMockRepo.update = function(id, obj, callback) {
                callback(null, null);
            };

            request(app)
                .put('/api/v1/product/abc123')
                .expect(404)
                .end(function(err, res) {
                    if (err) done(err);
                    expect(res.body.error).to.be.ok;
                    done(err);
                });
        });
    });

    describe("POST /", function() {
        it("should return the document that the product repository returns", function(done) {
            productMockRepo.create = function(obj, callback) {
                callback(null, { name: "test product entry" });
            };

            request(app)
                .post('/api/v1/product/')
                .send({ name: "test product entry" })
                .expect(200)
                .end(function(err, res) {
                    if (err) done(err);
                    expect(res.body).to.be.ok;
                    expect(res.body).to.an('object');
                    expect(res.body.name).to.equal("test product entry");
                    done(err);
                });
        });

        it("should return 400 error if a name is not provided", function(done) {
            productMockRepo.create = function(obj, callback) {
                callback(null, null);
            };

            request(app)
                .post('/api/v1/product/')
                .expect(400)
                .end(function(err, res) {
                    if (err) done(err);
                    expect(res.body.error).to.be.ok;
                    done(err);
                });
        });

        it("should return 500 if there is an error in the product repository", function(done) {
            productMockRepo.create = function(obj, callback) {
                callback({ error: "blah" }, null);
            };

            request(app)
                .post('/api/v1/product/')
                .send({ name: "test product entry" })
                .expect(500)
                .end(function(err, res) {
                    if (err) done(err);
                    expect(res.body.error).to.be.ok;
                    done(err);
                });
        });

        it("should return 404 if the product repository returns null", function(done) {
            productMockRepo.create = function(obj, callback) {
                callback(null, null);
            };

            request(app)
                .post('/api/v1/product/')
                .send({ name: "test product entry" })
                .expect(404)
                .end(function(err, res) {
                    if (err) done(err);
                    expect(res.body.error).to.be.ok;
                    done(err);
                });
        });
    });
});