export default function loopbackQuery(Model: IPersistedModel, sql: string, ...params: Array<any>) {
    return new Promise<Array<any>>((resolve, reject) => {
        Model.dataSource.connector.execute(sql, params, (error, result) => {
            if (error) {
                console.error(error);
                reject(error);
            }

            resolve(result);
        });
    });
}
