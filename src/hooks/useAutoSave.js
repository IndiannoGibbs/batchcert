import { useCallback, useEffect, useRef, useState } from 'react';
import {
  saveProjectToAutosave,
  loadAutosaveProject,
  hasAutosaveProject,
  clearAutosaveProject,
  formatAutosaveTime,
  isAutosaveEmpty,
} from '../lib/autosave.js';

export function useAutoSave(projectState, { enabled = true, debounceMs = 2000 } = {}) {
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!enabled) return undefined;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsSaving(true);
      const saved = saveProjectToAutosave(projectState);
      if (saved) setLastSavedAt(new Date().toISOString());
      setIsSaving(false);
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [projectState, enabled, debounceMs]);

  return { lastSavedAt, isSaving, formatAutosaveTime };
}

export function useAutosaveRestore() {
  const [pendingRestore, setPendingRestore] = useState(null);

  const checkForRestore = useCallback(() => {
    if (!hasAutosaveProject()) return null;
    const saved = loadAutosaveProject();
    if (!saved || isAutosaveEmpty(saved)) {
      clearAutosaveProject();
      return null;
    }
    setPendingRestore(saved);
    return saved;
  }, []);

  const applyRestore = useCallback((onApply) => {
    if (pendingRestore) onApply(pendingRestore);
    setPendingRestore(null);
  }, [pendingRestore]);

  const discardRestore = useCallback(() => {
    clearAutosaveProject();
    setPendingRestore(null);
  }, []);

  return {
    pendingRestore,
    checkForRestore,
    applyRestore,
    discardRestore,
    formatAutosaveTime,
  };
}

export { clearAutosaveProject, loadAutosaveProject };
