// hooks/useCustomMutation.ts
import { useState, useCallback, useRef, useEffect } from 'react';

// 定义 Mutation 状态类型
interface MutationState<TData = unknown, TError = unknown, TVariables = void> {
  data: TData | null;
  error: TError | null;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  isIdle: boolean;
  status: 'idle' | 'pending' | 'success' | 'error';
}

// 定义 Mutation 配置类型
interface MutationOptions<TData = unknown, TError = unknown, TVariables = void> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onMutate?: (variables: TVariables) => void | Promise<unknown>;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: TError, variables: TVariables, context?: unknown) => void;
  onSettled?: (data: TData | undefined, error: TError | null, variables: TVariables) => void;
}

// 定义 Mutate 函数类型
type MutateFunction<TData = unknown, TError = unknown, TVariables = void> = (
  variables: TVariables,
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: TError, variables: TVariables) => void;
  }
) => void;

interface UseMutationResult<TData = unknown, TError = unknown, TVariables = void> {
  data: TData | null;
  error: TError | null;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  isIdle: boolean;
  status: 'idle' | 'pending' | 'success' | 'error';
  mutate: MutateFunction<TData, TError, TVariables>;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  reset: () => void;
}

function useCustomMutation<TData = unknown, TError = unknown, TVariables = void>(
  options: MutationOptions<TData, TError, TVariables>
): UseMutationResult<TData, TError, TVariables> {
  const { mutationFn, onMutate, onSuccess, onError, onSettled } = options;
  
  // 使用 useRef 存储回调函数，避免在依赖项中重新创建函数
  const callbacksRef = useRef({
    onMutate,
    onSuccess,
    onError,
    onSettled,
  });
  
  // 更新 ref 以保持最新的回调函数
  useEffect(() => {
    callbacksRef.current = {
      onMutate,
      onSuccess,
      onError,
      onSettled,
    };
  }, [onMutate, onSuccess, onError, onSettled]);

  const [state, setState] = useState<MutationState<TData, TError, TVariables>>({
    data: null,
    error: null,
    isPending: false,
    isSuccess: false,
    isError: false,
    isIdle: true,
    status: 'idle',
  });

  // 重置状态
  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isPending: false,
      isSuccess: false,
      isError: false,
      isIdle: true,
      status: 'idle',
    });
  }, []);

  // 执行 mutation 的核心函数
  const executeMutation = useCallback(
    async (variables: TVariables, externalCallbacks?: { onSuccess?: any; onError?: any }) => {
      const { onMutate, onSuccess, onError, onSettled } = callbacksRef.current;

      // 设置为 pending 状态
      setState(prev => ({
        ...prev,
        isPending: true,
        isSuccess: false,
        isError: false,
        isIdle: false,
        status: 'pending',
      }));

      let context: unknown;

      try {
        // 执行 mutation 前的准备操作
        if (onMutate) {
          context = await onMutate(variables);
        }

        // 执行实际的 mutation 函数
        const data = await mutationFn(variables);

        // 成功状态更新
        setState(prev => ({
          ...prev,
          data,
          error: null,
          isPending: false,
          isSuccess: true,
          isError: false,
          isIdle: false,
          status: 'success',
        }));

        // 调用 onSuccess 回调
        if (onSuccess) {
          onSuccess(data, variables);
        }

        // 调用外部传入的成功回调
        if (externalCallbacks?.onSuccess) {
          externalCallbacks.onSuccess(data, variables);
        }

        // 调用 settled 回调
        if (onSettled) {
          onSettled(data, null, variables);
        }

        return data;
      } catch (error) {
        // 错误状态更新
        setState(prev => ({
          ...prev,
          error: error as TError,
          data: null,
          isPending: false,
          isSuccess: false,
          isError: true,
          isIdle: false,
          status: 'error',
        }));

        // 调用 onError 回调
        if (onError) {
          onError(error as TError, variables, context);
        }

        // 调用外部传入的错误回调
        if (externalCallbacks?.onError) {
          externalCallbacks.onError(error as TError, variables);
        }

        // 调用 settled 回调
        if (onSettled) {
          onSettled(undefined, error as TError, variables);
        }

        throw error;
      }
    },
    [mutationFn]
  );

  // 同步变异函数
  const mutate = useCallback<MutateFunction<TData, TError, TVariables>>(
    (variables, externalCallbacks) => {
      executeMutation(variables, externalCallbacks).catch(() => {
        // 错误已经被内部处理，这里只是为了防止未捕获的 Promise 错误
      });
    },
    [executeMutation]
  );

  // 异步变异函数
  const mutateAsync = useCallback(
    (variables: TVariables) => {
      return executeMutation(variables);
    },
    [executeMutation]
  );

  return {
    ...state,
    mutate,
    mutateAsync,
    reset,
  };
}

export default useCustomMutation;