export default function (method: Function, context: any = void(0)) {
    return (...args: Array<any>) => {
        return new Promise((resolve, reject) => {
            method.call(context, ...args, (error, ...result) => {
                if (error) {
                    reject(error);
                    return;
                }
                
                if (result.length > 1) {
                    resolve(result);
                } else {
                    resolve(result.length ? result[0] : void(0));
                }
            })
        });
    };
}
