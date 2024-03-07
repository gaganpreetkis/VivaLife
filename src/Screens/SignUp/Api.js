import RestClient from '../../Network/RestClient';
//http://www.aristabiotech.com/api/checkemail
const emailverifyUrl = 'checkemail';
const orgIdVerifyUrl = 'checkorgranization';
const signUpUrl = 'register';

//verify email 
export const emailVerify = (obj, token, lang) => {
    return new Promise((resolve, reject) => {
        RestClient.post(emailverifyUrl, JSON.stringify(obj), token, lang).then((resp) => {
            resolve(resp);
        }).catch((err) => {
            reject(err);
        })
    })
}

//verify Org Id 
export const OrgIdVerify = (obj, token, lang) => {
    return new Promise((resolve, reject) => {
        RestClient.post(orgIdVerifyUrl, JSON.stringify(obj), token, lang).then((resp) => {
            resolve(resp);
        }).catch((err) => {
            reject(err);
        })
    })
}

//sign Up 
export const signUp = (obj, token, lang) => {
    return new Promise((resolve, reject) => {
        RestClient.post(signUpUrl, JSON.stringify(obj), token, lang).then((resp) => {
            resolve(resp);
        }).catch((err) => {
            reject(err);
        })
    })
}