import ClipboardText from "@/components/ClipboardText";
import {
  FormikCheckbox,
  FormikLocationPicker,
  FormikTextInput,
} from "@/components/FormItem";
import LocationModal, { LocationItem } from "@/components/LocationModal";
import RenderScrollComponent from "@/components/RenderScrollComponent";
import InputSearch, { SearchInput } from "@/components/ui/InputSearch";
import PageIndicator from "@/components/ui/PageIndicator";
import useCustomMutation from "@/hooks/useMutation";
import { addItemFetch, commonRequestFetch } from "@/lib/commonServices";
import { getLocalUserInfo } from "@/lib/util";
import { FlashList } from "@shopify/flash-list";
import { Formik, FormikProps } from "formik";
import React, {
  FC,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const whsCode = getLocalUserInfo()?.whsCode;
interface RenderItemProps {
  item: any;
  index: number;
  onOpenModal: (index: number) => void;
}


const RenderItem: FC<RenderItemProps> = memo(({ item, index, onOpenModal }) => {
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

async function getPushDataFetch(itemCode:string){
  const selectWms0007Res = await commonRequestFetch<any, any>({
    functionCode: "wms0007",
    prefix: "wms",
    url: "/selectWms0007",
    data: {
      whsCode: getLocalUserInfo()?.whsCode,
      itemCode,
    },
  })
  if(selectWms0007Res.list.length){
    
    const selectHistoryLocationPdaRes = await commonRequestFetch<any, any>({
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
    return Promise.resolve( selectWms0007Res.list.map((a: any) => {
      const last = selectHistoryLocationPdaRes?.itemCodeWhsLocation.find(
        (d: any) => d.itemCode === a.itemCode && d.whsCode === a.whsCode
      );
      return {
        ...a,
        putawayLocation: last?.putawayLocation,
        putawayLocationName: last?.putawayLocationName,
        quantity: a.openPutawayQuantity,
        checked: selectWms0007Res.list.length==1 ? 1 : 0,
      };
    }))
  }else{
    return Promise.resolve([])
  }
  
}

export default function App() {
  const [itemCode, setItemCode] = useState("");
  const [lineIndex, setLineIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const inputRef = useRef<SearchInput>(null);

  const {isPending,data,mutate} = useCustomMutation({
    mutationFn:getPushDataFetch,
    onSuccess:(res)=>{
      if(res.length){

      }
    }
  })

  useEffect(()=>{
    mutate(itemCode)
  },[])
  const onRefresh = ()=>{
    mutate(itemCode)
  }

  const hanlePushData = ({list}: {list: any[]}) => {
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
      mutate(itemCode);
      Toast.show({
        type: "default",
        text1: "上架成功",
      });
    });
  };
  

  const handleSearch = (code: string) => {
    mutate(code);
  };

  // 打开库位选择器
  const onOpenModal = useCallback((index: number) => {
    setLineIndex(index);
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
      <View className="flex-1">
        <View className="p-2 bg-white">
          <InputSearch
            placeholder="请输入或 扫描货品编码"
            onSearch={handleSearch}
            returnKeyType="search"
            selectTextOnFocus
            onChangeText={setItemCode}
            ref={inputRef}
          />
        </View>
        {isPending ? (
          <PageIndicator />
        ) : (
          <Formik
            initialValues={{
              list: data
            }}
            onSubmit={hanlePushData}
          >
            {(props) => {
              return (
                <View className="flex-1 p-2">
                  <FlashList
                    renderScrollComponent={RenderScrollComponent}
                    data={data as any[]}
                    keyboardShouldPersistTaps="handled"
                    ListEmptyComponent={
                      <View className="flex justify-center items-center  h-20 ">
                        <Text className="text-gray-500 ">暂无待上架货品</Text>
                      </View>
                    }
                    refreshControl={
                      <RefreshControl
                        refreshing={isPending}
                        onRefresh={onRefresh}
                      />
                    }
                    keyExtractor={(item) => item.receiveLineId}
                    renderItem={({ item, index }) => (
                      <RenderItem
                        index={index}
                        item={item}
                        onOpenModal={onOpenModal}
                      />
                    )}
                  />

                  {
                    data?.length > 0 && (
                      <>
                        <TouchableOpacity
                          disabled={props.isSubmitting}
                          onPress={() => props.handleSubmit()}
                          className=" bg-blue-500 h-12 items-center justify-center flex-row"
                        >
                          {props.isSubmitting && (
                            <ActivityIndicator
                              animating={true}
                              color={"#fff"}
                            />
                          )}
                          <Text className="text-white text-lg">上架</Text>
                        </TouchableOpacity>
                        <LocationModal
                          visible={visible}
                          onClose={() => setVisible(false)}
                          onChange={(v) =>
                            handleLocationChange(v, lineIndex, props)
                          }
                          whsCode={whsCode as string}
                          areaType={[1, 3, 9, 6, 99]}
                        />
                      </>
                    )}
                </View>
              );
            }}
          </Formik>
        )}
      </View>
  );
}
