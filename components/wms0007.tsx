import { addItemFetch, deleteItemFetch, commonRequestFetch } from "@/lib/commonServices";
import MyMath from "@/lib/math";
import { getEnumStore } from "@/store/enum";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import { TouchableOpacity, Modal, View, Alert, TextInput,Text, ActivityIndicator, TouchableOpacityProps } from "react-native";
import Toast from "react-native-toast-message";
import LocationModal from "./LocationModal";
import LocationPicker from "./LocationPicker";
import { toastConfig } from "./ToastConfig";

interface BindLocationModalProps {
  whsCode: string;
  /** 货品信息 **/
  itemInfo: any;
  callback: () => void;
}
export const BindLocationModal = ({
  itemInfo,
  whsCode,
  callback,
}: BindLocationModalProps) => {
  const itemCode = itemInfo.itemCode || itemInfo.code;
  const itemName = itemInfo.itemName || itemInfo.name;
  const [visible, setVisible] = useState(false);
  const [locationVisible, setLocationVisible] = useState(false);
  // 绑定 fetch
  const createMdm0131Mutation = useMutation({
    mutationKey: ["mdm0131"],
    mutationFn: ({ code, name }: any) => {
      console.log(code, name);
      return addItemFetch({
        functionCode: "mdm0131",
        prefix: "mdm3",
        data: {
          whsCode,
          itemCode,
          itemName,
          location: code,
          locationName: name,
        },
      });
    },
    onSuccess: (res) => {
      Toast.show({
        type: "default",
        text1: "绑定成功",
      })
      callback();
      setVisible(false);
    },
    onError: (error) => { 
      console.log(error);
      Toast.show({
        type: "default",
        text1: error.message,
      })
    },
  });
  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        className="bg-purple-500 items-center justify-center p-4 rounded-sm"
      >
        <Text className="text-white">绑定</Text>
      </TouchableOpacity>
      <Modal
        visible={visible}
        backdropColor={"rgba(0,0,0,0.5)"}
        statusBarTranslucent
      >
        <View className="flex-1 justify-center items-center px-2">
          <View className="bg-white rounded w-full px-4 py-2 gap-2" style={{height:200}}>
            <TouchableOpacity
                onPress={() => setVisible(false)}
                className="absolute -top-4 right-2 bg-gray-200 p-2 rounded-full"
              > 
              <MaterialIcons name="close" size={20} color="black" />
            </TouchableOpacity>
            <Text className="text-center font-semibold text-xl pb-4">绑定</Text>
            <View className="gap-2">
              <Text>绑定库位：</Text>
              <View style={{height:40}}>
                <LocationPicker
                  whsCode={whsCode}
                  onSelect={(v) => createMdm0131Mutation.mutate(v)}
                  onOpenModal={() => setLocationVisible(true)}
                  focus
                />
              </View>
              <LocationModal
                visible={locationVisible}
                onClose={() => setLocationVisible(false)}
                onChange={(v) => createMdm0131Mutation.mutate(v)}
                whsCode={whsCode}
                areaType={[1, 9]}
              />
            </View>
          </View>
          <Toast config={toastConfig} />
        </View>
      </Modal>
    </>
  );
};

interface UnBindLocationProps {
  code: string;
  callback: () => void;
}
export const UnBindLocationModal = ({ code, callback }: UnBindLocationProps) => {
  // 解绑
  const deleteMdm0131Mutation = useMutation({
    mutationKey: ["mdm0131"],
    mutationFn: () => {
      return deleteItemFetch({
        functionCode: "mdm0131",
        prefix: "mdm",
        data: {
          code,
        },
      });
    },
    onSuccess: (res) => {
      Toast.show({
        type:"default",
        text1:"解绑成功"
      })
      callback();
    },
    onError: (error) => { 
      Toast.show({
        type:"default",
        text1:error.message
      })
    },
  });

  const confirm = () => {
    Alert.alert("解绑", "确定要解绑吗？", [
      {
        text: "取消",
        style: "cancel",
      },
      {
        text: "确定",
        onPress: () => deleteMdm0131Mutation.mutate(),
      },
    ]);
  };

  return (
    <TouchableOpacity
      onPress={confirm}
      className="bg-red-500 items-center justify-center p-4 rounded-sm"
    >
      <Text className="text-white">解绑</Text>
    </TouchableOpacity>
  );
};


interface UnBindLocationProps {
  code: string;
  callback: () => void;
}
export const Wms0011UnBindLocationModal = ({ code, callback }: UnBindLocationProps) => {
  // 解绑
  const batchUnbindLocationMutation = useMutation({
    mutationKey: ["batchUnbindLocation"],
    mutationFn: () => {
      return commonRequestFetch({
        functionCode: "wms0011",
        prefix: "wms",
        url:"/batchUnbindLocation",
        data: {
          codeList:[code]
        },
      });
    },
    onSuccess: (res) => {
      Toast.show({
        type:"default",
        text1:"释放成功"
      })
      callback();
    },
  });

  const confirm = () => {
    Alert.alert("释放", "确定要释放吗？", [
      {
        text: "取消",
        style: "cancel",
      },
      {
        text: "确定",
        onPress: () => batchUnbindLocationMutation.mutate(),
      },
    ]);
  };

  return (
    <TouchableOpacity
      onPress={confirm}
      disabled={batchUnbindLocationMutation.isPending}
      className="bg-red-500 items-center justify-center p-4 rounded-sm"
    >
      <Text className="text-white">释放</Text>
    </TouchableOpacity>
  );
};


interface onHandModalProps {
  whsCode: string;
  isLocationManagement: number;
  /** 货品信息 **/
  itemInfo: any;
  /** 库位信息 **/
  locationInfo?: any;
  /** 系统库存量 **/
  onHand: number;
  inventoryOrganization?: string;
  callback: () => void;
}
export const OnHandModal = ({
  whsCode,
  isLocationManagement,
  onHand,
  itemInfo,
  locationInfo,
  callback,
}: onHandModalProps) => {
  const itemCode = itemInfo.itemCode || itemInfo.code;
  const itemName = itemInfo.itemName || itemInfo.name;
  const [lineRowData, setLineRowData] = useState({
    onHand,
    checkQuantity: "",
    quantity: "",
    checkResult: "1",
  });
  const [onHandVisible, setOnHandVisible] = useState(false);
  // 盘点
  const createWms0017Mutation = useMutation({
    mutationKey: ["wms0017"],
    mutationFn: (data: any) => {
      return addItemFetch({
        functionCode: "wms0017",
        prefix: "wms",
        data: {
          whsCode,
          docType: "1",
          isLocationManagement,
          ...data,
        },
      });
    },
    onSuccess: (res) => {
      Toast.show({
        type:"default",
        text1: "盘点成功",
        visibilityTime:2000,
        onHide: () => {
          setOnHandVisible(false);
          callback();
        }
      })
    },
   
  });

  const getCheckResult = (q: number) => {
    let checkResult = "1";
    if (q < 0) {
      checkResult = "3";
    } else if (q > 0) {
      checkResult = "2";
    }
    return checkResult;
  };
  const handleSubmit = () => {
    const inventoryOrganization = getEnumStore("Mdm001901")?.[0]?.value;
    if (isLocationManagement == 1 && locationInfo) {
      createWms0017Mutation.mutate({
        wms001702: [
          {
            itemCode,
            itemName,
            location: locationInfo.location,
            locationName: locationInfo.locationName,
            areaType: locationInfo.areaType,
            inventoryOrganization,
            ...lineRowData,
            unit: itemInfo.unit,
          },
        ],
      });
    } else {
      createWms0017Mutation.mutate({
        wms001703: [
          {
            itemCode,
            itemName,
            inventoryOrganization,
            ...lineRowData,
            unit: itemInfo.unit,
          },
        ],
      });
    }
  };
  // 盘点库存 change
  const checkQuantityChange = (q: string) => {
    const quantity = MyMath.minus(Number(q), onHand);
    setLineRowData({
      ...lineRowData,
      checkQuantity: q,
      quantity: quantity.toString(),
      checkResult: getCheckResult(Number(q)),
    });
  };
  // 盈亏数量 change
  const quantityChange = (q: string) => {
    if (!q || q === "-") {
      setLineRowData({
        ...lineRowData,
        checkQuantity: onHand.toString(),
        quantity: q,
        checkResult: "1",
      });
      return;
    }
    const checkQuantity = MyMath.add(Number(q), onHand).toString();
    setLineRowData({
      ...lineRowData,
      checkQuantity,
      quantity: MyMath.toFixed(Number(q), 4).toString(),
      checkResult: getCheckResult(Number(q)),
    });
  };
  return (
    <>
      <TouchableOpacity
        onPress={() => setOnHandVisible(true)}
        disabled={createWms0017Mutation.isPending}
        className="bg-blue-500 items-center justify-center p-4 rounded-sm"
      >
        <Text className="text-white">盘点</Text>
      </TouchableOpacity>
      <Modal
        visible={onHandVisible}
        backdropColor={"rgba(0,0,0,0.5)"}
        statusBarTranslucent
        onRequestClose={() => setOnHandVisible(false)}
      >
        <View className="flex-1 justify-center items-center px-2">
          <View className="bg-white rounded w-full p-4 gap-2">
            <Text className="text-center font-semibold text-xl pb-4">盘点</Text>
            <TouchableOpacity
              onPress={() => setOnHandVisible(false)}
              className="absolute -top-4 right-2 bg-gray-200 p-2 rounded-full"

            > 
              <MaterialIcons name="close" size={20} color="black" />
            </TouchableOpacity>
            <Text>
              ({itemCode}){itemName}
            </Text>
            <View className="flex-row justify-between">
              <Text>
                库存量：
                <Text className="text-orange-600 font-bold text-lg">
                  {onHand}
                </Text>
                /{itemInfo.unit}
              </Text>
              <Text>货位：{locationInfo?.locationName}</Text>
            </View>
            <View className="flex-row justify-between gap-4">
              <View className="flex-row items-center flex-1">
                <Text>盘点库存量：</Text>
                <TextInput
                  value={lineRowData.checkQuantity}
                  selectTextOnFocus
                  onChangeText={checkQuantityChange}
                  className="border border-gray-300 rounded-sm flex-1"
                  placeholder="请输入数量"
                  inputMode="numeric"
                />
              </View>
              <View className="flex-row items-center w-1/2">
                <Text>盈亏数量：</Text>
                <TextInput
                  value={lineRowData.quantity}
                  selectTextOnFocus
                  onChangeText={quantityChange}
                  inputMode="numeric"
                  className="border border-gray-300 rounded-sm flex-1"
                  placeholder="请输入数量"
                />
              </View>
            </View>
            <SubmitBtn
              text="盘点" 
              disabled={createWms0017Mutation.isPending}
              loading={createWms0017Mutation.isPending}
              onPress={handleSubmit}
            />
          </View>
        </View>
        <Toast config={toastConfig} />
      </Modal>
    </>
  );
};
interface SubmitBtnProps extends TouchableOpacityProps {
  loading:boolean;
  text:string
}
const SubmitBtn=({loading,text,...props}:SubmitBtnProps)=>{
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      {...props}
      className="bg-blue-500 p-2 rounded-full justify-center items-center mt-2 flex-row gap-2"
    >
      {loading && <ActivityIndicator animating={true} color={"#fff"} />} 
      <Text className="text-white text-xl">{text}</Text>
    </TouchableOpacity>
  )
}