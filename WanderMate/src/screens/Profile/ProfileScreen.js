import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  ScrollView,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Feather } from '@expo/vector-icons';
import { logout } from '../../redux/slices/authSlice';
import { clearFavorites } from '../../redux/slices/favouritesSlice';
import { resetPlaces } from '../../redux/slices/placesSlice';
import { toggleTheme } from '../../redux/slices/uiSlice';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing, fontSize } from '../../theme/theme';

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { colors } = theme;
  const { user } = useSelector((state) => state.auth);
  const { items: favourites } = useSelector((state) => state.favourites);
  const isDarkMode = useSelector((state) => state.ui.isDarkMode);

  // Format joined date
  const joinedDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
            dispatch(clearFavorites());
            dispatch(resetPlaces());
          },
        },
      ]
    );
  };

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing functionality coming soon!');
  };

  const handleChangePassword = () => {
    Alert.alert('Change Password', 'Password change functionality coming soon!');
  };

  const styles = createStyles(colors);

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Feather name="user" size={40} color={colors.primary} />
        </View>
        <Text style={styles.name}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.content}>
        {/* Settings Section */}
        <Text style={styles.sectionHeader}>Settings</Text>
        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? colors.primaryLight + '20' : '#FFF3E0' }]}>
                <Feather 
                  name="moon"
                  size={20} 
                  color={isDarkMode ? colors.primary : '#FF9800'} 
                />
              </View>
              <View>
                <Text style={styles.settingLabel}>Dark Mode</Text>
                <Text style={styles.settingSubtext}>Adjust app appearance</Text>
              </View>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={handleToggleTheme}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={isDarkMode ? colors.primary : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Account Section */}
        <Text style={styles.sectionHeader}>Account</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.settingRow} onPress={handleEditProfile}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Feather name="user" size={20} color={colors.primary} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Account Details</Text>
                <Text style={styles.settingSubtext}>View and edit profile</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingRow} onPress={handleChangePassword}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#4CAF5020' }]}>
                <Feather name="lock" size={20} color={colors.success} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Privacy & Security</Text>
                <Text style={styles.settingSubtext}>Manage your privacy</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: colors.info + '20' }]}>
                <Feather name="calendar" size={20} color={colors.info} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Joined</Text>
                <Text style={styles.settingSubtext}>{joinedDate}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Feather name="log-out" size={20} color={colors.textLight} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: spacing.xxl + spacing.md,
    paddingBottom: spacing.xl,
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  name: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  email: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  content: {
    padding: spacing.lg,
  },
  sectionHeader: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.text,
  },
  settingSubtext: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.xl + spacing.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error,
    paddingVertical: spacing.md,
    borderRadius: 12,
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  logoutText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textLight,
  },
});
