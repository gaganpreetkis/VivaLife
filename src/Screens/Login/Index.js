import React, { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
  Modal,
  Keyboard,
  ScrollView,
  SafeAreaView,
  BackHandler,
  Platform,
} from 'react-native'
import { Brand } from '@/Components'
import { useTheme } from '@/Theme'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import DeviceInfo from 'react-native-device-info';
import { keys, setValue, getValue } from "../../helper/Storage";
import { navigateAndSimpleReset, navigateAndReset } from "../../Navigators/Root";
import ChangeTheme from '@/Store/Theme/ChangeTheme'
import Loader from '../common/Loader';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Colors from "../../Constants/colors";
import { loginApi, updatePrivacyApi } from './loginApi';
import Button from '../common/Button';
import { Show, EmailValidation } from '../common/Utils';
import { superAdminEmailVerify } from './loginApi'
import {
  TextField,
  FilledTextField,
  OutlinedTextField,
} from 'react-native-material-textfield';
import Header from '../common/Header'
import VerificationModal from './verificationModal'
import NetworkUtils from '../../helper/NetworkUtills';
import { moderateScale } from '../../helper/ResponsiveFonts'
import Popup from '../common/Popup'
import Dialog, { DialogTitle, DialogFooter, DialogButton, DialogContent } from 'react-native-popup-dialog';
import { app_true, privacyPolicyUrl, termsOfUseUrl } from '../../Network/apiUrl'
import { inOut } from 'react-native/Libraries/Animated/src/Easing'
import i18next from 'i18next';
//let ref_scroll;
fieldRef = React.createRef();

const english = "en";
const zhHans = "zhHans";
const zhHant = "zhHant";
const malay = "ms";
const reg = EmailValidation;///^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/;
const LoginScreen = (props) => {

  const navigation = useNavigation();

  const [isSecureTextEntry, setSecureTextEntry] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [isShowPopup, setIsShowPopup] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupMessage, setPopupMessage] = useState('');

  const [firstTimeEmail, setFirstTimeEmail] = useState(true);
  const [firstTimePassword, setFirstTimePassword] = useState(true);
  const [email, setEmail] = useState(false);
  const [emailError, setEmailError] = useState(null);
  const [password, setPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const [showRequestVerificationModal, setShowRequestVerificationModal] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isShowDialog, setIsShowDialog] = useState(false);
  const [checkboxSelected, setChecboxSelection] = useState(false);
  const [showCheckboxError, setShowCheckboxError] = useState(false);
  const [loginResponse, setLoginResponse] = useState('');


  const ref_email = useRef();
  const ref_password = useRef();
  const ref_scroll = useRef();



  /* useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true); // or some other action
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false); // or some other action
       // ref_email.current.blur();
        //ref_password.current.blur();
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []); */

  function handleBackButtonClick() {
    if (isShowDialog) {
      setIsShowDialog(false);
      setPopupMessage(false);
      setPopupTitle(false);
      setIsShowPopup(false);
    } else {
      navigation.goBack();
      setIsShowDialog(false);
      setPopupMessage(false);
      setPopupTitle(false);
      setIsShowPopup(false);
    }
    return true;
  }

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
    };
  }, []);

  function signupScreen() {
    navigation.navigate("SignUpScreen");
  }

  function mainScreen() {
    navigateAndSimpleReset('MainScreen');
  }

  function welcomeScreen() {
    navigateAndSimpleReset('Startup');
  }

  function forgotScreen() {
    navigation.navigate("Forgot");
  }

  const scrollViewUpTo = (y) => {
    if (Platform.OS === "ios") {
      console.log("ios");
      Keyboard.dismiss();
    } else {
      console.log("android");
      // ref_scroll?.scrollToPosition(0, y, false)
      ref_scroll?.current?.scrollTo({ x: 0, y: y, animated: false })
    }
  }

  function login() {
    // setEmailError(null);
    setPasswordError(null);
    let error = "";
    if (!email) {
      error = t('common.required');
      setEmailError(error);
      ref_email.current.focus();
      scrollViewUpTo(0);
    } else if (reg.test(email) === false) {
      error = t('common.emailValid');
      setEmailError(error);
      ref_email.current.focus();
      scrollViewUpTo(0);
    } else if (emailError) {
      return
    } else if (!password) {
      error = t('common.required');
      ref_password.current.focus();
      scrollViewUpTo(30);
      setPasswordError(error);
    }

    if (error == '') {
      checkNetwork();
    } else {
      //nothing for now
    }
  }

  const checkNetwork = async () => {
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected) {
      loginAPI();
    } else {
      //Show(t('common.appIsOfflineBody'), t('common.appIsOfflineHeading'));
      showPopUp(t('common.appIsOfflineHeading'), t('common.appIsOfflineBody'));
    }
  }
  const loaderDone = () => {
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  }

  const loaderShow = () => {
    setTimeout(() => {
      setShowRequestVerificationModal(true);
    }, 800);
  }

  async function saveLoginResponse(resp) {
    if (resp.status === 200) {
      //save user data
      setValue(keys.USER_EMAIL, resp.data.data.email);
      setValue(keys.TOKEN, resp.data.token);
      setValue(keys.USER_NAME, resp.data.data.full_name);
      setValue(keys.APP_LANGUAGE,resp.data.data.language)
      if (resp.data.data.id_proof != null) {
        setValue(keys.USER_ID_PIC, resp.data.data.id_proof);
      }
      if (resp.data.data.org_id != null) {
        setValue(keys.ORG_ID, resp.data.data.org_id);
        setValue(keys.ORG_NAME, resp.data.data.org_name);
      }
      else {
        setValue(keys.ORG_ID, "");
        setValue(keys.ORG_NAME, "");
      }
      console.log("data.app.photo_id=" + resp.data.data.app.photo_id);
      setValue(keys.IS_PHOTO_ID, resp.data.data.app.photo_id);
      console.log("certificate_list=" + resp.data.data.app.certificate_list);
      setValue(keys.IS_CERTIFICATE, resp.data.data.app.certificate_list);
      i18next.changeLanguage(resp.data.data.language);
      mainScreen();
    }
  }

  async function loginAPI() {
    Keyboard.dismiss();
    setIsLoading(true);
    var device_Id = ""
    device_Id = DeviceInfo.getDeviceId();
    console.log(device_Id)
    var deviceObj = ""
    try {
      let oneSignalId = await getValue(keys.ONE_SIGNAL_USER_ID);
      let oneSignalToken = await getValue(keys.ONE_SIGNAL_PUSH_TOKEN);

      const device = {
        token: oneSignalToken,
        type: Platform.OS,
        onesignal_id: oneSignalId,
        uuid: device_Id
      }
      deviceObj = JSON.parse(JSON.stringify(device));
      console.log(deviceObj);
    } catch (err) {
      console.log(err);
    }

    const obj = {
      email: email,
      password: password,
      device: deviceObj
    };
    let lang = await getValue(keys.APP_LANGUAGE);
    loginApi(obj, null, lang).then((resp) => {
      console.log("login API=" + JSON.stringify(resp));
      //setIsLoading(false);
      loaderDone();
      if (resp.status === 200) {
        if (resp.data.data.app_agree != 1) {
          setLoginResponse(resp);
          setIsShowDialog(true);
        } else {
          saveLoginResponse(resp);
        }
      } else if (resp.status === 402) {
        // 'no verify...'
        console.log("no verify...");
        //setShowRequestVerificationModal(true);
        loaderShow();
        //showVerificationModal();
      }
      else {
        //Show(t(resp.data.error), t('common.error'));
        showPopUp(t('common.error'), resp.data.error);
      }
    }).catch(err => {
      setIsLoading(false);
      //Show(t('common.somethingWentWrong'), t('common.serverError'));
      showPopUp(t('common.serverError'), t('common.somethingWentWrong'));
    });
  }
//Super Admin Email Verify Api
const superAdminEmailVerifyApi = async () => {
  let error = "";

  if (!email) {
    // error = t('common.emailEmpty');
    setEmailError(t('common.required'));
    return;
  } else if (reg.test(email) === false) {
    error = t('common.emailValid');
  }

  if (error != '') {
    setEmailError(error)
  }
  else {
    setEmailError(null)
    const obj = {
      email: email,
    }
    // setIsLoading(true);
    let lang = await getValue(keys.APP_LANGUAGE);
    superAdminEmailVerify(obj, null, lang).then((resp) => {
      console.log("emailVerifyApi API res==" + JSON.stringify(resp));
      if (resp.status === 200) {
        setIsLoading(false);
        setEmailError(null);
      } else {
        setIsLoading(false);
        setEmailError(resp.data.error);
      }
    }).catch(err => {
      setIsLoading(false);
      //Show(t('common.somethingWentWrong'), t('common.serverError'));
      showPopUp(t('common.serverError'), t('common.somethingWentWrong'));
    });
  }
}
  async function updatePrivacyAPI() {
    Keyboard.dismiss();
    setIsLoading(true);
    const obj = {
      app_agree: 1,
    };

    let lang = await getValue(keys.APP_LANGUAGE);
    updatePrivacyApi(obj, loginResponse.data.token, lang).then((resp) => {
      console.log("updatePrivacy API=" + JSON.stringify(resp));
      //setIsLoading(false);
      loaderDone();
      if (resp.status === 200) {
        saveLoginResponse(loginResponse)
      } else {
        //Show(t(resp.data.error), t('common.error'));
        showPopUp(t('common.error'), resp.data.error);
      }
    }).catch(err => {
      setIsLoading(false);
      //Show(t('common.somethingWentWrong'), t('common.serverError'));
      showPopUp(t('common.serverError'), t('common.somethingWentWrong'));
    });
  }

  function onAccessoryPress() {
    //.setState(({ isSecureTextEntry }) => ({ isSecureTextEntry: !isSecureTextEntry }));
    if (isSecureTextEntry) {
      setSecureTextEntry(false)
    } else {
      setSecureTextEntry(true)
    }
  }

  function renderEmailAccessory() {
    return (
      <Image
        source={require('../../Assets/Images/ic_email.png')}
        style={{ height: 20, width: 20 }}
        resizeMode={'contain'}
      />
    );
  }

  function renderPasswordAccessory() {

    let name = isSecureTextEntry ?
      'visibility' :
      'visibility-off';

    return (
      <MaterialIcon
        size={22}
        name={name}
        color={'#DADEED'}
        onPress={onAccessoryPress}
        suppressHighlighting={true}
      />
    );
  }

  function showVerificationModal() {
    console.log("showVerificationModal");
    setShowRequestVerificationModal(true);
  }

  function closeVerificationModal() {
    console.log("closeVerificationModal");
    setShowRequestVerificationModal(false);
  }

  const emailValidate = (text) => {
    let error = "";
    setFirstTimeEmail(false);
    if (!text) {
      setEmailError(t('common.required'));
      return;
    } else if (reg.test(text) === false) {
      error = t('common.emailValid');
    }else{
      superAdminEmailVerifyApi()
    }

    if (error != '') {
      setEmailError(error)
    }
    else {
      setEmailError(null)
    }
  }

  const passwordValidate = (text) => {
    let error = "";
    setFirstTimePassword(false);
    if (!text) {
      setPasswordError(t('common.required'));
      return;
    }
    if (error != '') {
      setPasswordError(error)
    }
    else {
      setPasswordError(null)
    }
  }

  const showPopUp = (title, message) => {
    setIsShowPopup(true);
    setPopupTitle(title);
    setPopupMessage(message);
  }

  const onPressOk = () => {
    setIsShowPopup(false);
  }

  function toggleCheckBox() {
    setChecboxSelection(!checkboxSelected);
  }

  async function openTermsOfUse() {
      setPassword('')
      ref_password.current.clear()
      setPasswordError('')
      setShowCheckboxError(false)
      setIsShowDialog(false)
      setPopupMessage(false)
      setPopupTitle(false)
      setIsShowPopup(false)
    let lang = await getValue(keys.APP_LANGUAGE);
    navigation.navigate('CommonWebView', {
      title: t('sideDrawer.termsOfUse'),
      url: termsOfUseUrl + lang + app_true
    });
  }

  async function openPrivacyPolicy() {
      setPassword('')
      ref_password.current.clear()
      setPasswordError('')
      setShowCheckboxError(false)
      setIsShowDialog(false)
      setPopupMessage(false)
      setPopupTitle(false)
      setIsShowPopup(false)
    let lang = await getValue(keys.APP_LANGUAGE);
    navigation.navigate('CommonWebView', {
      title: t('sideDrawer.privacyPolicy'),
      url: privacyPolicyUrl + lang + app_true
    });
  }

  function AllViews() {
    return (
      <>
        <View style={{ flexDirection: 'column', alignContent: 'center', alignItems: 'center', paddingTop: 100 }}>

          {/* Login text field */}
          <OutlinedTextField
            label={t('loginScreen.textField.email')}
            keyboardType='email-address'
            autoCapitalize='none'
            onBlur={() => emailValidate(email)}
            error={emailError}
            onSubmitEditing={() => ref_password.current.focus()}
            onChangeText={(text) => {
              setEmail(text);
              if (!firstTimeEmail) {
                emailValidate(text);
              }
            }}
            renderRightAccessory={renderEmailAccessory}

            ref={ref_email}
            returnKeyType="next"
            baseColor={Colors.textInputBaseColor}
            inputContainerStyle={styles.textInput}
            //containerStyle={{ overflow: 'hidden', padding: 1, margin: 1 }}
            //  titleTextStyle={{ padding: 1, margin: 1 }}
            labelTextStyle={{ padding: 3, margin: 0 }}
            allowFontScaling={false}
            fontSize={14}
          // labelTextStyle={styles.restricted}
          // tintColor={Colors.red}
          />
          {/* Password field */}
          <OutlinedTextField
            // ref={this.passwordRef}
            secureTextEntry={isSecureTextEntry}
            autoCapitalize='none'
            autoCorrect={false}
            onChangeText={(text) => {
              setPassword(text);
              if (!firstTimePassword) {
                passwordValidate(text);
              }

            }}
            label={t('loginScreen.textField.password')}
            keyboardType='default'
            onBlur={() => passwordValidate(password)}
            error={passwordError}
            // onSubmitEditing={this.onSubmit}
            renderRightAccessory={renderPasswordAccessory}
            inputContainerStyle={styles.textInput}
            ref={ref_password}
            labelTextStyle={{ padding: 3, margin: 0 }}
            baseColor={Colors.textInputBaseColor}
            allowFontScaling={false}

          />

        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: -10, width: '96%' }}>
          <TouchableOpacity onPress={() => forgotScreen()}>
            <Text style={{ fontSize: 14, color: 'rgba(144, 32, 122, 0.6)' }}>{t('loginScreen.lable.forgotPassword')}</Text>
          </TouchableOpacity>
        </View>

        <Button style={{width: Platform.isPad ? '95%' :'90%', marginLeft: Platform.isPad ? '3%' :'5%', marginTop: '10%' }} name={t('loginScreen.lable.button')} onPress={login} showRightArrow={true} />
        <View style={{
          flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10,
          marginBottom: DeviceInfo.hasNotch() ? 40 : 20,
        }}>
          <Text style={{ fontSize: Platform.isPad ? 18 :18, color: 'rgba(75,101,175, 0.5)' }}>{t('loginScreen.lable.noaccount')}</Text>
          <TouchableOpacity onPress={() => signupScreen()}>
            <Text style={{ fontSize: 16, color: 'rgba(144, 32, 122, 0.6)', textDecorationLine: 'underline', marginLeft: 0 }}>{t('loginScreen.lable.register')}</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  return (
    <>
      <SafeAreaView style={{ flex: 0, backgroundColor: Colors.Primary }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.White }}>
        <View style={[{ flex: 1, backgroundColor: Colors.White }]}>
          <StatusBar backgroundColor={Colors.Primary} />

          <Dialog
            visible={isShowDialog}
            hasOverlay={true}
            overlayOpacity={isShowDialog ? 0.5 : 0}

            footer={
              <DialogFooter>
                <DialogButton
                  text={t('signUpScreen.lable.confirmTitle')}
                  textStyle={{ color: 'black' }}
                  onPress={() => {
                    if (!showCheckboxError) {
                      setShowCheckboxError(true);
                      return
                    }
                    if (checkboxSelected) {
                      setIsShowDialog(false)
                      updatePrivacyAPI();
                    }
                  }}
                />
              </DialogFooter>
            }

          >
            <DialogContent>
              <View style={{ width: 320 }}>
                <View style={[styles.rowStyle, { marginTop: 10, marginRight: 10 }]}>
                  <TouchableOpacity onPress={() => toggleCheckBox()}>
                    <Image source={checkboxSelected ? require('../../Assets/Images/ic_checkbox.png') : require('../../Assets/Images/ic_uncheck.png')} resizeMode={'contain'}
                      style={{ width: 20, height: 20, marginRight: 10, tintColor: !checkboxSelected && showCheckboxError ? 'red' : '#1E1E1E' }} />
                  </TouchableOpacity>
                  <View style={[styles.rowStyle, { flexWrap: 'wrap', alignItems: 'flex-start' }]}>
                    <Text style={styles.termsConditionTxt}>{t('signUpScreen.lable.byRegistering')}</Text>
                    <TouchableOpacity onPress={() => openPrivacyPolicy()}><Text style={styles.termConditionLink}>{t('signUpScreen.lable.privacyPolicy')}</Text></TouchableOpacity>
                    <Text style={styles.termsConditionTxt}>{t('signUpScreen.lable.andAcceptThe')}</Text>
                    <TouchableOpacity onPress={() => openTermsOfUse()}><Text style={styles.termConditionLink}>{t('signUpScreen.lable.termsOfUse')}</Text></TouchableOpacity>
                  </View>
                </View>
                {!checkboxSelected && showCheckboxError ?
                  <Text style={styles.errorTxt}>{t('common.required')}</Text>
                  : null}

              </View>
            </DialogContent>

          </Dialog>


          <Loader isLoading={isLoading} />
          <Header left={true} name={t('loginScreen.lable.title')} onPressLeft={welcomeScreen} />
          <Popup isShow={isShowPopup} title={popupTitle} message={popupMessage} onPressOk={onPressOk} />
          {Platform.OS === "ios" ?
            <KeyboardAwareScrollView keyboardShouldPersistTaps={'handled'}
       /*  innerRef={(ref) => {
          ref_scroll = //ref;
            ref?._internalFiberInstanceHandleDEV.memoizedProps;
        }} */>
              {AllViews()}
            </KeyboardAwareScrollView>
            : <ScrollView ref={ref_scroll} keyboardShouldPersistTaps={'handled'}>

              {AllViews()}
            </ScrollView>}
          {showRequestVerificationModal ?
            <View style={{
              justifyContent: 'center', alignSelf: 'center', alignItems: 'center', /*  height: 200, position: 'absolute' */
            }}>
              <Modal
                animationType="fade"
                transparent={false}
                visible={showRequestVerificationModal}
                onRequestClose={() => {
                  setShowRequestVerificationModal(!showRequestVerificationModal);
                }}
              >
                <VerificationModal email={email} onClose={() => closeVerificationModal()} />
              </Modal>
            </View>
            : null}

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
    flexDirection: 'row',
  },
  columnStyle: {
    flexDirection: 'column'
  },

  textInput: {
    minHeight: 50,
    // width: '90%',
   width: Platform.isPad ? '94%' :'90%',
    //paddingLeft: 10,
    //paddingTop:5,
    // paddingBottom: 15,
    marginLeft:13,
    marginRight:13,
    marginTop: 10,
    padding: 0,
    // margin: 0,
    borderWidth: 0,
    marginBottom: 10,
  },
  restricted: {
    color: '#FF6965',
    fontSize: 20
  },
  termsConditionTxt: {
    fontSize: 12.5,
    color: Colors.Black,
  },
  termConditionLink: {
    fontSize: 11.5,
    marginTop:1,
    color: 'purple',
    textDecorationLine: 'underline',
    textTransform: 'uppercase',
    marginRight:1
  },
  errorTxt: {
    fontSize: 10,
    color: 'red',
    marginLeft: '10%',
    marginTop: 10
  }
});

export default LoginScreen