import ClipboardText from "@/components/ClipboardText";
import {
  FormikCheckbox,
  FormikLocationPicker,
  FormikTextInput,
} from "@/components/FormItem";
import LocationModal, { LocationItem } from "@/components/LocationModal";
import InputSearch from "@/components/ui/InputSearch";
import PageIndicator from "@/components/ui/PageIndicator";
import { addItemFetch, commonRequestFetch } from "@/lib/commonServices";
import { getLocalUserInfo } from "@/lib/util";
import { useQuery } from "@tanstack/react-query";
import { Formik, FormikConfig, FormikProps } from "formik";
import React, { FC, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

interface RenderItemProps {
  item: any;
  index: number;
  onOpenModal: (index: number) => void;
}

const RenderItem: FC<RenderItemProps> = ({
  item,
  index,
  onOpenModal,
}) => {
  return (
    <View className="p-2 border border-gray-300 border-solid mb-2 rounded gap-1">
      <View className="flex-row">
        <Text className="font-bold">{index + 1}. </Text>
        <Text>{item.docTypeNameInfo}：</Text>
        <Text>{item.baseDocNo}</Text>
      </View>
      <Text className="my-1">送货方：{item.deliveryOrganizationName}</Text>
      <Text>
        {item.itemName}
      </Text>
      <ClipboardText text={item.itemCode}>
        <Text className="text-blue-600">货品编码：{item.itemCode}</Text>
      </ClipboardText>
      <View className="flex-row mb-2 items-center">
        <Text>上架库位：</Text>
        <FormikLocationPicker
          whsCode={item.whsCode}
          name={`list.${index}.putawayLocationName]`}
          codeName={`list.${index}.putawayLocation]`}
          onOpenModal={() => onOpenModal(index)}
        />
      </View>
      <View className="flex-row items-center mt-2 justify-between">
        <View className="flex-row items-center">
          <Text>收/未收：</Text>
          <FormikTextInput
            name={`list.${index}.quantity`}
            inputMode="numeric"
            className="border border-gray-300 w-20 h-9 mr-2 rounded p-0 px-2"
          />
          <Text>
            {item.openPutawayQuantity}/{item.unit}
          </Text>
        </View>
        <FormikCheckbox size={40} name={`list.[${index}].checked`} />
      </View>
    </View>
  );
};

export default function App() {
  const [itemCode, setItemCode] = useState("");
  const [lineData, setLineData] = useState({
    whsCode: "",
    index: 0,
  });
  const [visible, setVisible] = useState(false);
  const [autoFocus, setAutoFocus] = useState(true);
  const selectWms0007Res = useQuery({
    queryKey: ["selectWms0007", itemCode ?? ""],
    select: (res: any) =>res.list,
    queryFn: () => commonRequestFetch<any, any>({
      functionCode: "wms0007",
      prefix: "wms",
      url: "/selectWms0007",
      data: {
        whsCode: getLocalUserInfo()?.whsCode,
        itemCode,
      },
    }),
  });

  const selectHistoryLocationPdaRes = useQuery({
    queryKey: ["selectHistoryLocationPda", selectWms0007Res.data],
    select: (res: any) =>{
      return selectWms0007Res.data.map((a:any)=>{
        const last = res.itemCodeWhsLocation.find((d:any)=>d.itemCode===a.itemCode && d.whsCode===a.whsCode)
        return {
          ...a,
          putawayLocation:last?.putawayLocation,
          putawayLocationName:last?.putawayLocationName,
          quantity: a.openPutawayQuantity,
          checked: 1,
        }
      })
    },
    enabled:!!selectWms0007Res.data,
    queryFn: () => commonRequestFetch<any, any>({
      functionCode: "wms0008",
      prefix: "wms",
      url: "/selectHistoryLocationPda",
      data: {
        itemCodeWhs: selectWms0007Res.data.map((d:any) => ({
          itemCode: d.itemCode,
          whsCode: d.whsCode,
          inventoryOrganization:d.inventoryOrganization
        })),
      },
    }),
  });

  

  const hanlePushData = ({list, directConfirm}:{list: any[],directConfirm:number}) => {
    let applicantNameInfo: string[] = [];
    let baseDocTypeInfo: string[] = [];
    let docTypeNameInfo: string[] = [];
    let receiveDocNoInfo: string[] = [];
    let deliveryOrganizationNameInfo: string[] = [];
    let whsCode = "";
    let inventoryOrganization = "";
    const wms000802 = list.map((d) => {
      whsCode = d.whsCode;
      inventoryOrganization = d.inventoryOrganization;
      if (!docTypeNameInfo.includes(d.docTypeNameInfo)) {
        docTypeNameInfo.push(d.docTypeNameInfo);
      }
      if (!applicantNameInfo.includes(d.applicantNameInfo)) {
        applicantNameInfo.push(d.applicantNameInfo);
      }
      if (!baseDocTypeInfo.includes(d.baseDocTypeInfo)) {
        baseDocTypeInfo.push(d.baseDocTypeInfo);
      }
      if (!receiveDocNoInfo.includes(d.receiveDocNo)) {
        receiveDocNoInfo.push(d.receiveDocNo);
      }
      if (
        !deliveryOrganizationNameInfo.includes(d.deliveryOrganizationNameInfo)
      ) {
        deliveryOrganizationNameInfo.push(d.deliveryOrganizationNameInfo);
      }
      return d;
    });
    return addItemFetch({
      functionCode: "wms0008",
      prefix: "wms",
      data: {
        applicantNameInfo: applicantNameInfo.toString(),
        baseDocTypeInfo: baseDocTypeInfo.toString(),
        docTypeNameInfo: docTypeNameInfo.toString(),
        receiveDocNoInfo: receiveDocNoInfo.toString(),
        deliveryOrganizationNameInfo: deliveryOrganizationNameInfo.toString(),
        whsCode,
        inventoryOrganization,
        wms000802,
      },
    }).then((res) => {
      console.log(directConfirm);
      if (directConfirm==1) {
        commonRequestFetch({
          functionCode: "wms0008",
          prefix: "wms",
          url: "/putaway",
          data: {
            docId: res.docId,
          },
        }).then(() => {
           selectWms0007Res.refetch();
           Toast.show({
             type: "success",
             text1: "上架成功",
             topOffset: 0,
           });
        }).catch((err) => Alert.alert("上架失败",err.message,[{text: '确定'}]));
      }
    }).catch((err) => Alert.alert("上架失败",err.message,[{text: '确定'}]));
  };

  const handleSearch = (code: string) => {
    setAutoFocus(false);
    setItemCode(code);
  };

  // 打开库位选择器
  const onOpenModal = (index: number) => {
    setLineData({
      whsCode: selectWms0007Res.data[index].whsCode,
      index,
    });
    setVisible(true);
  };

  // 库位选择器选择
  const handleLocationChange = (v: LocationItem, index: number,props:FormikProps<any>) => {
    props.values.list[index].putawayLocationName = v.name;
    props.values.list[index].putawayLocation = v.code;
  };

  const onSubmit: FormikConfig<any>["onSubmit"] = (value) => hanlePushData(value);
  return (
    <View className="flex-1 bg-white p-2 pb-0">
      <InputSearch
        placeholder="请输入或扫描货品编码"
        onSearch={handleSearch}
        returnKeyType="search"
        autoFocus={autoFocus}
        selectTextOnFocus
      />

      {selectHistoryLocationPdaRes.isFetching ? (
        <PageIndicator />
      ) : (
        <Formik
          initialValues={{
            list: selectHistoryLocationPdaRes.data,
            directConfirm: 1,
          }}
          onSubmit={onSubmit}
        >
          {(props) => {
            return (
              <>
                <FlatList
                  data={selectHistoryLocationPdaRes.data}
                  ListEmptyComponent={
                    <View className="flex justify-center items-center  h-20 ">
                      <Text className="text-gray-500 ">暂无待上架货品</Text>
                    </View>
                  }
                  refreshControl={
                    <RefreshControl
                      refreshing={selectWms0007Res.isFetching}
                      onRefresh={selectWms0007Res.refetch}
                    />
                  }
                  className="mt-2"
                  keyExtractor={(item) => item.receiveLineId}
                  renderItem={({ item, index }) => (
                    <RenderItem
                      index={index}
                      item={item}
                      onOpenModal={onOpenModal}
                    />
                  )}
                />
  
                <View className="flex-row">
                  <FormikCheckbox name="directConfirm" label="直接确认" />
                  <TouchableOpacity
                    disabled={props.isSubmitting}
                    onPress={() => props.handleSubmit()}
                    className="flex-1 bg-blue-800 h-12 items-center justify-center ml-4 flex-row"
                  >
                    {props.isSubmitting && (
                      <ActivityIndicator animating={true} color={"#fff"} />
                    )}
                    <Text className="text-white text-lg">上架</Text>
                  </TouchableOpacity>
                </View>
                <LocationModal
                  visible={visible}
                  onClose={()=> setVisible(false)}
                  onChange={(v) => handleLocationChange(v, lineData.index,props)}
                  whsCode={lineData?.whsCode}
                  areaType={[1, 3, 9, 6, 99]}
                />
              </>
            )
          }}
        </Formik>
      )}
      <Toast />
    </View>
  );
}
