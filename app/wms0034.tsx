
import EnumLabel from "@/components/EnumLabel";
import Empty from "@/components/ui/Empty";
import useEnum from "@/hooks/useEnum";
import { queryListFetch } from "@/lib/commonServices";
import { useIsFocused } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { memo } from "react";
import { GestureResponderEvent, Pressable, RefreshControl, Text, View,StyleSheet, ListRenderItemInfo, FlatList } from "react-native";

interface RenderItemProps extends ListRenderItemInfo<any>{
  item:any,
}
const RenderItem = memo(({item}:RenderItemProps)=>{
  const router = useRouter();
  
  const onPress=(e:GestureResponderEvent)=>{
    router.navigate({
      pathname:`/wms0007`,
      params:{
        docNo:item.receiveOrderDocNo,
        baseDocType:"ass0006"
      }
    })
  }
  return (
    <Pressable onPress={onPress} className="mx-2 p-2 mb-2 rounded gap-1 bg-white">
      <View className="flex-row justify-between">
        <Text>单号：{item.docNo} </Text>
        <EnumLabel enumKey='wms0034DocType' value={item.docType}/>
      </View>
      <Text>送货方：{item.deliveryOrganizationName}</Text>
      <Text>处理方式：<EnumLabel enumKey='wms0034ProcessingMethod' value={item.processingMethod}/></Text>
      <Text>关联单号：{item.receiveOrderDocNo}</Text>
      <View className="flex-row">
        <Text>备注：</Text>
        <Text className="flex-1">{item.comment}</Text>
      </View>
      <View className="flex-row flex-wrap gap-2">
        {
          item.wms003402?.map((img:any,subIndex:number)=>(
            <Image style={styles.image} key={img.lineId} source={img.pictureUrl} />
          ))
        }
      </View>
      <Text>创建人：{item.createUserName }({ item.createTime })</Text>
    </Pressable>
  )
})

export default function App() {
  const isFocused = useIsFocused() 
  const {data,refetch,isLoading} = useQuery({
    queryKey: ['wms0034',isFocused],
    refetchOnWindowFocus: false,
    queryFn: ()=>{
      return queryListFetch<any,any>({
        functionCode:"wms0034",
        prefix:"wms",
        data:{
          docStatusList:["2"],
          processingMethod:"1",
          page:1,
          size:100,
          orderBy:[
            {
              field:"docId",
              type:"desc"
            }
          ]
        },
      })
    }
  })
  
  useEnum({
    params:["Mdm0020","wms0034DocStatus","wms0034ProcessingMethod","wms0034DocType"]
  })

 
  return (
   <View className="flex-1">
     <FlatList 
      data={data?.rows} 
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch}/>}
      keyExtractor={(item)=>item.docId}
      ListEmptyComponent={<Empty />}
      contentContainerClassName="pt-2"
      renderItem={(props)=><RenderItem {...props}/>}
    />
   </View>
  );
}

const styles = StyleSheet.create({
  image:{
    width:40,
    height:40,
    borderRadius:6
  }
});