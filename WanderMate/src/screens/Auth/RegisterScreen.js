import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Feather } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { register as apiRegister } from '../../api/authApi';
import { loginUser } from '../../redux/slices/authSlice';
import { colors, spacing, fontSize } from '../../theme/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Validation schema
const registerSchema = yup.object().shape({
  firstName: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .matches(/^[A-Za-z\s]+$/, 'First name cannot contain numbers or special characters'),
  lastName: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .matches(/^[A-Za-z\s]+$/, 'Last name cannot contain numbers or special characters'),
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .test('unique-email', 'This email is already registered', async function (value) {
      if (!value) return true;
      
      // Check AsyncStorage for existing registered users
      try {
        const registeredUsers = await AsyncStorage.getItem('registered_users');
        if (registeredUsers) {
          const users = JSON.parse(registeredUsers);
          const username = value.split('@')[0];
          return !users.hasOwnProperty(username);
        }
      } catch (error) {
        console.error('Error checking email uniqueness:', error);
      }
      return true;
    }),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain at least one special character'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords do not match'),
});

export default function RegisterScreen({ navigation }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const scrollViewRef = useRef(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      // Use email prefix as username for DummyJSON API
      const username = data.email.split('@')[0];
      const result = await apiRegister({
        firstName: data.firstName,
        lastName: data.lastName,
        username,
        email: data.email,
        password: data.password,
      });

      if (result.success) {
        Alert.alert(
          'Success',
          `Account created successfully!\n\nYou can now login with:\nEmail: ${data.email}`,
          [
            {
              text: 'Login Now',
              onPress: async () => {
                // Auto login after registration
                await dispatch(loginUser({ username, password: data.password }));
              },
            },
          ]
        );
      } else {
        Alert.alert('Registration Failed', result.error);
      }
    } catch (error) {
      Alert.alert('Registration Failed', error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header Image */}
        <Image
          source={{ uri: 'https://via.placeholder.com/600x200.png?text=WanderMate' }}
          style={styles.headerImage}
          resizeMode="cover"
        />

        <View style={styles.formContainer}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join WanderMate Today</Text>

          {/* First Name */}
          <View style={styles.inputContainer}>
            <Controller
              control={control}
              name="firstName"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <View style={styles.inputWrapper}>
                    <Feather name="user" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, errors.firstName && styles.inputError]}
                      placeholder="First Name"
                      placeholderTextColor={colors.textSecondary}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      onFocus={() => {
                        setTimeout(() => {
                          scrollViewRef.current?.scrollTo({ y: 150, animated: true });
                        }, 100);
                      }}
                      autoCapitalize="words"
                    />
                  </View>
                  {errors.firstName && (
                    <View style={styles.errorContainer}>
                      <Feather name="alert-circle" size={14} color={colors.error} />
                      <Text style={styles.errorText}>{errors.firstName.message}</Text>
                    </View>
                  )}
                </View>
              )}
            />
          </View>

          {/* Last Name */}
          <View style={styles.inputContainer}>
            <Controller
              control={control}
              name="lastName"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <View style={styles.inputWrapper}>
                    <Feather name="user" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, errors.lastName && styles.inputError]}
                      placeholder="Last Name"
                      placeholderTextColor={colors.textSecondary}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      onFocus={() => setTimeout(() => scrollViewRef.current?.scrollTo({ y: 220, animated: true }), 100)}
                      autoCapitalize="words"
                    />
                  </View>
                  {errors.lastName && (
                    <View style={styles.errorContainer}>
                      <Feather name="alert-circle" size={14} color={colors.error} />
                      <Text style={styles.errorText}>{errors.lastName.message}</Text>
                    </View>
                  )}
                </View>
              )}
            />
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <View style={styles.inputWrapper}>
                    <Feather name="mail" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, errors.email && styles.inputError]}
                      placeholder="Email"
                      placeholderTextColor={colors.textSecondary}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      onFocus={() => setTimeout(() => scrollViewRef.current?.scrollTo({ y: 300, animated: true }), 100)}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoComplete="email"
                    />
                  </View>
                  {errors.email && (
                    <View style={styles.errorContainer}>
                      <Feather name="alert-circle" size={14} color={colors.error} />
                      <Text style={styles.errorText}>{errors.email.message}</Text>
                    </View>
                  )}
                </View>
              )}
            />
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <View style={styles.inputWrapper}>
                    <Feather name="lock" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, errors.password && styles.inputError]}
                      placeholder="Password"
                      placeholderTextColor={colors.textSecondary}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      onFocus={() => setTimeout(() => scrollViewRef.current?.scrollTo({ y: 400, animated: true }), 100)}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Feather
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.password && (
                    <View style={styles.errorContainer}>
                      <Feather name="alert-circle" size={14} color={colors.error} />
                      <Text style={styles.errorText}>{errors.password.message}</Text>
                    </View>
                  )}
                </View>
              )}
            />
          </View>

          {/* Confirm Password */}
          <View style={styles.inputContainer}>
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <View style={styles.inputWrapper}>
                    <Feather name="lock" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, errors.confirmPassword && styles.inputError]}
                      placeholder="Confirm Password"
                      placeholderTextColor={colors.textSecondary}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      onFocus={() => setTimeout(() => scrollViewRef.current?.scrollTo({ y: 500, animated: true }), 100)}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <Feather
                        name={showConfirmPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.confirmPassword && (
                    <View style={styles.errorContainer}>
                      <Feather name="alert-circle" size={14} color={colors.error} />
                      <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>
                    </View>
                  )}
                </View>
              )}
            />
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Register</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.linkText}>
              Already have an account? <Text style={styles.linkTextBold}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  headerImage: {
    width: '100%',
    height: 150,
  },
  formContainer: {
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.error,
  },
  eyeIcon: {
    padding: spacing.sm,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.sm,
    marginLeft: spacing.xs,
    flex: 1,
  },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.textLight,
    fontSize: fontSize.lg,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  linkText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  linkTextBold: {
    color: colors.primary,
    fontWeight: '600',
  },
});
