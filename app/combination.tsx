import ClipboardText from '@/components/ClipboardText';
import EnumSelect from '@/components/EnumSelect';
import { toastConfig } from '@/components/ToastConfig';
import Empty from '@/components/ui/Empty';
import InputSearch, { SearchInput } from '@/components/ui/InputSearch';
import PageIndicator from '@/components/ui/PageIndicator';
import useEnum from '@/hooks/useEnum';
import useCustomMutation from '@/hooks/useMutation';
import { commonRequestFetch } from '@/lib/commonServices';
import { getLocalUserInfo } from '@/lib/util';
import { Link, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, FlatList, StyleSheet, View,Image, TouchableOpacity,Keyboard } from 'react-native';
import Toast from 'react-native-toast-message';
export default function CombinationScreen() {
  const [whsCode, setWhsCode] = useState<string>(
    getLocalUserInfo()?.whsCode || ""
  );
  const [skuId,setSkuId] = useState("");
  const inputRef = React.useRef<SearchInput>(null);
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
  const {mutate,data,isPending} = useCustomMutation({
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
  })

  useEffect(() => {
    if(skuId && whsCode){
      mutate(skuId)
    }
  }, [whsCode])
  const handleSearch = (searchText: string) => {
    mutate(searchText)
  };

  const router = useRouter();
  const linkTo=(itemCode:string)=>{
    router.push(`./wms0017?itemCode=${itemCode}&whsCode=${whsCode}`)
  }
  
  return (
    <>
      <View className='flex-1'>
        <View style={styles.headerWrapper}>
          <EnumSelect enumKey="Mdm0020" value={whsCode} onChange={setWhsCode} />
          <InputSearch
            placeholder="请输入或扫描货品编码"
            onSearch={handleSearch}
            value={skuId}
            onChangeText={setSkuId}
            ref={inputRef}
          />
        </View>
        <View className='gap-2 p-2 flex-1'>
        {
          isPending ? <PageIndicator /> : (
          <FlatList
            data={data?.mdm008501}
            ListEmptyComponent={<Empty />}
            keyExtractor={(item) => item.code}
            renderItem={({item})=>(
              <View className='flex-row bg-white mb-2 gap-1 p-2'> 
                <TouchableOpacity activeOpacity={0.7} onPress={()=>linkTo(item.code)} className='flex-1'>
                  {
                    item.imageOriginUrl && <Image source={{uri:item.imageOriginUrl}} style={{width:100,height:100}} />
                  }
                  <Text>{item.name}</Text>
                  <ClipboardText text={item.code}>
                    <Text className='text-blue-600'>货品编码：{item.code}</Text>
                  </ClipboardText>
                  <Text>单位：{item.unit}</Text>
                  <Text>重量（g）：{item.weight}</Text>
                  <Text>品牌：{item.brandName}</Text>
                </TouchableOpacity>
              </View>
            )}
          />  
        )}
        </View>
        <Toast config={toastConfig} visibilityTime={2000} />
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