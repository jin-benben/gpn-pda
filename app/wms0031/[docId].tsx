import EnumLabel from "@/components/EnumLabel";
import {
  FormikCheckbox,
  FormikLocationModal,
  FormikLocationPicker,
  FormikTextInput,
} from "@/components/FormItem";
import RenderScrollComponent from "@/components/RenderScrollComponent";
import Swipeable from "@/components/Swipeable";
import { toastConfig } from "@/components/ToastConfig";
import Empty from "@/components/ui/Empty";
import PageIndicator from "@/components/ui/PageIndicator";
import Popup from "@/components/ui/Popup";
import useEnum from "@/hooks/useEnum";
import {
  commonRequestFetch,
  queryListFetch,
  queryOneFetch
} from "@/lib/commonServices";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { FlashList, ListRenderItemInfo, useMappingHelper } from "@shopify/flash-list";
import useMutation from "@/hooks/useMutation";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Formik, useFormikContext } from "formik";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Reanimated,{ useAnimatedStyle } from "react-native-reanimated";
import Toast from "react-native-toast-message";
import useCustomMutation from "@/hooks/useMutation";

interface EditRenderItemProps extends ListRenderItemInfo<any> {
  whsCode: string;
  openLocationPopup: (v: any) => void;
  opentargetPopup: (v: any) => void;
}
const EditRenderItem = ({
  item,
  index,
  whsCode,
  opentargetPopup,
  openLocationPopup,
}: EditRenderItemProps) => {
  const { getMappingKey } = useMappingHelper();
  return (
    <Swipeable 
      renderRightActions={(prog, drag) => {
        const styleAnimation = useAnimatedStyle(() => {
          return {
            transform: [{ translateX: drag.value + 120 }],
            width: 120,
            gap: 10,
            flexDirection: "row",
          };
        });
        return (
          <Reanimated.View style={styleAnimation}>
            <TouchableOpacity
              onPress={() =>
                opentargetPopup({ rowData: item, index, targetPopupVisible: true })
              }
              className="items-center justify-center p-4 rounded-sm bg-blue-500"
            >
              <Text className=" text-white">选择库位</Text>
            </TouchableOpacity>
          </Reanimated.View>
        );
      }}
    >
      <View className="bg-white rounded p-2 gap-1 mt-2">
        <Text>
          ({item.itemCode}) {item.itemName}
        </Text>
        <View className="flex-row items-center">
          <Text>拣货库位：</Text>
          <FormikLocationPicker
            name={`location.${index}.locationName]`}
            codeName={`location.${index}.locationName]`}
            whsCode={whsCode}
            onOpenModal={() =>
              openLocationPopup({
                rowData: item,
                index,
                locationPopupVisible: true,
              })
            }
        />
        <Text className="ml-1">
          {item.openQuantity} / {item.unit}
        </Text>
      </View>
      {item.wms003103?.map((a: any, subIndex: number) => (
        <View className="flex-row items-center gap-1" key={getMappingKey(a.lineId, subIndex)}>
          <FormikCheckbox
            labelStyle={{ fontSize: 14 }}
            size={24}
            label="暂存库位:"
            name={`location.${index}.wms003103.${subIndex}.checked`}
          />

          <Text>{a.locationName} </Text>
          <FormikTextInput
            inputMode="numeric"
            className="border border-gray-300 w-20 h-9 mx-2 rounded p-0 px-2"
            name={`location.${index}.wms003103.${subIndex}.quantity`}
          />
          <Text>/{a.unit}</Text>
        </View>
      ))}
    </View>
    </Swipeable>
  );
};

const RenderItem = ({ item, index }: ListRenderItemInfo<any>) => {
  const { getMappingKey } = useMappingHelper();
  return (
    <View className="border border-gray-300 mb-2 rounded p-2 gap-1">
      <Text>
        ({item.itemCode}) {item.itemName}
      </Text>
      <View className="flex-row junstify-between items-center">
        <View className="flex-1">
          <Text>拣货库位：{item.locationName}</Text>
          <Text className="ml-1">
            已补货数量：{item.finQuantity} / {item.unit}
          </Text>
        </View>
        <EnumLabel
          className="text-blue-500 font-semibold"
          value={item.lineStatus}
          enumKey="wms0031LineStatus"
        />
      </View>
      {item.wms003105?.length > 0 && (
        <>
          <Text className="font-semibold text-base">暂存库位</Text>
          <View className="border border-gray-100 rounded">
            <View className="bg-gray-200 flex-row justify-between p-2">
              <Text>库位</Text>
              <Text>补货数量</Text>
            </View>
            {item.wms003105?.map((a: any,subIndex:number) => (
              <View
                key={getMappingKey(a.lineId, subIndex)}
                className="flex-row justify-between p-2 border-b border-gray-100"
              >
                <Text>{a.locationName}</Text>
                <Text>{a.quantity}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
};

export default function Wms0031Screen() {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lineData, setLineData] = useState({
    whsCode: "",
    index: 0,
    rowData: null as any,
    targetPopupVisible: false,
    locationPopupVisible: false,
  });

  const local = useLocalSearchParams();
  useEnum({
    params: ["wms003101DocStatus", "wms0031LineStatus"],
  });
  // 获取单据详情
  const {
    data: wms00031Data,
    isPending,
    mutate,
  } = useMutation({
    
    mutationFn: () => {
      return queryOneFetch<any, any>({
        functionCode: "wms0031",
        prefix: "wms",
        data: {
          docId: local.docId,
        },
      });
    },
  });

  useEffect(()=>{
    if(local.docId){
      mutate();
    }
  },[local.docId])

  const waitHandleList = useMemo(() => {
    if (wms00031Data?.docStatus == 4) {
      return [];
    }
    return wms00031Data?.wms003102
      .filter((item: any) => [1, 2].includes(item.lineStatus))
      .map((a: any) => {
        const wms003103 = a.wms003103.map((b: any) => {
          const onHand =
            a.locationInvList?.find(
              (c: any) => c.location == b.location && c.itemCode == b.itemCode
            )?.quantity ?? 0;
          return {
            ...b,
            quantity: onHand,
            checked:1
          };
        });
        return {
          ...a,
          wms003103,
          quantity: a.openQuantity,
        };
      });
  }, [wms00031Data]);

  const successWms003102Data = useMemo(() => {
    return wms00031Data?.wms003102.filter((item: any) =>
      [2, 3, 5].includes(item.lineStatus)
    );
  }, [wms00031Data]);

  // 领取
  const startMutation = useMutation({
    mutationFn: () => {
      return commonRequestFetch({
        functionCode: "wms0031",
        data: {
          docId: wms00031Data?.docId,
          rowVersion: wms00031Data?.rowVersion,
        },
        prefix: "wms",
        url: "/start",
      });
    },
    onSuccess: () => {
      Toast.show({
        type: "default",
        text1: "领取成功",
        visibilityTime: 2000,
        onHide:mutate
      });
    },
  });
  // 确认补货
  const confirmMutation = useMutation({
    mutationFn: (location) => {
      return commonRequestFetch({
        functionCode: "wms0031",
        data: {
          docId: wms00031Data?.docId,
          rowVersion: wms00031Data?.rowVersion,
          location,
        },
        prefix: "wms",
        url: "/confirm",
      });
    },
    onSuccess: () => {
      Toast.show({
        type: "default",
        text1: "补货成功",
        visibilityTime: 2000,
        onHide:mutate
      });
    }
  });

  // 关闭 location
  const closeLocationPopup = () => {
    setLineData({ ...lineData, locationPopupVisible: false });
  };
  // 关闭 tagret
  const closeTargeLocationPopup = () => {
    setLineData({ ...lineData, targetPopupVisible: false });
  };
  const openLocationPopup = (v: any) => {
    setLineData({ ...lineData, locationPopupVisible: true, ...v });
  };
  const openTargetLocationPopup = (v: any) => {
    setLineData({ ...lineData, targetPopupVisible: true, ...v });
  };
  const onSubmit = (value:any) => {
    const needConfirms: any = [];
      value.location.forEach((item: any) => {
        item.wms003103.forEach((wms003103: any) => {
          if (wms003103.quantity > 0 && wms003103.checked) {
            needConfirms.push({
              itemCode: wms003103.itemCode,
              location: wms003103.location,
              locationName: wms003103.locationName,
              quantity: wms003103.quantity,
              targetLocation: item.location,
              targetLocationName: item.locationName,
            });
          }
        });
      });
      if (needConfirms.length == 0) {
        return Toast.show({
          type: "default",
          text1: "请选择暂存库位",
          visibilityTime: 2000,
        });
      }
      confirmMutation.mutate(needConfirms);
  };
  if (isPending || !wms00031Data) {
    return <PageIndicator />;
  }
  return (
    <>
    <Formik onSubmit={onSubmit} initialValues={{ location: waitHandleList }}>
      {(props) => (
        <View className="flex-1">
          <FlashList
            renderScrollComponent={RenderScrollComponent}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl refreshing={isPending} onRefresh={mutate} />
            }
            ListHeaderComponent={
              <View className="gap-2 p-2 bg-white">
                <View className="flex-row justify-between">
                  <Text>单号：{wms00031Data.docNo}</Text>
                  <EnumLabel
                    value={wms00031Data.docStatus}
                    enumKey="wms003101DocStatus"
                  />
                </View>
                {wms00031Data.assignerUserName && (
                  <Text>
                    处理人：
                    {wms00031Data.assignerUserName}({wms00031Data.assignerTime})
                  </Text>
                )}
                <SegmentedControl
                  values={["待补货", "已补货"]}
                  selectedIndex={selectedIndex}
                  onChange={(event) => {
                    setSelectedIndex(event.nativeEvent.selectedSegmentIndex);
                  }}
                />
              </View>
            }
            ListEmptyComponent={<Empty />}
            data={selectedIndex == 0 ? waitHandleList : successWms003102Data}
            keyExtractor={(item:any) => item.lineId}
            renderItem={(props) =>
              selectedIndex == 0 ? (
                <EditRenderItem
                  {...props}
                  whsCode={wms00031Data.whsCode}
                  openLocationPopup={openLocationPopup}
                  opentargetPopup={openTargetLocationPopup}
                />
              ) : (
                <RenderItem {...props} />
              )
            }
          />

          <View className="flex-row">
            {wms00031Data.docStatus == 1 ? (
              <TouchableOpacity
                disabled={startMutation.isPending}
                onPress={() => startMutation.mutate()}
                className="flex-1 bg-blue-600 h-12 items-center justify-center"
              >
                <Text className="text-white">领取</Text>
              </TouchableOpacity>
            ) : (
              <>
                {waitHandleList.length > 0 && selectedIndex == 0 && (
                  <>
                    <TouchableOpacity
                      disabled={confirmMutation.isPending}
                      activeOpacity={0.7}
                      onPress={()=>props.handleSubmit()}
                      className="w-2/3 bg-blue-600 h-12 items-center justify-center flex-row gap-2"
                    >
                      {confirmMutation.isPending && (
                        <ActivityIndicator animating={true} color={"#fff"} />
                      )}
                      <Text className="text-white">确认补货</Text>
                    </TouchableOpacity>
                    <CancelPopup
                      cancelList={waitHandleList}
                      callback={mutate}
                      wms00031Data={wms00031Data}
                    />
                  </>
                )}
              </>
            )}
          </View>
          <FormikLocationModal
            name={`location.${lineData.index}.locationName`}
            codeName={`location.${lineData.index}.location`}
            visible={lineData.locationPopupVisible}
            onClose={closeLocationPopup}
            whsCode={wms00031Data?.whsCode}
            areaType={[1, 9]}
          />
          <Popup
            visible={lineData.targetPopupVisible}
            title="选择拣货库位"
            onClose={closeTargeLocationPopup}
            modalStyle={{ height: "60%" }}
          >
            <TargetLocation
              whsCode={wms00031Data?.whsCode}
              enabled={lineData.targetPopupVisible}
              itemCode={lineData.rowData?.itemCode}
              name={`location.${lineData.index}.locationName`}
              codeName={`location.${lineData.index}.location`}
              onClose={closeTargeLocationPopup}
            />
          </Popup>
          <Toast config={toastConfig}/>
        </View>
      )}
    </Formik>
    </>
  );
}

interface TargetLocationProps {
  whsCode: string;
  enabled: boolean;
  itemCode: string;
  name: string;
  codeName: string;
  onClose:()=>void;
}
// 拣货库位
const TargetLocation = ({
  whsCode,
  enabled,
  itemCode,
  name,
  codeName,onClose
}: TargetLocationProps) => {
  const formik = useFormikContext();
  const onChange=(v:any)=>{
    formik.setFieldValue(name,v.locationName);
    formik.setFieldValue(codeName,v.location);
    onClose()
  }
  const { data, isPending,mutate } = useCustomMutation({
    mutationFn: () => {
      return queryListFetch<any, any>({
        functionCode: "mdm0131",
        prefix: "mdm3",
        url: "/selectByBaseDocAndLogisticsDoc",
        data: {
          page: 1,
          size: 1000,
          itemCode,
          whsCode,
          areaTypeList: [1, 9],
        },
      });
    },
  });
  useEffect(() => {
    if (enabled) {
      mutate();
    }
  }, [enabled]);
  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center h-20">
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return (
    <FlatList
      data={data?.rows}
      keyExtractor={(item) => item.code}
      ListEmptyComponent={<Empty />}
      renderItem={({ item }) => (
        <TouchableOpacity
          activeOpacity={0.7}
          className="border border-gray-300 mx-2 rounded p-3 flex-row justify-between mb-2"
          onPress={() =>
            onChange(item)
          }
        >
          <Text>库位：{item.locationName}</Text>
          <Text>库存量：{item.onHand}</Text>
        </TouchableOpacity>
      )}
    />
  );
};
interface CancelPopupProps {
  cancelList: any[];
  callback: () => void;
  wms00031Data?: any;
}
// 取消popup
const CancelPopup = ({
  cancelList,
  callback,
  wms00031Data,
}: CancelPopupProps) => {
  const [visible, setVisible] = useState(false);
  const [list, setList] = useState(cancelList);
  useEffect(() => {
    setList(cancelList);
  }, [visible]);
  // 手动完成
  const cancelLineMutation = useMutation({
    mutationFn: (wms003102LineIds: string[]) => {
      return commonRequestFetch({
        functionCode: "wms0031",
        data: {
          docId: wms00031Data?.docId,
          rowVersion: wms00031Data?.rowVersion,
          wms003102LineIds,
        },
        prefix: "wms",
        url: "/cancelLine",
      });
    },
    onSuccess: () => {
      setVisible(false);
      callback();
      Toast.show({
        type: "default",
        text1: "取消成功",
      });
    }
  });
  const deleteLine = (lineId: string) => {
    setList(list.filter((a: any) => a.lineId !== lineId));
  };

  const handleCancel = () => {
    if (list.length == 0) {
      return Toast.show({
        type: "default",
        text1: "取消的行不能为空",
      });
    }
    cancelLineMutation.mutate(list.map((a: any) => a.lineId));
  };
  return (
    <>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setVisible(true)}
        className="w-1/3 bg-red-600 h-12 items-center justify-center"
      >
        <Text className="text-white">取消</Text>
      </TouchableOpacity>
      <Popup
        visible={visible}
        title="手工完成"
        onClose={() => setVisible(false)}
        modalStyle={{ height: "60%" }}
      >
        <FlatList
          data={list}
          keyExtractor={(item) => item.lineId}
          ListEmptyComponent={<Empty />}
          renderItem={({ item }) => (
            <View className="border border-gray-300 mx-2 rounded p-3 mb-2">
              <Text>
                ({item.itemCode}) {item.itemName}
              </Text>
              <Text>拣货库位：{item.locationName}</Text>
              <View className="flex-row justify-between  items-center gap-2">
                <Text>
                  已补货数量：{item.finQuantity} / {item.unit}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  className=" bg-gray-100 rounded-full w-10 h-10 items-center justify-center"
                  onPress={() => deleteLine(item.lineId)}
                >
                  <MaterialIcons
                    name="delete-outline"
                    size={20}
                    color="#ef4444"
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
        <TouchableOpacity
          activeOpacity={0.7}
          disabled={cancelLineMutation.isPending}
          className=" bg-red-600 h-12 items-center justify-center"
          onPress={handleCancel}
        >
          <Text className="text-white">确定</Text>
        </TouchableOpacity>
        <Toast config={toastConfig} />
      </Popup>
    </>
  );
};
