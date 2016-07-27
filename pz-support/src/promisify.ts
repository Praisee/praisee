export default function <T>(method: (...args: Array<any>) => T, context: any = void(0)) {
    return (...args: Array<any>) => {
        return new Promise<T>((resolve, reject) => {
            method.call(context, ...args, (error, result: T) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(result);
            })
        });
    };
}

