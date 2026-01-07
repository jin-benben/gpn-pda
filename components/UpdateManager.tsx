

import * as Updates from 'expo-updates';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  // If true, check on mount automatically. Default: true
  autoCheck?: boolean;
  // If true, show prompt only when update is downloaded. Default: true
  promptOnUpdate?: boolean;
};

const UpdateManager: React.FC<Props> = ({ autoCheck = false, promptOnUpdate = true }) => {
  const [checking, setChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const checkAndFetch = useCallback(async (showPromptOnAvailable = true) => {
    setErrorMsg(null);
    try {
      setChecking(true);
      const update = await Updates.checkForUpdateAsync();
      setIsAvailable(update.isAvailable);
      setChecking(false);

      if (update.isAvailable) {
        // 下载并准备更新； fetchUpdateAsync 会下载更新资源并在完成后可通过 reloadAsync 应用
        setIsDownloading(true);
        await Updates.fetchUpdateAsync();
        setIsDownloading(false);
        setDownloaded(true);

        if (promptOnUpdate && showPromptOnAvailable) {
          setModalVisible(true);
        } else if (!promptOnUpdate) {
          // 如果不提示则直接 reload（谨慎使用）
          await applyUpdate();
        }
      } else {
        // 没有更新
      }
    } catch (e: any) {
      setChecking(false);
      setIsDownloading(false);
      setErrorMsg(e?.message ?? String(e));
      console.warn('Update check/fetch failed', e);
    }
  }, [promptOnUpdate]);

  const applyUpdate = useCallback(async () => {
    try {
      // reloadAsync 会使应用重启并生效新 bundle（只要运行时版本匹配）
      await Updates.reloadAsync();
    } catch (e) {
      console.warn('Failed to reload app to apply update', e);
      Alert.alert('更新应用失败', '尝试重新启动应用或从商店更新。');
    }
  }, []);

  useEffect(() => {
    if (!autoCheck) return;

    // 自动在启动时检查一次
    (async () => {
      await checkAndFetch(true);
    })();

    // 可在这里监听前台事件（AppState）再次检查，如果需要
    // 例如：在 resume 时再检查一次（实现略）
  }, [autoCheck, checkAndFetch]);

  // Public manual trigger example
  const onManualCheckPress = async () => {
    await checkAndFetch(true);
    if (!isAvailable && !errorMsg) {
      Alert.alert('当前已是最新版本');
    }
  };

  return (
    <>
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.backdrop}>
          <View style={styles.modal}>
            <Text style={styles.title}>发现新版本</Text>
            <Text style={styles.message}>已下载新版本，是否立即重启以应用更新？</Text>
            <View style={styles.actions}>
              <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnText}>稍后</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnOk]} onPress={async () => await applyUpdate()}>
                <Text style={[styles.btnText, { fontWeight: '600' }]}>立即更新</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Small status HUD (optional) — you can remove or style as needed */}
      {(checking || isDownloading || errorMsg) && (
        <View style={styles.hud}>
          <ActivityIndicator size="small" color="#fff" />
          <Text style={styles.hudText}>
            {checking ? '正在检查更新...' : isDownloading ? '正在下载更新...' : `更新失败：${errorMsg}`}
          </Text>
        </View>
      )}

      <View style={styles.hiddenManualTrigger}>
        <TouchableOpacity activeOpacity={0.7} onPress={onManualCheckPress} className='bg-blue-500 px-6 py-2 rounded'>
          <Text style={{ color: '#fff', fontSize: 12 }}>检查更新</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '84%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  message: { fontSize: 14, color: '#333', marginBottom: 18, textAlign: 'center' },
  actions: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  btnOk: { backgroundColor: '#0a84ff' },
  btnCancel: { backgroundColor: '#eee' },
  btnText: { color: '#fff' },
  hud: {
    position: 'absolute',
    top: 44,
    alignSelf: 'center',
    backgroundColor: '#222',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1000,
    marginHorizontal: 16,
  },
  hudText: { color: '#fff', marginLeft: 8, fontSize: 12 },
  hiddenManualTrigger: {
    marginTop:20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default UpdateManager;