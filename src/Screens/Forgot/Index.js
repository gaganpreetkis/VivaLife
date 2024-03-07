import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  Alert,
  Platform,
  StatusBar,
  SafeAreaView,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native'

import { useTheme } from '@/Theme'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import {
  TextField,
  FilledTextField,
  OutlinedTextField,

} from 'react-native-material-textfield';

import NetworkUtils from '../../helper/NetworkUtills';
import ChangeTheme from '@/Store/Theme/ChangeTheme'
import Loader from '../common/Loader';
import { Colors } from "@/Constants";
import { api } from './api';
import Button from '../common/Button';
import { MAIN_FONT, MAIN_FONT_BOLD, Show, EmailValidation } from '../common/Utils';
import Header from '../common/Header';
import Popup from '../common/Popup'
import { superAdminEmailVerify } from './api'
import { getValue, keys } from '../../helper/Storage'
fieldRef = React.createRef();
const reg = EmailValidation;
const Forgot = (props) => {

  const params = props.route.params;
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [firstTimeEmail, setFirstTimeEmail] = useState(true);
  const [emailError, setEmailError] = useState(null);
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const [showMessage, setShowMessage] = useState(false);
  const [isShowPopup, setIsShowPopup] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupMessage, setPopupMessage] = useState('');

  useEffect(() => {

  }, []);

  function onBack() {
    navigation.pop();
  }

  function emailVerification(token, email) {
   // console.log("from"+params.cameFromSettings);
    if (params?.cameFromSettings != undefined) {
      navigation.navigate("EmailVerification", {
        token: token,
        email: email,
        cameFromSettings: true,
        cameFromForgotScreen: true
      });
    } else {
      navigation.navigate("EmailVerification", {
        token: token,
        email: email,
        cameFromForgotScreen: true
      });
    }
  }

  function checkValidation() {
    setFirstTimeEmail(false);
    let error = "";
    if (!email) {
      error = t('common.required');
    } else if (reg.test(email) === false) {
      error = t('common.emailValid');
    } else if (emailError) {
      return
    }
    if (error == '') {
      checkNetwork();
      //navigation.navigate("SignUpScreen");
    } else {
      setEmailError(error)
    }
  }

  const checkNetwork = async () => {
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected) {
      Api();
    } else {
      // Show(t('common.appIsOfflineBody'), t('common.appIsOfflineHeading'));
      showPopUp(t('common.appIsOfflineHeading'), t('common.appIsOfflineBody'));
    }
  }

  async function Api() {
    setEmailError(null);
    setIsLoading(true);
    let obj = {
      email: email,
      type: "app"
    };
    let lang = await getValue(keys.APP_LANGUAGE);
    api(obj, null, lang).then((resp) => {
      console.log(JSON.stringify(resp));
      setIsLoading(false);
      if (resp.status === 200) {
        emailVerification(resp.data.token, email);
      } else {
        console.log(resp.data.error);
        if (resp.data.error != undefined) {
          setEmailError(resp.data.error);
          //setEmailError('resp.data.error');
        } else {
          //Show(t('common.somethingWentWrong'), t('common.error'));
          showPopUp(t('common.serverError'), t('common.somethingWentWrong'));
        }
      }
    }).catch(err => {
      setIsLoading(false);
      console.log(JSON.stringify(err));
      //Show(t('common.somethingWentWrong'), t('common.serverError'));
      showPopUp(t('common.serverError'), t('common.somethingWentWrong'));
    });
  }

  function renderEmailAccessory() {
    return (
      <MaterialIcon
        size={24}
        name={'email'}
        color={'#DADEED'}
        // onPress={this.onEmailIconPress}
        suppressHighlighting={true}
      />
    );
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


  const showPopUp = (title, message) => {
    setIsShowPopup(true);
    setPopupTitle(title);
    setPopupMessage(message);
  }

  const onPressOk = () => {
    setIsShowPopup(false);
  }

  return (
    <>
      <SafeAreaView style={{ flex: 0, backgroundColor: Colors.Primary }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.White }}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={{ flex: 1, backgroundColor: 'white' }}>
          <StatusBar backgroundColor={Colors.Purple} />
          <Loader isLoading={isLoading} />
          <Header name={t('forgotPassword.label.title')} left={true} onPressLeft={onBack} />
          <Popup isShow={isShowPopup} title={popupTitle} message={popupMessage} onPressOk={onPressOk} />
          <View style={{
            flexDirection: 'column', alignContent: 'center', alignItems: 'center',
            justifyContent: 'center', marginTop: 40
          }}>

            {!showMessage ?
              <View style={[styles.columnStyle, { width: '100%', alignItems: 'center' }]} >
                <OutlinedTextField
                  label={t('loginScreen.textField.email')}
                  keyboardType='email-address'
                  autoCapitalize='none'
                  onBlur={() => emailValidate(email)}
                  error={emailError}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (!firstTimeEmail) {
                      emailValidate(text);
                    }
                  }}
                  renderRightAccessory={renderEmailAccessory}
                  inputContainerStyle={styles.textInput}
                  labelTextStyle={{ padding: 3, margin: 0 }}
                  allowFontScaling={false}
                />

                <Button style={{ width: '80%', marginTop: 10 }} name={t('forgotPassword.label.next')} onPress={checkValidation} />
              </View>
              :
              <View style={{ width: '100%', alignItems: 'center' }}>
                {/*   <Text style={styles.messageStyle}>{t('forgotPassword.label.linkHasBeen')}</Text> */}
                <Text style={[styles.messageStyle, styles.emailStyle]}>{email}</Text>
                {/*     <Text style={styles.messageStyle}>{t('forgotPassword.label.toResetPassword')}</Text> */}
                <Text style={styles.messageStyle}>{t('forgotPassword.label.pleaseCheckEmail')}</Text>

                <Button style={{ width: '80%', marginTop: 30 }} name={t('forgotPassword.label.ok')} onPress={emailVerification} />
              </View>
            }
          </View>
        </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </>
  );

}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  columnStyle: {
    flexDirection: 'column'
  },
  rowStyle: {
    flexDirection: 'row'
  },
  textInput: {
    minHeight: 50,
    padding: 0,
    marginTop: 10,
    marginBottom: 10,
    marginLeft:13,
    marginRight:13,
    width: Platform.OS === "ios" ? '80%' : '80%'
  },
  messageStyle: {
    fontSize: 18,
    marginTop: 5,
    fontFamily: MAIN_FONT ? MAIN_FONT : '',
    alignSelf: 'center',
    color: Colors.Black,
  },
  emailStyle: {
    fontFamily: Platform.OS === "ios" ? MAIN_FONT : MAIN_FONT_BOLD,
    fontWeight: '600',
  }
});

export default Forgot



