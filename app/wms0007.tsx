import InputSearch from '@/components/ui/InputSearch';
import PageIndicator from '@/components/ui/PageIndicator';
import { queryOneFetch } from '@/lib/commonServices';
import '@/lib/request';
import { useIsFocused } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';
export default function Wms0007Screen() {
  const inputRef = useRef<TextInput>(null);
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
        router.navigate({
          pathname:"/wms0007/[docNo]",
          params:{
            docNo:data.docNo
          },
        });
        setDocNo("");
      }else{
        Alert.alert("收货申请单不存在","",[{text: '确定',onPress:()=>inputRef.current?.focus()}])
      }
    }
  })
  const handleSearch = (searchText: string) => {
    mutate(searchText)
  };
  useEffect(() => {
    if (isFocused) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isFocused]);
  return (
    <>
      <View style={styles.container}>
        <View style={styles.headerWrapper}>
          <InputSearch 
            ref={inputRef}
            placeholder="请输入或扫描收货申请单号" 
            onSearch={handleSearch}
            onChangeText={setDocNo}
            value={docNo}
            returnKeyType='search'
            selectTextOnFocus
            autoFocus
          />
        </View>
        {isPending && <PageIndicator />}
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