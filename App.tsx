import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './src/lib/types';
import { HomeScreen, AnalysisScreen, SettingsScreen } from './src/screens';
import { AppProvider } from './src/contexts/AppContext';
import { useNunitoFonts } from './src/lib/fonts';
import { View } from 'react-native';
import Loader from './src/components/Loader';
import { Colors } from './src/lib/constants';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const fontsLoaded = useNunitoFonts();

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
        <Loader color={Colors.primary} size={36} strokeWidth={4} />
      </View>
    );
  }

  return (
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Home"
          screenOptions={{
            headerShown: false, // Hide default headers since we have custom ones
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Analysis" component={AnalysisScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ presentation: 'modal' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}
