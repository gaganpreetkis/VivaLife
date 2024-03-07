import RestClient from '../../Network/RestClient';

//send request api call
export const api = (obj,token, lang) => {
    return new Promise((resolve,reject) => {
        RestClient.post('password/setpassword',JSON.stringify(obj),token,lang).then((resp) =>{
            resolve(resp);
        }).catch((err) => {
            reject(err);
        })
    })
}