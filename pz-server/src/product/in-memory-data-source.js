module.exports = function() {
    let products = [
        { id: 1, name: "product1" },
        { id: 2, name: "product2" },
        { id: 3, name: "product3" }
    ];
    let currentId = 3;

    return {
        getAll: getAll,
        getById: getById,
        update: update,
        create: create
    };

    function getAll() {
        return Promise.resolve(products);
    }

    function getById(id) {
        const product = products.find(product => product.id === id);

        if (product) {
            return Promise.resolve(products[productIndex]);
        }
        else {
            return Promise.reject(products);
        }
    }

    function create(obj) {
        obj.id = ++currentId;
        products.push(obj);
        return Promise.resolve(obj);
    }

    function update(id, object) {
        const productIndex = products.findIndex(product => product.id === id);
        if (productIndex === -1) {
            return Promise.reject();
        }

        const newObject = Object.assign({}, object, { id: Number(id) });

        products[productIndex] = newObject;

        return Promise.resolve(newObject);
    }
};