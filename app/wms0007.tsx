import { toastConfig } from '@/components/ToastConfig';
import InputSearch from '@/components/ui/InputSearch';
import PageIndicator from '@/components/ui/PageIndicator';
import { queryOneFetch } from '@/lib/commonServices';
import '@/lib/request';
import { useIsFocused } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import Toast from 'react-native-toast-message';
export default function Wms0007Screen() {
  const router = useRouter();
  
  const isFocused = useIsFocused();
  const [docNo,setDocNo] = useState("");
  const {mutate,data,isPending} = useMutation({
    mutationKey: ['wms0006'],
    mutationFn:(docNo:string)=>{
      return queryOneFetch<any,any>({
        functionCode:"wms0006",
        prefix:"wms",
        data:{
          docNo
        }
      })
    },
    onSuccess: (data) => {
      if(data){
        if(data.docStatus == 3){
          Toast.show({
            type: "default",
            text1: "该单据已全部收货",
          });
         
        }else if(data.docStatus == 99){
          Toast.show({
            type: "default",
            text1: "该单据已取消",
          });
        }else {
          router.navigate({
            pathname:"/wms0007/[docNo]",
            params:{
              docNo:data.docNo
            },
          });
          setDocNo("");
        }
        
      }else{
        Toast.show({
          type: "default",
          text1: "收货申请单不存在",
        });
      }
    }
  })
  const handleSearch = (searchText: string) => {
    mutate(searchText)
  };
  
  return (
    <>
      <View style={styles.container}>
        <View style={styles.headerWrapper}>
          <InputSearch 
            placeholder="请输入或扫描收货申请单号" 
            onSearch={handleSearch}
            onChangeText={setDocNo}
            value={docNo}
            returnKeyType='search'
          />
        </View>
        {isPending && <PageIndicator />}
        <Toast config={toastConfig} />
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