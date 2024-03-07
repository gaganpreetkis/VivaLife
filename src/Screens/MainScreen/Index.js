

import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  View,
  Dimensions,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  FlatList,
  StatusBar,
  PermissionsAndroid,
  SafeAreaView

} from 'react-native'


import { useTheme } from '@/Theme'
import { useTranslation } from 'react-i18next'
import { getFocusedRouteNameFromRoute, useNavigation } from '@react-navigation/native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import IconActionSheet from 'react-native-icon-action-sheet'
import RBSheet from "react-native-raw-bottom-sheet";
import Icon from "react-native-vector-icons";
var FilePicker = require('react-native-image-picker');

import { moderateScale } from '../../helper/ResponsiveFonts';
import { apiUrl } from '../../Network/apiUrl';
import { keys, setValue, getValue } from "../../helper/Storage";
import ChangeTheme from '@/Store/Theme/ChangeTheme'
import Loader from '../common/Loader';
import Colors from "../../Constants/colors";
import { getRecords, deletePhoto } from './MainApi';
import Header from '../common/Header';
import { MAIN_FONT, MAIN_FONT_BOLD, Show } from '../common/Utils';
import Popup from '../common/Popup'
import PopupWithoutTitle from '../common/PopupWithoutTitle';
import NetworkUtils from '../../helper/NetworkUtills'

const widthScreen = Dimensions.get("window").width;
const heightScreen = Dimensions.get("window").height;

const baseUrl = apiUrl;

sheetRef = React.createRef();


const MainScreen = () => {

  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation()
  const { Common, Fonts, Gutters, Layout } = useTheme()
  const [userName, setUserName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [IsPhotoIDShow, setIsPhotoIDShow] = useState(false);
  const [IsShowCertificate, setShowCertificate] = useState(true);
  const [recordList, setRecordList] = useState([]);
  const [listHeight, setListHeight] = useState(165);
  const [isShowPopup, setIsShowPopup] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [isShowPopupWithoutTitle, setIsShowPopupWithoutTitle] = useState(false);

  //const [isTestUser, setTestUser] = useState(false);

  useEffect(() => {
    if (recordList != undefined) {
      if (recordList.length == 0) {
        // listHeight = 0;
        setListHeight(0);
      } else if (recordList.length == 1) {
        // listHeight = 125;
        setListHeight(45);
      } else if (recordList.length == 2) {
        // listHeight = 85;
        setListHeight(85);
      } else if (recordList.length == 3) {
        // listHeight = 125;
        setListHeight(125);
      } else {
        // listHeight = 165;
        setListHeight(165);
      }
    }

  }, [recordList]);


  useEffect(() => {
    getUserInfo();
    getToken();

  }, []);

  function nextScreen() {
    navigation.navigate("Scanner");
  }

  function certificateScreen(item) {
    navigation.navigate("Certificate", {
      item: item,
    });
  }

  function photoIdView() {
    getValue(keys.USER_ID_PIC).then((value) => {
      navigation.navigate("PhotoIdPreview", {
        imageUrl: value,
      });
    });

  }

  function getUserInfo() {
    getValue(keys.USER_NAME).then((value) => {
      console.log("USER_NAME=" + value);
      setUserName(value)
    });

    getValue(keys.USER_ID_PIC).then((value) => {
      setImageUrl(value);
      console.log("photo id url=" + value);
    });

    getValue(keys.IS_PHOTO_ID).then((value) => {
      setIsPhotoIDShow(value);
      console.log("IS_PHOTO_ID=" + value);
    });

    getValue(keys.IS_CERTIFICATE).then((value) => {
        setShowCertificate(value);
      console.log("IS_CERTIFICATE=" + value);
    });
  }

  function getToken() {
   
    getValue(keys.TOKEN).then((value) => {
      // console.log(" TOKEN=" +value);
      //getRecordsAPI(value)
      checkNetwork(value);
    });
  }

  const getRecordsAPI = async (token) => {
    let lang = await getValue(keys.APP_LANGUAGE);
    console.log("lang=" + lang);
    getRecords(null, token, lang).then((resp) => {
      loaderDone();
      console.log("record API=" + JSON.stringify(resp));
      if (resp.status === 200) {
        // setIsLoading(false);
        setRecordList(resp.data);
      } else {
        //Show(resp.error, t('common.error'));
        showPopUp(t('common.error'), resp.error);
      }
    }).catch(err => {
      setIsLoading(false);
      //Show(t('common.somethingWentWrong'), t('common.serverError'));
      showPopUp(t('common.serverError'), t('common.somethingWentWrong'));
    });
  }

  const loaderDone = () => {
    setTimeout(() => {
      setIsLoading(false);
    }, 400);
  }

  const imagesApi = async (token, imagePath) => {
    let lang = await getValue(keys.APP_LANGUAGE);
    setIsLoading(true);
    var RandomNumber = Math.floor(Math.random() * 100) + 1;
    let data = new FormData();
    data.append('file', { uri: imagePath, name: 'IMG' + RandomNumber + '.png', type: 'image/*' });
    data.append('type', "photo_id"),
      setIsLoading(true);
    fetch(baseUrl + '/upload', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
        'X-localization': lang,
        'Authorization': `Bearer ${token}`
      },
      body: data,
    })
      .then((res) => res.json())
      .then((res) => {
        setIsLoading(false);
        console.log("response image=>" + JSON.stringify(res));

        setValue(keys.USER_ID_PIC, res.url);
        setImageUrl(res.url);
      })
      .catch((error) => {
        console.error(error);
        setIsLoading(false);
      });
  }

  const deletePhotoAPI = async (token) => {
    setIsLoading(true);
    let lang = await getValue(keys.APP_LANGUAGE);
    deletePhoto(null, token, lang).then((resp) => {
      setIsLoading(false);
      console.log("delete API=" + JSON.stringify(resp));
      if (resp.status === 200) {
        setIsLoading(false);
        setValue(keys.USER_ID_PIC, "");
        setImageUrl(null);
      } else {
        // Show(resp.data.error, t('common.error'));
        showPopUp(t('common.error'), resp.data.error);
      }
    }).catch(err => {
      console.log("delete Error=" + JSON.stringify(err));
      setIsLoading(false);
      // Show(t('common.somethingWentWrong'), t('common.serverError'));
      showPopUp(t('common.serverError'), t('common.somethingWentWrong'));
    });
  }


  function getMenuIcon() {
    return (
      <MaterialIcon
        size={30}
        name={'menu'}
        color={'#FFFFFF'}
        suppressHighlighting={true}
      />
    );
  }

  function toggleDrawer() {
    navigation.toggleDrawer();
  }

   function askForConfirmationToDelete() {
    setIsShowPopupWithoutTitle(true);
   /*  Alert.alert('', t('mainScreen.label.deletePhotoID'), [
      {
        text: t('common.yes'),
        onPress: () => {
          deletePhotoId();
        }
      },
      {
        text: t('common.no'),
        onPress: () => {

        }
      }
    ]); */
  } 

  function deletePhotoId() {
    getValue(keys.TOKEN).then((value) => {
      console.log(" TOKEN=" + value);
      deletePhotoAPI(value)
    });
  }

  function updateImage() {
    sheetRef.open();
  }

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          /*  {
             title: 'Camera Permission',
             message: 'App needs camera permission',
           }, */
        );
        // If CAMERA Permission is granted
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else return true;
  };

  const requestExternalWritePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          /*   {
              title: 'External Storage Write Permission',
              message: 'App needs write permission',
            }, */
        );
        // If WRITE_EXTERNAL_STORAGE Permission is granted
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        alert('Write permission err', err);
      }
      return false;
    } else return true;
  };

  //For photo from Camera
  const takePhotoFromCamera = async () => {
    let options = {
      mediaType: 'photo',
      maxHeight: 1000,
      maxWidth: 1000,
      quality: 0.5,
    }
    let isCameraPermitted = await requestCameraPermission();
    let isStoragePermitted = await requestExternalWritePermission();

    if (isCameraPermitted && isStoragePermitted) {
      FilePicker.launchCamera(options, (response) => {
        sheetRef.close();
        console.log("response camera" + JSON.stringify(response));
        if (response.fileSize != undefined) {
          getValue(keys.TOKEN).then((value) => {
            imagesApi(value, response.uri);
          });
        }
      });
    }
  }

  //For photo from Library
  const choosePhotoFromLibrary = () => {
    let options = {
      mediaType: 'photo',
      maxHeight: 1000,
      maxWidth: 1000,
      quality: 0.5,
    }
    FilePicker.launchImageLibrary(options, (response) => {
      sheetRef.close()
      console.log("response gallery" + JSON.stringify(response));
      if (response.uri != undefined) {
        getValue(keys.TOKEN).then((value) => {
          imagesApi(value, response.uri);
        });
      }
    });
  }

  const checkNetwork = async (value) => {
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected) {
      setIsLoading(true);
      getRecordsAPI(value);
    } else {
      setIsLoading(false);
      showPopUp(t('common.appIsOfflineHeading'), t('common.appIsOfflineBody'));
    }
  }

  function Divider() {
    return (
      <View style={{ backgroundColor: 'grey', margin: moderateScale(10), height: 0.5, width: widthScreen - 50 }}></View>
    );
  }

  const TestResultRow = (item) => {
    return <TouchableOpacity onPress={() => certificateScreen(item)}>
      <View>
        <View style={styles.rowStyle}>
          <Text style={styles.testName}>{item.cate_short_name}</Text>
          <View style={{ flex: 1 }} />
          <Text style={styles.testDate}>{item.test_date}</Text>
        </View>
        <View style={styles.divider} />
      </View>
    </TouchableOpacity>;
  }

  const showPopUp = (title, message) => {
    setIsShowPopup(true);
    setPopupTitle(title);
    setPopupMessage(message);
  }

  const onPressOk = () => {
    setIsShowPopup(false);
  }

 
  const onPressFirst = () => {
    setIsShowPopupWithoutTitle(false);
   
  }

  const onPressSecond = () => {
    setIsShowPopupWithoutTitle(false);
    deletePhotoId();
  }

  return (
    <>
    <SafeAreaView style={{ flex: 0, backgroundColor: Colors.Primary }} />
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.Primary}}>
    <View style={[Layout.fill, { backgroundColor: Colors.White }]}>
      <StatusBar backgroundColor={Colors.Primary} />
      <Loader isLoading={isLoading} />
      <Popup isShow={isShowPopup} title={popupTitle} message={popupMessage} onPressOk={onPressOk} />
      <PopupWithoutTitle isShow={isShowPopupWithoutTitle} twoButtons={true} message={t('mainScreen.label.deletePhotoID')}
        onPressFirst={onPressFirst} firstButton={t('common.no')} 
        onPressSecond={onPressSecond}
        secondButton={t('common.yes')} />
      <RBSheet
        ref={ref => {
          sheetRef = ref;
        }}
       /*  height={160}
        openDuration={250}
        customStyles={{
          container: {
            justifyContent: "center",
            alignItems: "center"
          }
        }} */
        height={Platform.OS == "ios" ? 160 : 130}
            openDuration={250}
            customStyles={{
              container: {
                justifyContent: "center",
                alignItems: "center",
                paddingBottom: Platform.OS == "ios" ? 20 : 0,
              }
            }}
      >
        <>
          <TouchableOpacity onPress={() => {
            takePhotoFromCamera();
          }}>
            <View style={styles.sheetContainer}>
              <Image source={require('../../Assets/Images/camera_icon.png')} resizeMode={'contain'}
                style={styles.iconStyle} />
              <View style={{ width: 100 }}>
                <Text style={{ marginLeft: 10 }}> {t('common.camera')}</Text>
              </View>
            </View>
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity onPress={() => {
            choosePhotoFromLibrary();

          }}>
            <View style={styles.sheetContainer}>
              <Image source={require('../../Assets/Images/gallery_icon.png')} resizeMode={'contain'}
                style={styles.iconStyle} />
              <View style={{ width: 100 }}>
                <Text style={{ marginLeft: 10 }}>{t('common.photo_library')}</Text>
              </View>
            </View>
          </TouchableOpacity>
         {/*  <Divider />
          <TouchableOpacity onPress={() => sheetRef.close()}>
            <View style={styles.sheetContainer}>
              <Text style={{ marginLeft: 10 }}>{t('common.cancel')}</Text>
            </View>
          </TouchableOpacity> */}
        </>

      </RBSheet>
      <View style={{ flexDirection: 'column' }}>
        <Header name={ t('mainScreen.label.smartPass')} left={true} leftIcon={getMenuIcon} onPressLeft={toggleDrawer} headerBlue={true} />


        <Text style={styles.usernameInput}>{userName}</Text>
        <View style={{ marginLeft: 15 }}>
          <Divider />
        </View>
        {IsShowCertificate == 'true' & recordList.length != 0 ?
          <FlatList
            style={{ width: '86%', height: listHeight, alignSelf: 'center', marginTop: 25 }}
            data={recordList}
            renderItem={({ item }) => TestResultRow(item)}
            keyExtractor={(item, index) => index.toString()}
          />
          :IsShowCertificate == 'true' ?

          <Text style={styles.noCertificateTxt}>{t('mainScreen.label.noCertificates')}</Text>:null
        }

        {
          IsPhotoIDShow == 'true' ?
            imageUrl != undefined && imageUrl != 'null' && imageUrl.length > 0 ?
              <View style={[styles.rowStyle, styles.center, { marginTop: 10 }]}>
                <TouchableOpacity onPress={() => photoIdView()}>
                  <View style={styles.updateImageContainer2}>
                    <Image style={styles.updateImageContainer2} source={{ uri: imageUrl }} resizeMode={'cover'} />
                  </View>
                </TouchableOpacity>

                {imageUrl != undefined && imageUrl != 'null' && imageUrl.length > 0 ?
                  <TouchableOpacity onPress={() => askForConfirmationToDelete()}>
                    <Image source={require('../../Assets/Images/ic_trash_circle.png')} resizeMode={'contain'} style={{ width: 40, height: 40, marginLeft: 20 }} />
                  </TouchableOpacity>
                  : null}
              </View>
              :
              <TouchableOpacity style={[styles.rowStyle, styles.center, { marginTop: 10 }]} onPress={() => updateImage()}>

                <View style={styles.updateImageContainer}>
                  <Image style={{ width: 60, height: 60, marginTop: 15, marginBottom: 15 }} source={require('../../Assets/Images/smartCard_icon.png')} resizeMode={'contain'} />
                  <Text style={{ color: Colors.headerBlue, fontSize: 12, fontFamily: MAIN_FONT ? MAIN_FONT : '' }}>{t('mainScreen.label.uploadPhotoID')}</Text>
                  <Text style={{ color: Colors.Black, fontSize: 12, fontFamily: MAIN_FONT ? MAIN_FONT : '', marginTop: 6 }}>{t('mainScreen.label.egPassportDriver')}</Text>

                </View>
              </TouchableOpacity>
            : null}

      </View>

      <View style={{ flex: 1 }} />
      <TouchableOpacity onPress={() => nextScreen()}>
        <View style={{ backgroundColor: Colors.Primary, height: 70, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={styles.addCertificateText}>{t('mainScreen.label.addCertificate')}</Text>

          <Image source={require('../../Assets/Images/add_certificate.png')} style={styles.addCertificateImage} resizeMode={'contain'}></Image>

        </View>
      </TouchableOpacity>
    </View>
    </SafeAreaView>
    </>

  );

}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  rowStyle: {
    flexDirection: 'row'
  },
  columnStyle: {

  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  usernameInput: {
    width: '86%',
    alignSelf: 'center',
    paddingBottom: 6,
    marginTop: 10,
    fontSize: 16,
    color: 'rgba(0,0,0,0.8)',
    fontFamily: MAIN_FONT ? MAIN_FONT : '',
  },
  noCertificateTxt: {
    marginTop: 80,
    marginBottom: 20,
    color: Colors.Yellow,
    alignSelf: 'center',
    fontSize: 22,
    fontFamily: MAIN_FONT_BOLD ? MAIN_FONT_BOLD : '',
    fontWeight: '600',
  },
  updateImageContainer: {
    width: 160,
    height: 160,
    borderRadius: 30,
    backgroundColor: 'rgba(67,56,145,0.1)',
    alignSelf: 'center',
    alignItems: 'center'
  },
  updateImageContainer2: {
    width: 160,
    height: 160,
    borderRadius: 30,
    alignSelf: 'center',
    alignItems: 'center'
  },
  addCertificateText: {
    fontSize: 16,
    fontFamily: MAIN_FONT ? MAIN_FONT : '',
    color: Colors.White,
    paddingTop: 10,
  },
  addCertificateImage: {
    height: 60,
    width: 60,
    position: 'absolute',
    top: -30,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.lightGray,
    marginTop: 10,
    marginBottom: 10
  },
  testName: {
    fontSize: 16,
    fontFamily: MAIN_FONT ? MAIN_FONT : '',
    color: 'rgba(240, 188, 29, 1)',
  },
  testDate: {
    fontSize: 14,
    fontFamily: MAIN_FONT ? MAIN_FONT : '',
    color: 'rgba(0,0,0,0.4)'
  },
  sheetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: widthScreen,
    justifyContent: 'center'
  },
  iconStyle: {
    width: 30,
    height: 30,
  }
});

export default MainScreen



