let promise = new Promise(resolve => {
    setTimeout(resolve, 5000);
});

async function greeter(person: string, ...otherStuff) {
    const test = await promise;
    return "Hello, " + person + otherStuff.join(' ');
}

var user = "Jane User";

greeter(user, 'woo', 'bar').then((msg) => console.log(msg));
