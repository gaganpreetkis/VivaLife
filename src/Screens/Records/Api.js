import RestClient from '../../Network/RestClient';
//http://127.0.0.1:8000/api/record
//http://www.aristabiotech.com/api/records/categories
const getRecordUrl = 'record/';
const getCate = 'records/categories';
import Connection from '../../Network/Connection';
export const getRecords = (id, token, lang) => {
    return new Promise((resolve, reject) => {
        RestClient.getIOS(getRecordUrl + id, null, token, lang).then((resp) => {
            resolve(resp);
        }).catch((err) => {
            reject(err);
        })
    })
}
//http://127.0.0.1:8000/api/categories
export const getCategories = (token, lang) => {
    return new Promise((resolve, reject) => {
        RestClient.getIOS(getCate, null, token,lang).then((resp) => {
               resolve(resp);
           }).catch((err) => {
               reject(err);
           }) 

        })
    }
    

  
 

