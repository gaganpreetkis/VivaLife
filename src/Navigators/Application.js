import React, { useEffect, useState } from 'react'
import { CardStyleInterpolators, createStackNavigator, HeaderStyleInterpolators } from '@react-navigation/stack'
import {
  Startup, LoginScreen, SignUpScreen, MainScreen, Scanner, Forgot, TestResult, TestPhoto,
  PhotoPreview, ResultPreview, Certificate, CommonWebView, PhotoIdPreview, EmailVerification, ResetPassword,
  Records, RecordDetail, SettingsAccount, Language
} from '@/Screens'
import { useSelector } from 'react-redux'
import { NavigationContainer } from '@react-navigation/native'
import { createDrawerNavigator } from '@react-navigation/drawer';
import { navigationRef } from '@/Navigators/Root'
import { Platform, SafeAreaView, StatusBar, Text } from 'react-native'
import { useTheme } from '@/Theme'
import Colors from '../Constants/colors';
import { AppearanceProvider } from 'react-native-appearance'
import SideMenu from '../Screens/MainScreen/SideMenu'
import SideMenuStartup from '../Screens/Startup/SideMenuStartup'
import OneSignal from 'react-native-onesignal'
import { keys, setValue } from '../helper/Storage'

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

let MainNavigator

// @refresh reset
const ApplicationNavigator = () => {
  const { Layout, darkMode, NavigationTheme } = useTheme()
  const [isApplicationLoaded, setIsApplicationLoaded] = useState(false)
  const applicationIsLoading = useSelector((state) => state.startup.loading)

  useEffect(() => {
    if (Text.defaultProps == null) {
      Text.defaultProps = {};
      Text.defaultProps.allowFontScaling = false;
    }

    setTimeout(async () => {
      const deviceState = await OneSignal.getDeviceState();

      console.log("OneSignal deviceState", JSON.stringify(deviceState));
      console.log("OneSignal userId", deviceState.userId);
      console.log("OneSignal pushToken", deviceState.pushToken);
      if(deviceState.userId){
        setValue(keys.ONE_SIGNAL_USER_ID, deviceState.userId);
      }
    }, 8000);
  }, []);

  useEffect(() => {
    if (MainNavigator == null && !applicationIsLoading) {
      MainNavigator = require('@/Navigators/Main').default
      setIsApplicationLoaded(true)
    }
  }, [applicationIsLoading])

  // on destroy needed to be able to reset when app close in background (Android)
  useEffect(
    () => () => {
      setIsApplicationLoaded(false)
      MainNavigator = null
    },
    [],
  )

  //OneSignal Init Code
  OneSignal.setLogLevel(6, 0);
  OneSignal.setAppId("eecdcfea-9155-4856-acec-849ffdc677b0");
  //END OneSignal Init Code

  if (Platform.OS == "ios") {
    //Prompt for push on iOS
    OneSignal.promptForPushNotificationsWithUserResponse(response => {
      console.log("Prompt response:", response);
    });
  }



  //Method for handling notifications received while app in foreground
  OneSignal.setNotificationWillShowInForegroundHandler(notificationReceivedEvent => {
    console.log("OneSignal: notification will show in foreground:", notificationReceivedEvent);
    let notification = notificationReceivedEvent.getNotification();
    console.log("notification: ", notification);
    const data = notification.additionalData
    console.log("additionalData: ", data);
    // Complete with null means don't show a notification.
    notificationReceivedEvent.complete(notification);
  });

  //Method for handling notifications opened
  OneSignal.setNotificationOpenedHandler(notification => {
    console.log("OneSignal: notification opened:", notification);
  });

  OneSignal.addSubscriptionObserver(async (event) => {
    console.log("OneSignal: subscription changed:", event);
    if (event.to.isSubscribed) {0
      setValue(keys.ONE_SIGNAL_USER_ID, event.to.userId);
      setValue(keys.ONE_SIGNAL_PUSH_TOKEN, event.to.pushToken);
      // const state = await OneSignal.getDeviceState();
      // do something with the device state
    }
  });

  return (
    <AppearanceProvider>

      {/*  <SafeAreaView style={{ flex: 0, backgroundColor: Colors.Primary }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.Primary }}> */}
      <NavigationContainer theme={NavigationTheme} ref={navigationRef}>
        <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />

        <Stack.Navigator
          initialRouteName={'Startup'}
          headerShown={false}
          screenOptions={{
            headerTransparent: true,
            gestureEnabled: false,
            headerShown: false,
            headerStyleInterpolator: HeaderStyleInterpolators.forFade,
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
          }}>
          <Stack.Screen name="Startup" component={StartupScreenRoute} screenOptions={{
            headerStyleInterpolator: HeaderStyleInterpolators.forFade,
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
          }} />
          <Stack.Screen name="LoginScreen" component={LoginScreen} screenOptions={{
            headerStyleInterpolator: HeaderStyleInterpolators.forFade,
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
          }} />
          <Stack.Screen name="SignUpScreen" component={SignUpScreen} screenOptions={{
            headerStyleInterpolator: HeaderStyleInterpolators.forFade,
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
          }} />
          <Stack.Screen name="MainScreen" component={Root} options={{
            headerShown: false,
            headerStyleInterpolator: HeaderStyleInterpolators.forFade,
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
          }} />
          <Stack.Screen name="Scanner" component={Scanner} screenOptions={{
            headerStyleInterpolator: HeaderStyleInterpolators.forFade,
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
          }} />
          <Stack.Screen name="Forgot" component={Forgot} screenOptions={{
            headerStyleInterpolator: HeaderStyleInterpolators.forFade,
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
          }} />
          <Stack.Screen name="TestResult" component={TestResult} screenOptions={{
            headerStyleInterpolator: HeaderStyleInterpolators.forFade,
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
          }} />
          <Stack.Screen name="TestPhoto" component={TestPhoto} screenOptions={{
            headerStyleInterpolator: HeaderStyleInterpolators.forFade,
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
          }} />
          <Stack.Screen name="PhotoPreview" component={PhotoPreview} screenOptions={{
            headerStyleInterpolator: HeaderStyleInterpolators.forFade,
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
          }} />
          <Stack.Screen name="ResultPreview" component={ResultPreview} screenOptions={{
            headerStyleInterpolator: HeaderStyleInterpolators.forFade,
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
          }} />
          <Stack.Screen name="Certificate" component={Certificate} screenOptions={{
            headerStyleInterpolator: HeaderStyleInterpolators.forFade,
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
          }} />
          <Stack.Screen name="CommonWebView" component={CommonWebView} screenOptions={{
            headerStyleInterpolator: HeaderStyleInterpolators.forFade,
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
          }} />
          <Stack.Screen name="PhotoIdPreview" component={PhotoIdPreview} screenOptions={{
            headerStyleInterpolator: HeaderStyleInterpolators.forFade,
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
          }} />
          <Stack.Screen name="EmailVerification" component={EmailVerification} screenOptions={{
            headerStyleInterpolator: HeaderStyleInterpolators.forFade,
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
          }} />
          <Stack.Screen name="ResetPassword" component={ResetPassword} screenOptions={{
            headerStyleInterpolator: HeaderStyleInterpolators.forFade,
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
          }} />
          <Stack.Screen name="Records" component={Records} screenOptions={{
            headerStyleInterpolator: HeaderStyleInterpolators.forFade,
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
          }} />
          <Stack.Screen name="RecordDetail" component={RecordDetail} screenOptions={{
            headerStyleInterpolator: HeaderStyleInterpolators.forFade,
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
          }} />
          <Stack.Screen name="SettingsAccount" component={SettingsAccount} screenOptions={{
            headerStyleInterpolator: HeaderStyleInterpolators.forFade,
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
          }} />
          <Stack.Screen name="Language" component={Language} screenOptions={{
            headerStyleInterpolator: HeaderStyleInterpolators.forFade,
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
          }} />

          {isApplicationLoaded && MainNavigator != null && (
            <Stack.Screen
              name="Main"
              component={MainNavigator}
              options={{
                animationEnabled: false,
              }}
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
      {/*  </SafeAreaView> */}
    </AppearanceProvider>
  )
}

function Root() {
  return (
    <Drawer.Navigator drawerContent={(props) => <SideMenu {...props} />}>
      <Drawer.Screen name="MainScreen" component={MainScreen} options={{
        headerShown: false
      }} />
      {/* <Drawer.Screen name="Reset Password" component={ResetPassword} options={{
          headerShown: false
        }} /> */}
    </Drawer.Navigator>
  );
}

function StartupScreenRoute() {
  return (
    <Drawer.Navigator drawerContent={(props) => <SideMenuStartup {...props} />}>
      <Drawer.Screen name="Startup" component={Startup} options={{
        headerShown: false
      }} />
      {/* <Drawer.Screen name="Reset Password" component={ResetPassword} options={{
          headerShown: false
        }} /> */}
    </Drawer.Navigator>
  );
}

export default ApplicationNavigator
