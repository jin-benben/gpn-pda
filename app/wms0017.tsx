import EnumSelect from "@/components/EnumSelect";
import InputSearch from "@/components/ui/InputSearch";
import useEnum from "@/hooks/useEnum";
import { addItemFetch, commonRequestFetch, deleteItemFetch } from "@/lib/commonServices";
import { getLocalUserInfo } from "@/lib/util";
import { useMutation, useQuery } from "@tanstack/react-query";
import { View } from "react-native";
import Toast from "react-native-toast-message";

export default function Wms0017Screen() { 
  const whsCode = getLocalUserInfo()?.whsCode;
  // 
  useEnum({params:["Mdm0020","Mdm001901"]});
  // 查询
  const selectInventoryPdaMutation = useMutation({
    mutationKey:["wms0011","selectInventoryPda"],
    mutationFn: (itemOrLocationCode:string) => {
      return commonRequestFetch({
        functionCode: "wms0011",
        prefix: "wms",
        url: "/selectInventoryPda",
        data: {
          whsCode,
          itemOrLocationCode,
        },
      });
    },
    onSuccess: (res:any) => {
      
      if (res.locationInventoryInfo?.locationInventoryInfoList.length == 0) {
        Toast.show({
          type: "error",
          text1: "当前库位暂无货品",
          topOffset: 0,
        });
      }
      if (res.mdm0085Info?.onHandInfo.length == 0) {
        Toast.show({
          type: "error",
          text1: "当前货品暂无库位",
          topOffset: 0,
        });
      }
      let list: any[] = [];
      if (res.locationInventoryInfo?.locationInventoryInfoList.length > 0) {
        list = res.locationInventoryInfo?.locationInventoryInfoList.map(
          (a: any) => ({
            ...a,
            fromLocation: res.locationInventoryInfo.location,
            fromLocationName: res.locationInventoryInfo.locationName,
            quantity:a.onHandCanMove,
          })
        );
      }
      if (res.mdm0085Info) {
        list = res.mdm0085Info.onHandInfo.map((a: any) => ({
          ...a,
          itemName: res.mdm0085Info.name,
          itemCode: res.mdm0085Info.code,
          fromLocation: a.location,
          fromLocationName: a.locationName,
          unit: res.mdm0085Info.unit,
          quantity:a.onHandCanMove,
        }));
      }
      
    },
  })
  // 绑定 fetch
  const createMdm0131Mutation = useMutation({
    mutationKey: ['mdm0131'],
    mutationFn: (data: any) => {
      return addItemFetch({functionCode:"mdm0131",prefix:"mdm",data})
    },
  })
  
  // 解绑
  const deleteMdm0131Mutation = useMutation({
    mutationKey: ['mdm0131'],
    mutationFn: (data: any) => {
      return deleteItemFetch({functionCode:"mdm0131",prefix:"mdm",data})
    },
  })
  // 盘点
  const createWms0017Mutation = useMutation({
    mutationKey: ['wms0017'],
    mutationFn: (data: any) => {
      return addItemFetch({functionCode:"mdm0131",prefix:"mdm",data})
    },
  })
  
  return (
    <View className="bg-white flex-1 px-2">
      <EnumSelect enumKey="Mdm0020" />'
      <InputSearch placeholder="请扫描货品编码或库位条码" />
      <Toast />
    </View>
  );
}