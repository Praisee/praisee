export default function query(Model: IModel, sql: string, ...params: Array<any>) {
    return new Promise((resolve, reject) => {
        Model.dataSource.connector.execute(sql, params, (error, result) => {
            if (error) {
                console.error(error);
                reject(error);
            }
            
            resolve(result);
        });
    });
}
