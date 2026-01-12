import { useReactQueryDevTools } from "@dev-plugins/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import Toast from "react-native-toast-message";
import { toastConfig } from "@/components/ToastConfig";
import "../global.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});


export default function RootLayout() {
  useReactQueryDevTools(queryClient);
  return (
    <KeyboardProvider>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView>
          <Stack
            screenOptions={{
              headerTitleAlign: "center",
              animation: "slide_from_right",
            }}
          >
            <Stack.Screen name="index" options={{ title: "工品牛" }} />
            <Stack.Screen name="login" options={{ title: "登录" }} />
            <Stack.Screen name="wms0007" options={{ title: "收货" }} />
            <Stack.Screen name="wms0008" options={{ title: "上架" }} />
            <Stack.Screen name="wms0017" options={{ title: "库存查询" }} />
            <Stack.Screen name="wms0028" options={{ title: "快速移动" }} />
            <Stack.Screen name="wms0031" options={{ title: "库位补货" }} />
            <Stack.Screen
              name="wms0031/[docId]"
              options={{ title: "新增补货单" }}
            />
            <Stack.Screen
              name="wms0034"
              options={{ title: "收货异常反馈" }}
            />
            <Stack.Screen
              name="combination"
              options={{ title: "组合装查询" }}
            />
          </Stack>
          <Toast config={toastConfig} />
        </GestureHandlerRootView>
      </QueryClientProvider>
    </KeyboardProvider>
  );
}
