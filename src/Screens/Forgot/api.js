import RestClient from '../../Network/RestClient';
const apiUrl = 'password/get/forgettoken';
const validateSuperAdmin= 'validate/superadmin/email';
//send request api call
export const api = (obj, token, headerLang) => {
    return new Promise((resolve, reject) => {
        RestClient.post(apiUrl, JSON.stringify(obj), token, headerLang).then((resp) => {
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