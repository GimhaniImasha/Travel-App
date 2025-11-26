import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/Home/HomeScreen';
import DetailsScreen from '../screens/Details/DetailsScreen';
import FavoritesScreen from '../screens/Favorites/FavoritesScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import { useTheme } from '../theme/ThemeProvider';
import { spacing, fontSize } from '../theme/theme';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const FavoritesStack = createNativeStackNavigator();

function CustomHomeHeader({ navigation }) {
  const theme = useTheme();
  const { colors } = theme;
  const { user } = useSelector((state) => state.auth);
  const firstName = user?.firstName || 'Traveler';

  const styles = createHeaderStyles(colors);

  return (
    <View style={styles.customHeader}>
      <View style={styles.headerLeft}>
        <Text style={styles.greetingText}>Hello {firstName}!</Text>
        <Text style={styles.subtitleText}>Where would you like to go?</Text>
      </View>
      <TouchableOpacity 
        style={styles.profileButton}
        onPress={() => navigation.navigate('Profile')}
      >
        <Image
          source={{ uri: 'https://via.placeholder.com/100/2196F3/FFFFFF?text=User' }}
          style={styles.profileImage}
        />
      </TouchableOpacity>
    </View>
  );
}

function HomeStackNavigator() {
  const theme = useTheme();
  const { colors } = theme;

  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.textLight,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <HomeStack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={({ navigation }) => ({
          headerTitle: () => <CustomHomeHeader navigation={navigation} />,
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.primary,
          },
        })}
      />
      <HomeStack.Screen
        name="Details"
        component={DetailsScreen}
        options={{
          title: 'Place Details',
          headerShown: true,
        }}
      />
    </HomeStack.Navigator>
  );
}

function FavoritesStackNavigator() {
  const theme = useTheme();
  const { colors } = theme;

  return (
    <FavoritesStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.textLight,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <FavoritesStack.Screen
        name="FavoritesMain"
        component={FavoritesScreen}
        options={{
          title: 'My Favorites',
          headerShown: true,
        }}
      />
      <FavoritesStack.Screen
        name="Details"
        component={DetailsScreen}
        options={{
          title: 'Place Details',
          headerShown: true,
        }}
      />
    </FavoritesStack.Navigator>
  );
}

export default function MainTabs() {
  const theme = useTheme();
  const { colors } = theme;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          borderTopColor: colors.border,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: colors.textLight,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          title: 'My Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const createHeaderStyles = (colors) => StyleSheet.create({
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    width: '100%',
  },
  headerLeft: {
    flex: 1,
  },
  greetingText: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.textLight,
  },
  subtitleText: {
    fontSize: fontSize.lg,
    color: colors.textLight,
    opacity: 0.9,
    marginTop: 2,
  },
  profileButton: {
    marginLeft: spacing.md,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.textLight,
  },
});
