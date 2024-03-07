import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text, Image, TouchableOpacity, SafeAreaView, Alert, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { keys, setValue, getValue, logout } from "../../helper/Storage";
import { DrawerContentScrollView } from '@react-navigation/drawer';
import DeviceInfo from 'react-native-device-info';
import Colors from '../../Constants/colors';
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native';
import { navigateAndSimpleReset } from '../../Navigators/Root';
import { MAIN_FONT, MAIN_FONT_BOLD, MAIN_FONT_LIGHT, Show } from '../common/Utils';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { aboutUrl, app_true, faqUrl, privacyPolicyUrl, termsOfUseUrl } from '../../Network/apiUrl';
import { deleteUuid } from './MainApi';
import Loader from '../common/Loader';

export default function SideMenu(props) {
    const { t } = useTranslation()
    const navigation = useNavigation();
    const [settingsExpanded, setSettingsExpand] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const textTransformations = ["uppercase"];
    console.log(props);

    const getSubMenuIcon = () => {
        return <Image source={require('../../Assets/Images/account_menu_icon.png')}
            resizeMode={'contain'}
            style={{
                height: 12, width: 12, alignSelf: 'center',
                marginLeft: 40
            }} />
        {/* <Icon
            style={{ marginLeft: 40 }}
            name={'angle-right'}
            size={15}
            color={'rgba(0,0,0,0.4)'}
        /> */}
    }

    function toggleSettingsExpand() {
        setSettingsExpand(!settingsExpanded);
    }

    const loaderDone = () => {
        setTimeout(() => {
            setIsLoading(false);
        }, 300);
    }

    async function logoutAPI() {
        Keyboard.dismiss();
        setIsLoading(true);
        // await getValue(keys.ONE_SIGNAL_USER_ID)
        var device_Id = ""
         device_Id = DeviceInfo.getDeviceId();
       let token= await getValue(keys.TOKEN);
        const obj = {
            device :  { uuid: device_Id },
        };
        console.log(JSON.stringify(obj));
        console.log(JSON.stringify(token));
        let lang = await getValue(keys.APP_LANGUAGE);
        deleteUuid(obj, token, lang).then((resp) => {
            console.log(JSON.stringify(resp));
            if (resp.status === 200) {
                logoutUser();
                loaderDone();
            } else if (resp.status === 402) {
                // 'no verify...'
                console.log("no verify...");
            }
            else {
                //Show(t(resp.data.error), t('common.error'));
                // showPopUp(t('common.error'), resp.data.error);
                alert(resp.data.error);
            }
        }).catch(err => {
            setIsLoading(false);
            //Show(t('common.somethingWentWrong'), t('common.serverError'));
            // showPopUp(t('common.serverError'), t('common.somethingWentWrong'));
            alert(t('common.serverError'));
        });
    }

    function logoutUser() {
        logout();
        navigateAndSimpleReset('Startup')
    }

    function recordsScreen() {
        navigation.navigate('Records');
    }

    function accountSettingsScreen() {
        navigation.navigate('SettingsAccount');
    }

    function languageScreen() {
        navigation.navigate('Language', {
            isLogin: true,
        });
    }

    async function openAboutPage() {
        toggleDrawer()
        let lang = await getValue(keys.APP_LANGUAGE);
        navigation.navigate('CommonWebView', {
            title: t('sideDrawer.faq'),
            url: faqUrl + lang + app_true
        });
    }

    async function openTermsOfUse() {
        toggleDrawer()
        let lang = await getValue(keys.APP_LANGUAGE);
        navigation.navigate('CommonWebView', {
            title: t('sideDrawer.termsOfUse'),
            url: termsOfUseUrl + lang + app_true
        });
    }

    async function openPrivacyPolicy() {
        toggleDrawer()
        let lang = await getValue(keys.APP_LANGUAGE);
        navigation.navigate('CommonWebView', {
            title: t('sideDrawer.privacyPolicy'),
            url: privacyPolicyUrl + lang + app_true
        });
    }

    function toggleDrawer() {
        props.navigation.toggleDrawer();
    }

    return (<>
        <SafeAreaView style={{ flex: 0, backgroundColor: Colors.White }} />
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.White }}>
            <Loader isLoading={isLoading} />
            <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'space-between' }}>
                <View style={styles.mainContainer}>
                    <ScrollView style={{ flex: 1 }}>
                        <TouchableWithoutFeedback>
                            <View>
                                <TouchableOpacity onPress={() => toggleDrawer()}>
                                    <Image source={require('../../Assets/Images/left-arrow.png')} style={{ width: 26, height: 26, alignSelf: 'flex-end', marginRight: 30, marginBottom: 20 }} resizeMode={'contain'} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => {
                                    recordsScreen()
                                    toggleDrawer()
                                }}>
                                    <Text style={styles.menuText}>{t('sideDrawer.records')}</Text>
                                </TouchableOpacity>
                                <View style={styles.divider}></View>
                                <TouchableOpacity style={[styles.rowStyle, styles.center]} onPress={() => toggleSettingsExpand()}>
                                    <Text style={styles.menuText}>{t('sideDrawer.settings')}</Text>
                                    <View style={{ flex: 1 }}></View>
                                    {/* <Icon
                            style={{ marginRight: 30, marginTop: 20 }}
                            name={'caret-down'}
                            size={15}
                            color={Colors.Black}
                        // onPress={() => setHidePass(!hidePass)} 
                        /> */}
                                    <Image source={require('../../Assets/Images/setting_menu_icon.png')}
                                        resizeMode={'contain'}
                                        style={{
                                            height: 15, width: 15, alignSelf: 'center',
                                            marginRight: 30, marginTop: 15
                                        }} />
                                </TouchableOpacity>
                                {settingsExpanded ?
                                    <View>
                                        <TouchableOpacity onPress={() => accountSettingsScreen()}>
                                            <View style={[styles.rowStyle, styles.center, { marginTop: 20, marginBottom: 10 }]}>
                                                {getSubMenuIcon()}
                                                <Text style={styles.submenuText}>{t('sideDrawer.settingsAccount')}</Text>
                                                <View style={{ flex: 1 }}></View>
                                            </View>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => {
                                            toggleDrawer()
                                            languageScreen()
                                        }
                                        }>
                                            <View style={[styles.rowStyle, styles.center, { marginTop: 10, marginBottom: 20 }]}>
                                                {getSubMenuIcon()}

                                                <Text style={styles.submenuText}>{t('sideDrawer.settingsLanguage')}</Text>
                                                <View style={{ flex: 1 }}></View>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                    : null}
                                <View style={styles.divider}></View>
                                <TouchableOpacity onPress={() => openAboutPage()}>
                                    <Text style={styles.menuText}>{t('sideDrawer.faq')}</Text>
                                </TouchableOpacity>
                                <View style={styles.divider}></View>
                                <TouchableOpacity onPress={() => openTermsOfUse()}>
                                    <Text style={styles.menuText}>{t('sideDrawer.termsOfUse')}</Text>
                                </TouchableOpacity>
                                <View style={styles.divider}></View>
                                <TouchableOpacity onPress={() => openPrivacyPolicy()}>
                                    <Text style={styles.menuText}>{t('sideDrawer.privacyPolicy')}</Text>
                                </TouchableOpacity>
                                <View style={styles.divider}></View>
                                {/* <TouchableOpacity onPress={() => logoutUser()}> */}
                                <TouchableOpacity onPress={() => logoutAPI()}>
                                    <Text style={styles.menuText}>{t('sideDrawer.logout')}</Text>
                                </TouchableOpacity>
                                <View style={styles.divider}></View>

                            </View>

                        </TouchableWithoutFeedback>
                    </ScrollView>
                </View>
                <View style={{ alignSelf: 'center' }}>
                    <Text style={{
                        marginTop: 10,
                        fontSize: 18,
                        paddingLeft: 40,
                        paddingRight: 40,
                        marginBottom: 10,
                        color: Colors.Black,
                    }}>{DeviceInfo.getVersion()}</Text>
                </View>
            </View>
        </SafeAreaView>
    </>);

}
const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.White,
        paddingTop: 30
    },
    rowStyle: {
        flexDirection: 'row'
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    menuText: {
        marginTop: 20,
        fontSize: 22,
        paddingLeft: 40,
        paddingRight: 40,
        fontFamily: MAIN_FONT_LIGHT ? MAIN_FONT_LIGHT : '',
        color: Colors.Black,
        marginBottom: 10,
    },
    submenuText: {
        fontSize: 22,
        paddingLeft: 10,
        paddingRight: 40,
        fontFamily: MAIN_FONT_LIGHT ? MAIN_FONT_LIGHT : '',
        color: 'rgba(0,0,0,0.6)',
    },
    divider: {
        width: '100%',
        height: 2,
        backgroundColor: Colors.lightGray,
        marginTop: 10,

    }
});