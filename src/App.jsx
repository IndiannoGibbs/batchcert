import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Upload, Download, Plus, Trash2, ChevronLeft, ChevronRight, ChevronDown,
  Move, Type, Image as ImageIcon, Layout, Users, FileText, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Palette, Scaling, Sliders, Minus, Save, FolderOpen,
  ZoomIn, ZoomOut, RotateCcw, CheckSquare, Undo2, SlidersHorizontal,
  Bold, Italic, Underline, FilePlus, FileCode, Award, PenTool,
  Layers, Eye, EyeOff, ArrowUp, ArrowDown, Check, X, Search, Maximize2, Minimize2, Grid,
  Maximize, Info, Tag, FileType, QrCode, HelpCircle, Sparkles, ArrowRight, Coffee, Copy, Lock, Unlock, AlertTriangle,
  AlignHorizontalDistributeCenter, AlignVerticalDistributeCenter, Paintbrush, ClipboardPaste, Table2, Stamp,
  PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';
import LandingPage from './components/LandingPage';
import LoaderOverlay from './components/LoaderOverlay';
import EditorTopBar from './components/EditorTopBar';
import KeyboardShortcutModal from './components/KeyboardShortcutModal';
import CSVInstructionsModal from './components/CSVInstructionsModal';
import QRInstructionsModal from './components/QRInstructionsModal';
import ExportModal from './components/ExportModal';
import ExportProgressOverlay from './components/ExportProgressOverlay';
import AwardeeDropdown from './components/AwardeeDropdown';
import RestoreProjectModal from './components/RestoreProjectModal';
import CsvImportModal from './components/CsvImportModal';
import QRCodeElement from './components/QRCodeElement';
import OnboardingWizard from './components/OnboardingWizard';
import DocsModal from './components/DocsModal';
import AwardeeBulkEditModal from './components/AwardeeBulkEditModal';
import { GOOGLE_FONTS, CANVAS_PRESETS, PRESET_BACKGROUNDS } from './constants/index.js';
import { SAMPLE_PROJECT } from './constants/sampleProject.js';
import { deduplicateElements, getTextElementTransform } from './lib/elements.js';
import { clearAutosaveProject, hasAutosaveProject, formatAutosaveTimeShort } from './lib/autosave.js';
import {
  parseCsvText,
  guessDefaultMapping,
  buildAwardeesFromCsv,
  getCustomCsvHeaders,
  extractDynamicHeadersFromElements,
  getBulkEditHeaders,
  bulkEditRowsToAwardees,
} from './lib/csv/parseCsv.js';
import { ensureAwardeeFieldElements } from './lib/awardeeCanvasElements.js';
import { getExportSummary } from './lib/export/pdfHelpers.js';
import { estimateExport } from './lib/export/estimateExport.js';
import { validateAwardees } from './lib/awardeeValidation.js';
import { getProjectAppliers, buildProjectSnapshot } from './lib/projectState.js';
import { useAutoSave, useAutosaveRestore } from './hooks/useAutoSave.js';
import { useCertificateExport } from './hooks/useCertificateExport.js';
import { isOnboardingComplete, markOnboardingComplete } from './lib/onboarding.js';

export default function CertificateGenerator() {
  // Navigation state for Landing Page vs Editor
  const [isEditorLaunched, setIsEditorLaunched] = useState(false);
  const [isLaunchingEditor, setIsLaunchingEditor] = useState(false);
  const [isReturningHome, setIsReturningHome] = useState(false);

  const handleLaunchEditor = (withSample = false) => {
    if (isLaunchingEditor || isReturningHome) return;
    if (withSample) setLaunchWithSample(true);
    setIsLaunchingEditor(true);
    setIsReturningHome(false);
    window.setTimeout(() => {
      setIsEditorLaunched(true);
      setIsLaunchingEditor(false);
      if (withSample || launchWithSample) {
        setPostLaunchAction('sample');
        setLaunchWithSample(false);
      } else if (hasAutosaveProject()) {
        setPostLaunchAction('restore');
      } else if (!isOnboardingComplete()) {
        setPostLaunchAction('onboard');
      }
    }, 850);
  };

  const handleCompleteOnboarding = () => {
    markOnboardingComplete();
    setShowOnboardingWizard(false);
  };

  const handleLoadSampleProject = () => {
    applyProjectState(SAMPLE_PROJECT);
  };

  const handleOnboardingTemplate = ({ canvasSize: size, bgType: bg }) => {
    setCanvasSize(size);
    setBgType(bg);
  };

  const handleOnboardingCsvImport = ({ headers, rows, nameColumn, positionColumn }) => {
    finalizeCsvImport({ headers, rows, nameColumn, positionColumn });
  };

  const handleExitToHome = () => {
    if (isReturningHome || isLaunchingEditor) return;
    setIsReturningHome(true);
    setIsLaunchingEditor(false);
    window.setTimeout(() => {
      setIsEditorLaunched(false);
      setIsReturningHome(false);
    }, 850);
  };

  const [activeTab, setActiveTab] = useState('data');
  const [bgType, setBgType] = useState('purpleGold');
  const [customBg, setCustomBg] = useState(null);
  
  const [projectName, setProjectName] = useState('BatchCert_Project');
  const [canvasSize, setCanvasSize] = useState({ width: 1100, height: 850, label: 'US Letter Landscape' });

  // Advanced Custom Background Controls
  const [bgTransform, setBgTransform] = useState({
    width: 100,
    height: 100,
    x: 0,
    y: 0
  });

  const [logoImg, setLogoImg] = useState(null);

  const [globalData, setGlobalData] = useState({
    orgName: '',
    orgSubtext: '',
    dateLine: '',
    certificateTitle: '',
    eventDuties: '',
    bodyTemplate: ''
  });

  const [signatories, setSignatories] = useState([
    { id: 'sig_1', name: '', title: '', signatureImg: null },
    { id: 'sig_2', name: '', title: '', signatureImg: null }
  ]);

  const [awardees, setAwardees] = useState([
    { 
      id: '1', 
      name: '', 
      position: '',
      csvData: { Name: '', Position: '' },
      hasCustomLayout: false,
      customElements: null,
      customSignatories: null
    }
  ]);
  const [currentAwardeeIdx, setCurrentAwardeeIdx] = useState(0);

  // Sidebar Awardee Search & Pagination States
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('');
  const [sidebarPage, setSidebarPage] = useState(0);
  const itemsPerPage = 8;

  // Dynamic CSV Headers List
  const [csvHeaders, setCsvHeaders] = useState(['Name', 'Position']);

  // Modals & UI States
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isKeyboardModalOpen, setIsKeyboardModalOpen] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [previewFitScale, setPreviewFitScale] = useState(1);
  const [showGuides, setShowGuides] = useState(false);
  const [isAwardeeDropdownOpen, setIsAwardeeDropdownOpen] = useState(false);
  const [awardeeSearchQuery, setAwardeeSearchQuery] = useState('');

  // Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportMode, setExportMode] = useState('all'); 
  const [exportFormat, setExportFormat] = useState('pdf'); // 'pdf' | 'png'
  const [exportScale, setExportScale] = useState(2); // 1x draft, 2x HD, 3x Ultra HD
  const [selectedExportIndices, setSelectedExportIndices] = useState([]);
  const [parsedCsvDraft, setParsedCsvDraft] = useState(null);
  const [isCsvImportModalOpen, setIsCsvImportModalOpen] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showOnboardingWizard, setShowOnboardingWizard] = useState(false);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [copiedTextStyle, setCopiedTextStyle] = useState(null);
  const [launchWithSample, setLaunchWithSample] = useState(false);
  const [postLaunchAction, setPostLaunchAction] = useState(null);

  const initialElements = [];
  const [elements, setElements] = useState(initialElements);

  const initialHistoryState = {
    elements: initialElements,
    globalData,
    awardees,
    signatories
  };

  const [history, setHistory] = useState([initialHistoryState]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [editingElementId, setEditingElementId] = useState(null);

  // Guide lines state (percentage relative to canvas dimensions)
  const [guides, setGuides] = useState({
    horizontal: [50],
    vertical: [50]
  });
  const [activeDraggingGuide, setActiveDraggingGuide] = useState(null);

  // Center snap indicators active during dragging
  const [snapStatus, setSnapStatus] = useState({ x: false, y: false });

  const currentAwardee = awardees[currentAwardeeIdx] || {};
  const activeElements = deduplicateElements((currentAwardee.hasCustomLayout && currentAwardee.customElements) ? currentAwardee.customElements : elements);
  const activeSignatories = (currentAwardee.hasCustomLayout && currentAwardee.customSignatories) ? currentAwardee.customSignatories : signatories;
  const activeElementsRef = useRef(activeElements);
  activeElementsRef.current = activeElements;
  const arrowNudgeActiveRef = useRef(false);


  // Load Google Fonts into document head dynamically on mount
  useEffect(() => {
    const linkId = 'batchcert-google-fonts';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Alex+Brush&family=Allura&family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=Cinzel:wght@400..900&family=Cormorant+Garamond:ital,wght@0,300..700;1,300..700&family=Dancing+Script:wght@400..700&family=Great+Vibes&family=Inter:wght@100..900&family=Merriweather:ital,wght@0,300..900;1,300..900&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Oswald:wght@200..700&family=Pinyon+Script&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Poppins:ital,wght@0,100..900;1,100..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  const getFontFamily = (fontKey) => {
    const found = GOOGLE_FONTS.find(f => f.id === fontKey || f.id.toLowerCase() === fontKey?.toLowerCase());
    if (found) return found.family;

    switch (fontKey) {
      case 'serif': return "'Georgia', 'Times New Roman', serif";
      case 'sans': return "'Inter', 'Helvetica', 'Arial', sans-serif";
      case 'cursive': return "'Great Vibes', 'Brush Script MT', cursive";
      case 'mono': return "'Courier New', monospace";
      default: return fontKey || 'sans-serif';
    }
  };

  const updateElementByKeyOrSig = (criteria, textVal, defaultProps) => {
    let updatedEls = [...activeElements].filter(el => {
      if (criteria.sigId && criteria.sigField) {
        return !(el.sigId === criteria.sigId && el.sigField === criteria.sigField);
      }
      if (criteria.key) {
        return el.key !== criteria.key;
      }
      return true;
    });

    if (textVal && textVal.trim() !== '') {
      updatedEls.push({
        id: `field_${criteria.sigId ? `${criteria.sigId}_${criteria.sigField}` : criteria.key}_${Date.now()}`,
        type: 'text',
        ...criteria,
        text: textVal,
        ...defaultProps,
        italic: false,
        underline: false,
        visible: true
      });
    }

    if (currentAwardee.hasCustomLayout) {
      setAwardees(prev => prev.map((a, i) => i === currentAwardeeIdx ? { ...a, customElements: updatedEls } : a));
    } else {
      setElements(updatedEls);
    }

    return updatedEls;
  };

  const handleGlobalDataChange = (key, val) => {
    setGlobalData(prev => ({ ...prev, [key]: val }));
    const defaults = {
      orgName: { x: 50, y: 11, fontSize: 24, font: 'Cinzel', color: '#581c87', bold: true, maxWidth: 85, align: 'center' },
      orgSubtext: { x: 50, y: 16, fontSize: 18, font: 'Inter', color: '#6b7280', bold: false, maxWidth: 80, align: 'center' },
      certificateTitle: { x: 50, y: 25, fontSize: 32, font: 'Playfair Display', color: '#581c87', bold: true, maxWidth: 85, align: 'center' },
      bodyTemplate: { x: 50, y: 55, fontSize: 18, font: 'Cormorant Garamond', color: '#374151', bold: false, maxWidth: 78, align: 'center' },
      dateLine: { x: 50, y: 74, fontSize: 16, font: 'Inter', color: '#6b7280', bold: false, maxWidth: 80, align: 'center' },
    }[key] || { x: 50, y: 50, fontSize: 20, font: 'Inter', color: '#1f2937', bold: false, maxWidth: 80, align: 'center' };

    updateElementByKeyOrSig({ key }, val, defaults);
  };

  const handleAwardeeChange = (field, val) => {
    setAwardees(prev => prev.map((a, i) => {
      if (i === currentAwardeeIdx) {
        const updatedCsvData = { ...(a.csvData || {}), [field === 'name' ? 'Name' : 'Position']: val };
        return { ...a, [field]: val, csvData: updatedCsvData };
      }
      return a;
    }));
    const key = field === 'name' ? 'awardeeName' : 'awardeePosition';
    const defaults = field === 'name' 
      ? { x: 50, y: 36, fontSize: 36, font: 'Great Vibes', color: '#581c87', bold: true, maxWidth: 90, align: 'center' }
      : { x: 50, y: 44, fontSize: 18, font: 'Montserrat', color: '#1f2937', bold: true, maxWidth: 85, align: 'center' };

    updateElementByKeyOrSig({ key }, val, defaults);
  };

  const handleSignatoryChange = (sigId, sigField, val) => {
    if (currentAwardee.hasCustomLayout) {
      const updatedSigs = activeSignatories.map(s => s.id === sigId ? { ...s, [sigField]: val } : s);
      setAwardees(prev => prev.map((a, i) => i === currentAwardeeIdx ? { ...a, customSignatories: updatedSigs } : a));
    } else {
      setSignatories(prev => prev.map(s => s.id === sigId ? { ...s, [sigField]: val } : s));
    }

    const sigIdx = activeSignatories.findIndex(s => s.id === sigId);
    const posX = activeSignatories.length === 1 ? 50 : (sigIdx === 0 ? 30 : 70);
    const defaults = sigField === 'name'
      ? { x: posX, y: 87, fontSize: 18, font: 'Inter', color: '#1f2937', bold: true, maxWidth: 40, align: 'center' }
      : { x: posX, y: 91, fontSize: 14, font: 'Inter', color: '#4b5563', bold: false, maxWidth: 40, align: 'center' };

    updateElementByKeyOrSig({ sigId, sigField }, val, defaults);
  };

  const handleSignatoryImageUpload = (sigId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target.result;
      if (currentAwardee.hasCustomLayout) {
        const updatedSigs = activeSignatories.map(s => s.id === sigId ? { ...s, signatureImg: result } : s);
        setAwardees(prev => prev.map((a, i) => i === currentAwardeeIdx ? { ...a, customSignatories: updatedSigs } : a));
      } else {
        setSignatories(prev => prev.map(s => s.id === sigId ? { ...s, signatureImg: result } : s));
      }
    };
    reader.readAsDataURL(file);
  };

  const projectState = useMemo(() => buildProjectSnapshot({
    bgType, customBg, bgTransform, logoImg, globalData, signatories, awardees, csvHeaders, elements, projectName, canvasSize,
  }), [bgType, customBg, bgTransform, logoImg, globalData, signatories, awardees, csvHeaders, elements, projectName, canvasSize]);

  const { pendingRestore, checkForRestore, applyRestore, discardRestore, formatAutosaveTime } = useAutosaveRestore();
  const { lastSavedAt, isSaving, formatAutosaveTime: formatSaveTime } = useAutoSave(projectState, { enabled: isEditorLaunched && !showRestoreModal });

  const applyProjectState = useMemo(() => getProjectAppliers({
    setBgType,
    setCustomBg,
    setBgTransform,
    setLogoImg,
    setGlobalData,
    setSignatories,
    setAwardees,
    setCsvHeaders,
    setProjectName,
    setCanvasSize,
    setElements,
    setHistory,
    setHistoryIndex,
    fallbacks: { globalData, awardees, signatories },
  }), [globalData, awardees, signatories]);

  useEffect(() => {
    if (!isEditorLaunched || !postLaunchAction) return;
    if (postLaunchAction === 'sample') {
      applyProjectState(SAMPLE_PROJECT);
      markOnboardingComplete();
    } else if (postLaunchAction === 'restore') {
      checkForRestore();
      setShowRestoreModal(true);
    } else if (postLaunchAction === 'onboard') {
      setShowOnboardingWizard(true);
    }
    setPostLaunchAction(null);
  }, [isEditorLaunched, postLaunchAction, applyProjectState, checkForRestore]);

  const handleRestoreProject = () => {
    applyRestore(applyProjectState);
    setShowRestoreModal(false);
  };

  const handleDiscardRestore = () => {
    discardRestore();
    setShowRestoreModal(false);
  };

  const createHistorySnapshot = (nextElements = elements, nextGlobalData = globalData, nextAwardees = awardees, nextSignatories = signatories) => {
    const cleaned = deduplicateElements(nextElements);
    return {
      elements: JSON.parse(JSON.stringify(cleaned)),
      globalData: JSON.parse(JSON.stringify(nextGlobalData)),
      awardees: JSON.parse(JSON.stringify(nextAwardees)),
      signatories: JSON.parse(JSON.stringify(nextSignatories))
    };
  };

  const applySnapshotToState = (snapshot) => {
    setElements(JSON.parse(JSON.stringify(snapshot.elements)));
    setGlobalData(JSON.parse(JSON.stringify(snapshot.globalData)));
    setAwardees(JSON.parse(JSON.stringify(snapshot.awardees)));
    setSignatories(JSON.parse(JSON.stringify(snapshot.signatories)));
  };

  const commitHistorySnapshot = (nextElements = elements, nextGlobalData = globalData, nextAwardees = awardees, nextSignatories = signatories) => {
    if (currentAwardee.hasCustomLayout) return;
    const snapshot = createHistorySnapshot(nextElements, nextGlobalData, nextAwardees, nextSignatories);
    const lastSnapshot = history[historyIndex];
    if (lastSnapshot && JSON.stringify(lastSnapshot) === JSON.stringify(snapshot)) return;
    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push(snapshot);
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
    applySnapshotToState(snapshot);
  };

  const pushHistory = (newElements, nextGlobalData = globalData, nextAwardees = awardees, nextSignatories = signatories) => {
    const snapshot = createHistorySnapshot(newElements, nextGlobalData, nextAwardees, nextSignatories);

    if (currentAwardee.hasCustomLayout) {
      setAwardees(prev => prev.map((a, idx) => idx === currentAwardeeIdx ? { ...a, customElements: snapshot.elements } : a));
    } else {
      const updatedHistory = history.slice(0, historyIndex + 1);
      updatedHistory.push(snapshot);
      setHistory(updatedHistory);
      setHistoryIndex(updatedHistory.length - 1);
      applySnapshotToState(snapshot);
    }
  };

  const handleUndo = () => {
    if (!currentAwardee.hasCustomLayout && historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      applySnapshotToState(history[prevIndex]);
      setEditingElementId(null);
    }
  };

  const handleRedo = () => {
    if (!currentAwardee.hasCustomLayout && historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      applySnapshotToState(history[nextIndex]);
      setEditingElementId(null);
    }
  };

  const applyActiveElementsLive = (updated) => {
    activeElementsRef.current = updated;
    if (currentAwardee.hasCustomLayout) {
      setAwardees(prev => prev.map((a, idx) => (
        idx === currentAwardeeIdx ? { ...a, customElements: updated } : a
      )));
    } else {
      setElements(updated);
    }
  };

  const stripHtml = (html) => {
    if (!html || typeof html !== 'string') return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const getEditableText = (el) => {
    if (!el) return '';
    if (el.key === 'awardeeName') return awardees[currentAwardeeIdx]?.name || '';
    if (el.key === 'awardeePosition') return awardees[currentAwardeeIdx]?.position || '';
    if (el.key && el.key in globalData) return globalData[el.key] || '';
    if (el.sigId) {
      const sig = activeSignatories.find(s => s.id === el.sigId);
      return sig?.[el.sigField] || '';
    }
    if (el.type === 'qrcode') return el.data || '';
    return el.text ?? '';
  };

  const placeCaretAtOffset = (node, offset, selectWord = false) => {
    const sel = window.getSelection();
    if (!sel || !node) return;

    const text = node.textContent || '';
    const safeOffset = offset == null ? 0 : Math.max(0, Math.min(offset, text.length));

    node.focus();

    const textNode = node.firstChild;
    const range = document.createRange();

    if (textNode?.nodeType === Node.TEXT_NODE) {
      range.setStart(textNode, safeOffset);
      range.collapse(true);

      if (selectWord && text.length > 0) {
        let start = safeOffset;
        let end = safeOffset;
        while (start > 0 && /\S/.test(text[start - 1])) start -= 1;
        while (end < text.length && /\S/.test(text[end])) end += 1;
        if (start === end && safeOffset < text.length) {
          end = Math.min(text.length, safeOffset + 1);
        }
        range.setStart(textNode, start);
        range.setEnd(textNode, end);
      }
    } else {
      range.selectNodeContents(node);
      range.collapse(safeOffset > 0);
    }

    sel.removeAllRanges();
    sel.addRange(range);
  };

  const getCaretOffsetFromPoint = (node, x, y) => {
    if (!node) return null;

    let range = null;
    if (typeof document.caretRangeFromPoint === 'function') {
      range = document.caretRangeFromPoint(x, y);
    } else if (typeof document.caretPositionFromPoint === 'function') {
      const pos = document.caretPositionFromPoint(x, y);
      if (pos) {
        range = document.createRange();
        range.setStart(pos.offsetNode, pos.offset);
        range.collapse(true);
      }
    }

    if (!range || !node.contains(range.startContainer)) return null;

    const preRange = document.createRange();
    preRange.selectNodeContents(node);
    preRange.setEnd(range.startContainer, range.startOffset);
    return preRange.toString().length;
  };

  const [selectedIds, setSelectedIds] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [marquee, setMarquee] = useState(null); 
  const dragStartRef = useRef({ clickX: 0, clickY: 0, initialPositions: {} });
  const resizeStartRef = useRef({ startX: 0, startWidth: 50, startElementWidth: 180 });
  const pendingEditRef = useRef(null);
  const editingNodeRef = useRef(null);

  useEffect(() => {
    if (!editingElementId) return;

    const pending = pendingEditRef.current;
    if (!pending || pending.elementId !== editingElementId) return;

    pendingEditRef.current = null;
    let cancelled = false;

    const initEditor = () => {
      if (cancelled) return;
      const node = editingNodeRef.current;
      if (!node) return;

      node.textContent = pending.text;
      placeCaretAtOffset(node, pending.caretOffset, pending.selectWord);
    };

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(initEditor);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [editingElementId]);

  const [canvasScale, setCanvasScale] = useState(1);
  const [zoomMultiplier, setZoomMultiplier] = useState(1);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imageUploadRef = useRef(null);

  const TEXT_STYLE_KEYS = ['font', 'fontSize', 'color', 'bold', 'italic', 'underline', 'align', 'maxWidth'];

  const {
    isExporting,
    exportProgress,
    exportStatusLabel,
    executeBatchZipExport,
    exportAllToSinglePDF,
    exportTestPdf,
    cancelExport,
  } = useCertificateExport({
    canvasRef,
    canvasSize,
    exportScale,
    awardees,
    projectName,
    currentAwardeeIdx,
    setCurrentAwardeeIdx,
    setSelectedIds,
  });

  const exportSummary = useMemo(() => getExportSummary({
    canvasSize,
    awardeeCount: exportMode === 'all' ? awardees.length : selectedExportIndices.length,
    exportScale,
    exportFormat,
  }), [canvasSize, exportMode, awardees.length, selectedExportIndices.length, exportScale, exportFormat]);

  const exportEstimate = useMemo(() => estimateExport({
    count: exportMode === 'all' ? awardees.length : selectedExportIndices.length,
    canvasSize,
    exportScale,
    exportFormat,
  }), [canvasSize, exportMode, awardees.length, selectedExportIndices.length, exportScale, exportFormat]);

  const awardeeValidation = useMemo(() => validateAwardees(awardees), [awardees]);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      const targetWidth = canvasSize.width;
      const targetHeight = canvasSize.height;

      if (isPreviewMode) {
        const padding = 32;
        const scaleX = (clientWidth - padding) / targetWidth;
        const scaleY = (clientHeight - padding) / targetHeight;
        setPreviewFitScale(Math.max(0.2, Math.min(scaleX, scaleY, 3)));
        return;
      }

      const padding = 48;
      const scaleX = (clientWidth - padding) / targetWidth;
      const scaleY = (clientHeight - padding) / targetHeight;
      setCanvasScale(Math.min(scaleX, scaleY, 1));
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => {
      window.removeEventListener('resize', updateScale);
      observer.disconnect();
    };
  }, [canvasSize, isPreviewMode]);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1280px)');
    const handleChange = (event) => {
      if (!event.matches) setIsSidebarCollapsed(false);
    };
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  const enterPreviewMode = () => {
    setSelectedIds([]);
    setEditingElementId(null);
    setIsPreviewMode(true);
  };

  const exitPreviewMode = () => {
    setIsPreviewMode(false);
  };

  const zoomIn = () => setZoomMultiplier(prev => Math.min(2.5, +(prev + 0.1).toFixed(2)));
  const zoomOut = () => setZoomMultiplier(prev => Math.max(0.4, +(prev - 0.1).toFixed(2)));
  const resetZoom = () => setZoomMultiplier(1);
  const displayScale = isPreviewMode ? previewFitScale : canvasScale * zoomMultiplier;
  const getCanvasRectScale = () => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect?.width) return displayScale;
    return rect.width / canvasSize.width;
  };

  const selectAllElements = () => {
    setSelectedIds(activeElements.map(el => el.id));
  };

  const getElementBounds = (el) => {
    let widthPct = 10;
    if (el.type === 'text') {
      widthPct = el.maxWidth || 50;
    } else if (el.type === 'line' || el.type === 'logo' || el.type === 'image') {
      widthPct = ((el.width || 100) / canvasSize.width) * 100;
    } else if (el.type === 'qrcode') {
      widthPct = ((el.size || 100) / canvasSize.width) * 100;
    }

    const anchor = el.type === 'logo' || el.type === 'image' || el.align === 'center'
      ? 'center'
      : (el.type === 'text' && el.align === 'right' ? 'right' : 'left');
    let left, center, right;

    if (anchor === 'center') {
      center = el.x;
      left = el.x - widthPct / 2;
      right = el.x + widthPct / 2;
    } else if (anchor === 'right') {
      right = el.x;
      left = el.x - widthPct;
      center = el.x - widthPct / 2;
    } else {
      left = el.x;
      center = el.x + widthPct / 2;
      right = el.x + widthPct;
    }
    return { widthPct, anchor, isCentered: anchor === 'center', left, center, right, y: el.y };
  };

  const handleAlign = (type) => {
    if (selectedIds.length === 0) return;
    const selectedEls = activeElements.filter(el => selectedIds.includes(el.id));
    if (selectedEls.length === 0) return;

    const boundsList = selectedEls.map(el => ({ el, ...getElementBounds(el) }));

    let targetVal = 0;
    if (selectedEls.length === 1) {
      if (type === 'left') targetVal = 10;
      else if (type === 'center') targetVal = 50;
      else if (type === 'right') targetVal = 90;
    } else {
      if (type === 'left') {
        targetVal = Math.min(...boundsList.map(b => b.left));
      } else if (type === 'center') {
        const sum = boundsList.reduce((acc, b) => acc + b.center, 0);
        targetVal = sum / boundsList.length;
      } else if (type === 'right') {
        targetVal = Math.max(...boundsList.map(b => b.right));
      }
    }

    const updated = activeElements.map(item => {
      const match = boundsList.find(b => b.el.id === item.id);
      if (!match) return item;

      let newX = item.x;
      if (type === 'left') {
        if (match.anchor === 'center') newX = targetVal + match.widthPct / 2;
        else if (match.anchor === 'right') newX = targetVal;
        else newX = targetVal;
      } else if (type === 'center') {
        if (match.anchor === 'center') newX = targetVal;
        else if (match.anchor === 'right') newX = targetVal + match.widthPct / 2;
        else newX = targetVal - match.widthPct / 2;
      } else if (type === 'right') {
        if (match.anchor === 'center') newX = targetVal - match.widthPct / 2;
        else if (match.anchor === 'right') newX = targetVal;
        else newX = targetVal - match.widthPct;
      }

      newX = Math.max(2, Math.min(98, newX));
      return { ...item, x: newX };
    });

    pushHistory(updated);
  };

  const handleDistribute = (direction) => {
    if (selectedIds.length < 3) return;
    const selectedEls = activeElements.filter(el => selectedIds.includes(el.id));
    if (selectedEls.length < 3) return;

    const boundsList = selectedEls.map(el => ({ el, ...getElementBounds(el) }));

    if (direction === 'horizontal') {
      boundsList.sort((a, b) => a.center - b.center);
      const minC = boundsList[0].center;
      const maxC = boundsList[boundsList.length - 1].center;
      const step = (maxC - minC) / (boundsList.length - 1);

      const updated = activeElements.map(item => {
        const matchIdx = boundsList.findIndex(b => b.el.id === item.id);
        if (matchIdx === -1) return item;

        const targetCenter = minC + matchIdx * step;
        const b = boundsList[matchIdx];
        let newX;
        if (b.anchor === 'center') newX = targetCenter;
        else if (b.anchor === 'right') newX = targetCenter + b.widthPct / 2;
        else newX = targetCenter - b.widthPct / 2;
        newX = Math.max(2, Math.min(98, newX));
        return { ...item, x: newX };
      });
      pushHistory(updated);
    } else if (direction === 'vertical') {
      boundsList.sort((a, b) => a.y - b.y);
      const minY = boundsList[0].y;
      const maxY = boundsList[boundsList.length - 1].y;
      const step = (maxY - minY) / (boundsList.length - 1);

      const updated = activeElements.map(item => {
        const matchIdx = boundsList.findIndex(b => b.el.id === item.id);
        if (matchIdx === -1) return item;

        let newY = minY + matchIdx * step;
        newY = Math.max(2, Math.min(98, newY));
        return { ...item, y: newY };
      });
      pushHistory(updated);
    }
  };

  const moveLayerOrder = (index, direction) => {
    const els = [...activeElements];
    const targetIndex = direction === 'up' ? index + 1 : index - 1;
    if (targetIndex < 0 || targetIndex >= els.length) return;
    const temp = els[index];
    els[index] = els[targetIndex];
    els[targetIndex] = temp;
    pushHistory(els);
  };

  const toggleLayerVisibility = (id) => {
    const updated = activeElements.map(el => el.id === id ? { ...el, visible: el.visible === false ? true : false } : el);
    pushHistory(updated);
  };

  const toggleAwardeeCustomLayout = (idx) => {
    setAwardees(prev => prev.map((a, i) => {
      if (i === idx) {
        const nextCustomState = !a.hasCustomLayout;
        return {
          ...a,
          hasCustomLayout: nextCustomState,
          customElements: nextCustomState ? JSON.parse(JSON.stringify(elements)) : null,
          customSignatories: nextCustomState ? JSON.parse(JSON.stringify(signatories)) : null
        };
      }
      return a;
    }));
  };

  const handleNewProject = () => {
    if (window.confirm('Create a new blank certificate project? All fields will be blank.')) {
      const blankGlobalData = { orgName: '', orgSubtext: '', dateLine: '', certificateTitle: '', eventDuties: '', bodyTemplate: '' };
      const blankAwardees = [{ id: '1', name: '', position: '', csvData: { Name: '', Position: '' }, hasCustomLayout: false, customElements: null, customSignatories: null }];
      setGlobalData(blankGlobalData);
      setSignatories([{ id: 'sig_1', name: '', title: '', signatureImg: null }]);
      setElements([]);
      setHistory([{ elements: [], globalData: blankGlobalData, awardees: blankAwardees, signatories: [{ id: 'sig_1', name: '', title: '', signatureImg: null }] }]);
      setHistoryIndex(0);
      setAwardees(blankAwardees);
      setCsvHeaders(['Name', 'Position']);
      setCurrentAwardeeIdx(0);
      setProjectName('Blank_BatchCert_Project');
      setCustomBg(null);
      setLogoImg(null);
      clearAutosaveProject();
    }
  };

  const handleSaveProject = () => {
    const projectState = { bgType, customBg, bgTransform, logoImg, globalData, signatories, awardees, csvHeaders, elements, projectName, canvasSize };
    const blob = new Blob([JSON.stringify(projectState, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectName || 'batchcert_project'}.json`;
    link.click();
    URL.revokeObjectURL(url);
    alert(`Project "${projectName}" saved successfully!`);
  };

  const handleLoadProjectFromFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const state = JSON.parse(event.target.result);
        applyProjectState(state);
        alert('Project loaded successfully from file!');
      } catch (err) {
        alert('Failed to load project file. Invalid format.');
      }
    };
    reader.readAsText(file);
  };

  const handleSaveLayoutTemplate = () => {
    const layoutTemplate = {
      templateName: prompt('Enter layout template name:', 'Standard_Layout_Template') || 'Custom_Layout_Template',
      elements,
      signatories,
      bgType,
      bgTransform,
      logoImg,
      canvasSize
    };
    const blob = new Blob([JSON.stringify(layoutTemplate, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${layoutTemplate.templateName}.json`;
    link.click();
    URL.revokeObjectURL(url);
    alert('Layout template saved successfully!');
  };

  const handleLoadLayoutTemplateFromFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const state = JSON.parse(event.target.result);
        if (state.elements) {
          const cleaned = deduplicateElements(state.elements);
          setElements(cleaned);
          setHistory([{
            elements: cleaned,
            globalData,
            awardees
          }]);
          setHistoryIndex(0);
        }
        if (state.signatories) setSignatories(state.signatories);
        if (state.bgType) setBgType(state.bgType);
        if (state.bgTransform) setBgTransform(state.bgTransform);
        if (state.logoImg !== undefined) setLogoImg(state.logoImg);
        if (state.canvasSize) setCanvasSize(state.canvasSize);
        alert('Layout template applied successfully!');
      } catch (err) {
        alert('Failed to load layout template file.');
      }
    };
    reader.readAsText(file);
  };

  const updateSelectedElement = (key, value) => {
    const activeId = selectedIds[selectedIds.length - 1];
    if (!activeId) return;
    const updated = activeElements.map(el => el.id === activeId ? { ...el, [key]: value } : el);
    pushHistory(updated);
  };

  const normalizeQrTemplate = (data) =>
    String(data || '').replace(/(\{\{\s*[^}]+\s*\}\})(?:\s*\1)+/gi, '$1');

  const updateSelectedElementLive = (key, value) => {
    const activeId = selectedIds[selectedIds.length - 1];
    if (!activeId) return;
    const updated = activeElements.map(el => el.id === activeId ? { ...el, [key]: value } : el);
    applyActiveElementsLive(updated);
  };

  const handleTextAlign = (alignValue) => {
    if (selectedIds.length !== 1) return;
    const el = activeElements.find(e => e.id === selectedIds[selectedIds.length - 1]);
    if (!el || el.type !== 'text') return;
    updateSelectedElement('align', alignValue);
  };

  const deleteSelectedElements = () => {
    if (selectedIds.length === 0) return;

    const deletedElements = activeElements.filter(el => selectedIds.includes(el.id));
    const updatedElements = activeElements.filter(el => !selectedIds.includes(el.id));

    setEditingElementId(null);

    const builtInAwardeeKeys = new Set(['orgName', 'orgSubtext', 'certificateTitle', 'bodyTemplate', 'dateLine', 'awardeeName', 'awardeePosition']);
    const globalDataReset = {};
    let shouldClearAwardeeName = false;
    let shouldClearAwardeePosition = false;
    const customCsvClears = new Set();
    const customSigClears = {};
    const globalSigClears = {};

    deletedElements.forEach(el => {
      if (el.key) {
        if (el.key === 'awardeeName') {
          shouldClearAwardeeName = true;
        } else if (el.key === 'awardeePosition') {
          shouldClearAwardeePosition = true;
        } else if (el.key in globalData) {
          globalDataReset[el.key] = '';
        } else if (!builtInAwardeeKeys.has(el.key)) {
          // Clear custom awardee CSV data entries when the matching element is deleted
          customCsvClears.add(el.key);
        }
      }

      if (el.sigId && el.sigField) {
        if (currentAwardee.hasCustomLayout) {
          customSigClears[el.sigId] = customSigClears[el.sigId] || new Set();
          customSigClears[el.sigId].add(el.sigField);
        } else {
          globalSigClears[el.sigId] = globalSigClears[el.sigId] || new Set();
          globalSigClears[el.sigId].add(el.sigField);
        }
      }
    });

    if (Object.keys(globalDataReset).length > 0) {
      setGlobalData(prev => ({ ...prev, ...globalDataReset }));
    }

    if (shouldClearAwardeeName || shouldClearAwardeePosition || customCsvClears.size > 0) {
      setAwardees(prev => prev.map((a, idx) => {
        if (idx !== currentAwardeeIdx) return a;
        const updatedCsv = { ...(a.csvData || {}) };
        const updatedAwardee = { ...a };

        if (shouldClearAwardeeName) {
          updatedAwardee.name = '';
          updatedCsv.Name = '';
        }
        if (shouldClearAwardeePosition) {
          updatedAwardee.position = '';
          updatedCsv.Position = '';
        }

        customCsvClears.forEach(csvKey => {
          if (csvKey in updatedCsv) {
            updatedCsv[csvKey] = '';
          }
        });

        return { ...updatedAwardee, csvData: updatedCsv };
      }));
    }

    if (currentAwardee.hasCustomLayout && Object.keys(customSigClears).length > 0) {
      setAwardees(prev => prev.map((a, idx) => {
        if (idx !== currentAwardeeIdx) return a;
        const updatedSigs = (a.customSignatories || []).map(sig => {
          if (!customSigClears[sig.id]) return sig;
          const fields = Array.from(customSigClears[sig.id]);
          const nextSig = { ...sig };
          fields.forEach(field => { nextSig[field] = ''; });
          return nextSig;
        });
        return { ...a, customSignatories: updatedSigs };
      }));
    }

    if (!currentAwardee.hasCustomLayout && Object.keys(globalSigClears).length > 0) {
      setSignatories(prev => prev.map(sig => {
        if (!globalSigClears[sig.id]) return sig;
        const nextSig = { ...sig };
        Array.from(globalSigClears[sig.id]).forEach(field => { nextSig[field] = ''; });
        return nextSig;
      }));
    }

    pushHistory(updatedElements);
    setSelectedIds([]);
  };

  const duplicateSelectedElements = () => {
    if (selectedIds.length === 0) return;
    const toDuplicate = activeElements.filter(el => selectedIds.includes(el.id));
    const duplicated = toDuplicate.map((el, idx) => ({
      ...JSON.parse(JSON.stringify(el)),
      id: `${el.type}_dup_${Date.now()}_${idx}`,
      x: Math.min(96, el.x + 3),
      y: Math.min(96, el.y + 3),
      locked: false,
    }));
    const updated = [...activeElements, ...duplicated];
    pushHistory(updated);
    setSelectedIds(duplicated.map(el => el.id));
  };

  const toggleLockSelected = () => {
    if (selectedIds.length === 0) return;
    const anyUnlocked = activeElements.some(el => selectedIds.includes(el.id) && !el.locked);
    const updated = activeElements.map(el =>
      selectedIds.includes(el.id) ? { ...el, locked: anyUnlocked } : el
    );
    pushHistory(updated);
  };

  const copyTextStyle = () => {
    const activeId = selectedIds[selectedIds.length - 1];
    const el = activeElements.find(item => item.id === activeId);
    if (!el || el.type !== 'text') return;
    const style = TEXT_STYLE_KEYS.reduce((acc, key) => ({ ...acc, [key]: el[key] }), {});
    setCopiedTextStyle(style);
  };

  const pasteTextStyle = () => {
    if (!copiedTextStyle) return;
    const updated = activeElements.map(el => {
      if (selectedIds.includes(el.id) && el.type === 'text') {
        return { ...el, ...copiedTextStyle };
      }
      return el;
    });
    pushHistory(updated);
  };

  const handleBulkEditSave = (rows) => {
    const editHeaders = getBulkEditHeaders(csvHeaders, awardees);
    const updatedAwardees = bulkEditRowsToAwardees(rows, editHeaders, awardees);
    if (updatedAwardees.length === 0) {
      alert('Add at least one awardee with a name or other field.');
      return false;
    }

    const newElements = ensureAwardeeFieldElements(activeElements, editHeaders);
    const nextElements = newElements.length ? [...activeElements, ...newElements] : activeElements;
    const addedCount = updatedAwardees.length - awardees.length;
    const nextIdx = addedCount > 0
      ? updatedAwardees.length - 1
      : Math.min(currentAwardeeIdx, updatedAwardees.length - 1);

    setCsvHeaders(editHeaders);

    if (currentAwardee.hasCustomLayout) {
      setAwardees(updatedAwardees.map((awardee, idx) => {
        if (idx !== currentAwardeeIdx || newElements.length === 0) return awardee;
        return {
          ...awardee,
          customElements: [...(awardee.customElements || activeElements), ...newElements],
        };
      }));
      setCurrentAwardeeIdx(nextIdx);
      setSidebarPage(Math.floor(nextIdx / itemsPerPage));
      return true;
    }

    if (newElements.length) {
      pushHistory(nextElements, globalData, updatedAwardees, signatories);
    } else {
      commitHistorySnapshot(elements, globalData, updatedAwardees, signatories);
    }

    setCurrentAwardeeIdx(nextIdx);
    setSidebarPage(Math.floor(nextIdx / itemsPerPage));
    return true;
  };

  const addImageElement = (src) => {
    const newEl = {
      id: `custom_image_${Date.now()}`,
      type: 'image',
      label: 'Image / Seal',
      src,
      x: 50,
      y: 40,
      width: 120,
      visible: true,
    };
    const updated = [...activeElements, newEl];
    pushHistory(updated);
    setSelectedIds([newEl.id]);
  };

  const handleImageElementUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = (event) => addImageElement(event.target.result);
    reader.readAsDataURL(file);
  };

  const exportAwardeesCsv = () => {
    const escapeCell = (value) => {
      const text = String(value ?? '');
      if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
      return text;
    };

    const rows = awardees.map((awardee) =>
      csvHeaders.map((header) => {
        if (header === 'Name') return escapeCell(awardee.name);
        if (header === 'Position') return escapeCell(awardee.position);
        return escapeCell(awardee.csvData?.[header] ?? '');
      }).join(',')
    );

    const csvContent = [csvHeaders.map(escapeCell).join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectName || 'BatchCert'}_awardees.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const primarySelectedElement = activeElements.find(el => el.id === selectedIds[selectedIds.length - 1]);

  const addTextElement = () => {
    const newEl = {
      id: `custom_text_${Date.now()}`,
      type: 'text',
      text: 'Custom Text Block',
      label: 'Custom Text',
      x: 50,
      y: 50,
      fontSize: 20,
      font: 'Inter',
      color: '#1f2937',
      align: 'center',
      bold: false,
      italic: false,
      underline: false,
      maxWidth: 50,
      visible: true
    };
    const updated = [...activeElements, newEl];
    pushHistory(updated);
    setSelectedIds([newEl.id]);
  };

  const addLineElement = () => {
    const newEl = {
      id: `custom_line_${Date.now()}`,
      type: 'line',
      label: 'Custom Line',
      x: 50,
      y: 80,
      width: 180,
      height: 2,
      color: '#1f2937',
      lineStyle: 'solid',
      visible: true
    };
    const updated = [...activeElements, newEl];
    pushHistory(updated);
    setSelectedIds([newEl.id]);
  };

  const addQRCodeElement = () => {
    const newEl = {
      id: `custom_qr_${Date.now()}`,
      type: 'qrcode',
      label: 'QR Code',
      x: 85,
      y: 78,
      size: 90,
      data: 'https://batchcert.verify/cert/',
      visible: true
    };
    const updated = [...activeElements, newEl];
    pushHistory(updated);
    setSelectedIds([newEl.id]);
  };

  const getLineElementStyle = (el) => ({
    width: '100%',
    height: 0,
    border: 'none',
    borderTop: `${Math.max(1, el.height || 2)}px ${el.lineStyle || 'solid'} ${el.color || '#1f2937'}`,
  });

  const LINE_STYLE_OPTIONS = [
    { value: 'solid', label: 'Solid' },
    { value: 'dashed', label: 'Dashed' },
    { value: 'dotted', label: 'Dotted' },
    { value: 'double', label: 'Double' },
  ];

  const insertTagIntoCanvas = (tagName) => {
    const tagPlaceholder = `{{${tagName}}}`;
    const tagAlreadyPresent = (text) => {
      const pattern = new RegExp(`\\{\\{\\s*${tagName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\}\\}`, 'i');
      return pattern.test(text || '');
    };

    if (selectedIds.length === 1 && primarySelectedElement && primarySelectedElement.type === 'text') {
      const currentText = primarySelectedElement.text || '';
      if (tagAlreadyPresent(currentText)) return;
      updateSelectedElement('text', `${currentText} ${tagPlaceholder}`.trim());
    } else if (selectedIds.length === 1 && primarySelectedElement && primarySelectedElement.type === 'qrcode') {
      const currentData = primarySelectedElement.data || '';
      if (tagAlreadyPresent(currentData)) return;
      updateSelectedElement('data', `${currentData}${tagPlaceholder}`.trim());
    } else {
      const newEl = {
        id: `custom_tag_${Date.now()}`,
        type: 'text',
        text: tagPlaceholder,
        label: `Field: ${tagName}`,
        x: 50,
        y: 50,
        fontSize: 20,
        font: 'Inter',
        color: '#1f2937',
        align: 'center',
        bold: false,
        italic: false,
        underline: false,
        maxWidth: 50,
        visible: true
      };
      const updated = [...activeElements, newEl];
      pushHistory(updated);
      setSelectedIds([newEl.id]);
    }
  };

  const applyTextFormat = (formatType) => {
    if (editingElementId) {
      document.execCommand(formatType, false, null);
    } else if (selectedIds.length === 1 && primarySelectedElement && primarySelectedElement.type === 'text') {
      if (formatType === 'bold') updateSelectedElement('bold', !primarySelectedElement.bold);
      if (formatType === 'italic') updateSelectedElement('italic', !primarySelectedElement.italic);
      if (formatType === 'underline') updateSelectedElement('underline', !primarySelectedElement.underline);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName;
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag);
      const isEditingInline = document.activeElement?.isContentEditable;

      if (isInput || isEditingInline) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveProject();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        if (isInput || isEditingInline) return;
        e.preventDefault();
        selectAllElements();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        applyTextFormat('bold');
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        applyTextFormat('italic');
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        applyTextFormat('underline');
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        duplicateSelectedElements();
        return;
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length > 0) {
        if (isInput || isEditingInline) return;
        e.preventDefault();
        deleteSelectedElements();
        return;
      }

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        if (isInput || isEditingInline) return;
        if (selectedIds.length === 0) return;
        e.preventDefault();

        const step = e.shiftKey ? 2.0 : 0.5;
        let dx = 0;
        let dy = 0;

        if (e.key === 'ArrowUp') dy = -step;
        if (e.key === 'ArrowDown') dy = step;
        if (e.key === 'ArrowLeft') dx = -step;
        if (e.key === 'ArrowRight') dx = step;

        const updated = activeElements.map(el => {
          if (selectedIds.includes(el.id)) {
            let newX = Math.max(2, Math.min(98, el.x + dx));
            let newY = Math.max(2, Math.min(98, el.y + dy));
            return { ...el, x: newX, y: newY };
          }
          return el;
        });

        applyActiveElementsLive(updated);
        arrowNudgeActiveRef.current = true;
        return;
      }
    };

    const handleKeyUp = (e) => {
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      if (!arrowNudgeActiveRef.current) return;
      arrowNudgeActiveRef.current = false;
      pushHistory(activeElementsRef.current);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedIds, historyIndex, history, currentAwardeeIdx, currentAwardee.hasCustomLayout, activeElements, projectName, editingElementId]);

  const getRenderedText = (element, awardee = {}) => {
    const rawText = typeof element?.text === 'string' ? element.text : '';
    if (typeof rawText !== 'string' || rawText.indexOf('{{') === -1) {
      return rawText || '';
    }

    return rawText.replace(/\{\{\s*([^}]+)\s*\}\}/g, (match, keyName) => {
      const trimmedKey = keyName.trim();
      if (!trimmedKey) return match;
      if (trimmedKey.toLowerCase() === 'duties') return globalData.eventDuties || '';
      if (trimmedKey.toLowerCase() === 'name') return awardee.name || '';
      if (trimmedKey.toLowerCase() === 'position') return awardee.position || '';

      if (awardee.csvData) {
        if (awardee.csvData[trimmedKey] !== undefined) return awardee.csvData[trimmedKey];
        const matchedKey = Object.keys(awardee.csvData).find(k => k.toLowerCase() === trimmedKey.toLowerCase());
        if (matchedKey) return awardee.csvData[matchedKey] || '';
      }

      if (awardee[trimmedKey] !== undefined) return awardee[trimmedKey];
      return match;
    });
  };

  const getElementText = (el) => {
    let rawText = '';
    if (el.sigId) {
      const sig = activeSignatories.find(s => s.id === el.sigId);
      if (sig) rawText = sig[el.sigField] || '';
    } else if (el.type === 'qrcode') {
      rawText = el.data || '';
    } else if (el.text !== undefined && el.text !== null && !el.key) {
      rawText = el.text;
    } else {
      const currentAwardeeObj = awardees[currentAwardeeIdx] || { name: '', position: '' };
      switch (el.key) {
        case 'orgName': rawText = globalData.orgName || ''; break;
        case 'orgSubtext': rawText = globalData.orgSubtext || ''; break;
        case 'certificateTitle': rawText = globalData.certificateTitle || ''; break;
        case 'bodyTemplate': {
          const template = globalData.bodyTemplate || '';
          const duties = globalData.eventDuties || '';
          rawText = template.includes('{{duties}}') ? template.replace(/\{\{duties\}\}/g, duties) : template;
          break;
        }
        case 'dateLine': rawText = globalData.dateLine || ''; break;
        case 'awardeeName': rawText = currentAwardeeObj.name || ''; break;
        case 'awardeePosition': rawText = currentAwardeeObj.position || ''; break;
        default: rawText = el.text || ''; break;
      }
    }

    const currentAwardeeObj = awardees[currentAwardeeIdx] || {};
    return getRenderedText({ text: typeof rawText === 'string' ? rawText : '' }, currentAwardeeObj);
  };

  const saveInlineEdit = (el, val) => {
    setEditingElementId(null);
    const cleanVal = stripHtml(val);

    if (el.key === 'awardeeName') {
      const updatedAwardees = awardees.map((a, idx) => {
        if (idx === currentAwardeeIdx) {
          return { ...a, name: cleanVal, csvData: { ...(a.csvData || {}), Name: cleanVal } };
        }
        return a;
      });
      setAwardees(updatedAwardees);
      commitHistorySnapshot(elements, globalData, updatedAwardees, signatories);
      return;
    }

    if (el.key === 'awardeePosition') {
      const updatedAwardees = awardees.map((a, idx) => {
        if (idx === currentAwardeeIdx) {
          return { ...a, position: cleanVal, csvData: { ...(a.csvData || {}), Position: cleanVal } };
        }
        return a;
      });
      setAwardees(updatedAwardees);
      commitHistorySnapshot(elements, globalData, updatedAwardees, signatories);
      return;
    }

    if (el.key) {
      const updatedGlobalData = { ...globalData, [el.key]: cleanVal };
      const updatedElements = updateElementByKeyOrSig({ key: el.key }, cleanVal, {
        x: el.x || 50,
        y: el.y || 50,
        fontSize: el.fontSize || 20,
        font: el.font || 'Inter',
        color: el.color || '#1f2937',
        bold: el.bold || false,
        maxWidth: el.maxWidth || 80,
        align: el.align || 'center'
      });
      setGlobalData(updatedGlobalData);
      setElements(updatedElements);
      commitHistorySnapshot(updatedElements, updatedGlobalData, awardees, signatories);
      return;
    }

    if (el.sigId) {
      const updatedSignatories = activeSignatories.map(s => s.id === el.sigId ? { ...s, [el.sigField]: cleanVal } : s);
      if (currentAwardee.hasCustomLayout) {
        setAwardees(prev => prev.map((a, idx) => idx === currentAwardeeIdx ? { ...a, customSignatories: updatedSignatories } : a));
      } else {
        setSignatories(updatedSignatories);
      }
      commitHistorySnapshot(elements, globalData, awardees, updatedSignatories);
      return;
    }

    const updated = activeElements.map(item => item.id === el.id ? { ...item, text: cleanVal } : item);
    pushHistory(updated);
  };

  const handleCanvasPointerDown = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setMarquee({ startX: x, startY: y, currentX: x, currentY: y });
    if (!e.shiftKey) setSelectedIds([]);
  };

  const handleElementPointerDown = (e, id) => {
    if (editingElementId === id) return;
    e.stopPropagation();
    setMarquee(null);
    const targetEl = activeElements.find(el => el.id === id);
    let newSelectedIds = [...selectedIds];

    if (e.shiftKey) {
      if (newSelectedIds.includes(id)) newSelectedIds = newSelectedIds.filter(i => i !== id);
      else newSelectedIds.push(id);
    } else {
      if (!newSelectedIds.includes(id)) newSelectedIds = [id];
    }

    setSelectedIds(newSelectedIds);

    if (targetEl?.locked) return;

    setIsDragging(true);

    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const clickX = ((e.clientX - rect.left) / rect.width) * 100;
      const clickY = ((e.clientY - rect.top) / rect.height) * 100;

      const initialPosMap = {};
      activeElements.forEach(el => {
        if (newSelectedIds.includes(el.id)) {
          initialPosMap[el.id] = { x: el.x, y: el.y };
        }
      });

      dragStartRef.current = { clickX, clickY, initialPositions: initialPosMap };
    }
  };

  const handlePointerMove = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const currX = ((e.clientX - rect.left) / rect.width) * 100;
    const currY = ((e.clientY - rect.top) / rect.height) * 100;

    if (activeDraggingGuide) {
      const { type, index } = activeDraggingGuide;
      const canvasRect = canvasRef.current.getBoundingClientRect();
      if (type === 'horizontal') {
        const yPct = Math.max(0, Math.min(100, ((e.clientY - canvasRect.top) / canvasRect.height) * 100));
        setGuides(prev => {
          const next = [...prev.horizontal];
          next[index] = yPct;
          return { ...prev, horizontal: next };
        });
      } else {
        const xPct = Math.max(0, Math.min(100, ((e.clientX - canvasRect.left) / canvasRect.width) * 100));
        setGuides(prev => {
          const next = [...prev.vertical];
          next[index] = xPct;
          return { ...prev, vertical: next };
        });
      }
      return;
    }

    if (marquee) {
      setMarquee({ ...marquee, currentX: currX, currentY: currY });
      return;
    }

    if (isResizing && selectedIds.length === 1) {
      const el = activeElements.find(item => item.id === selectedIds[0]);
      if (el) {
        const dx = e.clientX - resizeStartRef.current.startX;
        if (el.type === 'text') {
          const displayWidth = canvasRef.current?.getBoundingClientRect().width || canvasSize.width * displayScale;
          const deltaPercent = (dx / displayWidth) * 100;
          const newMaxWidth = Math.max(15, Math.min(100, resizeStartRef.current.startWidth + deltaPercent));
          const updated = activeElements.map(item => item.id === el.id ? { ...item, maxWidth: newMaxWidth } : item);
          applyActiveElementsLive(updated);
        } else if (el.type === 'line' || el.type === 'logo' || el.type === 'image') {
          const logicalScale = getCanvasRectScale();
          const newWidth = Math.max(30, resizeStartRef.current.startElementWidth + dx / logicalScale);
          const updated = activeElements.map(item => item.id === el.id ? { ...item, width: newWidth } : item);
          applyActiveElementsLive(updated);
        } else if (el.type === 'qrcode') {
          const logicalScale = getCanvasRectScale();
          const newSize = Math.max(50, Math.min(300, (resizeStartRef.current.startElementWidth || 90) + dx / logicalScale));
          const updated = activeElements.map(item => item.id === el.id ? { ...item, size: newSize } : item);
          applyActiveElementsLive(updated);
        }
      }
      return;
    }

    if (!isDragging || selectedIds.length === 0) return;

    const deltaX = currX - dragStartRef.current.clickX;
    const deltaY = currY - dragStartRef.current.clickY;

    let isNearCenterX = false;
    let isNearCenterY = false;

    // Multi-element group dragging support
    const updated = activeElements.map(el => {
      if (selectedIds.includes(el.id) && dragStartRef.current.initialPositions[el.id]) {
        if (el.locked) return el;

        const init = dragStartRef.current.initialPositions[el.id];
        let newX = init.x + deltaX;
        let newY = init.y + deltaY;

        if (selectedIds.length === 1) {
          if (Math.abs(newX - 50) < 1.0) {
            newX = 50;
            isNearCenterX = true;
          }
          if (Math.abs(newY - 50) < 1.0) {
            newY = 50;
            isNearCenterY = true;
          }

          if (showGuides) {
            for (const gx of guides.vertical) {
              if (Math.abs(newX - gx) < 1.0) {
                newX = gx;
                isNearCenterX = true;
                break;
              }
            }
            for (const gy of guides.horizontal) {
              if (Math.abs(newY - gy) < 1.0) {
                newY = gy;
                isNearCenterY = true;
                break;
              }
            }
          }
        }

        newX = Math.max(2, Math.min(98, newX));
        newY = Math.max(2, Math.min(98, newY));
        return { ...el, x: newX, y: newY };
      }
      return el;
    });

    setSnapStatus({ x: isNearCenterX, y: isNearCenterY });
    applyActiveElementsLive(updated);
  };

  const handlePointerUp = () => {
    if (activeDraggingGuide) {
      const { type, index } = activeDraggingGuide;
      setGuides(prev => {
        const list = [...prev[type]];
        const val = list[index];
        if (val < 0 || val > 100) {
          list.splice(index, 1);
        }
        return { ...prev, [type]: list };
      });
      setActiveDraggingGuide(null);
    }

    if (marquee) {
      const minX = Math.min(marquee.startX, marquee.currentX);
      const maxX = Math.max(marquee.startX, marquee.currentX);
      const minY = Math.min(marquee.startY, marquee.currentY);
      const maxY = Math.max(marquee.startY, marquee.currentY);

      if (Math.abs(maxX - minX) > 0.5 || Math.abs(maxY - minY) > 0.5) {
        const selectedInBox = activeElements.filter(el => {
          return el.x >= minX && el.x <= maxX && el.y >= minY && el.y <= maxY;
        }).map(el => el.id);

        if (selectedInBox.length > 0) {
          setSelectedIds(prev => Array.from(new Set([...prev, ...selectedInBox])));
        }
      }
    }

    const wasTransforming = isDragging || isResizing;
    if (wasTransforming) {
      pushHistory(activeElementsRef.current);
    }

    setIsDragging(false);
    setIsResizing(false);
    setMarquee(null);
    setSnapStatus({ x: false, y: false });
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target.result;
      if (type === 'background') {
        setCustomBg(result);
        setBgType('custom');
      } else if (type === 'logo') {
        setLogoImg(result);
        let updated = [...activeElements];
        const logoIdx = updated.findIndex(el => el.id === 'logo');
        if (logoIdx === -1) {
          updated.push({
            id: 'logo',
            type: 'logo',
            label: 'Institution Logo',
            x: 50,
            y: 8,
            width: 90,
            visible: true
          });
        } else {
          updated[logoIdx] = { ...updated[logoIdx], visible: true };
        }
        pushHistory(updated);
      }
    };
    reader.readAsDataURL(file);
  };

  const addSignatory = () => {
    if (activeSignatories.length >= 4) return;
    const newId = `sig_${Date.now()}`;
    const newSig = { id: newId, name: '', title: '', signatureImg: null };
    if (currentAwardee.hasCustomLayout) {
      const updatedSigs = [...activeSignatories, newSig];
      setAwardees(prev => prev.map((a, idx) => idx === currentAwardeeIdx ? { ...a, customSignatories: updatedSigs } : a));
    } else {
      setSignatories([...signatories, newSig]);
    }
  };

  const removeSignatory = (id) => {
    if (activeSignatories.length <= 1) return;
    if (currentAwardee.hasCustomLayout) {
      const updatedSigs = activeSignatories.filter(s => s.id !== id);
      setAwardees(prev => prev.map((a, idx) => idx === currentAwardeeIdx ? { ...a, customSignatories: updatedSigs } : a));
      const updatedEls = activeElements.filter(el => el.sigId !== id);
      setAwardees(prev => prev.map((a, idx) => idx === currentAwardeeIdx ? { ...a, customElements: updatedEls } : a));
    } else {
      setSignatories(signatories.filter(s => s.id !== id));
      const updatedEls = elements.filter(el => el.sigId !== id);
      setElements(updatedEls);
    }
  };

  const finalizeCsvImport = ({ headers, rows, nameColumn, positionColumn }) => {
    const parsed = buildAwardeesFromCsv({ rows, nameColumn, positionColumn });
    if (parsed.length === 0) {
      alert('No valid rows found in CSV.');
      return;
    }

    setCsvHeaders(headers);

    const newElements = ensureAwardeeFieldElements(activeElements, headers);

    setAwardees(parsed);
    setCurrentAwardeeIdx(0);

    if (newElements.length) {
      if (currentAwardee.hasCustomLayout) {
        setAwardees(prev => prev.map((a, idx) => {
          if (idx !== currentAwardeeIdx) return a;
          return { ...a, customElements: [...(a.customElements || activeElements), ...newElements] };
        }));
      } else {
        pushHistory([...activeElements, ...newElements], globalData, parsed, signatories);
      }
    }

    alert(`Successfully imported ${parsed.length} awardees with ${headers.length} dynamic column fields (${headers.join(', ')})!`);
  };

  const handleCSVImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';

    const reader = new FileReader();
    reader.onload = (evt) => {
      const parsed = parseCsvText(evt.target.result);
      if (parsed.error) {
        alert(parsed.error);
        return;
      }

      const defaultMapping = guessDefaultMapping(parsed.headers, parsed.normalizedHeaders);
      setParsedCsvDraft({ ...parsed, defaultMapping });
      setIsCsvImportModalOpen(true);
    };
    reader.readAsText(file);
  };

  const handleCsvImportConfirm = ({ headers, rows, nameColumn, positionColumn }) => {
    finalizeCsvImport({ headers, rows, nameColumn, positionColumn });
    setIsCsvImportModalOpen(false);
    setParsedCsvDraft(null);
  };

  const openExportModal = () => {
    setSelectedExportIndices(awardees.map((_, idx) => idx));
    setExportMode('all');
    setIsExportModalOpen(true);
  };

  const handleBatchZipExport = () => executeBatchZipExport({
    exportMode,
    selectedExportIndices,
    exportFormat,
    onCloseModal: () => setIsExportModalOpen(false),
  });

  const handleSinglePdfExport = () => exportAllToSinglePDF({
    exportMode,
    selectedExportIndices,
    onCloseModal: () => setIsExportModalOpen(false),
  });

  const awardeeMatchesQuery = (awardee, query) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (awardee.name || '').toLowerCase().includes(q)
      || (awardee.position || '').toLowerCase().includes(q);
  };

  const jumpToAwardee = (idx) => {
    setCurrentAwardeeIdx(idx);
    setSidebarPage(Math.floor(idx / itemsPerPage));
  };

  const sidebarSearchMatches = awardees
    .map((a, idx) => ({ ...a, originalIdx: idx }))
    .filter(a => awardeeMatchesQuery(a, sidebarSearchQuery));

  const paginatedSidebarAwardees = awardees
    .map((a, idx) => ({ ...a, originalIdx: idx }))
    .slice(sidebarPage * itemsPerPage, (sidebarPage + 1) * itemsPerPage);

  const totalSidebarPages = Math.ceil(awardees.length / itemsPerPage);
  const sidebarPageStart = awardees.length === 0 ? 0 : sidebarPage * itemsPerPage + 1;
  const sidebarPageEnd = Math.min((sidebarPage + 1) * itemsPerPage, awardees.length);

  // ==========================================
  // LANDING PAGE VIEW (Before Editor Launch)
  // ==========================================
  if (!isEditorLaunched) {
    return (
      <>
        <LandingPage
          onLaunchApp={() => handleLaunchEditor(false)}
          onLaunchWithSample={() => handleLaunchEditor(true)}
          onOpenDocs={() => setIsDocsModalOpen(true)}
        />
        <DocsModal isOpen={isDocsModalOpen && !isEditorLaunched} onClose={() => setIsDocsModalOpen(false)} />
        <LoaderOverlay
          visible={isLaunchingEditor}
          title="Launching Editor"
          description="Preparing your certificate workspace…"
        />
      </>
    );
  }

  // ==========================================
  // CERTIFICATE GENERATOR EDITOR WORKSPACE
  // ==========================================
  return (
    <div className="relative flex flex-col h-screen w-full bg-white text-zinc-900 font-sans overflow-hidden select-none">
      <LoaderOverlay
        visible={isReturningHome}
        title="Returning Home"
        description="Saving your workspace and opening the landing page…"
      />
      {(isLaunchingEditor || isReturningHome) && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/90 backdrop-blur-sm px-4">
          <div className="flex flex-col items-center gap-6 rounded-[32px] border border-white/10 bg-slate-950/95 p-6 shadow-[0_40px_120px_rgba(15,23,42,0.55)] max-w-[380px] w-full">
            <div className="relative w-40 h-56 rounded-[28px] border border-white/15 bg-slate-900/95 overflow-hidden shadow-[0_24px_64px_rgba(15,23,42,0.35)]">
              <div className="absolute inset-x-5 top-5 h-11 rounded-2xl bg-slate-950/95 border border-white/10" />
              <div className="absolute inset-x-5 bottom-5 top-20 rounded-[22px] overflow-hidden bg-slate-950/90 border border-white/10">
                <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-b from-fuchsia-400 via-violet-500 to-sky-400 translate-y-full animate-batchcert-file-fill" />
              </div>
              <div className="absolute inset-x-5 top-24 grid gap-2">
                <div className="h-2 rounded-full bg-white/20 w-3/4" />
                <div className="h-2 rounded-full bg-white/15 w-1/2" />
                <div className="h-2 rounded-full bg-white/15 w-5/6" />
              </div>
              <div className="absolute inset-x-5 bottom-6 grid gap-2">
                <div className="h-3 rounded-full bg-white/10" />
                <div className="h-3 rounded-full bg-white/10 w-4/5" />
                <div className="h-3 rounded-full bg-white/10 w-3/5" />
              </div>
            </div>
            <div className="text-center text-white">
              <p className="text-lg font-semibold">{isReturningHome ? 'Returning Home' : 'Launching Editor'}</p>
              <p className="mt-2 text-sm text-slate-300">{isReturningHome ? 'Saving your workspace and opening the landing page…' : 'Preparing your certificate workspace…'}</p>
            </div>
          </div>
        </div>
      )}
      
      <KeyboardShortcutModal isOpen={isKeyboardModalOpen} onClose={() => setIsKeyboardModalOpen(false)} />
      <CSVInstructionsModal isOpen={isCsvModalOpen} onClose={() => setIsCsvModalOpen(false)} />
      <QRInstructionsModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} />
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        exportFormat={exportFormat}
        setExportFormat={setExportFormat}
        exportScale={exportScale}
        setExportScale={setExportScale}
        exportMode={exportMode}
        setExportMode={setExportMode}
        selectedExportIndices={selectedExportIndices}
        setSelectedExportIndices={setSelectedExportIndices}
        awardees={awardees}
        executeBatchZipExport={handleBatchZipExport}
        exportAllToSinglePDF={handleSinglePdfExport}
        exportPreviewPdf={exportTestPdf}
        exportSummary={exportSummary}
        exportEstimate={exportEstimate}
        canvasSize={canvasSize}
        isExporting={isExporting}
      />
      <ExportProgressOverlay
        visible={isExporting}
        progress={exportProgress}
        label={exportStatusLabel}
        onCancel={cancelExport}
      />
      <RestoreProjectModal
        isOpen={showRestoreModal && !!pendingRestore}
        savedAt={formatAutosaveTime(pendingRestore?.savedAt)}
        projectName={pendingRestore?.projectName}
        awardeeCount={pendingRestore?.awardees?.length || 0}
        onRestore={handleRestoreProject}
        onDiscard={handleDiscardRestore}
      />
      <CsvImportModal
        isOpen={isCsvImportModalOpen}
        parsedCsv={parsedCsvDraft}
        onClose={() => { setIsCsvImportModalOpen(false); setParsedCsvDraft(null); }}
        onConfirm={handleCsvImportConfirm}
      />
      <OnboardingWizard
        isOpen={showOnboardingWizard}
        onClose={handleCompleteOnboarding}
        onComplete={handleCompleteOnboarding}
        onLoadSample={handleLoadSampleProject}
        onApplyTemplate={handleOnboardingTemplate}
        onImportCsv={handleOnboardingCsvImport}
        onExportTest={exportTestPdf}
        isExporting={isExporting}
      />
      <DocsModal isOpen={isDocsModalOpen && isEditorLaunched} onClose={() => setIsDocsModalOpen(false)} />
      <AwardeeBulkEditModal
        isOpen={isBulkEditOpen}
        onClose={() => setIsBulkEditOpen(false)}
        awardees={awardees}
        csvHeaders={csvHeaders}
        onSave={handleBulkEditSave}
      />

      {/* TOP MENU BAR (Hidden in Preview Mode) */}
      {!isPreviewMode && (
        <EditorTopBar
          handleExitToHome={handleExitToHome}
          handleNewProject={handleNewProject}
          handleLoadProjectFromFile={handleLoadProjectFromFile}
          handleSaveProject={handleSaveProject}
          projectName={projectName}
          setProjectName={setProjectName}
          setIsKeyboardModalOpen={setIsKeyboardModalOpen}
          autoSaveLabel={isSaving ? 'Saving…' : (lastSavedAt ? `Saved ${formatAutosaveTimeShort(lastSavedAt)}` : null)}
          autoSaveTitle={lastSavedAt ? formatSaveTime(lastSavedAt) : null}
          onOpenDocs={() => setIsDocsModalOpen(true)}
          onOpenOnboarding={() => setShowOnboardingWizard(true)}
        />
      )}

      <div className="flex flex-1 overflow-hidden relative min-w-0">
        
        {/* SIDEBAR (Hidden in Preview Mode) */}
        {!isPreviewMode && (
          <div
            className={`relative shrink-0 flex flex-col bg-white border-r border-purple-200 shadow-sm z-10 overflow-hidden transition-[width] duration-300 ease-in-out ${
              isSidebarCollapsed ? 'w-0 border-r-0' : 'w-96'
            }`}
          >
            <div className="relative flex border-b border-purple-100 bg-purple-50/40 shrink-0">
              <button 
                onClick={() => setActiveTab('data')} 
                className={`flex-1 py-3 text-[11px] font-bold flex flex-col items-center justify-center gap-1 border-b-2 transition ${activeTab === 'data' ? 'border-purple-600 text-purple-900 bg-white shadow-inner' : 'border-transparent text-zinc-500 hover:text-zinc-800'}`}
              >
                <Users size={14} className={activeTab === 'data' ? 'text-purple-600' : ''} /> Data
              </button>
              <button 
                onClick={() => setActiveTab('signatories')} 
                className={`flex-1 py-3 text-[11px] font-bold flex flex-col items-center justify-center gap-1 border-b-2 transition ${activeTab === 'signatories' ? 'border-purple-600 text-purple-900 bg-white shadow-inner' : 'border-transparent text-zinc-500 hover:text-zinc-800'}`}
              >
                <FileText size={14} className={activeTab === 'signatories' ? 'text-purple-600' : ''} /> Signers
              </button>
              <button 
                onClick={() => setActiveTab('design')} 
                className={`flex-1 py-3 text-[11px] font-bold flex flex-col items-center justify-center gap-1 border-b-2 transition ${activeTab === 'design' ? 'border-purple-600 text-purple-900 bg-white shadow-inner' : 'border-transparent text-zinc-500 hover:text-zinc-800'}`}
              >
                <Layout size={14} className={activeTab === 'design' ? 'text-purple-600' : ''} /> Design
              </button>
              <button 
                onClick={() => setActiveTab('layers')} 
                className={`flex-1 py-3 text-[11px] font-bold flex flex-col items-center justify-center gap-1 border-b-2 transition ${activeTab === 'layers' ? 'border-purple-600 text-purple-900 bg-white shadow-inner' : 'border-transparent text-zinc-500 hover:text-zinc-800'}`}
              >
                <Layers size={14} className={activeTab === 'layers' ? 'text-purple-600' : ''} /> Layers
              </button>
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(true)}
                className="hidden xl:flex absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-zinc-500 hover:text-purple-800 hover:bg-purple-100 transition"
                title="Collapse sidebar"
              >
                <PanelLeftClose size={15} />
              </button>
            </div>

            <div className={`flex-1 overflow-y-auto p-4 space-y-5 bg-white min-w-[24rem] ${isSidebarCollapsed ? 'invisible' : ''}`}>

              {/* TAB 1: DATA & AWARDEES */}
              {activeTab === 'data' && (
                <div className="space-y-5">
                  <div className="space-y-3 bg-purple-50/30 p-3.5 rounded-xl border border-purple-100 shadow-sm">
                    <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider">Header & Text Details</h3>
                    <div>
                      <label className="text-xs text-zinc-600 font-medium">University / Org Name</label>
                      <input 
                        type="text" 
                        value={globalData.orgName} 
                        onChange={e => handleGlobalDataChange('orgName', e.target.value)}
                        onBlur={() => commitHistorySnapshot()}
                        className="w-full mt-1 bg-white border border-purple-200 rounded px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-purple-600 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-600 font-medium">Campus & ISO Details</label>
                      <textarea 
                        rows={2}
                        value={globalData.orgSubtext} 
                        onChange={e => handleGlobalDataChange('orgSubtext', e.target.value)}
                        onBlur={() => commitHistorySnapshot()}
                        className="w-full mt-1 bg-white border border-purple-200 rounded p-1.5 text-xs text-zinc-900 focus:outline-none focus:border-purple-600 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-600 font-medium">Certificate Title</label>
                      <input 
                        type="text" 
                        value={globalData.certificateTitle} 
                        onChange={e => handleGlobalDataChange('certificateTitle', e.target.value)}
                        onBlur={() => commitHistorySnapshot()}
                        className="w-full mt-1 bg-white border border-purple-200 rounded px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-purple-600 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-purple-800 font-bold">Event / Duties (Applies to All)</label>
                      <textarea 
                        rows={3}
                        value={globalData.eventDuties} 
                        onChange={e => handleGlobalDataChange('eventDuties', e.target.value)}
                        onBlur={() => commitHistorySnapshot()}
                        className="w-full mt-1 bg-white border border-purple-200 rounded p-1.5 text-xs text-purple-950 font-medium focus:outline-none focus:border-purple-600 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-600 font-medium">Body Sentence Template (use {'{{duties}}'})</label>
                      <textarea 
                        rows={3}
                        value={globalData.bodyTemplate} 
                        onChange={e => handleGlobalDataChange('bodyTemplate', e.target.value)}
                        onBlur={() => commitHistorySnapshot()}
                        className="w-full mt-1 bg-white border border-purple-200 rounded p-1.5 text-xs text-zinc-900 focus:outline-none focus:border-purple-600 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-600 font-medium">Date & Location Line</label>
                      <textarea 
                        rows={2}
                        value={globalData.dateLine} 
                        onChange={e => handleGlobalDataChange('dateLine', e.target.value)}
                        onBlur={() => commitHistorySnapshot()}
                        className="w-full mt-1 bg-white border border-purple-200 rounded p-1.5 text-xs text-zinc-900 focus:outline-none focus:border-purple-600 shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Dynamic CSV Placeholders Bar */}
                  <div className="space-y-2 bg-purple-50/40 p-3 rounded-xl border border-purple-100 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                        <Tag size={14} className="text-purple-600" />
                        <span>Dynamic CSV Tags</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-medium">Click tag to insert into canvas</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {csvHeaders.map((headerKey) => (
                        <button
                          key={headerKey}
                          onClick={() => insertTagIntoCanvas(headerKey)}
                          className="px-2 py-1 bg-white hover:bg-purple-100 border border-purple-200 rounded text-[11px] font-mono text-purple-900 font-semibold shadow-sm transition flex items-center gap-1"
                          title={`Insert {{${headerKey}}} into canvas`}
                        >
                          <Plus size={10} className="text-purple-600" />
                          {`{{${headerKey}}}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Data validation panel */}
                  {awardeeValidation.warnings.length > 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                        <AlertTriangle size={14} className="text-amber-600" />
                        Data validation
                      </div>
                      <ul className="space-y-1">
                        {awardeeValidation.warnings.map((warning) => (
                          <li key={warning} className="text-[11px] text-amber-900 leading-relaxed">• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Awardees List with Search & Pagination */}
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                          Awardees List ({awardees.length})
                        </h3>
                        <button
                          onClick={() => setIsCsvModalOpen(true)}
                          className="text-purple-600 hover:text-purple-800 p-0.5 rounded-full hover:bg-purple-100 transition"
                          title="Click to view Dynamic CSV Mapping instructions"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          onClick={() => setIsBulkEditOpen(true)}
                          className="flex items-center justify-center gap-1 px-2 py-2 text-[10px] font-bold bg-purple-600 hover:bg-purple-700 text-white border border-purple-700 rounded-lg transition shadow-sm whitespace-nowrap"
                          title="Bulk edit or add awardees in a spreadsheet"
                        >
                          <Table2 size={13} className="shrink-0" />
                          <span>Bulk</span>
                        </button>
                        <button
                          onClick={exportAwardeesCsv}
                          className="flex items-center justify-center gap-1 px-2 py-2 text-[10px] font-bold bg-white hover:bg-purple-50 text-purple-900 border border-purple-200 rounded-lg transition shadow-sm whitespace-nowrap"
                          title="Export awardee data as CSV"
                        >
                          <Download size={13} className="shrink-0 text-purple-600" />
                          <span>Export</span>
                        </button>
                        <label
                          className="flex items-center justify-center gap-1 px-2 py-2 text-[10px] font-bold bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-lg cursor-pointer transition shadow-sm whitespace-nowrap"
                          title="Import awardees from CSV file"
                        >
                          <Upload size={13} className="shrink-0 text-purple-600" />
                          <span>Import</span>
                          <input type="file" accept=".csv" onChange={handleCSVImport} className="hidden" />
                        </label>
                      </div>
                    </div>

                    {/* Sidebar Search Input */}
                    <div className="flex items-center gap-1.5 bg-purple-50/60 border border-purple-200 rounded-lg px-2.5 py-1.5 shadow-sm">
                      <Search size={14} className="text-purple-600" />
                      <input 
                        type="text" 
                        value={sidebarSearchQuery} 
                        onChange={(e) => {
                          const query = e.target.value;
                          setSidebarSearchQuery(query);
                          if (query.trim()) {
                            const firstMatch = awardees.findIndex(a => awardeeMatchesQuery(a, query));
                            if (firstMatch >= 0) {
                              setSidebarPage(Math.floor(firstMatch / itemsPerPage));
                            }
                          }
                        }}
                        placeholder="Search by name or position…"
                        className="bg-transparent text-xs text-zinc-900 focus:outline-none w-full font-medium"
                      />
                      {sidebarSearchQuery && (
                        <button
                          onClick={() => setSidebarSearchQuery('')}
                          className="text-zinc-400 hover:text-zinc-600 text-xs font-bold"
                        >
                          ×
                        </button>
                      )}
                    </div>

                    {sidebarSearchQuery.trim() && (
                      <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-2.5 space-y-2">
                        <p className="text-[10px] font-bold text-purple-900 uppercase tracking-wide">
                          {sidebarSearchMatches.length} match{sidebarSearchMatches.length === 1 ? '' : 'es'} in {awardees.length} awardees
                        </p>
                        {sidebarSearchMatches.length === 0 ? (
                          <p className="text-xs text-zinc-500">No awardees match your search.</p>
                        ) : (
                          <div className="max-h-36 overflow-y-auto space-y-1">
                            {sidebarSearchMatches.map((item) => (
                              <button
                                key={item.id || item.originalIdx}
                                onClick={() => jumpToAwardee(item.originalIdx)}
                                className={`w-full text-left px-2.5 py-2 rounded-lg border text-xs transition ${
                                  currentAwardeeIdx === item.originalIdx
                                    ? 'border-purple-600 bg-purple-100 text-purple-950'
                                    : 'border-purple-100 bg-white hover:bg-purple-50 text-zinc-700'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-bold text-purple-800 shrink-0">
                                    #{item.originalIdx + 1} of {awardees.length}
                                  </span>
                                  {currentAwardeeIdx === item.originalIdx && (
                                    <span className="text-[10px] font-bold text-purple-700 uppercase">Selected</span>
                                  )}
                                </div>
                                <p className="font-semibold text-zinc-900 truncate mt-0.5">{item.name || '(Unnamed Awardee)'}</p>
                                {item.position && (
                                  <p className="text-[11px] text-zinc-500 truncate">{item.position}</p>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      {paginatedSidebarAwardees.map((item) => {
                        const idx = item.originalIdx;
                        const isSearchMatch = sidebarSearchQuery.trim() && awardeeMatchesQuery(item, sidebarSearchQuery);
                        const isDimmed = sidebarSearchQuery.trim() && !isSearchMatch;
                        return (
                          <div 
                            key={item.id} 
                            onClick={() => jumpToAwardee(idx)}
                            className={`p-3 rounded-xl border flex flex-col gap-2 cursor-pointer transition shadow-sm ${
                              currentAwardeeIdx === idx
                                ? 'border-purple-600 bg-purple-50/50 ring-1 ring-purple-300'
                                : isSearchMatch
                                  ? 'border-purple-400 bg-purple-50/30'
                                  : isDimmed
                                    ? 'border-purple-100/60 bg-white/60 opacity-55'
                                    : 'border-purple-100 bg-white hover:bg-purple-50/20'
                            }`}
                          >
                            <div className="flex justify-between items-center gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                                  #{idx + 1} of {awardees.length}
                                </span>
                                {isSearchMatch && (
                                  <span className="text-[10px] font-bold text-emerald-700 uppercase">Match</span>
                                )}
                              </div>
                              <button 
                                onClick={(e) => { e.stopPropagation(); if (awardees.length > 1) setAwardees(awardees.filter((_, i) => i !== idx)); }}
                                className="text-zinc-400 hover:text-red-500 p-1 transition shrink-0"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <div className="flex justify-between items-center">
                              <input 
                                type="text" 
                                value={item.name} 
                                onChange={(e) => handleAwardeeChange('name', e.target.value)}
                                onBlur={() => commitHistorySnapshot()}
                                onClick={(e) => e.stopPropagation()}
                                placeholder="Awardee Name"
                                className="w-full bg-transparent font-bold text-sm text-zinc-900 focus:outline-none"
                              />
                            </div>
                            
                            <div>
                              <label className="text-[10px] text-purple-700 block font-bold uppercase">POSITION</label>
                              <input 
                                type="text" 
                                value={item.position} 
                                onChange={(e) => handleAwardeeChange('position', e.target.value)}
                                onBlur={() => commitHistorySnapshot()}
                                placeholder="Position / Designation"
                                className="w-full bg-white border border-purple-200 rounded px-2 py-1 text-xs text-purple-950 font-semibold focus:outline-none focus:border-purple-600 uppercase shadow-sm"
                              />
                            </div>

                            {item.csvData && Object.keys(item.csvData).some(k => k.toLowerCase() !== 'name' && k.toLowerCase() !== 'position') && (
                              <div className="pt-2 border-t border-purple-100/80 space-y-1">
                                <span className="text-[10px] text-purple-800 font-bold uppercase block">Additional CSV Fields</span>
                                <div className="grid grid-cols-2 gap-1 text-[10px]">
                                  {Object.entries(item.csvData)
                                    .filter(([k]) => k.toLowerCase() !== 'name' && k.toLowerCase() !== 'position')
                                    .map(([k, v]) => (
                                      <div key={k} className="bg-purple-50/50 p-1 rounded border border-purple-100 truncate">
                                        <span className="font-bold text-purple-900">{k}:</span> {v}
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}

                            <div className="pt-2 border-t border-purple-100 flex items-center justify-between">
                              <span className="text-[11px] text-zinc-600 font-medium">Separate Custom Layout</span>
                              <input 
                                type="checkbox"
                                checked={!!item.hasCustomLayout}
                                onChange={() => toggleAwardeeCustomLayout(idx)}
                                className="w-4 h-4 accent-purple-600 cursor-pointer rounded"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Sidebar Pagination Controls */}
                    {totalSidebarPages > 1 && (
                      <div className="flex items-center justify-between pt-2 border-t border-purple-100 text-xs text-zinc-600">
                        <button 
                          onClick={() => setSidebarPage(p => Math.max(0, p - 1))}
                          disabled={sidebarPage === 0}
                          className="px-2.5 py-1 bg-white border border-purple-200 rounded font-semibold disabled:opacity-40 hover:bg-purple-50 transition shadow-sm"
                        >
                          Previous
                        </button>
                        <span className="text-center leading-tight">
                          <span className="block font-semibold text-purple-900">#{sidebarPageStart}–{sidebarPageEnd} of {awardees.length}</span>
                          <span className="text-[10px] text-zinc-500">Page {sidebarPage + 1} of {totalSidebarPages}</span>
                        </span>
                        <button 
                          onClick={() => setSidebarPage(p => Math.min(totalSidebarPages - 1, p + 1))}
                          disabled={sidebarPage >= totalSidebarPages - 1}
                          className="px-2.5 py-1 bg-white border border-purple-200 rounded font-semibold disabled:opacity-40 hover:bg-purple-50 transition shadow-sm"
                        >
                          Next
                        </button>
                      </div>
                    )}

                    <button 
                      onClick={() => setAwardees([...awardees, { id: String(Date.now()), name: '', position: '', csvData: { Name: '', Position: '' }, hasCustomLayout: false, customElements: null, customSignatories: null }])} 
                      className="w-full py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-xs font-bold text-purple-900 flex items-center justify-center gap-1 transition shadow-sm"
                    >
                      <Plus size={14} /> Add Awardee
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: SIGNATORIES */}
              {activeTab === 'signatories' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider">Signatories ({activeSignatories.length})</h3>
                      {currentAwardee.hasCustomLayout && (
                        <span className="text-[10px] text-purple-700 italic font-medium">Custom Signatories Active</span>
                      )}
                    </div>
                    <button 
                      onClick={addSignatory}
                      disabled={activeSignatories.length >= 4}
                      className="text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-1.5 rounded-md flex items-center gap-1 disabled:opacity-50 shadow-sm transition"
                    >
                      <Plus size={12} /> Add
                    </button>
                  </div>

                  <div className="space-y-3">
                    {activeSignatories.map((sig, idx) => (
                      <div key={sig.id} className="p-3.5 bg-purple-50/30 rounded-xl border border-purple-100 space-y-2.5 shadow-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-purple-950">Signatory #{idx + 1}</span>
                          {activeSignatories.length > 1 && (
                            <button onClick={() => removeSignatory(sig.id)} className="text-zinc-400 hover:text-red-500 transition">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>

                        <input 
                          type="text" 
                          value={sig.name} 
                          onChange={e => handleSignatoryChange(sig.id, 'name', e.target.value)}
                          onBlur={() => commitHistorySnapshot()}
                          placeholder="Signatory Name"
                          className="w-full bg-white border border-purple-200 rounded px-2.5 py-1.5 text-xs font-bold text-zinc-900 shadow-sm focus:outline-none focus:border-purple-600"
                        />

                        <input 
                          type="text" 
                          value={sig.title} 
                          onChange={e => handleSignatoryChange(sig.id, 'title', e.target.value)}
                          onBlur={() => commitHistorySnapshot()}
                          placeholder="Title / Office"
                          className="w-full bg-white border border-purple-200 rounded px-2.5 py-1.5 text-xs text-zinc-600 shadow-sm focus:outline-none focus:border-purple-600"
                        />

                        <div className="pt-2 border-t border-purple-100">
                          <label className="text-[10px] text-purple-800 font-bold block mb-1 uppercase">SIGNATURE IMAGE (.PNG Transparent)</label>
                          <div className="flex items-center gap-2">
                            <label className="flex-1 border border-dashed border-purple-300 hover:border-purple-600 rounded px-2 py-1.5 text-center cursor-pointer bg-white text-[11px] text-zinc-600 truncate shadow-sm transition">
                              {sig.signatureImg ? 'Change Signature Image...' : 'Upload Signature Image'}
                              <input type="file" accept="image/png,image/jpeg" onChange={(e) => handleSignatoryImageUpload(sig.id, e)} className="hidden" />
                            </label>
                            {sig.signatureImg && (
                              <button 
                                onClick={() => handleSignatoryChange(sig.id, 'signatureImg', null)}
                                className="text-red-600 hover:text-red-700 text-[11px] px-2.5 py-1.5 bg-red-50 rounded border border-red-200 font-medium transition"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: DESIGN & TOOLS */}
              {activeTab === 'design' && (
                <div className="space-y-6">
                  {/* Canvas Orientation & Dimension Presets */}
                  <div className="space-y-2 bg-purple-50/30 p-3.5 rounded-xl border border-purple-100 shadow-sm">
                    <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Layout size={14} className="text-purple-600" /> Page Orientation & Dimensions
                    </h3>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {CANVAS_PRESETS.map(preset => (
                        <button
                          key={preset.id}
                          onClick={() => setCanvasSize({ width: preset.width, height: preset.height, label: preset.name })}
                          className={`p-2 text-[11px] font-medium border rounded-xl flex flex-col items-center gap-1 transition shadow-sm ${canvasSize.width === preset.width && canvasSize.height === preset.height ? 'border-purple-600 bg-purple-50 text-purple-900 ring-1 ring-purple-600' : 'border-zinc-200 text-zinc-600 bg-white hover:bg-purple-50/30'}`}
                        >
                          <span className="font-bold">{preset.name}</span>
                          <span className="text-[9px] text-zinc-400">{preset.width} × {preset.height}px</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Template Saving / Loading */}
                  <div className="space-y-2 bg-purple-50/30 p-3.5 rounded-xl border border-purple-100 shadow-sm">
                    <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                      <PenTool size={14} className="text-purple-600" /> Layout Template Management
                    </h3>
                    <p className="text-[11px] text-zinc-500">Save positions, dimensions, fonts, logo, and signers as a reusable template.</p>
                    <div className="flex gap-2 pt-1">
                      <button 
                        onClick={handleSaveLayoutTemplate}
                        className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm"
                      >
                        <Save size={13} /> Save Template
                      </button>
                      <label className="flex-1 py-2 bg-white border border-purple-200 hover:bg-purple-50 text-purple-900 rounded-lg text-xs font-bold cursor-pointer transition flex items-center justify-center gap-1 shadow-sm">
                        <FolderOpen size={13} className="text-purple-600" /> Load Template
                        <input type="file" accept=".json" onChange={handleLoadLayoutTemplateFromFile} className="hidden" />
                      </label>
                    </div>
                  </div>

                  {/* Institution Logo Upload Section */}
                  <div className="space-y-2 bg-purple-50/30 p-3.5 rounded-xl border border-purple-100 shadow-sm">
                    <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon size={14} className="text-purple-600" /> Institution Logo
                    </h3>
                    <p className="text-[11px] text-zinc-500">Upload and dynamically position/resize your logo on canvas.</p>
                    <label className="block w-full border-2 border-dashed border-purple-200 hover:border-purple-600 rounded-xl p-3 text-center cursor-pointer transition bg-white shadow-sm">
                      <Upload size={18} className="mx-auto mb-1 text-purple-600" />
                      <span className="text-xs text-zinc-700 font-medium block">{logoImg ? 'Change Logo Image' : 'Upload Logo Image'}</span>
                      <input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'logo')} className="hidden" />
                    </label>
                    {logoImg && (
                      <button 
                        onClick={() => {
                          setLogoImg(null);
                          const updated = activeElements.map(el => el.id === 'logo' ? { ...el, visible: false } : el);
                          pushHistory(updated);
                        }}
                        className="w-full py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs font-semibold transition shadow-sm"
                      >
                        Remove Logo from Canvas
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-purple-900 uppercase tracking-wider block mb-2">Background Styles</label>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {Object.keys(PRESET_BACKGROUNDS).map(key => (
                        <button 
                          key={key} 
                          onClick={() => setBgType(key)}
                          className={`p-2.5 text-[11px] font-medium border rounded-xl flex flex-col items-center gap-1 transition shadow-sm ${bgType === key ? 'border-purple-600 bg-purple-50 text-purple-900 ring-1 ring-purple-600' : 'border-zinc-200 text-zinc-600 bg-white hover:bg-purple-50/30'}`}
                        >
                          <Layout size={16} className="text-purple-600" />
                          {PRESET_BACKGROUNDS[key].name}
                        </button>
                      ))}
                    </div>

                    <label className="block w-full border-2 border-dashed border-purple-200 hover:border-purple-500 rounded-xl p-3 text-center cursor-pointer transition mb-3 bg-white shadow-sm">
                      <Upload size={18} className="mx-auto mb-1 text-purple-600" />
                      <span className="text-xs text-zinc-700 font-medium block">Upload Custom Background</span>
                      <input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'background')} className="hidden" />
                    </label>

                    {bgType === 'custom' && (
                      <div className="space-y-3 bg-purple-50/30 p-3.5 rounded-xl border border-purple-100 shadow-sm">
                        <h4 className="text-xs font-bold text-purple-900 uppercase">Background Scaling & Position</h4>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-zinc-500 font-medium block">Width ({bgTransform.width}%)</label>
                            <input 
                              type="range" min="50" max="200" value={bgTransform.width}
                              onChange={(e) => setBgTransform({...bgTransform, width: Number(e.target.value)})}
                              className="w-full accent-purple-600 cursor-pointer"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-zinc-500 font-medium block">Height ({bgTransform.height}%)</label>
                            <input 
                              type="range" min="50" max="200" value={bgTransform.height}
                              onChange={(e) => setBgTransform({...bgTransform, height: Number(e.target.value)})}
                              className="w-full accent-purple-600 cursor-pointer"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-zinc-500 font-medium block">X Offset ({bgTransform.x}px)</label>
                            <input 
                              type="range" min="-300" max="300" value={bgTransform.x}
                              onChange={(e) => setBgTransform({...bgTransform, x: Number(e.target.value)})}
                              className="w-full accent-purple-600 cursor-pointer"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-zinc-500 font-medium block">Y Offset ({bgTransform.y}px)</label>
                            <input 
                              type="range" min="-300" max="300" value={bgTransform.y}
                              onChange={(e) => setBgTransform({...bgTransform, y: Number(e.target.value)})}
                              className="w-full accent-purple-600 cursor-pointer"
                            />
                          </div>
                        </div>

                        <button 
                          onClick={() => setBgTransform({ width: 100, height: 100, x: 0, y: 0 })}
                          className="w-full py-1.5 bg-white border border-purple-200 hover:bg-purple-50 rounded-lg text-[11px] font-semibold text-purple-900 shadow-sm transition"
                        >
                          Reset Background Scaling
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: LAYERS MANAGEMENT PANEL */}
              {activeTab === 'layers' && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider">Layer Management Panel</h3>
                  <p className="text-[11px] text-zinc-500">Reorder element stack depth or toggle layer visibility.</p>
                  
                  <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                    {activeElements.slice().reverse().map((el, revIdx) => {
                      const actualIdx = activeElements.length - 1 - revIdx;
                      const isSelected = selectedIds.includes(el.id);
                      const displayName = el.label || el.key || (el.type === 'line' ? 'Horizontal Line' : (el.type === 'qrcode' ? 'QR Code' : (el.type === 'image' ? 'Image / Seal' : (el.text ? el.text.substring(0, 20) : el.id))));
                      
                      return (
                        <div 
                          key={el.id}
                          onClick={() => setSelectedIds([el.id])}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition shadow-sm ${isSelected ? 'border-purple-600 bg-purple-50/60' : 'border-purple-100 bg-white hover:bg-purple-50/20'}`}
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <button 
                              onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(el.id); }}
                              className="text-zinc-400 hover:text-purple-700 p-1 transition"
                              title={el.visible === false ? "Show Element" : "Hide Element"}
                            >
                              {el.visible === false ? <EyeOff size={14} className="text-red-500" /> : <Eye size={14} />}
                            </button>
                            <div className="flex flex-col truncate">
                              <span className="text-xs font-semibold text-zinc-800 truncate">{displayName}</span>
                              <span className="text-[10px] text-purple-600 uppercase font-bold">{el.type} {el.key ? `(${el.key})` : ''}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                            <button 
                              onClick={() => moveLayerOrder(actualIdx, 'up')}
                              disabled={actualIdx === activeElements.length - 1}
                              className="p-1 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded text-zinc-700 disabled:opacity-30 transition"
                              title="Bring Forward (Move Up)"
                            >
                              <ArrowUp size={12} />
                            </button>
                            <button 
                              onClick={() => moveLayerOrder(actualIdx, 'down')}
                              disabled={actualIdx === 0}
                              className="p-1 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded text-zinc-700 disabled:opacity-30 transition"
                              title="Send Backward (Move Down)"
                            >
                              <ArrowDown size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            <div className={`p-4 border-t border-purple-100 bg-purple-50/40 space-y-2 shrink-0 min-w-[24rem] ${isSidebarCollapsed ? 'invisible' : ''}`}>
              <button 
                onClick={openExportModal}
                disabled={isExporting}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 font-bold text-white rounded-xl shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <Download size={18} />
                {isExporting ? `Exporting (${exportProgress}%)...` : `Export Certificates (ZIP)`}
              </button>
              <button 
                onClick={exportAllToSinglePDF}
                disabled={isExporting || awardees.length === 0}
                className="w-full py-2.5 bg-white border border-purple-300 hover:bg-purple-50 font-bold text-purple-900 rounded-xl shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-50 text-sm"
              >
                <FileText size={16} />
                Export All as Single PDF
              </button>
            </div>
            <div className={`p-4 border-t border-gray-200 bg-gray-50 shrink-0 min-w-[24rem] ${isSidebarCollapsed ? 'invisible' : ''}`}>
            <a
              href="https://ko-fi.com/indiannogibbs"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-1.5 bg-[#29abe0] hover:bg-[#208ab8] text-white font-medium py-2 px-3 rounded-lg text-xs transition-colors shadow-sm"
            >
              <span>☕</span>
              <span>Support my work on Ko-fi</span>
            </a>
          </div>

          </div>
        )}

        {!isPreviewMode && isSidebarCollapsed && (
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed(false)}
            className="hidden xl:flex absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2.5 bg-white border border-purple-200 rounded-xl text-purple-800 shadow-lg hover:bg-purple-50 transition"
            title="Expand sidebar"
          >
            <PanelLeftOpen size={18} />
          </button>
        )}

        {/* WORKSPACE CANVAS WITH RULERS */}
        <div className="flex-1 flex flex-col bg-slate-100 relative overflow-hidden min-w-0">
          
          {/* FLOATING EXIT PREVIEW BUTTON */}
          {isPreviewMode && (
            <button 
              onClick={exitPreviewMode}
              className="fixed top-6 right-6 z-50 bg-white/90 text-purple-900 border border-purple-300 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold hover:bg-white backdrop-blur transition"
            >
              <Minimize2 size={15} /> Exit Preview Mode
            </button>
          )}

          {isPreviewMode && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-[11px] font-semibold backdrop-blur-sm pointer-events-none">
              Preview · {Math.round(previewFitScale * 100)}% fit
            </div>
          )}

          {/* FIXED HEIGHT CANVAS TOOLBAR */}
          {!isPreviewMode && (
            <div className="h-14 shrink-0 border-b border-purple-200 bg-white/95 backdrop-blur px-3 flex items-center justify-between gap-2 z-20 shadow-sm overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

              {/* Left: Awardee nav + canvas tools */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-0.5 bg-purple-50/80 border border-purple-200 rounded-lg px-1 py-1 shadow-sm">
                  <button
                    onClick={() => setCurrentAwardeeIdx(prev => Math.max(0, prev - 1))}
                    disabled={currentAwardeeIdx === 0}
                    className="p-1.5 hover:bg-purple-100 rounded text-zinc-700 disabled:opacity-30 transition"
                    title="Previous awardee"
                  >
                    <ChevronLeft size={14} />
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setIsAwardeeDropdownOpen(prev => !prev)}
                      className="text-[11px] text-purple-900 font-bold px-1.5 hover:bg-purple-100 rounded flex items-center gap-0.5 py-1 transition whitespace-nowrap"
                      title={`Awardee ${currentAwardeeIdx + 1} of ${awardees.length} — click to search`}
                    >
                      {currentAwardeeIdx + 1}/{awardees.length}
                      <ChevronDown size={12} className="text-purple-600" />
                    </button>

                    <AwardeeDropdown
                      isOpen={isAwardeeDropdownOpen}
                      onClose={() => setIsAwardeeDropdownOpen(false)}
                      awardees={awardees}
                      currentAwardeeIdx={currentAwardeeIdx}
                      searchQuery={awardeeSearchQuery}
                      setSearchQuery={setAwardeeSearchQuery}
                      onSelectAwardee={jumpToAwardee}
                    />
                  </div>

                  <button
                    onClick={() => setCurrentAwardeeIdx(prev => Math.min(awardees.length - 1, prev + 1))}
                    disabled={currentAwardeeIdx === awardees.length - 1}
                    className="p-1.5 hover:bg-purple-100 rounded text-zinc-700 disabled:opacity-30 transition"
                    title="Next awardee"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>

                <div className="flex items-center gap-0.5 border border-purple-200 rounded-lg px-1 py-1 bg-white shadow-sm">
                  <button
                    onClick={addTextElement}
                    className="p-1.5 text-zinc-700 hover:text-purple-700 hover:bg-purple-50 rounded transition"
                    title="Add text box"
                  >
                    <Type size={14} />
                  </button>
                  <button
                    onClick={addLineElement}
                    className="p-1.5 text-zinc-700 hover:text-purple-700 hover:bg-purple-50 rounded transition"
                    title="Add horizontal line"
                  >
                    <Minus size={14} />
                  </button>
                  <button
                    onClick={addQRCodeElement}
                    className="p-1.5 text-zinc-700 hover:text-purple-700 hover:bg-purple-50 rounded transition"
                    title="Add QR code"
                  >
                    <QrCode size={14} />
                  </button>
                  <label
                    className="p-1.5 text-zinc-700 hover:text-purple-700 hover:bg-purple-50 rounded transition cursor-pointer"
                    title="Add image or seal"
                  >
                    <Stamp size={14} />
                    <input ref={imageUploadRef} type="file" accept="image/*" onChange={handleImageElementUpload} className="hidden" />
                  </label>
                  <div className="h-4 w-px bg-purple-200" />
                  <button
                    onClick={() => setIsQrModalOpen(true)}
                    className="p-1.5 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded transition"
                    title="QR code guide"
                  >
                    <Info size={14} />
                  </button>
                </div>
              </div>

              {/* Right: view, export, history, zoom */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-0.5 border border-purple-200 rounded-lg px-1 py-1 bg-white shadow-sm">
                  <button
                    onClick={() => setShowGuides(prev => !prev)}
                    className={`p-1.5 rounded transition ${showGuides ? 'bg-purple-100 text-purple-800' : 'text-zinc-700 hover:text-purple-700 hover:bg-purple-50'}`}
                    title="Toggle ruler guides"
                  >
                    <Grid size={14} />
                  </button>
                  <button
                    onClick={enterPreviewMode}
                    className="p-1.5 text-zinc-700 hover:text-purple-700 hover:bg-purple-50 rounded transition"
                    title="Full-screen preview (fit to screen)"
                  >
                    <Maximize2 size={14} />
                  </button>
                  <button
                    onClick={exportTestPdf}
                    disabled={isExporting || awardees.length === 0}
                    className="p-1.5 text-zinc-700 hover:text-purple-700 hover:bg-purple-50 rounded transition disabled:opacity-30"
                    title="Export PDF for current awardee"
                  >
                    <Download size={14} />
                  </button>
                </div>

                <div className="flex items-center gap-0.5 border border-purple-200 rounded-lg px-1 py-1 bg-white shadow-sm">
                  <button
                    onClick={handleUndo}
                    disabled={historyIndex === 0 || currentAwardee.hasCustomLayout}
                    className="p-1.5 hover:bg-purple-50 rounded text-zinc-700 disabled:opacity-30 transition"
                    title="Undo (Ctrl+Z)"
                  >
                    <Undo2 size={14} />
                  </button>
                  <button
                    onClick={handleRedo}
                    disabled={historyIndex >= history.length - 1 || currentAwardee.hasCustomLayout}
                    className="p-1.5 hover:bg-purple-50 rounded text-zinc-700 disabled:opacity-30 transition"
                    title="Redo (Ctrl+Y)"
                  >
                    <RotateCcw size={14} className="transform scale-x-[-1]" />
                  </button>
                </div>

                <div className="flex items-center gap-0.5 border border-purple-200 rounded-lg px-1 py-1 bg-white shadow-sm">
                  <button
                    onClick={zoomOut}
                    className="p-1.5 hover:bg-purple-50 rounded text-zinc-700 transition"
                    title="Zoom out"
                  >
                    <ZoomOut size={14} />
                  </button>
                  <button
                    onClick={resetZoom}
                    className="px-1.5 py-1 text-[11px] font-bold text-purple-900 min-w-[2.5rem] hover:bg-purple-50 rounded transition"
                    title="Reset zoom"
                  >
                    {Math.round(zoomMultiplier * 100)}%
                  </button>
                  <button
                    onClick={zoomIn}
                    className="p-1.5 hover:bg-purple-50 rounded text-zinc-700 transition"
                    title="Zoom in"
                  >
                    <ZoomIn size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedIds.length > 0 && !isPreviewMode && (
            <div className="absolute top-14 inset-x-0 z-50 flex justify-center px-4 pt-3 pointer-events-none">
              <div className="pointer-events-auto max-w-full overflow-x-auto bg-white/95 backdrop-blur-md border border-purple-200 rounded-2xl shadow-2xl px-3 py-1.5 flex items-center gap-2 flex-wrap justify-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex items-center gap-1 border border-transparent rounded-full bg-purple-50/80 px-1 py-1 shrink-0">
                  <button onClick={() => handleAlign('left')} className="p-1.5 text-zinc-700 hover:text-purple-700 hover:bg-purple-100 rounded-full transition" title="Align element left"><AlignLeft size={14} /></button>
                  <button onClick={() => handleAlign('center')} className="p-1.5 text-zinc-700 hover:text-purple-700 hover:bg-purple-100 rounded-full transition" title="Align element center"><AlignCenter size={14} /></button>
                  <button onClick={() => handleAlign('right')} className="p-1.5 text-zinc-700 hover:text-purple-700 hover:bg-purple-100 rounded-full transition" title="Align element right"><AlignRight size={14} /></button>
                </div>

                {selectedIds.length >= 3 && (
                  <div className="flex items-center gap-1 border border-purple-200 rounded-xl bg-white shadow-sm shrink-0 px-1">
                    <button
                      onClick={() => handleDistribute('horizontal')}
                      className="p-1.5 text-zinc-700 hover:text-purple-700 hover:bg-purple-50 rounded-l-xl transition"
                      title="Distribute horizontally (3+ elements)"
                    >
                      <AlignHorizontalDistributeCenter size={14} />
                    </button>
                    <button
                      onClick={() => handleDistribute('vertical')}
                      className="p-1.5 text-zinc-700 hover:text-purple-700 hover:bg-purple-50 rounded-r-xl transition"
                      title="Distribute vertically (3+ elements)"
                    >
                      <AlignVerticalDistributeCenter size={14} />
                    </button>
                  </div>
                )}

                {selectedIds.length === 1 && primarySelectedElement?.type === 'text' && (
                  <div className="flex items-center gap-1 border border-purple-200 rounded-xl bg-white shadow-sm shrink-0 px-1">
                    <button
                      onClick={copyTextStyle}
                      className="p-1.5 text-zinc-700 hover:text-purple-700 hover:bg-purple-50 rounded-l-xl transition"
                      title="Copy text style"
                    >
                      <Paintbrush size={14} />
                    </button>
                    <button
                      onClick={pasteTextStyle}
                      disabled={!copiedTextStyle}
                      className="p-1.5 text-zinc-700 hover:text-purple-700 hover:bg-purple-50 rounded-r-xl transition disabled:opacity-30"
                      title="Paste text style onto selected text"
                    >
                      <ClipboardPaste size={14} />
                    </button>
                  </div>
                )}

                {selectedIds.length === 1 && primarySelectedElement && primarySelectedElement.type === 'text' ? (
                  <>
                    <select 
                      value={primarySelectedElement.font} 
                      onChange={e => updateSelectedElement('font', e.target.value)}
                      className="bg-white text-xs border border-purple-200 rounded-xl px-2 py-1 text-zinc-800 font-medium shadow-sm focus:outline-none focus:border-purple-600 shrink-0 max-w-[140px]"
                    >
                      <optgroup label="Serif / Academic">
                        <option value="Cinzel">Cinzel</option>
                        <option value="Playfair Display">Playfair Display</option>
                        <option value="Cormorant Garamond">Cormorant Garamond</option>
                        <option value="Merriweather">Merriweather</option>
                        <option value="Bodoni Moda">Bodoni Moda</option>
                        <option value="serif">Georgia (System)</option>
                      </optgroup>
                      <optgroup label="Sans-Serif / Modern">
                        <option value="Inter">Inter</option>
                        <option value="Montserrat">Montserrat</option>
                        <option value="Poppins">Poppins</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Oswald">Oswald</option>
                        <option value="sans">System Sans</option>
                      </optgroup>
                      <optgroup label="Calligraphy / Script">
                        <option value="Great Vibes">Great Vibes</option>
                        <option value="Alex Brush">Alex Brush</option>
                        <option value="Dancing Script">Dancing Script</option>
                        <option value="Pinyon Script">Pinyon Script</option>
                        <option value="Allura">Allura</option>
                        <option value="cursive">System Cursive</option>
                      </optgroup>
                      <optgroup label="Monospace">
                        <option value="mono">Courier New (System)</option>
                      </optgroup>
                    </select>

                    <div className="flex items-center gap-1 border border-purple-200 rounded-xl px-2 py-1 bg-white shadow-sm shrink-0">
                      <input 
                        type="number" 
                        value={primarySelectedElement.fontSize} 
                        onChange={e => updateSelectedElement('fontSize', Number(e.target.value))}
                        className="w-14 bg-transparent text-xs text-zinc-900 font-semibold focus:outline-none"
                        title="Font size"
                      />
                      <span className="text-xs text-zinc-500">px</span>
                    </div>

                    <input 
                      type="color" 
                      value={primarySelectedElement.color || '#1f2937'} 
                      onChange={e => updateSelectedElement('color', e.target.value)}
                      className="w-8 h-8 rounded-full border border-purple-200 p-0 cursor-pointer shrink-0"
                      title="Text color"
                    />

                    <div className="flex items-center gap-1 border border-purple-200 rounded-xl bg-white shadow-sm shrink-0">
                      <button onClick={() => applyTextFormat('bold')} className="p-1.5 text-zinc-700 hover:text-purple-700 hover:bg-purple-50 transition rounded-l-xl" title="Bold"><Bold size={14} /></button>
                      <button onClick={() => applyTextFormat('italic')} className="p-1.5 text-zinc-700 hover:text-purple-700 hover:bg-purple-50 transition" title="Italic"><Italic size={14} /></button>
                      <button onClick={() => applyTextFormat('underline')} className="p-1.5 text-zinc-700 hover:text-purple-700 hover:bg-purple-50 transition rounded-r-xl" title="Underline"><Underline size={14} /></button>
                    </div>

                    <div className="flex items-center shrink-0 border border-purple-200 rounded-xl bg-white shadow-sm">
                      <button
                        onClick={() => handleTextAlign('left')}
                        className={`p-1.5 transition rounded-l-xl ${(primarySelectedElement.align || 'left') === 'left' ? 'bg-purple-100 text-purple-800' : 'text-zinc-700 hover:text-purple-700 hover:bg-purple-50'}`}
                        title="Align text left"
                      >
                        <AlignLeft size={14} />
                      </button>
                      <button
                        onClick={() => handleTextAlign('center')}
                        className={`p-1.5 transition ${primarySelectedElement.align === 'center' ? 'bg-purple-100 text-purple-800' : 'text-zinc-700 hover:text-purple-700 hover:bg-purple-50'}`}
                        title="Align text center"
                      >
                        <AlignCenter size={14} />
                      </button>
                      <button
                        onClick={() => handleTextAlign('right')}
                        className={`p-1.5 transition ${primarySelectedElement.align === 'right' ? 'bg-purple-100 text-purple-800' : 'text-zinc-700 hover:text-purple-700 hover:bg-purple-50'}`}
                        title="Align text right"
                      >
                        <AlignRight size={14} />
                      </button>
                      <button
                        onClick={() => handleTextAlign('justify')}
                        className={`p-1.5 transition rounded-r-xl ${primarySelectedElement.align === 'justify' ? 'bg-purple-100 text-purple-800' : 'text-zinc-700 hover:text-purple-700 hover:bg-purple-50'}`}
                        title="Justify text"
                      >
                        <AlignJustify size={14} />
                      </button>
                    </div>
                  </>
                ) : null}

                {selectedIds.length === 1 && primarySelectedElement && primarySelectedElement.type === 'line' ? (
                  <>
                    <input
                      type="color"
                      value={primarySelectedElement.color || '#1f2937'}
                      onChange={(e) => updateSelectedElement('color', e.target.value)}
                      onPointerDown={(e) => e.stopPropagation()}
                      className="w-8 h-8 rounded-full border border-purple-200 p-0 cursor-pointer shrink-0"
                      title="Border color"
                    />
                    <div className="flex items-center gap-1 border border-purple-200 rounded-xl px-2 py-1 bg-white shadow-sm shrink-0">
                      <span className="text-[10px] text-zinc-500 font-semibold uppercase">Width</span>
                      <input
                        type="number"
                        value={primarySelectedElement.height || 2}
                        min={1}
                        max={24}
                        onChange={(e) => updateSelectedElement('height', Number(e.target.value))}
                        onPointerDown={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        className="w-10 bg-transparent text-xs text-zinc-900 font-semibold focus:outline-none"
                        title="Border thickness in pixels"
                      />
                      <span className="text-xs text-zinc-500">px</span>
                    </div>
                    <select
                      value={primarySelectedElement.lineStyle || 'solid'}
                      onChange={(e) => updateSelectedElement('lineStyle', e.target.value)}
                      onPointerDown={(e) => e.stopPropagation()}
                      className="bg-white text-xs border border-purple-200 rounded-xl px-2 py-1 text-zinc-800 font-medium shadow-sm focus:outline-none focus:border-purple-600 shrink-0"
                      title="Border style"
                    >
                      {LINE_STYLE_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    <div className="flex items-center gap-1 border border-purple-200 rounded-xl px-2 py-1 bg-white shadow-sm shrink-0">
                      <span className="text-[10px] text-zinc-500 font-semibold uppercase">Length</span>
                      <input
                        type="number"
                        value={primarySelectedElement.width || 180}
                        min={30}
                        max={1200}
                        onChange={(e) => updateSelectedElement('width', Number(e.target.value))}
                        onPointerDown={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        className="w-14 bg-transparent text-xs text-zinc-900 font-semibold focus:outline-none"
                        title="Border length in pixels"
                      />
                      <span className="text-xs text-zinc-500">px</span>
                    </div>
                  </>
                ) : null}

                {selectedIds.length === 1 && primarySelectedElement && primarySelectedElement.type === 'qrcode' ? (
                  <>
                    <div className="flex items-center gap-1.5 border border-purple-200 rounded-xl px-2 py-1 bg-white shadow-sm shrink-0 min-w-[200px] max-w-[min(420px,70vw)]">
                      <QrCode size={14} className="text-purple-600 shrink-0" />
                      <input
                        type="text"
                        value={normalizeQrTemplate(primarySelectedElement.data || '')}
                        onChange={(e) => updateSelectedElementLive('data', e.target.value)}
                        onBlur={() => {
                          const normalized = normalizeQrTemplate(primarySelectedElement.data || '');
                          if (normalized !== (primarySelectedElement.data || '')) {
                            updateSelectedElementLive('data', normalized);
                          }
                          commitHistorySnapshot();
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        placeholder="https://verify.example.com/{{Name}}"
                        title={`QR encodes: ${getElementText(primarySelectedElement) || 'Enter URL or text with {{ColumnName}} tags'}`}
                        className="min-w-0 flex-1 bg-transparent text-xs text-zinc-900 font-medium focus:outline-none placeholder:text-zinc-400"
                      />
                    </div>
                    <div className="flex items-center gap-1 border border-purple-200 rounded-xl px-2 py-1 bg-white shadow-sm shrink-0">
                      <span className="text-[10px] text-zinc-500 font-semibold uppercase">Size</span>
                      <input
                        type="number"
                        value={primarySelectedElement.size || 90}
                        min={50}
                        max={300}
                        onChange={(e) => updateSelectedElement('size', Number(e.target.value))}
                        onPointerDown={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        className="w-12 bg-transparent text-xs text-zinc-900 font-semibold focus:outline-none"
                        title="QR code size in pixels"
                      />
                      <span className="text-xs text-zinc-500">px</span>
                    </div>
                  </>
                ) : null}

                <button
                  onClick={duplicateSelectedElements}
                  className="p-2 text-zinc-700 hover:text-purple-800 hover:bg-purple-50 rounded-full transition shrink-0"
                  title="Duplicate selected (Ctrl+D)"
                >
                  <Copy size={16} />
                </button>
                <button
                  onClick={toggleLockSelected}
                  className="p-2 text-zinc-700 hover:text-purple-800 hover:bg-purple-50 rounded-full transition shrink-0"
                  title={primarySelectedElement?.locked ? 'Unlock selected' : 'Lock position'}
                >
                  {primarySelectedElement?.locked ? <Unlock size={16} /> : <Lock size={16} />}
                </button>

                <button onClick={deleteSelectedElements} className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition shrink-0" title="Delete selected"><Trash2 size={16} /></button>
              </div>
            </div>
          )}

          <div 
            ref={containerRef}
            className={`flex-1 flex items-center justify-center overflow-auto relative select-none [scrollbar-gutter:stable] ${
              isPreviewMode ? 'bg-zinc-950 p-4' : 'bg-purple-50/20 p-6'
            }`}
            onPointerMove={isPreviewMode ? undefined : handlePointerMove}
            onPointerUp={isPreviewMode ? undefined : handlePointerUp}
          >
            <div 
              className="relative flex-shrink-0"
              style={{
                width: Math.round(canvasSize.width * displayScale),
                height: Math.round(canvasSize.height * displayScale),
              }}
            >
              <div
                className="absolute top-0 left-0"
                style={{
                  width: `${canvasSize.width}px`,
                  height: `${canvasSize.height}px`,
                  transform: `scale(${displayScale})`,
                  transformOrigin: 'top left',
                }}
              >
                {!isPreviewMode && showGuides && (
                  <>
                    <div 
                      className="absolute -top-6 left-0 right-0 h-5 bg-white border-b border-purple-200 flex items-center cursor-ns-resize z-20 shadow-sm"
                      onMouseDown={(e) => {
                        if (!canvasRef.current) return;
                        const rect = canvasRef.current.getBoundingClientRect();
                        const yPct = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
                        setGuides(prev => ({ ...prev, horizontal: [...prev.horizontal, yPct] }));
                        setActiveDraggingGuide({ type: 'horizontal', index: guides.horizontal.length });
                      }}
                      title="Click and drag down to add a horizontal guide line"
                    >
                      <span className="text-[9px] text-purple-800 px-1 font-mono font-bold">RULER</span>
                    </div>
                    <div 
                      className="absolute -left-6 top-0 bottom-0 w-5 bg-white border-r border-purple-200 flex flex-col items-center justify-center cursor-ew-resize z-20 shadow-sm"
                      onMouseDown={(e) => {
                        if (!canvasRef.current) return;
                        const rect = canvasRef.current.getBoundingClientRect();
                        const xPct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                        setGuides(prev => ({ ...prev, vertical: [...prev.vertical, xPct] }));
                        setActiveDraggingGuide({ type: 'vertical', index: guides.vertical.length });
                      }}
                      title="Click and drag right to add a vertical guide line"
                    >
                      <span className="text-[8px] text-purple-800 font-mono font-bold [writing-mode:vertical-lr]">RULER</span>
                    </div>
                  </>
                )}

                <div 
                  ref={canvasRef}
                  onPointerDown={handleCanvasPointerDown}
                  className="relative w-full h-full shadow-2xl overflow-hidden cursor-crosshair rounded-sm"
                  style={{
                    ...(bgType !== 'custom' ? PRESET_BACKGROUNDS[bgType].style : { backgroundColor: '#ffffff' })
                  }}
                >
                {bgType === 'custom' && customBg && (
                  <img 
                    src={customBg} 
                    alt="Custom Background" 
                    className="absolute pointer-events-none select-none"
                    style={{
                      width: `${bgTransform.width}%`,
                      height: `${bgTransform.height}%`,
                      left: `calc(50% + ${bgTransform.x}px)`,
                      top: `calc(50% + ${bgTransform.y}px)`,
                      transform: 'translate(-50%, -50%)',
                      objectFit: 'fill',
                      zIndex: 0
                    }}
                  />
                )}

                {activeSignatories.map((sig) => {
                  if (!sig.signatureImg) return null;
                  const nameEl = activeElements.find(el => el.sigId === sig.id && el.sigField === 'name');
                  if (!nameEl || nameEl.visible === false) return null;
                  return (
                    <div
                      key={`sig_img_${sig.id}`}
                      className="absolute pointer-events-none select-none flex justify-center"
                      style={{
                        left: `${nameEl.x}%`,
                        top: `${nameEl.y - 8}%`,
                        transform: 'translateX(-50%)',
                        zIndex: 9
                      }}
                    >
                      <img 
                        src={sig.signatureImg} 
                        alt="Signature" 
                        className="max-h-16 object-contain"
                      />
                    </div>
                  );
                })}

                {activeElements.map(el => {
                  if (el.visible === false) return null;
                  const isSelected = !isPreviewMode && selectedIds.includes(el.id);
                  const isEditing = !isPreviewMode && editingElementId === el.id;

                  return (
                    <div
                      key={el.id}
                      onPointerDown={(e) => { if (!isPreviewMode) handleElementPointerDown(e, el.id); }}
                      className={`absolute ${!isPreviewMode ? (el.locked ? 'cursor-not-allowed' : 'cursor-move') : ''} ${isSelected ? 'ring-2 ring-purple-600 bg-purple-600/5' : (!isPreviewMode ? 'hover:ring-1 hover:ring-purple-400/50' : '')} ${el.locked ? 'opacity-95' : ''}`}
                      style={{
                        left: `${el.x}%`,
                        top: `${el.y}%`,
                        transform: getTextElementTransform(el),
                        width: el.type === 'text' ? `${el.maxWidth || 80}%` : (el.type === 'line' || el.type === 'logo' || el.type === 'image') ? `${el.width || 100}px` : el.type === 'qrcode' ? `${el.size || 90}px` : 'auto',
                        zIndex: isSelected ? 30 : 10
                      }}
                    >
                      {el.locked && !isPreviewMode && (
                        <div className="absolute -top-2 -right-2 z-40 bg-amber-100 border border-amber-300 text-amber-800 rounded-full p-0.5 shadow-sm pointer-events-none">
                          <Lock size={10} />
                        </div>
                      )}
                      {el.type === 'text' ? (
                          isEditing ? (
                          <div
                            ref={editingNodeRef}
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => saveInlineEdit(el, e.currentTarget.textContent)}
                            onKeyDown={(e) => {
                              if (e.key === 'Escape') saveInlineEdit(el, e.currentTarget.textContent);
                              e.stopPropagation();
                            }}
                            onPointerDown={(e) => e.stopPropagation()}
                            className="w-full border-2 border-purple-600 rounded p-1.5 focus:outline-none bg-white shadow-2xl selection:bg-purple-200 selection:text-purple-950"
                            style={{
                              fontFamily: getFontFamily(el.font),
                              fontSize: `${el.fontSize}px`,
                              color: el.color,
                              textAlign: el.align || 'left',
                              fontWeight: el.bold ? 'bold' : 'normal',
                              lineHeight: 1.3,
                              display: 'block',
                              width: '100%'
                            }}
                          />
                        ) : (
                          <div 
                            onDoubleClick={(e) => {
                              if (isPreviewMode) return;
                              e.stopPropagation();
                              const displayNode = e.currentTarget;
                              const displayText = displayNode.textContent || '';
                              const editText = getEditableText(el);
                              let caretOffset = getCaretOffsetFromPoint(displayNode, e.clientX, e.clientY);
                              if (
                                caretOffset != null &&
                                displayText.length > 0 &&
                                editText.length > 0 &&
                                displayText !== editText
                              ) {
                                caretOffset = Math.min(
                                  editText.length,
                                  Math.round((caretOffset / displayText.length) * editText.length)
                                );
                              }
                              pendingEditRef.current = {
                                elementId: el.id,
                                text: editText,
                                caretOffset,
                                selectWord: true,
                              };
                              setEditingElementId(el.id);
                            }}
                            style={{
                              fontFamily: getFontFamily(el.font),
                              fontSize: `${el.fontSize}px`,
                              color: el.color,
                              textAlign: el.align || 'left',
                              fontWeight: el.bold ? 'bold' : 'normal',
                              whiteSpace: 'pre-wrap',
                              lineHeight: 1.3,
                              display: 'block',
                              width: '100%',
                              cursor: isPreviewMode ? 'default' : 'text'
                            }}
                            title={isPreviewMode ? '' : "Double-click to edit text & highlight specific letters/words"}
                            dangerouslySetInnerHTML={{ __html: getElementText(el) }}
                          />
                        )
                      ) : el.type === 'line' ? (
                        <div style={getLineElementStyle(el)} />
                      ) : el.type === 'logo' && logoImg ? (
                        <img 
                          src={logoImg} 
                          alt="Institution Logo" 
                          className="w-full h-auto object-contain pointer-events-none select-none"
                        />
                      ) : el.type === 'image' && el.src ? (
                        <img
                          src={el.src}
                          alt={el.label || 'Certificate image'}
                          className="w-full h-auto object-contain pointer-events-none select-none"
                        />
                      ) : el.type === 'qrcode' ? (
                        <QRCodeElement
                          text={getElementText(el) || el.data || 'https://batchcert.verify'}
                          size={el.size || 90}
                        />
                      ) : null}

                      {isSelected && !isPreviewMode && selectedIds.length === 1 && (
                        <div 
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            setIsResizing(true);
                            resizeStartRef.current = { startX: e.clientX, startWidth: el.maxWidth || 50, startElementWidth: el.width || el.size || 100 };
                          }}
                          className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-8 bg-purple-600 rounded-sm cursor-ew-resize z-40 shadow hover:bg-purple-500"
                          title="Drag to resize width"
                        />
                      )}
                    </div>
                  );
                })}

                {marquee && !isPreviewMode && (
                  <div 
                    className="absolute border border-purple-500 bg-purple-500/20 pointer-events-none z-40"
                    style={{
                      left: `${Math.min(marquee.startX, marquee.currentX)}%`,
                      top: `${Math.min(marquee.startY, marquee.currentY)}%`,
                      width: `${Math.abs(marquee.currentX - marquee.startX)}%`,
                      height: `${Math.abs(marquee.currentY - marquee.startY)}%`,
                    }}
                  />
                )}
                </div>

                {!isPreviewMode && showGuides && (
                  <div className="absolute inset-0 pointer-events-none overflow-visible z-50">
                    {guides.horizontal.map((yVal, idx) => (
                      <div 
                        key={`h_guide_${idx}`}
                        className="absolute left-0 right-0 h-[1px] bg-purple-500 border-t border-dashed border-purple-300 pointer-events-auto cursor-ns-resize group"
                        style={{ top: `${yVal}%` }}
                        onMouseDown={() => setActiveDraggingGuide({ type: 'horizontal', index: idx })}
                        title="Drag guide or drag off canvas to delete"
                      >
                        <span className="absolute left-2 -top-3 text-[9px] bg-purple-900 text-purple-200 px-1 rounded opacity-0 group-hover:opacity-100 transition font-mono">
                          Y: {yVal.toFixed(1)}% (Drag off to delete)
                        </span>
                      </div>
                    ))}

                    {guides.vertical.map((xVal, idx) => (
                      <div 
                        key={`v_guide_${idx}`}
                        className="absolute top-0 bottom-0 w-[1px] bg-purple-500 border-l border-dashed border-purple-300 pointer-events-auto cursor-ew-resize group"
                        style={{ left: `${xVal}%` }}
                        onMouseDown={() => setActiveDraggingGuide({ type: 'vertical', index: idx })}
                        title="Drag guide or drag off canvas to delete"
                      >
                        <span className="absolute top-2 -left-4 text-[9px] bg-purple-900 text-purple-200 px-1 rounded opacity-0 group-hover:opacity-100 transition font-mono [writing-mode:vertical-lr]">
                          X: {xVal.toFixed(1)}%
                        </span>
                      </div>
                    ))}

                    {snapStatus.x && (
                      <div className="absolute top-0 bottom-0 left-[50%] w-[2px] bg-purple-600 shadow-[0_0_8px_rgba(147,51,234,0.8)] pointer-events-none z-50">
                        <span className="absolute top-4 left-1 text-[10px] bg-purple-600 text-white px-1 rounded font-bold font-mono">CENTER X</span>
                      </div>
                    )}
                    {snapStatus.y && (
                      <div className="absolute left-0 right-0 top-[50%] h-[2px] bg-purple-600 shadow-[0_0_8px_rgba(147,51,234,0.8)] pointer-events-none z-50">
                        <span className="absolute left-4 top-1 text-[10px] bg-purple-600 text-white px-1 rounded font-bold font-mono">CENTER Y</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>

      <div className="h-8 bg-purple-50 border-t border-purple-200 flex items-center justify-center px-4 text-xs font-medium text-purple-900 z-30 shadow-inner">
        Created by: IndiannoGibbs August 2026
      </div>

    </div>
  );
}