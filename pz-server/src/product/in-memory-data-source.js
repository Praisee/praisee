module.exports = function() {
    var products = [
        { id: 1, name: "product1" },
        { id: 2, name: "product2" },
        { id: 3, name: "product3" }
    ];
    var currentId = 3;

    return {
        getAll: getAll,
        getByID: getByID,
        update: update,
        create: create
    };

    function getAll(callback) {
        callback(null, products)
    }

    function getByID(id, callback) {
        var productIndex = findWithAttr(products, 'id', id);
        if (productIndex === undefined)
            callback(undefined);
        else
            callback(null, products[productIndex]);
    }

    function create(obj, callback) {
        obj.id = ++currentId;
        products.push(obj);
        callback(null, obj)
    }

    function update(id, object, callback) {
        var productIndex = findWithAttr(products, 'id', id);

        if (productIndex === undefined)
            return callback(undefined);

        object.id = parseInt(id);
        products[productIndex] = object;
        return callback(null, products[productIndex]);
    }

    function findWithAttr(array, attr, value) {
        for (var i = 0; i < array.length; i += 1) {
            if (array[i][attr] == value) {
                return i;
            }
        }
    }
};