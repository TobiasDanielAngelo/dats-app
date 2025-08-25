import { observer } from "mobx-react-lite";
import { useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
  StatusBar,
  Animated,
  Easing,
} from "react-native";
import { useNavigate } from "react-router-native";
import { useStore } from "./Store";
import { MyIcon } from "../../blueprints/MyIcon";
import { BASE_URL } from "../../constants/constants";
import RunningMotorcycle from "./RunningMotorcycle";

const { width, height } = Dimensions.get("window");

export const LoginView = observer(() => {
  const { userStore } = useStore();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const navigate = useNavigate();

  // Animation values
  const slideAnim = useRef(new Animated.Value(height)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  const showForm = () => {
    setShowLoginForm(true);

    // Animate button press
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Show overlay and slide up form
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        // easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        // easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideForm = () => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 250,
        // easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        // easing: Easing.in(Easing.back(1.2)),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowLoginForm(false);
      setMsg("");
    });
  };

  const loginUser = async () => {
    setLoading(true);
    const response = await userStore.loginUser({
      username: credentials.username.toLowerCase(),
      password: credentials.password,
    });

    if (!response.ok) {
      setMsg(response.details);
      setLoading(false);
      return;
    }
    navigate("/");
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f23" />
      <View style={styles.container}>
        {/* Main Content */}
        <View style={styles.mainContent}>
          <RunningMotorcycle />

          <View style={styles.logoContainer}>
            {/* <View style={styles.logoCircle}>
              <Text style={styles.logoText}>
                <MyIcon icon="motorcycle" color="white" size={40} />
              </Text>
            </View> */}
            <Text style={styles.appTitle}>Welcome to DATS</Text>
            <Text style={styles.appSubtitle}>DATS Motorcycle Parts</Text>
            <Text style={styles.appSubtitle}>& Service Center</Text>
          </View>
        </View>

        {/* Floating Login Button */}
        <Animated.View
          style={[
            styles.floatingButtonContainer,
            { transform: [{ scale: buttonScale }] },
          ]}
        >
          <TouchableOpacity
            style={styles.floatingButton}
            onPress={showForm}
            activeOpacity={0.9}
          >
            <Text style={styles.floatingButtonText}>Sign In</Text>
            <MyIcon icon="hand-point-right" color="white" />
          </TouchableOpacity>
        </Animated.View>

        {/* Overlay and Bottom Sheet */}
        {showLoginForm && (
          <View style={styles.modalContainer}>
            <Animated.View
              style={[styles.overlay, { opacity: overlayOpacity }]}
            >
              <TouchableOpacity
                style={styles.overlayTouch}
                onPress={hideForm}
                activeOpacity={1}
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.bottomSheet,
                {
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.sheetHandle} />

              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Sign In</Text>
                <TouchableOpacity onPress={hideForm} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Username</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your username"
                    placeholderTextColor="#6b7280"
                    value={credentials.username}
                    onChangeText={(userId) =>
                      setCredentials({ ...credentials, username: userId })
                    }
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor="#6b7280"
                    secureTextEntry={true}
                    value={credentials.password}
                    onChangeText={(code) =>
                      setCredentials({ ...credentials, password: code })
                    }
                    autoCapitalize="none"
                  />
                </View>

                {msg ? (
                  <Animated.View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{msg}</Text>
                  </Animated.View>
                ) : null}

                <TouchableOpacity
                  style={[
                    styles.loginButton,
                    loading && styles.loginButtonDisabled,
                  ]}
                  onPress={loginUser}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.loginButtonText}>
                    {loading ? "Signing In..." : "Sign In"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.forgotPasswordContainer}>
                  <Text style={styles.forgotPassword}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        )}
      </View>
    </>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f23",
  },
  mainContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: "center",
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(229, 53, 171, 0.2)",
    borderWidth: 2,
    borderColor: "#e535ab",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  logoText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#e535ab",
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 12,
    textAlign: "center",
  },
  appSubtitle: {
    fontSize: 16,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 24,
  },
  floatingButtonContainer: {
    position: "absolute",
    bottom: 60,
    left: 24,
    right: 24,
  },
  floatingButton: {
    height: 60,
    backgroundColor: "#e535ab",
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    shadowColor: "#e535ab",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  floatingButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    marginRight: 12,
  },
  buttonIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  overlayTouch: {
    flex: 1,
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1a1a2e",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: height * 0.7,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#374151",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sheetTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#374151",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    color: "#9ca3af",
    fontSize: 16,
    fontWeight: "600",
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e5e7eb",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    height: 52,
    backgroundColor: "#16213e",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#ffffff",
    borderWidth: 1,
    borderColor: "#374151",
  },
  errorContainer: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  loginButton: {
    height: 52,
    backgroundColor: "#e535ab",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  loginButtonDisabled: {
    backgroundColor: "#6b7280",
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  forgotPasswordContainer: {
    alignItems: "center",
    paddingVertical: 8,
  },
  forgotPassword: {
    color: "#e535ab",
    fontSize: 14,
    fontWeight: "500",
  },
});
