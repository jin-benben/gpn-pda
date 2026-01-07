import ClipboardText from "@/components/ClipboardText";
import EnumLabel from "@/components/EnumLabel";
import EnumSelect from "@/components/EnumSelect";
import Swipeable from "@/components/Swipeable";
import InputSearch from "@/components/ui/InputSearch";
import useEnum from "@/hooks/useEnum";
import {
  addItemFetch,
  commonRequestFetch,
  deleteItemFetch,
} from "@/lib/commonServices";
import { getLocalUserInfo } from "@/lib/util";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Reanimated, { useAnimatedStyle } from "react-native-reanimated";
import Toast from "react-native-toast-message";

export default function Wms0017Screen() {
  const [whsCode, setWhsCode] = useState<string>(
    getLocalUserInfo()?.whsCode || ""
  );
  const [searchText, setSearchText] = useState("AA2276539");
  const [searchRes, setSearchRes] = useState<any>(null);
  //
  useEnum({ params: ["Mdm0020", "Mdm001901", "mdm009501AreaType"] });
  // 查询
  const selectInventoryPdaMutation = useMutation({
    mutationKey: ["wms0011", "selectInventoryPda"],
    mutationFn: (itemOrLocationCode: string) => {
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
    onSuccess: (res: any) => {
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
      setSearchRes(res);
    },
  });
  // 绑定 fetch
  const createMdm0131Mutation = useMutation({
    mutationKey: ["mdm0131"],
    mutationFn: (data: any) => {
      return addItemFetch({ functionCode: "mdm0131", prefix: "mdm", data });
    },
  });

  // 解绑
  const deleteMdm0131Mutation = useMutation({
    mutationKey: ["mdm0131"],
    mutationFn: (data: any) => {
      return deleteItemFetch({ functionCode: "mdm0131", prefix: "mdm", data });
    },
  });
  // 盘点
  const createWms0017Mutation = useMutation({
    mutationKey: ["wms0017"],
    mutationFn: (data: any) => {
      return addItemFetch({ functionCode: "mdm0131", prefix: "mdm", data });
    },
  });

  return (
    <View className="flex-1 gap-2">
      <View className="bg-white px-2">
        <EnumSelect enumKey="Mdm0020" value={whsCode} onChange={setWhsCode} />
        <InputSearch
          placeholder="请扫描货品编码或库位条码"
          value={searchText}
          autoFocus
          onChangeText={setSearchText}
          onSearch={(text: string) => selectInventoryPdaMutation.mutate(text)}
        />
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
            <View className="p-2">
              <Text>{searchRes.mdm0085Info.name}</Text>
              <Text>货品编码：{searchRes.mdm0085Info.code}</Text>
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
          )
        }
      </View>
      {searchRes?.locationInventoryInfo && (
        <View>
          {searchRes?.locationInventoryInfo.locationInventoryInfoList.map(
            (a: any) => (
              <Swipeable
                key={a.itemCode}
                renderRightActions={(prog, drag) => {
                  const styleAnimation = useAnimatedStyle(() => {
                    return {
                      transform: [{ translateX: drag.value + 50 }],
                    };
                  });
                  console.log("执行了");
                  return (
                    <Reanimated.View style={styleAnimation}>
                      <Text>Text</Text>
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
        <View>
          {searchRes?.mdm0085Info.onHandInfo.map((a: any) => (
            <Swipeable
              key={a.location}
              renderRightActions={(prog, drag) => {
                const styleAnimation = useAnimatedStyle(() => {
                  return {
                    transform: [{ translateX: drag.value + 100 }],
                    width: 100,
                    gap:10,
                    flexDirection:"row"
                  };
                });
                return (
                  <Reanimated.View style={styleAnimation}>
                    <TouchableOpacity className="bg-blue-500 items-center justify-center p-4 rounded-sm" >
                      <Text className="text-white">盘点</Text>
                    </TouchableOpacity>
                  </Reanimated.View>
                );
              }}
            >
              <View className="bg-white mx-2 p-2 rounded gap-1">
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
                <View>
                  <View>
                    <EnumLabel enumKey="mdm009501AreaType" value={a.areaType} />
                    <Text className="text-gray-500">类型</Text>
                  </View>
                </View>
              </View>
            </Swipeable>
          ))}
        </View>
      )}

      <Toast />
    </View>
  );
}
