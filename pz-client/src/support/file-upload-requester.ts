export interface IFileUploadRequester {
    send(data: any): IFileUploadStatus
}

export interface ISingleFileUploadRequester extends IFileUploadRequester {
    send(file: File): IFileUploadStatus
}

export interface IFileUploadResponse {
    statusCode: number
    body: any
}

export interface IFileUploadStatus {
    onProgress(progressCallback: (decimalPercent?: number) => void): void
    toPromise(): Promise<IFileUploadResponse>
}

export default class XhrSingleFileUploadRequester implements ISingleFileUploadRequester {
    private _url: string;
    private _method: string;
    private _fieldName: string;
    private _body: {};

    constructor({url, method = 'POST', fieldName, body = null}) {
        this._url = url;
        this._method = method;
        this._fieldName = fieldName;
        this._body = body || {};
    }

    send(data: File): IFileUploadStatus {
        let formData = new FormData();

        Object.keys(this._body).forEach(key => formData.append(key, this._body[key]));

        formData.append(this._fieldName, data);

        let xmlHttpRequest = new XMLHttpRequest();

        const status = this._createStatusFromXhr(xmlHttpRequest);

        xmlHttpRequest.responseType = 'json';
        xmlHttpRequest.open(this._method.toUpperCase(), this._url);
        xmlHttpRequest.send(formData);

        return status;
    }

    _createStatusFromXhr(xmlHttpRequest: XMLHttpRequest): IFileUploadStatus {
        return {
            onProgress: (progressCallback) => {
                xmlHttpRequest.upload.addEventListener('progress', (event: any) => {
                    const decimalPercent = event.lengthComputable ?
                        event.loaded / event.total : void(0);

                    progressCallback(decimalPercent);
                });
            },

            toPromise: () => new Promise((resolve, reject) => {
                xmlHttpRequest.upload.addEventListener('error', reject);
                xmlHttpRequest.upload.addEventListener('abort', reject);
                xmlHttpRequest.upload.addEventListener('timeout', reject);

                xmlHttpRequest.addEventListener('load', () => {
                    resolve({
                        statusCode: xmlHttpRequest.status,
                        body: xmlHttpRequest.response
                    });
                });
            })
        };
    }
}
