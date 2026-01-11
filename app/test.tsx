import { toastConfig } from '@/components/ToastConfig'
import React from 'react'
import { Button,View,Text, ActivityIndicator } from 'react-native'
import Toast, { BaseToast, ErrorToast, ToastConfig, ToastConfigParams } from 'react-native-toast-message'

const test = () => {
  return (
    <View>
      <Button title='测试loading' onPress={() => Toast.show({type:'loading',text1:'测试',visibilityTime:2000})}></Button>
      <Button title='测试default' onPress={() => Toast.show({type:'default',text1:'测很多字看事实大黑积极NIIT几iiii叽叽叽叽写一篇文章，天高云淡，望断南飞雁，屈指行程二万，不到长城非好汉，六盘上高峰，红旗漫卷西风，今日长缨在手，何时缚住苍龙试',visibilityTime:2000})}></Button>
      <Toast config={toastConfig}/>
    </View>
  )
}

export default test