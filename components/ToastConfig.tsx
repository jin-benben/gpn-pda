import { View, ActivityIndicator,Text } from "react-native";
import { ToastConfig } from "react-native-toast-message";

 
export  const toastConfig: ToastConfig = {
  loading: ({}) => (
    <View
      style={{
        width: 100,
        height: 100,
        zIndex: 9999,
        backgroundColor: "black",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
        gap: 6,
      }}
    >
      <ActivityIndicator size="large" color="white" />
      <Text className="text-white">加载中...</Text>
    </View>
  ),
  default: ({ text1, props }) => (
    <View
      style={{
        backgroundColor: "black",
        padding: 10,
        zIndex: 9999,
        borderRadius: 10,
        marginHorizontal: 10,
      }}
    >
      <Text className="text-white">{text1}</Text>
    </View>
  ),
};