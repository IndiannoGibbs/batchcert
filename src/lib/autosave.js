import { AUTOSAVE_KEY } from '../constants/index.js';
import { isAutosaveEmpty } from './autosaveEmpty.js';

export { isAutosaveEmpty };

export const buildProjectState = (state) => ({
  ...state,
  savedAt: new Date().toISOString(),
});

export const saveProjectToAutosave = (state) => {
  if (isAutosaveEmpty(state)) {
    clearAutosaveProject();
    return { ok: true, cleared: true };
  }

  try {
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(buildProjectState(state)));
    return { ok: true };
  } catch (err) {
    console.warn('LocalStorage quota exceeded.', err);
    return { ok: false, error: err };
  }
};

export const loadAutosaveProject = () => {
  try {
    const saved = localStorage.getItem(AUTOSAVE_KEY);
    if (!saved) return null;
    return JSON.parse(saved);
  } catch (err) {
    console.error('Failed to load auto-saved project', err);
    return null;
  }
};

export const hasAutosaveProject = () => Boolean(localStorage.getItem(AUTOSAVE_KEY));

export const clearAutosaveProject = () => {
  localStorage.removeItem(AUTOSAVE_KEY);
};

export const formatAutosaveTime = (isoString) => {
  if (!isoString) return 'Unknown time';
  try {
    return new Date(isoString).toLocaleString();
  } catch {
    return 'Unknown time';
  }
};

export const formatAutosaveTimeShort = (isoString) => {
  if (!isoString) return '';
  try {
    return new Date(isoString).toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
};

export const getAutosaveProjectIfRestorable = () => {
  if (!hasAutosaveProject()) return null;
  const saved = loadAutosaveProject();
  if (!saved || isAutosaveEmpty(saved)) {
    clearAutosaveProject();
    return null;
  }
  return saved;
};
