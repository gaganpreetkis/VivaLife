import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, Alert } from 'react-native';
import Colors from '../../Constants/colors';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next'
import { MAIN_FONT, MAIN_FONT_BOLD } from '../common/Utils';
import Loader from '../common/Loader';
import Button from '../common/Button';
import { reSendApi } from './loginApi';
import { moderateScale } from '../../helper/ResponsiveFonts';
import NetworkUtils from '../../helper/NetworkUtills';
import { Show, EmailValidation } from '../common/Utils';
import {
  TextField,
  FilledTextField,
  OutlinedTextField,
} from 'react-native-material-textfield';
import { getValue, keys } from '../../helper/Storage';

const reg = EmailValidation;
export default function VerificationModal(props) {
  const navigation = useNavigation();
  const { t } = useTranslation()
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState(null);

  useState(() => {
    setEmail(props.email);
  }, []);

  const validation = async () => {
    let error = "";
    if (!email) {
      error = t('common.emailEmpty');
    } else if (reg.test(email) === false) {
      error = t('common.emailValid');
    }
    if (error == '') {
      checkNetworkPhotoUpload();
    } else {
      Show(error);
    }

  }

  const checkNetworkPhotoUpload = async () => {
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected) {
      resendEmailAPI();
    } else {
      Show(t('common.appIsOfflineBody'), t('common.appIsOfflineHeading'));
    }
  }

  async function resendEmailAPI() {
    setEmailError(null)
    setIsLoading(true);
    const obj = {
      email: email,
    };
    let lang = await getValue(keys.APP_LANGUAGE);
    reSendApi(obj, null, lang).then((resp) => {
      console.log(" verify API=" + JSON.stringify(resp));
      setIsLoading(false);

      if (resp.status === 200) {
        // showMessageAndRedirect(resp.data)
        props.onClose();
        emailVerification(resp.data.token, email);
      }
      else {
        setEmailError(resp.data.error);
        //Show(t(resp.data.error), t('common.error'));
      }
    }).catch(err => {
      setIsLoading(false);
      console.log(err);
      Show(t('common.somethingWentWrong'), t('common.serverError'));
    });
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

  function emailVerification(token, email) {
    // navigation.navigate("EmailVerification");
    navigation.navigate("EmailVerification", {
      token: token,
      email, email
    });
  }

  function checkValidation(text) {
    let error = "";
    if (!text) {
      error = t('common.required');
    } else if (reg.test(text) === false) {
      error = t('common.emailValid');
    }
    if (error == '') {
      setEmailError(null)
    } else {
      //Show(error);
      setEmailError(error)
    }
  }

 


  return (
    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <View style={styles.container}>
        <Loader isLoading={isLoading} />
        <ScrollView /* showsVerticalScrollIndicator={false} */>
          <View>
            <View style={[styles.rowStyle, { height: 40, alignItems: 'center', justifyContent: 'space-between' }]}>
              <View style={{ width: 14 }}></View>
              <Text style={{ fontSize: moderateScale(16), color: Colors.Black, alignSelf: 'center', fontFamily: MAIN_FONT_BOLD ? MAIN_FONT_BOLD : '', }}>
                {t('verificationModal.label.resendActiveEmailLink')}</Text>
              <TouchableOpacity onPress={() => props.onClose()}>
                <MaterialIcon
                  size={22}
                  name={'close'}
                  color={Colors.Black}
                  suppressHighlighting={true}
                  style={{ alignSelf: 'center', padding: 5 }}
                  solid
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.heading}>{t('verificationModal.label.accountActivationEmailResend')}</Text>
            <View style={styles.rowStyle}>
              <Text style={[styles.normalTxt, styles.number]}>{t('verificationModal.label.numOne')}</Text>
              <Text style={styles.normalTxt}>{t('verificationModal.label.accountActivationEmailResendStep1')}</Text>
            </View>
            <View style={styles.rowStyle}>
              <Text style={[styles.normalTxt, styles.number]}>{t('verificationModal.label.numTwo')}</Text>
              <View style={[styles.columnStyle, { flex: 1 }]}>
                <Text style={[styles.normalTxt, styles.number]}>{t('verificationModal.label.accountActivationEmailResendStep2')}</Text>
              </View>
            </View>
            {/* <View style={styles.rowStyle}>
                            <Text style={[styles.normalTxt, styles.number]}>{t('verificationModal.label.numThree')}</Text>
                            <Text style={styles.normalTxt}>{t('verificationModal.label.stepThree')}</Text>
                        </View> */}

            <OutlinedTextField
              label={t('loginScreen.textField.email')}
              autoCapitalize='none'
              keyboardType='email-address'
              onChangeText={(text) => {
                setEmail(text);
                checkValidation(text);
              }}
              renderRightAccessory={renderEmailAccessory}
              inputContainerStyle={{ marginTop: 30 }}
              returnKeyType="done"
              baseColor={Colors.textInputBaseColor}
              style={{ marginTop: 30 }}
              value={email}
              error={emailError}
            // labelTextStyle={styles.restricted}
            // tintColor={Colors.red}
            labelTextStyle={{ padding: 3, margin: 0 }}
              allowFontScaling={false}
            />
            <Button style={{ width: '100%', marginTop: 0 }} name={t('verificationModal.label.resend')} onPress={validation} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', }}>

              <Text style={{
                fontSize: 18, marginTop: 20, color: Colors.Black,
                fontWeight: 'bold'
              }}>{t('verificationModal.label.help')}
                <Text style={{
                  fontSize: 16, marginTop: 20, color: '#000000',
                  fontWeight: '400'
                }}>{t('verificationModal.label.accountActivationEmailResendHelp1')}</Text>
                 <Text style={{
                  fontSize: 16, marginTop: 20, color: '#000000',
                  fontWeight: 'bold'
                }}>{t('verificationModal.label.accountActivationEmailResendHelp2')}</Text>
                 <Text style={{
                  fontSize: 16, marginTop: 20, color: '#000000',
                  fontWeight: '400'
                }}>{t('verificationModal.label.accountActivationEmailResendHelp3')}</Text>
              </Text>

            </View>
          </View>
        </ScrollView>

      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    width: '90%',
    height: '90%',
    backgroundColor: Colors.White,
    shadowColor: Colors.lightGrey,
    shadowRadius: 0,
    shadowOpacity: 0,
    elevation: 0,
    borderColor: Colors.lightGrey,
    borderWidth: 2,
    borderRadius: 10,
    paddingTop: 10,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
    alignSelf: 'center',
    marginTop: '10%'
  },
  rowStyle: {
    flexDirection: 'row',

  },
  columnStyle: {
    flexDirection: 'column'
  },
  heading: {
    fontSize: 18,
    color: Colors.Black,
    marginTop: 20
  },
  number: {
    marginRight: 6
  },
  normalTxt: {
    fontSize: 16,
    fontFamily: MAIN_FONT ? MAIN_FONT : '',
    color: 'rgba(0,0,0,0.8)',
    marginTop: 20,
    // lineHeight: 24,
    marginRight: 5
  }
});