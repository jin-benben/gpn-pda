import ClipboardText from "@/components/ClipboardText";
import EnumLabel from "@/components/EnumLabel";
import EnumSelect from "@/components/EnumSelect";
import LocationModal from "@/components/LocationModal";
import LocationPicker from "@/components/LocationPicker";
import Swipeable from "@/components/Swipeable";
import { toastConfig } from "@/components/ToastConfig";
import InputSearch from "@/components/ui/InputSearch";
import PageIndicator from "@/components/ui/PageIndicator";
import useEnum from "@/hooks/useEnum";
import {
  addItemFetch,
  commonRequestFetch,
  deleteItemFetch,
} from "@/lib/commonServices";
import MyMath from "@/lib/math";
import { getLocalUserInfo } from "@/lib/util";
import { getEnumItem, getEnumStore } from "@/store/enum";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useMutation } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Modal,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Reanimated, { useAnimatedStyle } from "react-native-reanimated";
import Toast from "react-native-toast-message";

export default function Wms0017Screen() {
  const searchParams = useLocalSearchParams<{
    location?: string;
    itemCode?: string;
    whsCode?: string;
  }>();
  const [whsCode, setWhsCode] = useState<string>(
    searchParams.whsCode || getLocalUserInfo()?.whsCode || ""
  );
  const [isShowZeroStock, setIsShowZeroStock] = useState<string>("0");
 
  const [searchText, setSearchText] = useState(searchParams.itemCode || searchParams.location || '');
  const [searchRes, setSearchRes] = useState<any>(null);
  const { data: enumData } = useEnum({
    params: [
      {
        code:"Mdm0020",
        filter: {
          whsType: [1,2],
        },
      },
      "yesOrNo",
      {
        code: "Mdm001901",
        filter: {
          isDefaultPurchase: [1],
        },
      },
      "mdm009501AreaType",
    ],
  });
  // 是否启动库位管理
  const isLocationManagement = useMemo(() => {
    return enumData?.Mdm0020.find((a) => a.value == whsCode)?.extend
      ?.isLocationManagement;
  }, [whsCode, enumData]);

  
  // 查询
  const selectInventoryPdaMutation = useMutation({
    mutationKey: ["wms0011", "selectInventoryPda",isShowZeroStock,whsCode],
    mutationFn: (itemOrLocationCode: string) => {
      return commonRequestFetch({
        functionCode: "wms0011",
        prefix: "wms",
        url: "/selectInventoryPda",
        data: {
          whsCode,
          itemOrLocationCode,
          isShowZeroStock
        },
      });
    },
    onSuccess: (res: any) => {
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
        });
      }
      setSearchRes(res);
    },
  });

  useEffect(() => { 
    if(searchText){
      selectInventoryPdaMutation.mutate(searchText);
    }
  }, [whsCode,isShowZeroStock]);


  useEffect(() => {
    if (searchParams.itemCode) {
      selectInventoryPdaMutation.mutate(searchParams.itemCode);
    }else if (searchParams.location) {
      selectInventoryPdaMutation.mutate(searchParams.location);
    }
  }, []);

  const handleCallback = () => { 
    selectInventoryPdaMutation.mutate(searchText);
  };

  return (
    <View className="flex-1 gap-2">
      <View className="bg-white px-2">
        <View className="flex-row items-center">
          <Text>仓库：</Text>
          <EnumSelect style={{flex:1}} enumKey="Mdm0020" value={whsCode} onChange={setWhsCode} />
        </View>
        <View className="flex-row items-center">
          <Text>显示零库存：</Text>
          <EnumSelect style={{flex:1}} enumKey="yesOrNo" value={isShowZeroStock} onChange={setIsShowZeroStock} />
        </View>
        
        <InputSearch
          placeholder="请扫描货品编码或库位条码"
          value={searchText}
          onChangeText={setSearchText}
          onSearch={(text: string) => selectInventoryPdaMutation.mutate(text)}
        />
       
       
      </View>
      {
        selectInventoryPdaMutation.isPending && (
          <PageIndicator />
        )
      }
      <ScrollView>
      {
          // 库位
          searchRes?.locationInventoryInfo && (
            <View className="p-2">
              <View>
                <Text className="text-lg">
                  {searchRes.locationInventoryInfo.locationName}
                </Text>
                <Text className="text-gray-500">货位</Text>
              </View>
            </View>
          )
        }
        {
          // 货品
          searchRes?.mdm0085Info && (
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
                    <OnHandModal
                      itemInfo={searchRes?.mdm0085Info}
                      onHand={searchRes.mdm0085Info.onHand}
                      whsCode={whsCode}
                      isLocationManagement={isLocationManagement}
                      callback={handleCallback}
                    />
                    <BindLocationModal
                      itemInfo={searchRes.mdm0085Info}
                      whsCode={whsCode}
                      callback={handleCallback}
                    />
                  </Reanimated.View>
                );
              }}
            >
              <View className="p-2">
                <Text>{searchRes.mdm0085Info.name}</Text>
                <ClipboardText text={searchRes.mdm0085Info.code}>
                  <Text className="text-blue-500">
                    货品编码：{searchRes.mdm0085Info.code}
                  </Text>
                </ClipboardText>
                <View className="flex-row justify-between">
                  <Text>单位：{searchRes.mdm0085Info.unit}</Text>
                  <Text>重量：{searchRes.mdm0085Info.weight}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text>
                    最后上架库位：{searchRes.mdm0085Info.lastPutawayLocation}
                  </Text>
                  <Text>
                    库存：
                    <Text className="text-orange-600 font-bold text-lg">
                      {searchRes.mdm0085Info.onHand}
                    </Text>
                  </Text>
                </View>
              </View>
            </Swipeable>
          )
        }
        {searchRes?.locationInventoryInfo && (
          <View>
            {searchRes?.locationInventoryInfo.locationInventoryInfoList.map(
              (a: any, index: number) => (
                <Swipeable
                  key={index}
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
                        <OnHandModal
                          itemInfo={a}
                          locationInfo={a}
                          onHand={a.onHand}
                          whsCode={whsCode}
                          isLocationManagement={isLocationManagement}
                          callback={handleCallback}
                        />
                        {a.code == 0 && (
                          <UnBindLocationModal
                            code={a.code}
                            callback={handleCallback}
                          />
                        )}
                        {
                          a.wms0011Code && (
                            <Wms0011UnBindLocationModal
                              code={a.wms0011Code}
                              callback={handleCallback}
                            />
                          )
                        }
                      </Reanimated.View>
                    );
                  }}
                >
                  <View className="bg-white mx-2 p-2 rounded mb-2">
                    <Text>{a.itemName}</Text>
                    <ClipboardText text={a.itemCode}>
                      <Text className="text-blue-500">
                        货品编码：{a.itemCode}
                      </Text>
                    </ClipboardText>
                    <Text>单位：{a.unit}</Text>
                    <Text>
                      库存：
                      <Text className="text-orange-600 font-bold text-lg">
                        {a.onHand}
                      </Text>
                    </Text>
                  </View>
                </Swipeable>
              )
            )}
          </View>
        )}
        {searchRes?.mdm0085Info && (
          <View className=" gap-2">
            {searchRes?.mdm0085Info.onHandInfo.map((a: any, index: number) => (
              <Swipeable
                key={index}
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
                      <OnHandModal
                        itemInfo={searchRes?.mdm0085Info}
                        locationInfo={a}
                        onHand={a.onHand}
                        whsCode={whsCode}
                        isLocationManagement={isLocationManagement}
                        callback={handleCallback}
                      />
                      {isLocationManagement == 0 && (
                        <UnBindLocationModal
                          code={a.code}
                          callback={handleCallback}
                        />
                      )}
                      {
                        a.wms0011Code && (
                          <Wms0011UnBindLocationModal
                            code={a.wms0011Code}
                            callback={handleCallback}
                          />
                        )
                      }
                    </Reanimated.View>
                  );
                }}
              >
                <View className="bg-white mx-2 p-2 rounded gap-2">
                  <View className="flex-row justify-between">
                    <View>
                      <Text className="text-lg">{a.locationName}</Text>
                      <Text className="text-gray-500">货位</Text>
                    </View>
                    <View>
                      <Text className="text-orange-600 font-bold text-lg">
                        {a.onHand}
                      </Text>
                      <Text className="text-gray-500">库存</Text>
                    </View>
                  </View>
                  <View className="flex-row justify-between">
                    <View>
                      <EnumLabel
                        enumKey="mdm009501AreaType"
                        value={a.areaType}
                      />
                      <Text className="text-gray-500">类型</Text>
                    </View>
                    <View className="flex-row gap-2">
                      <View>
                        <Text className="text-rend-600 font-bold text-lg text-right">
                          {a.openAllocation}
                        </Text>
                        <Text className="text-gray-500">已配货</Text>
                      </View>
                      <View>
                        <Text className="text-green-600 font-bold text-lg text-right">
                          {a.openDistributableOnHand ?? 0}
                        </Text>
                        <Text className="text-gray-500">可配货</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </Swipeable>
            ))}
          </View>
        )}
      </ScrollView>

      <Toast config={toastConfig}/>
    </View>
  );
}
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
const OnHandModal = ({
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
      })
      setOnHandVisible(false);
      callback();
    },
    onError: (err) => {
      Toast.show({
        type:"default",
        text1: err.message,
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
    if (isLocationManagement == 1) {
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
            <TouchableOpacity
              activeOpacity={0.7}
              disabled={createWms0017Mutation.isPending}
              onPress={handleSubmit}
              className="bg-blue-500 p-2 rounded-full justify-center items-center mt-2"
            >
              <Text className="text-white text-xl">盘点</Text>
            </TouchableOpacity>
          </View>
          <Toast config={toastConfig} />
        </View>
      </Modal>
    </>
  );
};
interface BindLocationModalProps {
  whsCode: string;
  /** 货品信息 **/
  itemInfo: any;
  callback: () => void;
}
const BindLocationModal = ({
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
const UnBindLocationModal = ({ code, callback }: UnBindLocationProps) => {
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
const Wms0011UnBindLocationModal = ({ code, callback }: UnBindLocationProps) => {
  // 解绑
  const deleteMdm0131Mutation = useMutation({
    mutationKey: ["mdm0131"],
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
    onError: (error) => { 
      Toast.show({
        type:"default",
        text1:error.message
      })
    }
  });

  const confirm = () => {
    Alert.alert("释放", "确定要释放吗？", [
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
      <Text className="text-white">释放</Text>
    </TouchableOpacity>
  );
};

