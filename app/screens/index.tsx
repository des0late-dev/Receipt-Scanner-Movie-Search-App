import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createContext } from 'react';
import CameraComponent from './cameraComponent';
import MoviesScreen from './MoviesScreen';
import StoredReceipts from './Storedreceipts';
const receiptContext = createContext(undefined);
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <receiptContext.Provider value={undefined}>
      <NavigationContainer>   
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: '#007AFF',
            tabBarInactiveTintColor: '#8E8E93',
            tabBarStyle: {
              backgroundColor: '#fff',
              borderTopWidth: 1,
              borderTopColor: '#E5E5EA',
            },
          }}
        >
          <Tab.Screen 
  name="Scanner" 
  component={CameraComponent}
  options={{
    tabBarIcon: ({ color, size }) => (
      <MaterialIcons name="camera-alt" size={size} color={color} />
    ),
    headerShown: false,
  }}
/>
<Tab.Screen 
  name="Movie Screen" 
  component={MoviesScreen}
  options={{
    tabBarIcon: ({ color, size }) => (
      <MaterialIcons name="movie" size={size} color={color} />
    ),
    headerShown: false,
  }}
/>

<Tab.Screen 
  name="Receipts" 
  component={StoredReceipts}
  options={{
    tabBarIcon: ({ color, size }) => (
      <MaterialIcons name="receipt" size={size} color={color} />
    ),
    headerShown: false,
  }}
/>

        </Tab.Navigator>
      </NavigationContainer>
    </receiptContext.Provider>
  );
}
