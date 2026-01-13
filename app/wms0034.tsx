
import EnumLabel from "@/components/EnumLabel";
import Tabs from "@/components/Tabs";
import Empty from "@/components/ui/Empty";
import useEnum from "@/hooks/useEnum";
import { commonRequestFetch, queryListFetch } from "@/lib/commonServices";
import { useIsFocused } from "@react-navigation/native";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { memo, useState } from "react";
import { FlatList, GestureResponderEvent, ListRenderItemInfo, Pressable, RefreshControl, Text, ToastAndroid, TouchableOpacity, View } from "react-native";

interface RenderItemProps extends ListRenderItemInfo<any>{
  item:any,
  callback:()=>void
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
    <Pressable onPress={onPress} className="mx-2 p-2 border border-gray-200 mb-2 rounded gap-1">
      <View className="flex-row justify-between">
        <Text>单号：{item.docNo} </Text>
        <EnumLabel enumKey='wms0034DocType' value={item.docType}/>
      </View>
      <Text>送货方：{item.deliveryOrganizationName}</Text>
      <Text>处理方式：<EnumLabel enumKey='wms0034ProcessingMethod' value={item.processingMethod}/></Text>
      <View className="flex-row">
        <Text>备注：</Text>
        <Text className="flex-1">{item.comment}</Text>
      </View>
      <View className="flex-row justify-between items-center">
        <Text>创建人：{item.createUserName }({ item.createTime })</Text>
      </View>
    </Pressable>
  )
})

export default function App() {
  const isFocused = useIsFocused() 
  const [activeKey,setActiveKey] = useState("1");
  const {data,refetch,isLoading} = useQuery({
    queryKey: ['wms0034',activeKey,isFocused],
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
    <View className="flex-1 bg-white pt-2">
      <FlatList 
        data={data?.rows} 
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch}/>}
        keyExtractor={(item)=>item.docId}
        ListEmptyComponent={<Empty />}
        renderItem={(props)=><RenderItem callback={refetch} {...props}/>}
      />
    </View>
  );
}

