import {
  FormikLocationModal,
  FormikLocationPicker,
  FormikTextInput,
} from "@/components/FormItem";
import { toastConfig } from "@/components/ToastConfig";
import InputSearch from "@/components/ui/InputSearch";
import PageIndicator from "@/components/ui/PageIndicator";
import Popup from "@/components/ui/Popup";
import useEnum from "@/hooks/useEnum";
import { addItemFetch, commonRequestFetch } from "@/lib/commonServices";
import { getLocalUserInfo } from "@/lib/util";
import { getEnumStore } from "@/store/enum";
import { useMutation } from "@tanstack/react-query";
import { Formik } from "formik";
import { useRef, useState } from "react";
import { Button, FlatList, Pressable, Text, TextInput, View } from "react-native";
import Toast from "react-native-toast-message";

export default function Wms0028Screen() {
  const whsCode = getLocalUserInfo()?.whsCode;
  const [visible, setVisible] = useState(false);
  const [visible1, setVisible1] = useState(false);
  const [wms002802, setWms002802] = useState<any>(null);
  const [waitSelectList, setWaitSelectList] = useState<any>([]);
  const [toLocationFocus,setToLocationFocus] = useState(true);
  //
  useEnum({ params: [
    "Mdm0020",
    {
      code:"Mdm001901",
      filter: {
        isDefaultPurchase: [1]
      }
    }
   ] 
  });

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
      setWms002802(null);
      if (res.locationInventoryInfo?.locationInventoryInfoList.length == 0) {
        Toast.show({
          type: "default",
          text1: "当前库位暂无货品",
        });
      }
      if (res.mdm0085Info?.onHandInfo.length == 0) {
        Toast.show({
          type: "default",
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
      if (list.length > 1) {
        setWaitSelectList(list);
        setVisible1(true);
      } else {
        setWms002802(list[0]);
      }
    },
  })

 

  // 创建快速移动单 fetch
  const wms0028CreateMutation = useMutation({
    mutationKey: ["wms0028"],
    mutationFn: (wms002802: any) => {
      const inventoryOrganization = wms002802.inventoryOrganization || getEnumStore("Mdm001901")?.[0]?.value;
      console.log(inventoryOrganization,wms002802);
      return addItemFetch({
        functionCode: "wms0028",
        prefix: "wms",
        data: {
          wms002802:[{...wms002802,inventoryOrganization}],
          whsCode,
          isConfirm: 1,
        },
      });
    },
    onSuccess: () => {
      setWms002802(null);
      Toast.show({
        type: "default",
        text1: "转移成功",
      });
    },
    onError: (error) => {
      Toast.show({
        type: "default",
        text1: "转移失败"+error.message,
      });
    },
  });
  
  const onSubmit = (values: any) => {
    return wms0028CreateMutation.mutateAsync(values.wms002802);
  };
  return (
    <View className="flex-1 bg-white p-2">
      <InputSearch
        placeholder="请扫描货品编码或库位条码"
        onSearch={(v)=>selectInventoryPdaMutation.mutate(v)}
      />
      {
        selectInventoryPdaMutation.isPending && <PageIndicator />
      }
      {wms002802 && (
        <Formik initialValues={{ wms002802 }} onSubmit={onSubmit}>
          {(props) => (
            <View className="gap-2 mt-2">
              <Text>
                ({wms002802.itemCode}){wms002802.itemName}
              </Text>
              <View className="flex-row justify-between">
                <Text>库位：{wms002802.fromLocationName}</Text>
                <Text>可转移数量：{wms002802.onHandCanMove}</Text>
              </View>
              
              <View className="flex-row items-center">
                <Text>转移到：</Text>
                <FormikLocationPicker
                  name="wms002802.toLocationName"
                  codeName="wms002802.toLocation"
                  onOpenModal={() => setVisible(true)}
                  focus={toLocationFocus}
                  whsCode={whsCode!}
                  onSubmit={(row)=>{
                    onSubmit(Object.assign({},props.values,Object.assign(props.values.wms002802,{toLocation:row.code,toLocationName:row.name})))
                  }}
                />
              </View>
              <View className="flex-row items-center mb-4">
                <Text>转移数量：</Text>
                <FormikTextInput
                  inputMode="numeric"
                  className="border border-gray-300 flex-1 mx-2 rounded p-2"
                  name="wms002802.quantity"
                />
              </View>
              <Button
                title="确定"
                disabled={wms0028CreateMutation.isPending}
                onPress={() => {
                  setToLocationFocus(false);
                  props.handleSubmit();
                }}
              />
              <FormikLocationModal
                name="wms002802.toLocationName"
                codeName="wms002802.toLocation"
                visible={visible}
                onClose={() => setVisible(false)}
                onSubmit={() => props.handleSubmit()}
                whsCode={whsCode!}
                areaType={[1, 9]}
              />
              
            </View>
          )}
        </Formik>
      )}
      <Popup
        visible={visible1}
        onClose={() => setVisible1(false)}
        modalStyle={{ height: "60%",padding:6 }}
        title="选择货品"
      >
        <FlatList
          data={waitSelectList}
          className="p-2"
          renderItem={({ item }) => (
            <Pressable className="border border-gray-300 p-2 mb-2" onPress={()=>{
              setWms002802(item);
              setVisible1(false);
            }}>
              <Text>
                ({item.itemCode}){item.itemName}
              </Text>
              <View className="flex-row justify-between">
                <Text>库位：{item.fromLocationName}</Text>
                <Text>可转移数量：{item.onHandCanMove}</Text>
              </View>
            </Pressable>
          )}
        />  
      </Popup>
      <Toast config={toastConfig}/>
    </View>
  );
}
