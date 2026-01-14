import EnumLabel from "@/components/EnumLabel";
import EnumSelect from "@/components/EnumSelect";
import {
  FormikLocationPicker,
  FormikTextInput,
  FormikCheckbox,
  FormikLocationModal,
} from "@/components/FormItem";
import RenderScrollComponent from "@/components/RenderScrollComponent";
import { toastConfig } from "@/components/ToastConfig";
import Empty from "@/components/ui/Empty";
import InputSearch, { SearchInput } from "@/components/ui/InputSearch";
import PageIndicator from "@/components/ui/PageIndicator";
import theme from "@/const/theme";
import useEnum from "@/hooks/useEnum";
import {
  addItemFetch,
  commonRequestFetch,
  queryOneFetch,
} from "@/lib/commonServices";
import "@/lib/request";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useIsFocused } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Formik, FormikProps, useField, useFormikContext } from "formik";
import { constant, pick } from "lodash-es";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import Toast from "react-native-toast-message";
export default function Wms0007Screen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  console.log("local", isFocused);
  const local = useLocalSearchParams();
  const inputRef = useRef<SearchInput>(null);
  const [waitReceiveList, setWaitReceiveList] = useState<any[]>();
  const [wms000701Data, setWms000701Data] = useState<any>();
  const [wms000101Data, setWms000101Data] = useState<any>();
  const [lineData, setLineData] = useState({
    index: 0,
  });
  const [visible, setVisible] = useState(false);

  const enumQueryRes = useEnum({
    params: [
      "wms0006DeliveryOrganizationType",
      "wms000601BaseDocType",
      "Mdm0020",
      "wms000701ReceiverMode",
    ],
  });

  const [searchText, setSearchText] = useState(local.docNo as string);
  // 查询待收货单据信息
  const selectByBaseDocAndLogisticsDocMutation = useMutation({
    mutationKey: ["selectByBaseDocAndLogisticsDoc"],
    mutationFn: (docNo: string) => {
      console.log("docNo", docNo);
      return commonRequestFetch<any, any>({
        functionCode: "wms0006",
        prefix: "wms",
        url: "/selectByBaseDocAndLogisticsDoc",
        data: {
          docType: [1, 2, 3, 4, 5, 6, 7, 8, 9],
          docNos: [docNo],
          baseDocType: local.baseDocType ?? "",
        },
      });
    },
    onSuccess: (res: any) => {
      if (res.wms000702NewList) {
        // 存在数据
        setWms000701Data(
          pick(res.wms000702NewList[0], [
            "deliveryType",
            "deliveryOrganizationType",
            "deliveryOrganizationCode",
            "deliveryOrganizationName",
            "inventoryOrganization",
            "whsCode",
            "baseDocType",
            "baseDocNo",
          ])
        );
      }
      if (res.wms0001ItemInfoList) {
        const wms0001Data = res.wms0001ItemInfoList[0];
        Toast.show({
          type: "default",
          text1: wms0001Data.message,
        });
        if (wms0001Data.docStatus == 4) {
          setWms000101Data(wms0001Data);
        } else {
          setSearchText("");
          inputRef.current?.focus();
        }
      }
      if (!res.wms000702NewList && !res.wms0001ItemInfoList) {
        Toast.show({
          type: "default",
          text1: "暂无可收货的货品",
        });
        inputRef.current?.focus();
      }
    },
  });

  // 初始
  useEffect(() => {
    if (local.docNo) {
      selectByBaseDocAndLogisticsDocMutation.mutate(searchText);
    }
  }, []);

  const lastList = useMemo(() => {
    if (selectByBaseDocAndLogisticsDocMutation.isPending) {
      return [];
    }
    if (
      selectByBaseDocAndLogisticsDocMutation.data?.wms000702NewList?.length &&
      enumQueryRes.data
    ) {
      const wms000702NewList =
        selectByBaseDocAndLogisticsDocMutation.data.wms000702NewList;
      const whsCode = wms000702NewList[0]?.whsCode;
      const whsRowData = enumQueryRes.data.Mdm0020?.find(
        (a) => a.value === whsCode
      )?.extend;
      return wms000702NewList.map((a: any) => {
        return {
          ...a,
          temporaryReceivingLocationName:
            whsRowData?.temporaryReceivingLocationName,
          temporaryShippingLocation: whsRowData?.temporaryShippingLocation,
          receiverLocation: whsRowData?.temporaryShippingLocation,
          receiverLocationName: whsRowData?.temporaryReceivingLocationName,
          quantity: a.openReceiverQuantity,
        };
      });
    }
    return [];
  }, [
    enumQueryRes.data,
    selectByBaseDocAndLogisticsDocMutation.data,
    selectByBaseDocAndLogisticsDocMutation.isPending,
  ]);

  const onRefresh = () => {
    setWms000101Data(null);
    selectByBaseDocAndLogisticsDocMutation.mutate(searchText);
    inputRef.current?.focus();
  };

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
    onSuccess: (res, variables) => {
      onRefresh();
      Toast.show({
        type: "default",
        text1: "收货成功",
      });
      if (variables.directConfirm == 1) {
        commonRequestFetch({
          functionCode: "wms0007",
          prefix: "wms",
          url: "/confirm",
          data: {
            docId: res.docId,
          },
        });
      }
    },
  });

  // 删除行
  const deleteLine = (index: number, props: FormikProps<any>) => {
    props.setFieldValue(
      "list",
      props.values.list.filter((a: any, bIndex: number) => bIndex !== index)
    );
  };

  // 打开库位选择器
  const onOpenModal = (index: number) => {
    setLineData({
      index,
    });
    setVisible(true);
  };
 const onSubmit = (value: any) => {
  // 使用 Set 进行去重，提高查找效率
  const docTypeNameInfo = new Set<string>();
  const trackingNumberInfo = new Set<string>();
  const applicantNameInfo = new Set<string>();
  const baseDocNoInfo = new Set<string>();
  const comment = new Set<string>();

  const wms000702 = value.list.map((d: any) => {
    // 使用 Set.add() 自动去重
    docTypeNameInfo.add(d.docTypeNameInfo);
    trackingNumberInfo.add(d.trackingNumberInfo);
    applicantNameInfo.add(d.applicantNameInfo);
    baseDocNoInfo.add(d.baseDocNoInfo);
    comment.add(d.comment);

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

  return mutateAsync(
    Object.assign(wms000701Data, {
      comment: Array.from(comment).join(','),
      docTypeNameInfo: Array.from(docTypeNameInfo).join(','),
      trackingNumberInfo: Array.from(trackingNumberInfo).join(','),
      applicantNameInfo: Array.from(applicantNameInfo).join(','),
      baseDocNoInfo: Array.from(baseDocNoInfo).join(','),
      wms000702,
      receiverMode: value.receiverMode,
      directConfirm: value.directConfirm,
    })
  );
};

 
  const onSearch = (v: string) => {
    setWms000101Data(null);
    selectByBaseDocAndLogisticsDocMutation.mutate(v);
  };

  return (
    
      <View style={styles.container}>
        <Stack.Screen
          options={{ title: local.baseDocType ? "售后收货" : "常规收货" }}
        />
        <View style={styles.headerWrapper}>
          <InputSearch
            ref={inputRef}
            placeholder="请输入或扫描收货申请单号"
            onSearch={onSearch}
            onChangeText={setSearchText}
            value={searchText}
            returnKeyType="search"
          />
        </View>

        {selectByBaseDocAndLogisticsDocMutation.isPending && <PageIndicator />}

        {Boolean(lastList?.length) && (
          <Formik
            initialValues={{
              list: lastList,
              directConfirm: 1,
              receiverMode: local.baseDocType ? "2" : "1",
            }}
            onSubmit={onSubmit}
            enableReinitialize
          >
            {(props) => {
              return (
                <View className="flex-1">
                  <FlashList
                    renderScrollComponent={RenderScrollComponent}
                    refreshControl={
                      <RefreshControl
                        refreshing={
                          selectByBaseDocAndLogisticsDocMutation.isPending
                        }
                        onRefresh={onRefresh}
                      />
                    }
                    ListHeaderComponent={
                      <View className="bg-white px-2 mb-2">
                        <View className="flex-row justify-between">
                          <View className="flex-row">
                            <EnumLabel
                              enumKey="wms000601BaseDocType"
                              value={wms000701Data?.baseDocType}
                            />
                            <Text>：{wms000701Data?.baseDocNo}</Text>
                          </View>
                          <EnumLabel
                            enumKey="Mdm0020"
                            value={wms000701Data?.whsCode}
                          />
                        </View>
                        <Text>
                            送货方类型：
                            <EnumLabel
                              enumKey="wms0006DeliveryOrganizationType"
                              value={wms000701Data?.deliveryOrganizationType}
                            />
                        </Text>
                        <Text>送货方：{wms000701Data?.deliveryOrganizationName}</Text>
                        <ReceiverModeItem />
                      </View>
                    }
                    data={lastList as any[]}
                    renderItem={({ item, index }) => (
                      <View className="bg-white mb-2 rounded p-2 gap-1 mx-2">
                        <Text>
                          ({item.itemCode}) {item.itemName}
                        </Text>
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
                            onPress={() => deleteLine(index, props)}
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
                    whsCode={wms000701Data?.whsCode}
                    areaType={
                      props.values.receiverMode == "1" ? [2] : [1, 3, 9, 6, 99]
                    }
                  />
                </View>
              );
            }}
          </Formik>
        )}

        {
          wms000101Data && (
             <Wms0001List wms000101Data={wms000101Data} callback={onRefresh}/>
          )
        }
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerWrapper: {
    padding: 10,
    backgroundColor: "#fff",
    zIndex: 1,
  },
});


const ReceiverModeItem = () => {
  const [field, meta, helpers] = useField("receiverMode");
  const formik = useFormikContext<any>();

  const onChange = (v: any) => {
    helpers.setValue(v);
    if (v == "2") {
      commonRequestFetch<any, any>({
        functionCode: "wms0008",
        prefix: "wms",
        url: "/selectHistoryLocationPda",
        data: {
          itemCodeWhs: formik.values.list.map((d: any) => ({
            itemCode: d.itemCode,
            whsCode: d.whsCode,
            inventoryOrganization: d.inventoryOrganization,
          })),
        },
      }).then((res) => {
        const newList = formik.values.list.map((a: any) => {
          const last = res.itemCodeWhsLocation.find(
            (d: any) => d.itemCode === a.itemCode && d.whsCode === a.whsCode
          );
          return {
            ...a,
            receiverLocation: last?.putawayLocation,
            receiverLocationName: last?.putawayLocationName,
          };
        });
        formik.setFieldValue("list", newList);
      });
    } else {
      const newList = formik.values.list.map((a: any) => {
        return {
          ...a,
          receiverLocation: a.temporaryReceivingLocation,
          receiverLocationName: a.temporaryReceivingLocationName,
        };
      });
      formik.setFieldValue("list", newList);
    }
  };
  return (
    <EnumSelect
      value={field.value}
      onChange={onChange}
      className="flex-1"
      enumKey="wms000701ReceiverMode"
    />
  );
};

interface Wms0001ListItemProps {
  wms000101Data:{
    docId:string;
    docNo:string;
    wms000102:any[];
  };
  callback:()=>void;
}
const Wms0001List = ({callback,wms000101Data}:Wms0001ListItemProps) => {
  const wms0001CancelMutation = useMutation({
    mutationKey: ["wms000701"],
    mutationFn: (data: any) => {
      return commonRequestFetch<any, any>({
        functionCode: "wms0001",
        prefix: "wms",
        url: "/cancel",
        data: {
          docId: wms000101Data?.docId,
        },
      });
    },
    onSuccess: (res) => {
      Toast.show({
        type: "default",
        text1: "取消成功",
      });
      callback();
    },
  });
  const wms0001Cancel = () => {
    Alert.alert("取消", "确定取消该发货单吗？", [
      {
        text: "取消",
        style: "cancel",
      },
      {
        text: "确定",
        onPress: () => {
          wms0001CancelMutation.mutate(wms000101Data?.docId);
        },
      },
    ]);
  };

  return (
    <View className="px-2 gap-2 flex-1">
      <Text>发货单号：{wms000101Data.docNo}</Text>
      <FlashList
        data={wms000101Data.wms000102}
        keyExtractor={(item) => item.lineId}
        ListEmptyComponent={<Empty />}
        renderItem={({ item, index }) => (
          <View className="border border-gray-300 rounded p-2">
            <View className="flex-row justify-between gap-2 items-center ">
              <Image
                style={{ width: 80, height: 80, borderRadius: 6 }}
                source={{ uri: item.imageOriginUrl }}
              />
              <View className="gap-1 flex-1">
                <Text>{item.skuName}</Text>
                <Text>skuId：{item.skuId}</Text>
                <Text>
                  数量：{item.quantity}/{item.unit}
                </Text>
              </View>
            </View>
            <View className="bg-gray-100 gap-1">
              {item.wms000103.map((b: any) => (
                <View key={b.lineId} className="bg-white p-1 gap-1">
                  <Text>{b.skuName}</Text>
                  <Text>货品编码：{b.skuId}</Text>
                  <Text>
                    数量：{b.quantity}/{b.unit}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      />
      <TouchableOpacity
        className="bg-red-500 h-12 items-center justify-center"
        activeOpacity={0.7}
        onPress={wms0001Cancel}
        disabled={wms0001CancelMutation.isPending}
      >
        <Text className="text-white text-lg">取消</Text>
      </TouchableOpacity>
    </View>
  );
};
