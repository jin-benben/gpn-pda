import ClipboardText from "@/components/ClipboardText";
import {
  FormikCheckbox,
  FormikLocationPicker,
  FormikTextInput,
} from "@/components/FormItem";
import LocationModal, { LocationItem } from "@/components/LocationModal";
import InputSearch, { SearchInput } from "@/components/ui/InputSearch";
import PageIndicator from "@/components/ui/PageIndicator";
import { addItemFetch, commonRequestFetch } from "@/lib/commonServices";
import { getLocalUserInfo } from "@/lib/util";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Formik, FormikConfig, FormikProps } from "formik";
import { FlashList } from "@shopify/flash-list";
import React, {
  FC,
  Suspense,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  ScrollViewProps,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAvoidingView, KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Toast from "react-native-toast-message";
import RenderScrollComponent from "@/components/RenderScrollComponent";

interface RenderItemProps {
  item: any;
  index: number;
  onOpenModal: (index: number) => void;
}

const RenderItem: FC<RenderItemProps> = memo(({ item, index, onOpenModal }) => {
  console.log(index);
  return (
    <View className="p-2 rounded gap-1 bg-white mb-2">
      <View className="flex-row">
        <Text className="font-bold">{index + 1}. </Text>
        <Text>{item.docTypeNameInfo}：</Text>
        <Text>{item.baseDocNo}</Text>
      </View>
      <Text className="my-1">送货方：{item.deliveryOrganizationName}</Text>
      <Text>{item.itemName}</Text>
      <ClipboardText text={item.itemCode}>
        <Text className="text-blue-600">货品编码：{item.itemCode}</Text>
      </ClipboardText>
      <View className="flex-row items-center">
        <Text>上架库位：</Text>
        <FormikLocationPicker
          whsCode={item.whsCode}
          name={`list.${index}.putawayLocationName`}
          codeName={`list.${index}.putawayLocation`}
          onOpenModal={() => onOpenModal(index)}
        />
      </View>
      <View className="flex-row items-center justify-between">
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
        <FormikCheckbox size={40} name={`list.${index}.checked`} />
      </View>
    </View>
  );
});


interface ListSuspenseProps {
  itemCode: string;
}
const ListSuspense = ({ itemCode }: ListSuspenseProps) => {
  const [lineData, setLineData] = useState({
    whsCode: "",
    index: 0,
  });
  const [visible, setVisible] = useState(false);
  const inputRef = useRef<SearchInput>(null);
 
  const selectWms0007Query = useQuery({
    queryKey: ["selectWms0007", itemCode ?? ""],
    queryFn: async() =>{
      const selectWms0007Res = await commonRequestFetch<any, any>({
        functionCode: "wms0007",
        prefix: "wms",
        url: "/selectWms0007",
        data: {
          whsCode: getLocalUserInfo()?.whsCode,
          itemCode,
        },
      })
      if(selectWms0007Res.list?.length){
        const selectHistoryLocationPdaRes= await commonRequestFetch<any, any>({
          functionCode: "wms0008",
          prefix: "wms",
          url: "/selectHistoryLocationPda",
          data: {
            itemCodeWhs: selectWms0007Res.list.map((d: any) => ({
              itemCode: d.itemCode,
              whsCode: d.whsCode,
              inventoryOrganization: d.inventoryOrganization,
            })),
          },
        })
        return Promise.resolve(selectWms0007Res.list.map((a: any) => {
          const last = selectHistoryLocationPdaRes.itemCodeWhsLocation.find(
            (d: any) => d.itemCode === a.itemCode && d.whsCode === a.whsCode
          );
          return {
            ...a,
            putawayLocation: last?.putawayLocation,
            putawayLocationName: last?.putawayLocationName,
            quantity: a.openPutawayQuantity,
            checked: 1,
          };
        }))
      }else{
        return Promise.resolve([]);
      }
      
    },
  });
  


 const hanlePushData = ({
  list,
  directConfirm,
}: {
  list: any[];
  directConfirm: number;
}) => {
  // 使用 Set 进行去重，提高查找效率
  const applicantNameInfo = new Set<string>();
  const baseDocTypeInfo = new Set<string>();
  const docTypeNameInfo = new Set<string>();
  const receiveDocNoInfo = new Set<string>();
  const deliveryOrganizationNameInfo = new Set<string>();
  
  let whsCode = "";
  let inventoryOrganization = "";

  const wms000802 = list
    .filter((d) => d.checked == 1)
    .map((d) => {
      whsCode = d.whsCode;
      inventoryOrganization = d.inventoryOrganization;
      
      // 使用 Set.add() 自动去重
      docTypeNameInfo.add(d.docTypeNameInfo);
      applicantNameInfo.add(d.applicantNameInfo);
      baseDocTypeInfo.add(d.baseDocTypeInfo);
      receiveDocNoInfo.add(d.receiveDocNo);
      deliveryOrganizationNameInfo.add(d.deliveryOrganizationNameInfo);
      
      return d;
    });

  return addItemFetch({
    functionCode: "wms0008",
    prefix: "wms",
    data: {
      applicantNameInfo: Array.from(applicantNameInfo).toString(),
      baseDocTypeInfo: Array.from(baseDocTypeInfo).toString(),
      docTypeNameInfo: Array.from(docTypeNameInfo).toString(),
      receiveDocNoInfo: Array.from(receiveDocNoInfo).toString(),
      deliveryOrganizationNameInfo: Array.from(deliveryOrganizationNameInfo).toString(),
      whsCode,
      inventoryOrganization,
      wms000802,
    },
  }).then((res) => {
    if (directConfirm == 1) {
      return commonRequestFetch({
        functionCode: "wms0008",
        prefix: "wms",
        url: "/putaway",
        data: {
          docId: res.docId,
        },
      }).then(() => {
        selectWms0007Query.refetch();
        Toast.show({
          type: "default",
          text1: "上架成功",
          topOffset: 0,
        });
      });
    }
  });
};

  // 打开库位选择器
  const onOpenModal = useCallback((index: number) => {
    setLineData({
      whsCode: selectWms0007Query.data[index].whsCode,
      index,
    });
    setVisible(true);
  }, []);

  // 库位选择器选择
  const handleLocationChange = (
    v: LocationItem,
    index: number,
    props: FormikProps<any>
  ) => {
    props.values.list[index].putawayLocationName = v.name;
    props.values.list[index].putawayLocation = v.code;
  };

  return (
    <Formik
      initialValues={{
        list: selectWms0007Query.data,
        directConfirm: 1,
        
      }}
      onSubmit={hanlePushData}
      enableReinitialize
    >
      {(props) => {
        return (
          <>
            <FlashList
              data={selectWms0007Query.data as any[]}
              renderScrollComponent={RenderScrollComponent}
              refreshing={selectWms0007Query.isFetching}
              ListEmptyComponent={
                <View className="flex justify-center items-center  h-20 ">
                  <Text className="text-gray-500 ">暂无待上架货品</Text>
                </View>
              }
              refreshControl={
                <RefreshControl
                  refreshing={selectWms0007Query.isRefetching}
                  onRefresh={selectWms0007Query.refetch}
                />
              }
              contentContainerClassName="px-2 pt-2"
              renderItem={({ item, index }) => (
                <RenderItem
                  index={index}
                  item={item}
                  onOpenModal={onOpenModal}
                />
              )}
            />

            {
              selectWms0007Query.data?.length > 0 && (
                <>
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
                    onClose={() => setVisible(false)}
                    onChange={(v) =>
                      handleLocationChange(v, lineData.index, props)
                    }
                    whsCode={lineData?.whsCode}
                    areaType={[1, 3, 9, 6, 99]}
                  />
                </>
              )}
          </>
        );
      }}
    </Formik>
  );
};

export default function App() {
  const [itemCode, setItemCode] = useState("");
 
  const inputRef = useRef<SearchInput>(null);
  const handleSearch = (code: string) => {
    inputRef.current?.focus();
    setItemCode(code);
  };

  return (
    <View className="flex-1">
      <View className="p-2 bg-white">
        <InputSearch
          placeholder="请输入或 扫描货品编码"
          onSearch={handleSearch}
          returnKeyType="search"
          selectTextOnFocus
          ref={inputRef}
        />
      </View>
      <Suspense fallback={<PageIndicator />}>
        <ListSuspense itemCode={itemCode} />
      </Suspense>
    </View>
  );
}
