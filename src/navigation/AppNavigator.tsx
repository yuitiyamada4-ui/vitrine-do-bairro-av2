import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { ProductListScreen } from '../screens/ProductListScreen';
import { ProductFormScreen } from '../screens/ProductFormScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.secondary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProductList"
        component={ProductListScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ProductForm"
        component={ProductFormScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

function ListStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="ProductList"
        component={ProductListScreen}
      />
      <Stack.Screen
        name="ProductForm"
        component={ProductFormScreen}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
      />
    </Stack.Navigator>
  );
}

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textLight,
          tabBarStyle: {
            backgroundColor: colors.white,
            borderTopColor: colors.border,
            paddingBottom: 6,
            paddingTop: 6,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      >
        <Tab.Screen
          name="Início"
          component={HomeStack}
          options={{
            tabBarLabel: 'Comércios',
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 20 }}>🏪</Text>
            ),
          }}
        />
        <Tab.Screen
          name="MinhaListaTab"
          component={ListStack}
          options={{
            tabBarLabel: 'Minha Lista',
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 20 }}>🛒</Text>
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
