
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * FirebaseErrorListener - 職責：捕捉全局權限錯誤並拋出，觸發 Next.js 錯誤遮罩以利除錯。
 */
export function FirebaseErrorListener() {
  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      // 在開發環境中，直接拋出錯誤以觸發詳細的 Contextual Error 介面
      console.warn("偵測到 Firestore 權限衝突:", error.context);
      throw error;
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => errorEmitter.off('permission-error', handlePermissionError);
  }, []);

  return null;
}
