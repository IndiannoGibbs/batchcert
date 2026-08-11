import { useCallback, useEffect, useRef, useState } from 'react';
import {
  saveProjectToAutosave,
  clearAutosaveProject,
  formatAutosaveTime,
  isAutosaveEmpty,
  getAutosaveProjectIfRestorable,
} from '../lib/autosave.js';

export function useAutoSave(projectState, { enabled = true, debounceMs = 2000 } = {}) {
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const timerRef = useRef(null);
  const projectStateRef = useRef(projectState);
  const enabledRef = useRef(enabled);

  projectStateRef.current = projectState;
  enabledRef.current = enabled;

  const writeProjectState = useCallback((state = projectStateRef.current) => {
    if (isAutosaveEmpty(state)) {
      clearAutosaveProject();
      setLastSavedAt(null);
      return { ok: true, cleared: true };
    }

    setIsSaving(true);
    const result = saveProjectToAutosave(state);
    if (result.ok && !result.cleared) {
      setLastSavedAt(new Date().toISOString());
    }
    if (result.cleared) {
      setLastSavedAt(null);
    }
    setIsSaving(false);
    return result;
  }, []);

  const flushSave = useCallback((state = projectStateRef.current) => writeProjectState(state), [writeProjectState]);

  const persistProjectState = useCallback((state = projectStateRef.current) => {
    if (!enabledRef.current) return { ok: false, skipped: true };
    return writeProjectState(state);
  }, [writeProjectState]);

  useEffect(() => {
    if (!enabled) return undefined;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      persistProjectState(projectState);
    }, debounceMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [projectState, enabled, debounceMs, persistProjectState]);

  useEffect(() => {
    if (enabled) return undefined;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      writeProjectState(projectStateRef.current);
    }

    return undefined;
  }, [enabled, writeProjectState]);

  useEffect(() => {
    const flushOnExit = () => writeProjectState(projectStateRef.current);
    window.addEventListener('pagehide', flushOnExit);
    window.addEventListener('beforeunload', flushOnExit);
    return () => {
      window.removeEventListener('pagehide', flushOnExit);
      window.removeEventListener('beforeunload', flushOnExit);
    };
  }, [writeProjectState]);

  return { lastSavedAt, isSaving, formatAutosaveTime, flushSave };
}

export function useAutosaveRestore() {
  const [pendingRestore, setPendingRestore] = useState(null);
  const pendingRestoreRef = useRef(null);

  const checkForRestore = useCallback(() => {
    const saved = getAutosaveProjectIfRestorable();
    pendingRestoreRef.current = saved;
    setPendingRestore(saved);
    return saved;
  }, []);

  const applyRestore = useCallback((onApply) => {
    const saved = pendingRestoreRef.current;
    if (!saved) return false;
    onApply(saved);
    pendingRestoreRef.current = null;
    setPendingRestore(null);
    return true;
  }, []);

  const discardRestore = useCallback(() => {
    clearAutosaveProject();
    pendingRestoreRef.current = null;
    setPendingRestore(null);
  }, []);

  const dismissRestorePrompt = useCallback(() => {
    pendingRestoreRef.current = null;
    setPendingRestore(null);
  }, []);

  return {
    pendingRestore,
    checkForRestore,
    applyRestore,
    discardRestore,
    dismissRestorePrompt,
    formatAutosaveTime,
  };
}
