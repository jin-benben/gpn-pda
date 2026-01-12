import EnumSelect from '@/components/EnumSelect';
import Empty from '@/components/ui/Empty';
import InputSearch from '@/components/ui/InputSearch';
import PageIndicator from '@/components/ui/PageIndicator';
import useEnum from '@/hooks/useEnum';
import { commonRequestFetch } from '@/lib/commonServices';
import { getLocalUserInfo } from '@/lib/util';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, FlatList, StyleSheet, View,Image, Pressable } from 'react-native';
export default function CombinationScreen() {
  const [whsCode, setWhsCode] = useState<string>(
    getLocalUserInfo()?.whsCode || ""
  );
  const [skuId,setSkuId] = useState("");
  useEnum({
    params: [
      {
        code:"Mdm0020",
        filter: {
          whsType: [1,2],
        },
      }
    ],
  });
  const {mutate,data,isPending} = useMutation({
    mutationKey: ['selectGoodsBySku',whsCode],
    mutationFn:(skuId:string)=>{
      return commonRequestFetch<any,any>({
        functionCode:"mdm0085",
        prefix:"mdm2",
        url:"/selectSkuIsBind",
        data:{
          skuId,
          whsCodeList:[whsCode]
        }
      })
    },
    onSuccess: (data) => {
      
    },
    onError: (error) => {
      console.log(error);
    }
  })

  useEffect(() => {
    if(skuId && whsCode){
      mutate(skuId)
    }
  }, [whsCode])
  const handleSearch = (searchText: string) => {
    mutate(searchText)
  };
  
  return (
    <>
      <View>
        <View style={styles.headerWrapper}>
          <EnumSelect enumKey="Mdm0020" value={whsCode} onChange={setWhsCode} />
          <InputSearch 
            placeholder="请输入或扫描SKU" 
            onSearch={handleSearch}
            onChangeText={setSkuId}
            value={skuId}
            returnKeyType='search'
            selectTextOnFocus
          />
        </View>
        <View className='gap-2 p-2'>
        {
          isPending ? <PageIndicator /> : (
          <FlatList
            data={data?.mdm008501}
            ListEmptyComponent={<Empty />}
            keyExtractor={(item) => item.code}
           
            renderItem={({item})=>(
              <Link href={`./wms0017?itemCode=${item.code}&whsCode=${whsCode}`} asChild > 
                <Pressable className='flex-row bg-white mb-2 gap-1 p-2'>
                  {
                    item.imageOriginUrl && <Image source={{uri:item.imageOriginUrl}} style={{width:100,height:100}} />
                  }
                  
                  <View className='flex-1'>
                    <Text>{item.name}</Text>
                    <Text>货品编码：{item.code}</Text>
                    <Text>单位：{item.unit}</Text>
                    <Text>重量（g）：{item.weight}</Text>
                    <Text>品牌：{item.brandName}</Text>
                  </View>
                </Pressable>
              </Link>
            )}
          />  
        )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
 
  headerWrapper: {
    padding:10,
    backgroundColor:"#fff",
  },
});