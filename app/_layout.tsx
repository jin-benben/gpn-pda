import { Stack } from "expo-router";
import "../global.css";
export default function RootLayout() {
  return (
    <Stack 
      screenOptions={{
        headerTitleAlign: 'center',
        animation:"slide_from_right",
      }}
    >
      <Stack.Screen name="index" options={{ title: "工品牛" }} />
      <Stack.Screen name="login" options={{ title: "登录" }} />
      <Stack.Screen name="wms0007" options={{ title: "收货" }} />
      <Stack.Screen name="wms0008" options={{ title: "上架" }} />
      <Stack.Screen name="wms0017" options={{ title: "库存查询" }} />
      <Stack.Screen name="wms0018" options={{ title: "库位转移" }} />
      <Stack.Screen name="wms0028" options={{ title: "快速移动" }} />
      <Stack.Screen name="wms0031" options={{ title: "库位补货" }} />
     
    </Stack>
  );
}
