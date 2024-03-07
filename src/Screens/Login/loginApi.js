import RestClient from '../../Network/RestClient';
const validateSuperAdmin= 'validate/superadmin/email';
//send request api call
export const loginApi = (obj, token, lang) => {
    return new Promise((resolve, reject) => {
        RestClient.post('login', JSON.stringify(obj), token, lang).then((resp) => {
            resolve(resp);
        }).catch((err) => {
            reject(err);
        })
    })
}

//Validate super admin email
export const superAdminEmailVerify = (obj, token, lang) => {
    return new Promise((resolve, reject) => {
        RestClient.post(validateSuperAdmin, JSON.stringify(obj), token, lang).then((resp) => {
            resolve(resp);
        }).catch((err) => {
            reject(err);
        })
    })
}
//http://127.0.0.1:8000/api/account/reactivate
export const reSendApi = (obj, token, lang) => {
    return new Promise((resolve, reject) => {
        RestClient.post('account/reactivate', JSON.stringify(obj), token, lang).then((resp) => {
            resolve(resp);
        }).catch((err) => {
            reject(err);
        })
    })
}

//send request api call
export const updatePrivacyApi = (obj, token, lang) => {
    return new Promise((resolve, reject) => {
        RestClient.post('agreement/update', JSON.stringify(obj), token, lang).then((resp) => {
            resolve(resp);
        }).catch((err) => {
            reject(err);
        })
    })
}