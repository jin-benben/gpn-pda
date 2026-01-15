import ClipboardText from "@/components/ClipboardText";
import EnumLabel from "@/components/EnumLabel";
import EnumSelect from "@/components/EnumSelect";
import Swipeable from "@/components/Swipeable";
import { toastConfig } from "@/components/ToastConfig";
import InputSearch from "@/components/ui/InputSearch";
import PageIndicator from "@/components/ui/PageIndicator";
import { OnHandModal, BindLocationModal, UnBindLocationModal, Wms0011UnBindLocationModal } from "@/components/wms0007";
import useEnum from "@/hooks/useEnum";
import {commonRequestFetch} from "@/lib/commonServices";
import { getLocalUserInfo } from "@/lib/util";
import useMutation from "@/hooks/useMutation";
import { useLocalSearchParams } from "expo-router";
import { lazy, useEffect, useMemo, useState } from "react";
import {
  Text,
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
        selectInventoryPdaMutation.isPending ? (
          <PageIndicator />
        ):(
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
        )
      }
      <Toast config={toastConfig} />
    </View>
  );
}