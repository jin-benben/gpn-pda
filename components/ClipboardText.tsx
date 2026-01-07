import theme from '@/const/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Clipboard from 'expo-clipboard';
import React from 'react';
import { Pressable, ToastAndroid } from 'react-native';
interface ClipboardTextProps {
  text:string;
  icon?:React.ReactNode;
  children?:React.ReactNode;
}
const ClipboardText = ({text,children}:ClipboardTextProps) => {
  const copyToClipboard = async () => {
    Clipboard.setStringAsync(text).then(() => {   
       ToastAndroid.showWithGravity('复制成功',ToastAndroid.LONG,ToastAndroid.TOP)
    });
  };
  return (
    <Pressable className='flex-row items-center gap-1' onPress={copyToClipboard}>
      {children}
      <MaterialIcons name="content-copy" size={20} color={theme.blue600} />
    </Pressable>
  )
}

export default ClipboardText