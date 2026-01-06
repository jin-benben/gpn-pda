import EnumLabel from "@/components/EnumLabel";
import EnumSelect from "@/components/EnumSelect";
import {
  FormikCheckbox,
  FormikLocationModal,
  FormikLocationPicker,
  FormikTextInput
} from "@/components/FormItem";
import PageIndicator from "@/components/ui/PageIndicator";
import theme from "@/const/theme";
import useEnum from "@/hooks/useEnum";
import { addItemFetch, commonRequestFetch } from "@/lib/commonServices";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Formik, FormikProps, useField, useFormikContext } from "formik";
import { pick } from "lodash-es";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Toast from "react-native-toast-message";


export default function Wms0007Screen() {
  const router = useRouter();
  const [lineData, setLineData] = useState({
    whsCode: "",
    index: 0,
  });
  const [visible, setVisible] = useState(false);
  const local = useLocalSearchParams();
  const enumQueryRes = useEnum({
    params: [
      "wms0006DeliveryOrganizationType",
      "wms000601BaseDocType",
      "Mdm0020",
      "wms000701ReceiverMode",
    ],
  });
  // 获取单据详情
  const {
    data: wms000702NewList,
    status,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["wms0007", local.docNo],
    select: (res: any) =>res.wms000702NewList,
    queryFn: () => {
      return commonRequestFetch({
        functionCode: "wms0006",
        prefix: "wms",
        url: "/selectByBaseDocAndLogisticsDoc",
        data: {
          docType: [1],
          docNos: [local.docNo],
        },
      });
    },
  });

  const lastList = useMemo(()=>{
    if(wms000702NewList?.length && enumQueryRes.data){
      const whsCode =  wms000702NewList[0]?.whsCode;
      const whsRowData = enumQueryRes.data.Mdm0020?.find((a)=>a.value === whsCode)?.extend;
      return wms000702NewList.map((a:any)=>{
        return {
          ...a,
          temporaryReceivingLocationName: whsRowData?.temporaryReceivingLocationName,
          temporaryShippingLocation: whsRowData?.temporaryShippingLocation,
          receiverLocation: whsRowData?.temporaryShippingLocation,
          receiverLocationName: whsRowData?.temporaryReceivingLocationName,
          quantity: a.openReceiverQuantity,
        }
      })
      
    }
    return []
   
    
  },[enumQueryRes.data,wms000702NewList])
  

  useEffect(() => {
    if (status === "success" && !wms000702NewList) {
      Alert.alert("提示", "已全部收货", [
        { text: "确定", onPress: () => router.back() },
      ]);
    }
  }, [status, wms000702NewList]);

  // 创建收货单
  const { mutateAsync, isPending: isAddLoading } = useMutation({
    mutationKey: ["wms0007"],
    mutationFn: (data: any) => {
      return addItemFetch<any>({
        functionCode: "wms0007",
        prefix: "wms",
        data,
      });
    },
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "收货成功",
        topOffset: 0,
        onHide:refetch,
      });
    },
    onError: (err) => {
      Toast.show({
        type: "error",
        text1: "收货失败",
        text2: err.message,
        topOffset: 0,
      });
    },
  });

  // 删除行
  const deleteLine = (index: number,props:FormikProps<any>) => {
    props.setFieldValue("list", props.values.list.filter((a: any,bIndex:number) => bIndex !== index));
  };
  
  // 打开库位选择器
  const onOpenModal = (index: number) => {
    setLineData({
      whsCode: wms000702NewList?.[index].whsCode,
      index,
    });
    setVisible(true);
  };



  const onSubmit = (value: any) => {
    // 数据处理
    const wms000701 = {};
    let docTypeNameInfo: string[] = [];
    let trackingNumberInfo: string[] = [];
    let applicantNameInfo: string[] = [];
    let baseDocNoInfo: string[] = [];
    let comment: string[] = [];
    const wms000702 = value.list.map((d: any) => {
      if (!docTypeNameInfo.includes(d.docTypeNameInfo)) {
        docTypeNameInfo.push(d.docTypeNameInfo);
      }
      if (!trackingNumberInfo.includes(d.trackingNumberInfo)) {
        trackingNumberInfo.push(d.trackingNumberInfo);
      }
      if (!applicantNameInfo.includes(d.applicantNameInfo)) {
        applicantNameInfo.push(d.applicantNameInfo);
      }
      if (!baseDocNoInfo.includes(d.baseDocNoInfo)) {
        baseDocNoInfo.push(d.baseDocNoInfo);
      }
      if (!comment.includes(d.comment)) {
        comment.push(d.comment);
      }
      return Object.assign(
        {},
        pick(d, [
          "inventoryOrganization",
          "receiveOrderDocId",
          "receiveOrderDocNo",
          "receiveOrderLineId",
          "sourceDocType",
          "sourceDocId",
          "sourceDocNo",
          "sourceLineId",
          "baseDocType",
          "baseDocId",
          "baseDocNo",
          "baseLineId",
          "soDocId",
          "soDocNo",
          "soLineId",
          "baseDocType",
          "itemCode",
          "itemName",
          "unit",
          "openReceiverQuantity",
          "lineComment",
          "whsCode",
          "receiverLocation",
          "receiverLocationName",
          "quantity",
        ])
      );
    });
    Object.assign(
      wms000701,
      {
        comment: comment.toString(),
        docTypeNameInfo: docTypeNameInfo.toString(),
        trackingNumberInfo: trackingNumberInfo.toString(),
        applicantNameInfo: applicantNameInfo.toString(),
        baseDocNoInfo: baseDocNoInfo.toString(),
        wms000702,
        receiverMode: value.receiverMode,
        directConfirm: Number(value.directConfirm),
      },
      pick(value.list[0], [
        "deliveryType",
        "deliveryOrganizationType",
        "deliveryOrganizationCode",
        "deliveryOrganizationName",
        "inventoryOrganization",
        "whsCode",
        "baseDocType",
      ])
    );
    return mutateAsync(wms000701);
  };

  if (isFetching || lastList.length === 0 ) {
    return <PageIndicator />;
  }

  return (
    <Formik
      initialValues={{
        list: lastList,
        directConfirm: true,
        receiverMode: "1",
      }}
      onSubmit={onSubmit}
    >
      {(props) => (
        <View className="bg-white px-2 flex-1">
          <FlatList
            refreshControl={
              <RefreshControl refreshing={isFetching} onRefresh={refetch} />
            }
            ListHeaderComponent={
              <>
                <View className="flex-row justify-between">
                  <View className="flex-row">
                    <EnumLabel
                      enumKey="wms000601BaseDocType"
                      value={lastList?.[0].baseDocType}
                    />
                    <Text>：{lastList?.[0].baseDocNo}</Text>
                  </View>
                  <EnumLabel
                    enumKey="Mdm0020"
                    value={lastList?.[0].whsCode}
                  />
                </View>
                <View className="flex-row">
                  <Text>送货方：</Text>
                  <EnumLabel
                    enumKey="wms0006DeliveryOrganizationType"
                    value={lastList?.[0].deliveryOrganizationType}
                  />
                  <Text>{lastList?.[0].deliveryOrganizationName}</Text>
                </View>
                <ReceiverModeItem />
              </>
            }
            data={props.values.list}
            renderItem={({ item, index }) => (
              <View className="border border-gray-300 mb-2 rounded p-2 gap-1">
                <Text>({item.itemCode}) {item.itemName}</Text>
                <View className="flex-row mb-2 items-center">
                  <Text>库 位：</Text>
                  <FormikLocationPicker
                    name={`list.${index}.receiverLocationName]`}
                    codeName={`list.${index}.receiverLocation`}
                    onOpenModal={() => onOpenModal(index)}
                    whsCode={item.whsCode}
                  />
                </View>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Text>收/未收：</Text>
                    <FormikTextInput
                      inputMode="numeric"
                      className="border border-gray-300 w-20 h-9 mr-2 rounded p-0 px-2"
                      name={`list.${index}.quantity]`}
                    />
                    <Text>
                      {item.openReceiverQuantity}/{item.unit}
                    </Text>
                  </View>
                  <TouchableOpacity
                    className="rounded-full h-10 w-10 items-center justify-center bg-red-100"
                    onPress={() => deleteLine(index,props)}
                  >
                    <MaterialIcons
                      name="delete-outline"
                      size={20}
                      color={theme.error}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />

          <View className="flex-row">
            <FormikCheckbox label="直接确认" name="directConfirm" />
            <TouchableOpacity
              disabled={props.isSubmitting}
              onPress={() => props.handleSubmit()}
              className="flex-1 bg-blue-800 h-12 items-center justify-center ml-4 flex-row"
            >
              {props.isSubmitting && (
                <ActivityIndicator animating={true} color={"#fff"} />
              )}
              <Text className="text-white text-lg">
                {props.values.receiverMode == "1" ? "收货" : "上架"}
              </Text>
            </TouchableOpacity>
          </View>
          <FormikLocationModal
            name={`list.${lineData.index}.receiverLocationName]`}
            codeName={`list.${lineData.index}.receiverLocation`}
            visible={visible}
            onClose={() => setVisible(false)}
            whsCode={lineData.whsCode}
            areaType={props.values.receiverMode == "1" ? [2] : [1, 3]}
          />
          <Toast />
        </View>
      )}
    </Formik>
  );
}

const ReceiverModeItem=()=>{
  const [field, meta, helpers] = useField("receiverMode");
  const formik = useFormikContext<any>();
  
  const onChange=(v:any)=>{
    helpers.setValue(v);
    if(v == "2"){
      commonRequestFetch<any, any>({
        functionCode: "wms0008",
        prefix: "wms",
        url: "/selectHistoryLocationPda",
        data: {
          itemCodeWhs: formik.values.list.map((d:any) => ({
            itemCode: d.itemCode,
            whsCode: d.whsCode,
            inventoryOrganization:d.inventoryOrganization
          })),
        },
      }).then(res=>{ 
         const newList = formik.values.list.map((a:any)=>{
          const last = res.itemCodeWhsLocation.find((d:any)=>d.itemCode===a.itemCode && d.whsCode===a.whsCode)
          return {
            ...a,
            receiverLocation:last?.putawayLocation,
            receiverLocationName:last?.putawayLocationName,
          }
         })
         formik.setFieldValue("list",newList)
      })
    }else{
      const newList = formik.values.list.map((a:any)=>{
        return {
          ...a,
          receiverLocation:a.temporaryReceivingLocation,
          receiverLocationName:a.temporaryReceivingLocationName,
        }
       })
       formik.setFieldValue("list",newList)
    }
    
  }
  return (
    <EnumSelect
      value={field.value}
      onChange={onChange}
      className="flex-1"
      enumKey="wms000701ReceiverMode"
      
    />
  ) 
}