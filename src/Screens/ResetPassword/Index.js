import React, { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    View,
    StyleSheet,
    Alert,
    Platform,
    StatusBar, BackHandler, Keyboard, SafeAreaView
} from 'react-native'
import { Brand } from '@/Components'
import { useTheme } from '@/Theme'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { navigateAndSimpleReset, navigateAndReset } from "../../Navigators/Root";
import Loader from '../common/Loader';
import { Colors } from "@/Constants";
import { api } from './api';
import Button from '../common/Button';
import { MAIN_FONT, MAIN_FONT_BOLD, Show } from '../common/Utils';
import Header from '../common/Header';
import {
    TextField,
    FilledTextField,
    OutlinedTextField,
} from 'react-native-material-textfield';
import { getValue, keys, logout } from '../../helper/Storage'
import Popup from '../common/Popup'
import PopupWithoutTitle from '../common/PopupWithoutTitle';
import NetworkUtils from '../../helper/NetworkUtills';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
fieldRef = React.createRef();

const passwordReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d].{7,}$/;

export default function ResetPassword(props) {
    const params = props.route.params;
    const navigation = useNavigation();

    const [isSecureTextEntry, setSecureTextEntry] = useState(true);
    const [isSecureConfirmTextEntry, setSecureConfirmTextEntry] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState(null);
    const [confirmPasswordError, setConfirmPasswordError] = useState(null);
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const { t } = useTranslation()
    const [isShowPopup, setIsShowPopup] = useState(false);
    const [popupTitle, setPopupTitle] = useState('');
    const [popupMessage, setPopupMessage] = useState('');
    const [isShowPopupWithoutTitle, setIsShowPopupWithoutTitle] = useState(false);
    const [popupMessageWithoutTitle, setPopupMessageWithoutTitle] = useState('');
    const ref_password = useRef();
    const ref_confirm_password = useRef();
    const [cameFromSettings, setCameFromSettings] = useState(false);

    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        return () => {
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };
    }, []);

    function handleBackButtonClick() {
        // setIsShowPopupWithoutTitle(false);
        // setIsShowPopup(false);
        // onBack();
        // return true;
        if (isShowPopup) {
            setIsShowPopupWithoutTitle(false);
            setIsShowPopup(false);
          } else {
            onBack()
            setIsShowPopupWithoutTitle(false);
            setIsShowPopup(false);
          }
          return true;
        }

    function goToLogin() {
        navigateAndSimpleReset('LoginScreen')
    }
   
    function onBack() {
        console.log('cameFromSettings' + params.cameFromSettings );
        if(params.cameFromSettings != undefined){
            navigation.pop();
            navigation.pop();
            navigation.pop();
        }else{
            goToLogin();
        }
    }

    useEffect(() => {
        console.log('params' + JSON.stringify(params));
        if (params.token != undefined) {
            setToken(params.token)
            setEmail(params.email)
        }
       /*  if (params.cameFromSettings != undefined) {
            console.log("cameFromSettings1 " + params.cameFromSettings);
            setCameFromSettings(true);
            console.log("cameFromSettings2 " + params.cameFromSettings);
            console.log('cameFromSettings3 ' + cameFromSettings);
            
        }*/
    }, []);


    function validateResetPassword() {

        let error = "";
        if (password.length == 0) {
            error = t('common.passwordValid');
            setPasswordError(error);
            ref_password.current.focus();
        }else if(confirmPassword.length == 0){
            error = t('common.required');
            setConfirmPasswordError(error);
            ref_confirm_password.current.focus()
        }
        else if (passwordError != null && passwordError.length != 0) {
            error = t('common.passwordValid');
            ref_password.current.focus();
            setPasswordError(error);

        } else if (password != confirmPassword) {
            error = t('resetPassword.label.passwordNotMatch');
            setConfirmPasswordError(error);
            ref_confirm_password.current.focus();
        }
        else {
            if (error == '') {
                checkNetwork();
            } else {
                //nothing for now
            }
        }
    }

    const checkNetwork = async () => {
        const isConnected = await NetworkUtils.isNetworkAvailable();
        if (isConnected) {
            Api();
        } else {
            //Show(t('common.appIsOfflineBody'), t('common.appIsOfflineHeading'));
            showPopUp(t('common.appIsOfflineHeading'), t('common.appIsOfflineBody'));
        }
    }

    async function Api() {
        Keyboard.dismiss();
        setIsLoading(true);
        let obj = {
            new_password: password,
            verified_token: token
        };
        console.log('sending api' + JSON.stringify(obj));
        let lang = await getValue(keys.APP_LANGUAGE);
        api(obj, null, lang).then((resp) => {
            console.log('reset password api' + JSON.stringify(resp));
            if (resp.status === 200) {
                setIsLoading(false);
                showMessageAndRedirectToLogin(resp.data.message);
            } else {
                setIsLoading(false);
                //Show(t('common.somethingWentWrong'), t('common.error'));
                showPopUp(t('common.serverError'), t('common.somethingWentWrong'));
            }
        }).catch(err => {
            setIsLoading(false);
            // Show(t('common.somethingWentWrong'), t('common.serverError'));
            showPopUp(t('common.serverError'), t('common.somethingWentWrong'));
        });
    }

    function showMessageAndRedirectToLogin(message) {

        setPopupMessageWithoutTitle(message);
        setIsShowPopupWithoutTitle(true);
        /*  Alert.alert('', message, [
             {
                 text: t('common.ok'),
                 onPress: () => {
                     logout();
                     goToLogin();
                 }
             }
         ]); */
    }

    function onAccessoryPress() {
        setSecureTextEntry(!isSecureTextEntry);
    }

    function onAccessoryPressConfirmPassword() {
        setSecureConfirmTextEntry(!isSecureConfirmTextEntry);
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

    function renderConfirmPasswordAccessory() {
        let name = isSecureConfirmTextEntry ?
            'visibility' :
            'visibility-off';

        return (
            <MaterialIcon
                size={22}
                name={name}
                color={'#DADEED'}
                onPress={onAccessoryPressConfirmPassword}
                suppressHighlighting={true}
            />
        );
    }

    function checkPasswordValidation(text, isConfirmPassword) {
        console.log(" ", text)
        if (text == undefined) {
            console.log(isConfirmPassword)
            return
        }
        let error = "";
        let upperCase = /^(?=.*[A-Z])/

        if (isConfirmPassword) {
            if (text == ""){
                error = t('common.required');
            }
            else if (password != text) {
                error = t('resetPassword.label.passwordNotMatch');
                // ref_confirm_password.current.focus();
            }
        } else {
            if (!password) {
                error = t('common.passwordValid');
            } else if (text.length < 8 || text.length > 50) {
                error = t('common.passwordValid');
            } else if (upperCase.test(text) === false) {
                error = t('common.passwordValid');
            } else if (text.search(/[a-z]/i) < 0) {
                error = t('common.passwordValid');
            } else if (text.search(/[0-9]/) < 0) {
                error = t('common.passwordValid');
            }
        }

        if (error != '') {
            //Show(error);
            isConfirmPassword ? setConfirmPasswordError(error) : setPasswordError(error)
        } else {
            isConfirmPassword ? setConfirmPasswordError(null) : setPasswordError(null)
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
    
    const onPressFirst = () => {
        setIsShowPopupWithoutTitle(false);
        logout();
        goToLogin();
    }

    return (
        <>
        <SafeAreaView style={{ flex: 0, backgroundColor: Colors.Primary }} />
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.White }}>
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <StatusBar backgroundColor={Colors.Purple} />
            <Loader isLoading={isLoading} />
            <Header name={t('resetPassword.label.title')} left={true} onPressLeft={onBack} />
            <Popup isShow={isShowPopup} title={popupTitle} message={popupMessage} onPressOk={onPressOk} />
            <PopupWithoutTitle isShow={isShowPopupWithoutTitle} twoButtons={false} message={popupMessageWithoutTitle}
                onPressFirst={onPressFirst} firstButton={t('common.ok')} />
              <KeyboardAwareScrollView  keyboardShouldPersistTaps={'handled'}>
            <View style={{
                flexDirection: 'column', alignContent: 'center', alignItems: 'center',
                justifyContent: 'center', marginTop: 40
            }}>
               
                <View style={[styles.columnStyle, { width: '80%', alignItems: 'center' }]}>

                    <OutlinedTextField
                        ref={ref_password}
                        secureTextEntry={isSecureTextEntry}
                        autoCapitalize='none'
                        autoCorrect={false}
                        onChangeText={(text) => {
                            setPassword(text);
                            checkPasswordValidation(text, false);
                        }}
                        label={t('resetPassword.textField.password')}
                        keyboardType='default'
                        // formatText={this.formatText}
                        onBlur={() => checkPasswordValidation(password, false)}
                        onSubmitEditing={() => checkPasswordValidation(password, false)}
                        // onSubmitEditing={() => ref_orgId.current.focus()}
                        renderRightAccessory={renderPasswordAccessory}
                        inputContainerStyle={styles.textInput}
                        error={passwordError}
                        baseColor={Colors.textInputBaseColor}
                        labelTextStyle={{ padding: 3, margin: 0 }}
                        allowFontScaling={false}
                    />

                    {passwordError != null && passwordError.length > 0 ? <View style={{ height: 20 }}></View> : null}

                    <OutlinedTextField
                        ref={ref_confirm_password}
                        secureTextEntry={isSecureConfirmTextEntry}
                        autoCapitalize='none'
                        autoCorrect={false}
                        onChangeText={(text) => {
                            setConfirmPassword(text);
                            checkPasswordValidation(text, true);
                        }}
                        label={t('resetPassword.textField.repeatPassword')}
                        keyboardType='default'
                        // formatText={this.formatText}
                        onBlur={() => checkPasswordValidation(confirmPassword, true)}
                        onSubmitEditing={() => checkPasswordValidation(confirmPassword, true)}
                        // onSubmitEditing={() => ref_orgId.current.focus()}
                        renderRightAccessory={renderConfirmPasswordAccessory}
                        inputContainerStyle={[styles.textInput, { marginTop: 0 }]}
                        error={confirmPasswordError}
                        baseColor={Colors.textInputBaseColor}
                        labelTextStyle={{ padding: 3, margin: 0 }}
                        allowFontScaling={false}
                    />

                    {confirmPasswordError != null && confirmPasswordError.length > 0 ? <View style={{ height: 20 }}></View> : null}

                    <Button style={{ width: '100%' }} name={t('resetPassword.label.submit')} onPress={() => validateResetPassword()} />
                </View>
               
            </View>
            </KeyboardAwareScrollView>
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
    columnStyle: {
        flexDirection: 'column'
    },
    rowStyle: {
        flexDirection: 'row'
    },
    textInput: {
        minHeight: 50,
       // paddingLeft: 10,
        marginTop: 30,
        padding: 0,
        marginBottom: 10,
        marginLeft:13,
        marginRight:13,
        width: '100%'
    },
    messageStyle: {
        fontSize: 18,
        marginTop: 10,
        fontFamily: MAIN_FONT ? MAIN_FONT : '',
        alignSelf: 'center',
        color: Colors.Black,
        lineHeight: 26
    },
    emailStyle: {
        fontFamily: Platform.OS === "ios" ? MAIN_FONT : MAIN_FONT_BOLD,
        fontWeight: '600',
    }
});
