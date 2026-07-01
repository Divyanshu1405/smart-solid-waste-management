import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import AppNavigator from "./src/navigation/AppNavigator";
import { colors } from "./src/theme";

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar
        style="light"
        backgroundColor={colors.primary}
        translucent={false}
      />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
