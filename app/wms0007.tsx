import InputSearch from '@/components/InputSearch';
import '@/lib/request';
import { useForm } from '@tanstack/react-form';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, ToastAndroid, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
export default function Wms0007Screen() {
  const router = useRouter();
  const form = useForm({
    defaultValues: {
      name: '张三丰s',
    },
    onSubmit: async ({ value }) => {
      // Do something with form data
      console.log(value)
      ToastAndroid.showWithGravity('提交成功',ToastAndroid.LONG,ToastAndroid.CENTER)
      // Alert.alert('提交成功', JSON.stringify(value),[{text: '取消',style:"cancel"},{text: '确定'}])
    },
  })
  const a = useSafeAreaInsets();
  const handleSearch = (searchText: string) => {
    console.log('搜索内容:', searchText);
    // 在这里执行搜索逻辑
  };
  
  return (
    <>
      <View style={styles.container}>
        <View style={styles.headerWrapper}>
          <InputSearch 
            placeholder="请输入或扫描收货申请单号" 
            onSearch={handleSearch}
            returnKeyType='search'
            autoFocus
            selectTextOnFocus
          />
        </View>
        <View className='flex justify-between '>
          <Text className='text-red-500'>收货申请单</Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container:{
    backgroundColor:"#fff",
    height:"100%",
  },
  headerWrapper: {
    padding:10,
  },
});