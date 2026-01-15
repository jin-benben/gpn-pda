import * as Updates from 'expo-updates';
import { useEffect, useState } from 'react';
import { Alert, Text, View,Linking, TouchableOpacity } from 'react-native';
import * as Application from "expo-application"
import { useIsFocused } from '@react-navigation/native';
import { commonRequestFetch } from '@/lib/commonServices';
import Toast from 'react-native-toast-message';
import { toastConfig } from './ToastConfig';
import useCustomMutation from '@/hooks/useMutation';

export default function UpdatesDemo() {
  const [autoUpdate, setAutoUpdate] = useState(true);
  const isFocused = useIsFocused();
  const {
    currentlyRunning,
    isUpdateAvailable,
    isUpdatePending,
  } = Updates.useUpdates();

  useEffect(() => {
    if (isUpdatePending) {
      Updates.reloadAsync();
    }
  }, [isUpdatePending]);

  // 自动更新 expo-updates
  
  useEffect(() => {
    if(isUpdateAvailable){
      Alert.alert("更新提示","发现新版本，请立即更新？", [
        {
          text: "更新",
          onPress: async() => {
            Updates.fetchUpdateAsync()
          },
        },
      ]);
    }
  }, [isUpdateAvailable]);

  const selectVersionMutation = useCustomMutation({
    mutationFn:()=>{
      return  commonRequestFetch({
        functionCode:"smp0055",
        prefix:"smp2",
        url:'/selectVersion',
        data:{
          code: "wms0001pdaApp"
        },
      })
    },
    onSuccess:(res:any)=>{ 
      if(res.version!=Application.nativeApplicationVersion){
        Alert.alert("更新提示",`发现新版本${res.version}，请立即更新？`, [
          {
            text: "取消",
            onPress: () => setAutoUpdate(false),
            style: "cancel",
          },
          {
            text: "确定",
            onPress: async() => {
              Linking.openURL(res.originUrl)
            },
          },
        ]);
      }else{
        Toast.show({
          type: 'default',
          text1: '当前版本已是最新版本',
        });
      }
      
    }
  })
 
  useEffect(() => {
    if(autoUpdate && isFocused){
      selectVersionMutation.mutate()
    }
  }, [isFocused,autoUpdate]);
 
  return (
    <View className='mt-5 gap-2'>
      <Text className='text-center text-gray-500'>当前版本：{Application.nativeApplicationVersion}</Text>
      <TouchableOpacity className='w-40 bg-blue-500 rounded-full mx-auto h-10 justify-center' onPress={() => selectVersionMutation.mutate()}>
        <Text className='text-center text-white'>检查更新</Text>
      </TouchableOpacity>
      <Toast config={toastConfig} />
    </View>
  );
}
