import React, { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  View,
  Dimensions,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  StatusBar,
  Keyboard,
  ScrollView,
  Platform,
  SafeAreaView,
  BackHandler
} from 'react-native'
import { Brand } from '@/Components'
import { useTheme } from '@/Theme'
import { useTranslation } from 'react-i18next'
import { useNavigation, useIsFocused } from '@react-navigation/native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import DeviceInfo from 'react-native-device-info';
import Tooltip from "react-native-walkthrough-tooltip";
import Dialog, { DialogTitle, DialogFooter, DialogButton, DialogContent } from 'react-native-popup-dialog';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { MAIN_FONT, MAIN_FONT_BOLD, Show, EmailValidation } from '../common/Utils';
import { emailVerify, OrgIdVerify, signUp } from './Api';
import { moderateScale } from '../../helper/ResponsiveFonts'
import ChangeTheme from '@/Store/Theme/ChangeTheme'
import Colors from "../../Constants/colors";
import Loader from '../common/Loader';
import Button from '../common/Button';
import {
  TextField,
  FilledTextField,
  OutlinedTextField,
} from 'react-native-material-textfield';
import Header from '../common/Header'
import { navigateAndSimpleReset } from '../../Navigators/Root'
import { app_true, privacyPolicyUrl, termsOfUseUrl } from '../../Network/apiUrl'
import { getValue, keys, setValue } from '../../helper/Storage'
import NetworkUtils from '../../helper/NetworkUtills';
import Popup from '../common/Popup'

const widthScreen = Dimensions.get("window").width;
const heightScreen = Dimensions.get('window').height;
const reg = EmailValidation;
// const passwordReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d].{7,}$/;
const passwordReg = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

//let ref_scroll;
const SignUpScreen = () => {
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const { t } = useTranslation()
  const { Common, Fonts, Gutters, Layout } = useTheme()
  const [isLoading, setIsLoading] = useState(false);
  const [firstName, setFirstName] = useState(false);
  const [firstNameError, setFirstNameError] = useState(null);
  const [lastName, setLastName] = useState(false);
  const [lastNameError, setLastNameError] = useState(null);
  const [email, setEmail] = useState(false);
  const [emailError, setEmailError] = useState(null);
  const [password, setPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState(false);
  const [orgId, setOrgId] = useState(false);
  const [orgIdError, setOrgIdError] = useState(null);
  const [empId, setEmpId] = useState('');
  const [isOrgIdValid, setOrgIdValid] = useState(false);
  const [checkOrgId, setCheckOrgId] = useState(true);
  const [orgIdApi, setOrgIdApi] = useState('');
  const [checkboxSelected, setChecboxSelection] = useState(false);
  const dispatch = useDispatch()
  const [isSecurePasswordTextEntry, setSecurePasswordTextEntry] = useState(true);
  const [isSecureConfirmPasswordTextEntry, setSecureConfirmPasswordTextEntry] = useState(true);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isShowDialog, setIsShowDialog] = useState(false);
  const [orgCompanyName, setOrgCompanyName] = useState('');
  const [isShowPopup, setIsShowPopup] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [showTipOrgId, setTipOrgId] = useState(false);
  const [showTipEmpId, setShowTipEmpId] = useState(false);

  const ref_firstName = useRef();
  const ref_lastName = useRef();
  const ref_email = useRef();
  const ref_password = useRef();
  const ref_orgId = useRef();
  const ref_empId = useRef();
  const ref_scroll = useRef();

  useEffect(() => {
    if (orgId != undefined && orgId.length == 0) {
      setOrgIdError(null);
    }
  }, [orgId]);

  function handleBackButtonClick() {
    if (isShowDialog) {
      setIsShowDialog(false);
      setPopupMessage(false);
      setPopupTitle(false);
      setIsShowDialog(false);
      setIsShowPopup(false);
    } else {
      navigation.goBack();
      setIsShowDialog(false);
      setPopupMessage(false);
      setPopupTitle(false);
      setIsShowDialog(false);
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

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        console.log('keyboardDidShow');
        setKeyboardVisible(true); // or some other action
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        console.log('keyboardDidHide');
        setKeyboardVisible(false); // or some other action
        ref_firstName.current.blur();
        ref_lastName.current.blur();
        ref_email.current.blur();
        ref_password.current.blur();
        ref_orgId.current.blur();
        // ref_empId.current.blur();
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const changeTheme = ({ theme, darkMode }) => {
    dispatch(ChangeTheme.action({ theme, darkMode }))
  }

  function loginScreen() {
    navigation.navigate("LoginScreen");
  }

  function goBack() {
    navigation.pop();
  }

  function emailVerification(token, email) {
    // navigation.navigate("EmailVerification");
    navigation.navigate("EmailVerification", {
      token: token,
      email, email
    });
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

  function register() {
    if (emailError != null) {
      return;
    }
    setFirstNameError(null);
    setLastNameError(null);
    setEmailError(null);
    setPasswordError(null);
    let error = "";
    let upperCase = /^(?=.*[A-Z])/
    if (!firstName) {
      ref_firstName.current.focus();
      setFirstNameError(t('common.required'));
      //console.log("ref_scroll" + ref_scroll);
      scrollViewUpTo(0);

      //console.log("ref_scroll2" + ref_scroll.current);
    } else if (!lastName) {
      ref_lastName.current.focus();
      setLastNameError(t('common.required'));
      scrollViewUpTo(30);
    } else if (!email) {
      ref_email.current.focus();
      setEmailError(t('common.required'));
      scrollViewUpTo(60);
    } else if (reg.test(email) === false) {
      ref_email.current.focus();
      error = t('common.emailValid');
      setEmailError(t(error));
      scrollViewUpTo(60);
    } else if (!password) {
      setPasswordError(t('common.passwordValid'));
      ref_password.current.focus();
      scrollViewUpTo(90);
    } else if (password.length < 8 || password.length > 50) {
      error = t('common.passwordValid');
      setPasswordError(error);
      ref_password.current.focus();
      scrollViewUpTo(90);
    } else if (upperCase.test(password) === false) {
      error = t('common.passwordValid');
      setPasswordError(error);
      ref_password.current.focus();
      scrollViewUpTo(90);
    } else if (password.search(/[a-z]/i) < 0) {
      error = t('common.passwordValid');
      setPasswordError(error);
      ref_password.current.focus();
      scrollViewUpTo(90);
    } else if (password.search(/[0-9]/) < 0) {
      error = t('common.passwordValid');
      setPasswordError(error);
      ref_password.current.focus();
      scrollViewUpTo(90);
    }
   /*  else if (!checkboxSelected) {
      error = t('common.selectTermPolicy');
      //Show(error, "");
      showPopUp(t('common.error'), error);
    } */ else {

      if (error == '') {
        checkNetwork();
        //navigateAndSimpleReset('MainScreen')
      }
    }
  }



  function checkFirstNameValidation() {
    if (!firstName) {

      setFirstNameError(t('common.required'));
    } else {
      setFirstNameError(null);
    }
  }

  function checkLastNameValidation() {
    if (!lastName) {
      //ref_lastName.current.focus();
      setLastNameError(t('common.required'));
    } else {
      setLastNameError(null);
    }
  }

  function checkPasswordValidation(text) {
    if (text == undefined) {
      return
    }
    setPassword(text);
    let error = "";
    let upperCase = /^(?=.*[A-Z])/

    if (!password) {
      // error = t('common.required');
      setPasswordError(t('common.passwordValid'));
      return;
    } else if (text.length < 8 || text.length > 50) {
      error = t('common.passwordValid');
    } else if (upperCase.test(text) === false) {
      error = t('common.passwordValid');
    } else if (text.search(/[a-z]/i) < 0) {
      error = t('common.passwordValid');
    } else if (text.search(/[0-9]/) < 0) {
      error = t('common.passwordValid');
    }

    if (error != '') {
      setPasswordError(error)
    } else {
      setPasswordError(null)
    }
  }

  const checkNetwork = async () => {
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected) {
      checkOrgIdValid();
    } else {
      //Show(t('common.appIsOfflineBody'), t('common.appIsOfflineHeading'));
      showPopUp(t('common.appIsOfflineHeading'), t('common.appIsOfflineBody'));
    }
  }

  const checkOrgIdValid = () => {
    if (checkOrgId) {
      console.log("check pp");
      if (!checkboxSelected) {
        error = t('common.selectTermPolicy');
        showPopUp(t('common.error'), error);
      } else {
        console.log("signUp");
        signUpAPI();
      }

    } else {
      console.log("VerifyApi..");
      OrgIdVerifyApi()
    }
  }

  const signUpAPI = async () => {
    Keyboard.dismiss();
    let lang = await getValue(keys.APP_LANGUAGE);
    const obj = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      password: password,
      language: lang

    }
    if (isOrgIdValid) {
      obj['org_id'] = orgIdApi;
      obj['employee_id'] = empId;
    }
    console.log('sending api' + JSON.stringify(obj));
    setIsLoading(true);
    signUp(obj, null, lang).then((resp) => {
      console.log("signUp API=" + JSON.stringify(resp));
      setIsLoading(false);
      if (resp.status === 200) {
        // showMessageAndRedirect(resp.data, email);
        emailVerification(resp.data.token, email);
      } else {
        // Show(resp.data.errors[0], t('common.error'));
        showPopUp(t('common.error'), resp.data.errors[0]);
      }
    }).catch(err => {
      setIsLoading(false);
      //Show(t('common.somethingWentWrong'), t('common.serverError'));
      showPopUp(t('common.serverError'), t('common.somethingWentWrong'));
    });
  };

  const emailVerifyApi = async () => {
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
      emailVerify(obj, null, lang).then((resp) => {
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

  const OrgIdVerifyApi = async () => {
    // orgIdNameConfirm();
    Keyboard.dismiss();
    setOrgIdError(null);//clear error
    console.log("inside OrgIdVerifyApi");
    if (orgId) {
      const obj = {
        org_id: orgId,
      }
      setIsLoading(true);
      let lang = await getValue(keys.APP_LANGUAGE);
      OrgIdVerify(obj, null, lang).then((resp) => {
        console.log("OrgIdVerifyApi API res==" + JSON.stringify(resp));
        if (resp.status === 200) {
          setIsLoading(false);
          if (isFocused) {
            setOrgCompanyName(resp.data.data.org_name);
            setIsShowDialog(true)
            //orgIdNameConfirm(resp.data.data.org_name);
            setOrgIdApi(resp.data.data.id);
            setOrgIdError(null);
          }
        } else {
          setIsLoading(false);
          // setOrgId(resp.data.error);
          // ref_empId.current.clear();
          setOrgIdError(resp.data.error);
        }
      }).catch(err => {
        setIsLoading(false);
        //Show(t('common.somethingWentWrong'), t('common.serverError'));
        showPopUp(t('common.serverError'), t('common.somethingWentWrong'));
      });
    } else {
      setEmpId('');
    }
  }

  function onAccessoryPress() {
    setSecurePasswordTextEntry(!isSecurePasswordTextEntry);
  }

  function onAccessoryPressConfirmPassword() {
    setSecureConfirmPasswordTextEntry(!isSecureConfirmPasswordTextEntry);
  }

  function renderUserAccessory() {
    return (
      <Image
        source={require('../../Assets/Images/ic_user.png')}
        style={{ height: 20, width: 20 }}
        resizeMode={'contain'}
      />
    );
  }

  function renderEmailAccessory() {
    return (
      <MaterialIcon
        size={22}
        name={'email'}
        color={'#DADEED'}
        // onPress={this.onEmailIconPress}
        suppressHighlighting={true}
      />
    );
  }

  function renderPasswordAccessory() {
    let name = isSecurePasswordTextEntry ?
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

  function renderEmployeeIDAccessory() {
    return (
      <Image
        source={require('../../Assets/Images/ic_employee_id.png')}
        style={{ height: 20, width: 20 }}
        resizeMode={'contain'}
      />
    );
  }

  function renderOrganisationIdAccessory() {
    return (
      <Image
        source={require('../../Assets/Images/ic_orgId.png')}
        style={{ height: 20, width: 20 }}
        resizeMode={'contain'}
      />
    );
  }


  function onOrgIdPressTip() {
    console.log("onOrgIdPressTip");
    setTipOrgId(true);
  }

  function onEmpIdPressTip() {
    console.log("onEmpIdPressTip");
    setShowTipEmpId(true);
  }


  function toggleCheckBox() {
    setChecboxSelection(!checkboxSelected);
  }

  async function openTermsOfUse() {
    let lang = await getValue(keys.APP_LANGUAGE);
    navigation.navigate('CommonWebView', {
      title: t('sideDrawer.termsOfUse'),
      url: termsOfUseUrl + lang + app_true
    });
  }

  async function openPrivacyPolicy() {
    let lang = await getValue(keys.APP_LANGUAGE);
    navigation.navigate('CommonWebView', {
      title: t('sideDrawer.privacyPolicy'),
      url: privacyPolicyUrl + lang + app_true
    });
  }

  function setEmpIdValidation(text) {
    if (text.length == 0) {
      // ref_empId.current.clear();
      setCheckOrgId(true);
    } else {
      setCheckOrgId(false);
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

  function AllViews() {
    return (
      <>
        <View style={{ flexDirection: 'column', alignContent: 'center', alignItems: 'center', marginTop: 20, flex: 1, backgroundColor: 'white'}}>
          <OutlinedTextField
            ref={ref_firstName}
            label={t('signUpScreen.textField.firstName')}
            keyboardType='default'
            // formatText={this.formatText}
            onBlur={() => checkFirstNameValidation()}
            onSubmitEditing={() => ref_lastName.current.focus()}
            onChangeText={(text) => { setFirstName(text) }}
            renderRightAccessory={renderUserAccessory}
            inputContainerStyle={styles.textInput}
            returnKeyType="next"
            baseColor={Colors.textInputBaseColor}
            error={firstNameError}
            labelTextStyle={{ padding: 3, margin: 0 }}
            allowFontScaling={false}
          />

          <OutlinedTextField
            ref={ref_lastName}
            label={t('signUpScreen.textField.lastName')}
            keyboardType='default'
            // formatText={this.formatText}
            onBlur={() => checkLastNameValidation()}
            onSubmitEditing={() => ref_email.current.focus()}
            onChangeText={(text) => { setLastName(text) }}
            renderRightAccessory={renderUserAccessory}
            inputContainerStyle={styles.textInput}
            returnKeyType="next"
            baseColor={Colors.textInputBaseColor}
            error={lastNameError}
            labelTextStyle={{ padding: 3, margin: 0 }}
            allowFontScaling={false}
          />

          <OutlinedTextField
            ref={ref_email}
            label={t('signUpScreen.textField.email')}
            autoCapitalize='none'
            keyboardType='email-address'
            // formatText={this.formatText}
            onBlur={() => emailVerifyApi()}
            onSubmitEditing={() => ref_password.current.focus()}
            onChangeText={(text) => { setEmail(text) }}
            renderRightAccessory={renderEmailAccessory}
            inputContainerStyle={styles.textInput}
            error={emailError}
            baseColor={Colors.textInputBaseColor}
            labelTextStyle={{ padding: 3, margin: 0 }}
            allowFontScaling={false}
          />

          {emailError != null && emailError != undefined && emailError.length > 100 ? <View style={{height: 5}}></View> : null }

          <OutlinedTextField
            ref={ref_password}
            secureTextEntry={isSecurePasswordTextEntry}
            autoCapitalize='none'
            autoCorrect={false}
            onChangeText={(text) => {
              checkPasswordValidation(text);
              setOrgIdValid(false);
            }}
            label={t('signUpScreen.textField.password')}
            keyboardType='default'
            // formatText={this.formatText}
            onBlur={() => checkPasswordValidation(password)}
            onSubmitEditing={() => checkPasswordValidation(password)}
            // onSubmitEditing={() => ref_orgId.current.focus()}
            renderRightAccessory={renderPasswordAccessory}
            inputContainerStyle={styles.textInput}
            error={passwordError}
            baseColor={Colors.textInputBaseColor}
            labelTextStyle={{ padding: 3, margin: 0 }}
            allowFontScaling={false}
          />

          {passwordError != null && passwordError.length > 0 ? <View style={{ height: 5 }}></View> : null}

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '90%' }}>
            <View style={{ width: Platform.isPad ? '92%' :'92%',marginLeft:-19 }}>
              <OutlinedTextField
                ref={ref_orgId}
                label={t('signUpScreen.textField.orgId')}
                keyboardType='default'
                onBlur={() => OrgIdVerifyApi()}
                onSubmitEditing={() => ref_orgId.current.focus()}
                onChangeText={(text) => {
                  setEmpIdValidation(text);
                  setOrgId(text)
                }}
                //renderLeftAccessory={renderOrganisationIdTipTool}
                // renderRightAccessory={renderOrganisationIdAccessory}
                inputContainerStyle={styles.textInput2}
                keyboardType={'phone-pad'}
                maxLength={6}
                // returnKeyType="next"
                error={orgIdError}
                baseColor={Colors.textInputBaseColor}
                labelTextStyle={{ padding: 3, margin: 0 }}
                allowFontScaling={false}
              />
            </View>
            <View style={{ width: '12%' }}>
              {/*  <RenderOrganisationIdTipTool /> */}
              <Tooltip
                isVisible={showTipOrgId}
                content={
                  <View>
                    <Text> {t('common.organisationIdTip')}</Text>
                  </View>
                }
                onClose={() => setTipOrgId(false)}
                placement="bottom"
              // topAdjustment={Platform.OS === 'android' ? -StatusBar.currentHeight : 0}
              >
                <TouchableOpacity onPress={() => onOrgIdPressTip()}>
                  <View style={{ width: moderateScale(25), height: moderateScale(25),marginRight: Platform.OS === 'android' ? moderateScale(14) : moderateScale(14) }}>
                    <Image
                      source={require('../../Assets/Images/tip_icon.png')}
                      style={{ height: moderateScale(20), width: moderateScale(20), marginLeft: Platform.OS === 'android' ? moderateScale(8) : moderateScale(10) }}
                      resizeMode={'contain'}
                    //onPress={onEmpIdPressTip}
                    />
                  </View>
                </TouchableOpacity>
              </Tooltip>
              {/*  <RenderOrganisationIdTipTool /> */}
            </View>
          </View>
          <View style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '90%',
            display: 'none' // asked by client
          }}>
            <View style={{ width: '88%',marginLeft:-19 }}>
              <OutlinedTextField
                ref={ref_empId}
                label={t('signUpScreen.textField.empId')}
                keyboardType='default'
                // formatText={this.formatText}
                // onSubmitEditing={this.onSubmit}
                onChangeText={(text) => { setEmpId(text) }}
                //renderRightAccessory={renderEmployeeIDAccessory}
                inputContainerStyle={styles.textInput2}
                disabled={!isOrgIdValid ? true : false}
                baseColor={Colors.textInputBaseColor}
                labelTextStyle={{ padding: 3, margin: 0 }}
                allowFontScaling={false}
              />
            </View>
            <View style={{ width: '12%' }}>
              {/*  <RenderEmpIdTipTool /> */}
              <Tooltip
                isVisible={showTipEmpId}
                content={
                  <View>
                    <Text> {t('common.employeeIdTip')}</Text>
                  </View>
                }
                onClose={() => setShowTipEmpId(false)}
                placement="bottom"
              //topAdjustment={Platform.OS === 'android' ? -StatusBar.currentHeight : 0}
              >
                <TouchableOpacity onPress={() => onEmpIdPressTip()}>
                  <View style={{ height: moderateScale(25), height: moderateScale(25),marginRight: Platform.OS === 'android' ? moderateScale(14) : moderateScale(14) }}>
                    <Image
                      source={require('../../Assets/Images/tip_icon.png')}
                      style={{ height: moderateScale(20), width: moderateScale(20), marginLeft: Platform.OS === 'android' ? moderateScale(8) : moderateScale(10)  }}
                      resizeMode={'contain'}
                    //onPress={onEmpIdPressTip}
                    />
                  </View>
                </TouchableOpacity>
              </Tooltip>
              {/*  <RenderEmpIdTipTool /> */}
            </View>
          </View>
        </View>

        <View style={[styles.rowStyle, { marginLeft: Platform.isPad ? '3%' :'3%', marginRight: '6%', marginTop:'2%' }]}>
          <TouchableOpacity onPress={() => toggleCheckBox()}>
            <Image source={checkboxSelected ? require('../../Assets/Images/ic_checkbox.png') : require('../../Assets/Images/ic_uncheck.png')} resizeMode={'contain'}
              style={{ width: 20, height: 20, marginRight: 8 }} />
          </TouchableOpacity>

          {/*   <Text style={styles.termsConditionTxt}>{t('signUpScreen.lable.byRegistering')+t('signUpScreen.lable.privacyPolicy')
              +t('signUpScreen.lable.andAcceptThe')+t('signUpScreen.lable.termsOfUse')}</Text> */}
          <View style={[styles.rowStyle, { flexWrap: 'wrap', alignItems: 'flex-start' }]}>
            <Text style={styles.termsConditionTxt}>{t('signUpScreen.lable.byRegistering')}</Text>
            <TouchableOpacity onPress={() => openPrivacyPolicy()}><Text style={styles.termConditionLink}>{t('signUpScreen.lable.privacyPolicy')}</Text></TouchableOpacity>
            <Text style={styles.termsConditionTxt}>{t('signUpScreen.lable.andAcceptThe')}</Text>
            <TouchableOpacity onPress={() => openTermsOfUse()}><Text style={styles.termConditionLink}>{t('signUpScreen.lable.termsOfUse')}</Text></TouchableOpacity>
          </View>
        </View>

        <Button style={{ width: Platform.isPad ? '95%' :'94%', marginLeft: Platform.isPad ? '3%' :'3%', marginTop: 20 }} name={t('signUpScreen.lable.register')} onPress={register} />

        <View style={{
          flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 0,
          marginBottom: DeviceInfo.hasNotch() ? 40 : 20,
        }}>
          <Text style={{ fontSize: 16, color: 'blue', opacity: 0.6 }}>{t('signUpScreen.lable.alreadyAccount')}</Text>
          <TouchableOpacity onPress={() => loginScreen()}>
            <Text style={styles.signInButton}>{t('signUpScreen.lable.signIn')}</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  return (
    <>
      <SafeAreaView style={{ flex: 0, backgroundColor: Colors.Primary }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.White }}>
        <View style={[Layout.fill, styles.container]}>
          <StatusBar backgroundColor={Colors.Primary} />
          <Loader isLoading={isLoading} />
          <Header left={true} name={t('signUpScreen.lable.title')} onPressLeft={() => navigation.pop()} />
          <Popup isShow={isShowPopup} title={popupTitle} message={popupMessage} onPressOk={onPressOk} />


          <Dialog
            visible={isShowDialog}
            dialogTitle={<DialogTitle title={t('signUpScreen.lable.confirmTitle')}
              textStyle={{ fontWeight: 'bold' }} />}
            overlayOpacity={0.5}
            footer={
              <DialogFooter>
                <DialogButton
                  text={t('common.no')}
                  textStyle={{ color: 'black' }}
                  onPress={() => {
                    ref_orgId.current.clear();
                    // ref_empId.current.clear();
                    setOrgIdValid(false)
                    setIsShowDialog(false)
                  }}
                />
                <DialogButton
                  text={t('common.yes')}
                  textStyle={{ color: 'black' }}
                  color='black'
                  onPress={() => {
                    setCheckOrgId(true)
                    setOrgIdValid(true)
                    setIsShowDialog(false)
                  }}
                />
              </DialogFooter>
            }

          >
            <DialogContent>
              <View style={{ width: 280}}>
                <Text style={{ marginTop: 10 }}>
                  <Text style={{ fontSize: 15 }}>{t('common.organisationConfirm')}</Text>
                  <Text style={{ fontWeight: "bold" }}>{t('common.organisationConfirm2').replace("{organization}", orgCompanyName)}</Text>
                  <Text style={{ fontSize: 15 }}>{t('common.organisationConfirm3')}</Text>
                </Text>

              </View>
            </DialogContent>

          </Dialog>
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
    width: Platform.isPad ? '94%' :'93%',
    padding: 0,
    // paddingLeft: 10,
    marginLeft:13,
    marginRight:13,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 30,
    borderWidth: 0,
  },
  textInput2: {
    minHeight: 50,
    width: '95%',
    padding: 0,
    // paddingLeft: 10,
    marginTop: 8,
    marginLeft:10,
    marginBottom: 8,
    borderRadius: 30,
    borderWidth: 0,
  },
  termsConditionTxt: {
    fontSize: 12.5,
    color: Colors.Black,
  },
  termConditionLink: {
    fontSize: 12.5,
    color: 'purple',
    textDecorationLine: 'underline',
    textTransform: 'uppercase',
    marginRight:1
  },
  signInButton: {
    fontSize: 14,
    color: 'purple',
    textTransform: 'uppercase',
    textDecorationLine: 'underline'
  }
});

export default SignUpScreen