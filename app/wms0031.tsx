
import EnumLabel from "@/components/EnumLabel";
import Tabs from "@/components/Tabs";
import Empty from "@/components/ui/Empty";
import useEnum from "@/hooks/useEnum";
import useCustomMutation from "@/hooks/useMutation";
import { commonRequestFetch, queryListFetch } from "@/lib/commonServices";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { memo, useDeferredValue, useEffect, useState } from "react";
import { FlatList, GestureResponderEvent, ListRenderItemInfo, Pressable, RefreshControl, Text, ToastAndroid, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

interface RenderItemProps extends ListRenderItemInfo<any>{
  item:any,
  callback:()=>void
}
const RenderItem = memo(({item,callback}:RenderItemProps)=>{
  const router = useRouter();
  const startMutation = useCustomMutation({
    mutationFn: ()=>{
      return  commonRequestFetch({
        functionCode:"wms0031",
        data:{
          docId:item.docId,
          rowVersion:item.rowVersion,
        },
        prefix:"wms",
        url:"/start"
      })
    },
    onSuccess: () => {
      Toast.show({
        type:"default",
        text1:"领取成功"
      })
      callback();
      router.navigate({
        pathname:"/wms0031/[docId]",
        params:{
          docId:item.docId
        }
      })
      
    }
  })
  const cancelMutation = useCustomMutation({
    mutationFn: ()=>{
      return  commonRequestFetch({
        functionCode:"wms0031",
        data:{
          docId:item.docId,
          rowVersion:item.rowVersion,
        },
        prefix:"wms",
        url:"/cancel"
      })
    },
    onSuccess: () => {
      Toast.show({
        type:"default",
        text1:"取消成功"
      })
      callback();
    },
  })
  const onPress=(e:GestureResponderEvent)=>{
    e.stopPropagation();
    router.navigate({
      pathname:"/wms0031/[docId]",
      params:{
        docId:item.docId
      }
    })
  }
  return (
    <Pressable onPress={onPress} className="mx-2 p-2 border border-gray-200 mb-2 rounded gap-1">
      <View className="flex-row justify-between">
        <Text>单号：{item.docNo} </Text>
        <EnumLabel enumKey='Mdm0020' value={item.whsCode}/>
      </View>
      <View className="flex-row justify-between">
        <Text>来 源：<EnumLabel enumKey='wms003101DocSourceType' value={item.docSourceType}/></Text>
        <Text>优先级：<EnumLabel enumKey='wms003101DocPriority' value={item.docPriority}/></Text>
      </View>
      <View className="mb-1">
        <Text>补货库区：{item.toWhsAreaInfo}</Text>
      </View>
      <View className="flex-row">
        <Text>货品摘要：</Text>
        <Text className="flex-1 line-clamp-2">{item.goodsAbstract}</Text>
      </View>
      <View className="flex-row justify-between items-center">
        <Text>处理人：{item.assignerUserName }({ item.assignerTime })</Text>
      </View>
      <View className="flex-row gap-2">
        {
          item.docStatus == 1 && (
            <TouchableOpacity 
              disabled={startMutation.isPending} 
              activeOpacity={0.7} 
              className="bg-blue-500 px-6 py-1 rounded w-2/3 items-center" 
              onPress={()=>startMutation.mutate()}>
              <Text className="text-white">领取</Text>
            </TouchableOpacity>  
          )
        }
        {
          item.docStatus != 4 && (
            <TouchableOpacity 
              disabled={cancelMutation.isPending} 
              activeOpacity={0.7} 
              className="bg-red-500 px-6 py-1 rounded items-center w-1/3" 
              onPress={()=>cancelMutation.mutate()}>
              <Text className="text-white">取消</Text>
            </TouchableOpacity>  
          )
        }
        
      </View>
    </Pressable>
  )
})

export default function App() {
  const isFocused = useIsFocused() 
  const [activeKey,setActiveKey] = useState("1");
  const deferActiveKey = useDeferredValue(activeKey)
  const {data,isPending,mutate} = useCustomMutation({
    mutationFn: ()=>{
      return queryListFetch<any,any>({
        functionCode:"wms0031",
        prefix:"wms",
        data:{
          docStatusList:[deferActiveKey],
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
  useEffect(()=>{
    if(isFocused){
      mutate()
    }
  },[isFocused,deferActiveKey])
  
  useEnum({
    params:["Mdm0020","wms003101DocSourceType","wms003101DocPriority"]
  })

  const tabs = [
    {
      title: "待领取",
      key:"1",
    },
    {
      title: "处理中",
      key:"2",
    },
    {
      title: "部分完成",
      key:"3",
    },
    {
      title: "已完成",
      key:"4",
    },
  ];
  
  return (
    <View className="flex-1 bg-white">
      <Tabs activeKey={activeKey} onChange={setActiveKey} items={tabs}/>
      <FlatList 
        data={data?.rows} 
        refreshControl={<RefreshControl refreshing={isPending} onRefresh={mutate}/>}
        keyExtractor={(item)=>item.docId}
        ListEmptyComponent={<Empty />}
        renderItem={(props)=><RenderItem callback={mutate} {...props}/>}
      />
    </View>
  );
}

