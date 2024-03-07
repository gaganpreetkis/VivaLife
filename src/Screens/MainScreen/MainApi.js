import RestClient from '../../Network/RestClient';
//http://127.0.0.1:8000/api/record
//http://127.0.0.1:8000/api/delete/photoid
const getRecordUrl = 'record';
const deletePhotoId = 'delete/photoid';
const deleteUuidUrl = 'delete/uuid';

export const getRecords = (obj, token, headerLang) => {
    return new Promise((resolve, reject) => {
        RestClient.getIOS(getRecordUrl, JSON.stringify(obj), token, headerLang).then((resp) => {
            resolve(resp);
        }).catch((err) => {
            reject(err);
        })
    })
}

export const deletePhoto = (obj, token, headerLang) => {
    return new Promise((resolve, reject) => {
        RestClient.getIOS(deletePhotoId, JSON.stringify(obj), token, headerLang).then((resp) => {
            resolve(resp);
        }).catch((err) => {
            reject(err);
        })
    })
}

export const deleteUuid = (obj, token, headerLang) => {
    return new Promise((resolve, reject) => {
        RestClient.post(deleteUuidUrl, JSON.stringify(obj), token, headerLang).then((resp) => {
            resolve(resp);
        }).catch((err) => {
            reject(err);
        })
    })
}
