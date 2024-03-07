
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
  BackHandler,
  SafeAreaView

} from 'react-native'


import { useTheme } from '@/Theme'
import { useTranslation } from 'react-i18next'
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { StackActions } from '@react-navigation/native';
import NetworkUtils from '../../helper/NetworkUtills';
import { keys, setValue, getValue } from "../../helper/Storage";
import ChangeTheme from '@/Store/Theme/ChangeTheme'
import Loader from '../common/Loader';
//import { Colors } from "@/Constants";
import Colors from "../../Constants/colors";
import { getRecords, getCategories } from './Api';
import Header from '../common/Header';
import { MAIN_FONT, MAIN_FONT_BOLD, Show } from '../common/Utils';
import { Dropdown } from 'react-native-material-dropdown-v2'
import Icon from 'react-native-vector-icons/FontAwesome5';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { navigateAndSimpleReset, navigateAndReset } from "../../Navigators/Root";
import Popup from '../common/Popup'

const widthScreen = Dimensions.get("window").width;
const heightScreen = Dimensions.get("window").height;


const Records = (props) => {
  const params = props.route.params;
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation()
  const { Common, Fonts, Gutters, Layout } = useTheme()
  const [defaultValue, setDefaultValue] = useState('');
  const [recordList, setRecordList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [dropDownList, setDropDownList] = useState([]);
  const isFocused = useIsFocused();

  const [isShowPopup, setIsShowPopup] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupMessage, setPopupMessage] = useState('');

  useEffect(() => {
    if (isFocused) {
      getToken();
      //getCategoriesAPI();
    }
  }, [isFocused]);


  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
    };
  }, []);

  function handleBackButtonClick() {
    if(isShowPopup){
      setIsShowPopup(false);
      setPopupTitle(false);
      setPopupMessage(false);
    }else{
      setIsShowPopup(false);
      setPopupTitle(false);
      setPopupMessage(false);
      onBack();
    return true;
  }
}

  function onBack() {
    //navigation.pop();
    navigateAndSimpleReset('MainScreen');
  }

  function goHome() {
    //navigation.dispatch(StackActions.popToTop());
    navigateAndSimpleReset('MainScreen');
  }

  function RecordDetail(index) {
    navigation.navigate("RecordDetail", {
      items: recordList,
      index: index,
    });
  }

  function getToken() {
    getValue(keys.TOKEN).then((value) => {
      console.log("getToken=>" + value);
      checkNetwork(value)
    });
  }

  function getTokenForRecord(id) {
    getValue(keys.TOKEN).then((value) => {
      getRecordAPI(id, value)
    });
  }

  const getCategoriesAPI = async (token) => {

    setIsLoading(true);
    let lang = await getValue(keys.APP_LANGUAGE);


   // console.log("getCategoriesAPI2=>" + lang);
    getCategories(token, lang).then((resp) => {
      //console.log("getResponse=>");
      console.log("record API=" + JSON.stringify(resp));

      if (resp.status === 200) {
        let data = resp.data;
        if (data.length == 0) {
          setIsLoading(false);
        } else {
          setCategoryList(resp.data);
        }
        let newList = []
        for (var i = 0; i < data.length; i++) {
          if (i == 0) {
            console.log("deafutvalue="+data[i].cate_name);
            setDefaultValue(data[i].cate_name);
            getTokenForRecord(data[i].category_id);
          }
          const obj =
          {
            value: data[i].cate_name,
            id: data[i].category_id
          };
          newList.push(obj);
          console.log("obj" + JSON.stringify(obj))
        }
        console.log("new" + JSON.stringify(newList))
        if (newList.length != 0) {
          setDropDownList(newList);
        } else {
          setDropDownList([]);
          setDefaultValue('');
        }

        //console.log("categoryList" +JSON.stringify(categoryList))
      } else {
        console.log("error record API=");
        setIsLoading(false);
        //Show(resp.data.error, t('common.error'));
        showPopUp(t('common.error'), resp.data.error);
      }
    }).catch(err => {
      console.log("error=" + err);
      setIsLoading(false);
      //Show(t('common.somethingWentWrong'), t('common.serverError'));
      showPopUp(t('common.serverError'), t('common.somethingWentWrong'));
    });
  }

  const getRecordAPI = async (id, token) => {
    setIsLoading(true);
    let lang = await getValue(keys.APP_LANGUAGE);
    getRecords(id, token, lang).then((resp) => {
      setIsLoading(false);
      console.log("record API=" + JSON.stringify(resp));
      if (resp.status === 200) {
        setRecordList(resp.data);
      } else {
        //Show(resp.data.error, t('common.error'));
        showPopUp(t('common.error'), resp.data.error);
      }
    }).catch(err => {
      setIsLoading(false);
      //Show(t('common.somethingWentWrong'), t('common.serverError'));
      showPopUp(t('common.serverError'), t('common.somethingWentWrong'));
    });
  }

  const selectedItem = (item) => {
    for (var i = 0; i < categoryList.length; i++) {
      if (item == categoryList[i].cate_name) {
        setDefaultValue(categoryList[i].cate_name);
        getTokenForRecord(categoryList[i].category_id);
      }
    }
  }

  const checkNetwork = async (token) => {
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected) {
      console.log("checkNetwork=>" + token);
      getCategoriesAPI(token)
    } else {
      // Show(t('common.appIsOfflineBody'), t('common.appIsOfflineHeading'));
      showPopUp(t('common.appIsOfflineHeading'), t('common.appIsOfflineBody'));
    }
  }

  function getColorCode(testResult) {
    if (testResult == 'negative') {
      return Colors.green;
    } else if (testResult == 'positive') {
      return Colors.resultRed
    } else if (testResult == 'invalid') {
      return Colors.resultGrey
    } else {
      return Colors.darkBlack
    }
  }

  const TestResultRow = (item, index) => {
    return <TouchableOpacity onPress={() => RecordDetail(index)}>
      <View>
        <View style={[styles.rowStyle, { marginLeft: 5, marginRight: 5 }]}>
          <Text style={styles.testDate}>{item.test_date}</Text>
          <View style={{ flex: 1 }} />
          <Text style={[styles.testName, {
            color: getColorCode(item.test_result.toLowerCase()),
            /* item.test_result.toLowerCase() == 'negative' ? Colors.green
              : item.test_result.toLowerCase() == 'positive' ? Colors.resultRed : Colors.resultGrey, */
            fontWeight: 'bold',
          }]}>{item.test_result_value}</Text>
          <Image source={require('../../Assets/Images/play_icon.png')} resizeMode={'contain'}
            style={{ height: 10, width: 10, alignSelf: 'center', marginLeft: 8 }} />
        </View>
        <View style={styles.divider} />
      </View>
    </TouchableOpacity>;
  }

  const renderAccessory = () => {
    return (
      <View style={{ width: 10, height: 10 }}>
        <Image source={require('../../Assets/Images/play_icon.png')} style={{ width: 20, height: 12, resizeMode: 'contain', }} />
      </View>
    );
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
        <View style={[Layout.fill, { backgroundColor: Colors.White }]}>
          <StatusBar backgroundColor={Colors.headerBlue} />
          <Loader isLoading={isLoading} />
          <Popup isShow={isShowPopup} title={popupTitle} message={popupMessage} onPressOk={onPressOk} />
          <View style={{ flexDirection: 'column' }}>
            <Header name={t('records.label.title')} left={true} right={false} onPressLeft={onBack} />
            {/* <View style={{ borderColor: Colors.textInputBaseColor, borderRadius: 8, borderWidth: 1, height: 40, width: '90%', alignSelf: 'center'}}></View> */}
            <View style={[styles.rowStyle, {}]}>
              <Dropdown
                // icon='chevron-down'
                label={t('common.selectCategory')}
                data={dropDownList}
                onChangeText={(item) => selectedItem(item)}
                containerStyle={{ marginLeft: 15, marginRight: 15, width: '90%' }}
                renderAccessory={renderAccessory}
                dropdownPosition={0}
                value={defaultValue}
                dropdownOffset={{ top: 80, left: 0 }}
              />
              {/*    <Icon
            size={22}
            name={'caret-down'}
            // color={'#DADEED'}
            color={Colors.Black}
            suppressHighlighting={true}
            style={{ position: 'absolute',  }}
            solid
          />  */}

              <Image source={require('../../Assets/Images/drop_down_icon.png')}
                resizeMode={'contain'}
                style={{
                  position: 'absolute',
                  right: 40, top: 30,
                  height: 15, width: 15, alignSelf: 'center',
                  marginLeft: 8
                }} />

            </View>
            {recordList.length != 0 ?

              <FlatList
                style={{ width: '86%', height: heightScreen - 200, alignSelf: 'center', marginTop: 25 }}
                data={recordList}
                renderItem={({ item, index }) => TestResultRow(item, index)}
                keyExtractor={(item, index) => index.toString()}
              />

              :
              <Text style={styles.noCertificateTxt}>{t('common.noRecords')}</Text>
            }

          </View>

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
    borderBottomColor: 'rgba(0,0,0,0.4)',
    borderBottomWidth: 1,
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
    fontSize: 16,
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

export default Records



