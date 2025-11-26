import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Feather } from '@expo/vector-icons';
import { loginUser } from '../../redux/slices/authSlice';
import { colors, spacing, fontSize } from '../../theme/theme';

// Validation schema
const loginSchema = yup.object().shape({
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

export default function LoginScreen({ navigation }) {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);
  const scrollViewRef = useRef(null);
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      // For DummyJSON API, we use email prefix as username
      const username = data.email.split('@')[0];
      const resultAction = await dispatch(loginUser({ username, password: data.password }));

      if (loginUser.fulfilled.match(resultAction)) {
        // Login successful - navigation will happen automatically via AppNavigator
      } else {
        // Login failed
        const errorMessage = resultAction.payload || 'Login failed';
        Alert.alert('Login Failed', errorMessage);
      }
    } catch (error) {
      Alert.alert('Login Failed', error.message || 'An error occurred');
    }
  };

  return (
    <ImageBackground
      source={require('../../../assets/loginBackground.gif')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
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
          <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Login to continue your journey</Text>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <View style={styles.inputWrapper}>
                    <Feather name="mail" size={20} color="rgba(255, 255, 255, 0.7)" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, errors.email && styles.inputError]}
                      placeholder="Email"
                      placeholderTextColor="rgba(255, 255, 255, 0.7)"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      onFocus={() => {
                        setTimeout(() => {
                          scrollViewRef.current?.scrollTo({ y: 200, animated: true });
                        }, 100);
                      }}
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

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <View style={styles.inputWrapper}>
                    <Feather name="lock" size={20} color="rgba(255, 255, 255, 0.7)" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, errors.password && styles.inputError]}
                      placeholder="Password"
                      placeholderTextColor="rgba(255, 255, 255, 0.7)"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      onFocus={() => {
                        setTimeout(() => {
                          scrollViewRef.current?.scrollTo({ y: 300, animated: true });
                        }, 100);
                      }}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoComplete="password"
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Feather
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color="rgba(255, 255, 255, 0.7)"
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

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Register Link */}
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.linkText}>
                Don't have an account? <Text style={styles.linkTextBold}>Register</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
  },
  formContainer: {
    marginHorizontal: spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: '#FFFFFF',
    marginBottom: spacing.xl,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
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
    color: '#FFFFFF',
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
  },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.md,
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
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  linkTextBold: {
    color: '#2196F3',
    fontWeight: '700',
  },
});
