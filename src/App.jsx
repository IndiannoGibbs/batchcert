import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, Download, Plus, Trash2, ChevronLeft, ChevronRight, 
  Move, Type, Image as ImageIcon, Layout, Users, FileText, 
  AlignLeft, AlignCenter, AlignRight, Palette, Scaling, Sliders, Minus, Save, FolderOpen,
  ZoomIn, ZoomOut, RotateCcw, CheckSquare, Undo2, SlidersHorizontal,
  Bold, Italic, Underline, FilePlus, FileCode, Award, PenTool,
  Layers, Eye, EyeOff, ArrowUp, ArrowDown, Check, X, Search, Maximize2, Minimize2, Grid,
  Maximize, Info
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';

// --- Preset Background Styles ---
const PRESET_BACKGROUNDS = {
  purpleGold: {
    name: 'Royal Purple & Gold',
    style: {
      backgroundColor: '#ffffff',
      borderLeft: '24px solid #581c87',
      borderTop: '6px solid #d97706',
      borderRight: '6px solid #581c87',
      borderBottom: '6px solid #d97706'
    }
  },
  gold: {
    name: 'Gold Elegance',
    style: {
      background: 'linear-gradient(135deg, #fffdfa 0%, #fef8ec 100%)',
      border: '14px double #d97706',
      outline: '2px solid #b45309',
      outlineOffset: '-10px'
    }
  },
  classic: {
    name: 'Academic Classic',
    style: {
      backgroundColor: '#ffffff',
      border: '10px solid #581c87',
      outline: '2px dashed #c084fc',
      outlineOffset: '-14px'
    }
  }
};

const deduplicateElements = (els) => {
  const map = new Map();
  (els || []).forEach(el => {
    if (el.key === 'eventDuties') return;
    const identifier = el.sigId && el.sigField ? `sig_${el.sigId}_${el.sigField}` : (el.key ? `key_${el.key}` : el.id);
    map.set(identifier, el);
  });
  return Array.from(map.values());
};

export default function CertificateGenerator() {
  const [activeTab, setActiveTab] = useState('data');
  const [bgType, setBgType] = useState('purpleGold');
  const [customBg, setCustomBg] = useState(null);
  
  const [projectName, setProjectName] = useState('BatchCert_Project');

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
      hasCustomLayout: false,
      customElements: null,
      customSignatories: null
    }
  ]);
  const [currentAwardeeIdx, setCurrentAwardeeIdx] = useState(0);

  // Preview, Guides & Quick Search States
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showGuides, setShowGuides] = useState(false);
  const [isAwardeeDropdownOpen, setIsAwardeeDropdownOpen] = useState(false);
  const [awardeeSearchQuery, setAwardeeSearchQuery] = useState('');

  // Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportMode, setExportMode] = useState('all'); 
  const [selectedExportIndices, setSelectedExportIndices] = useState([]);

  const initialElements = [];
  const [elements, setElements] = useState(initialElements);

  const [history, setHistory] = useState([initialElements]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [editingElementId, setEditingElementId] = useState(null);

  // Guide lines state (percentage relative to canvas 1100x850)
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
  };

  const handleGlobalDataChange = (key, val) => {
    setGlobalData(prev => ({ ...prev, [key]: val }));
    const defaults = {
      orgName: { x: 50, y: 11, fontSize: 24, font: 'serif', color: '#581c87', bold: true, maxWidth: 85, align: 'center' },
      orgSubtext: { x: 50, y: 16, fontSize: 24, font: 'sans', color: '#6b7280', bold: false, maxWidth: 80, align: 'center' },
      certificateTitle: { x: 50, y: 25, fontSize: 24, font: 'serif', color: '#581c87', bold: true, maxWidth: 85, align: 'center' },
      bodyTemplate: { x: 50, y: 55, fontSize: 24, font: 'serif', color: '#374151', bold: false, maxWidth: 78, align: 'center' },
      dateLine: { x: 50, y: 74, fontSize: 24, font: 'serif', color: '#6b7280', bold: false, maxWidth: 80, align: 'center' },
    }[key] || { x: 50, y: 50, fontSize: 24, font: 'sans', color: '#1f2937', bold: false, maxWidth: 80, align: 'center' };

    updateElementByKeyOrSig({ key }, val, defaults);
  };

  const handleAwardeeChange = (field, val) => {
    setAwardees(prev => prev.map((a, i) => i === currentAwardeeIdx ? { ...a, [field]: val } : a));
    const key = field === 'name' ? 'awardeeName' : 'awardeePosition';
    const defaults = field === 'name' 
      ? { x: 50, y: 36, fontSize: 24, font: 'serif', color: '#581c87', bold: true, maxWidth: 90, align: 'center' }
      : { x: 50, y: 44, fontSize: 24, font: 'sans', color: '#1f2937', bold: true, maxWidth: 85, align: 'center' };

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
      ? { x: posX, y: 87, fontSize: 24, font: 'sans', color: '#1f2937', bold: true, maxWidth: 40, align: 'center' }
      : { x: posX, y: 91, fontSize: 24, font: 'sans', color: '#4b5563', bold: false, maxWidth: 40, align: 'center' };

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

  useEffect(() => {
    const saved = localStorage.getItem('batchcert_project_auto');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        if (state.bgType) setBgType(state.bgType);
        if (state.customBg !== undefined) setCustomBg(state.customBg);
        if (state.bgTransform) setBgTransform(state.bgTransform);
        if (state.logoImg !== undefined) setLogoImg(state.logoImg);
        if (state.globalData) setGlobalData(state.globalData);
        if (state.signatories) setSignatories(state.signatories);
        if (state.awardees) setAwardees(state.awardees);
        if (state.projectName) setProjectName(state.projectName);
        if (state.elements) {
          const cleaned = deduplicateElements(state.elements);
          setElements(cleaned);
          setHistory([cleaned]);
          setHistoryIndex(0);
        }
      } catch (err) {
        console.error('Failed to load auto-saved project', err);
      }
    }
  }, []);

  useEffect(() => {
    try {
      const projectState = { bgType, customBg, bgTransform, logoImg, globalData, signatories, awardees, elements, projectName };
      localStorage.setItem('batchcert_project_auto', JSON.stringify(projectState));
    } catch (err) {
      console.warn('LocalStorage quota exceeded.', err);
    }
  }, [bgType, customBg, bgTransform, logoImg, globalData, signatories, awardees, elements, projectName]);

  const pushHistory = (newElements) => {
    const cleaned = deduplicateElements(newElements);
    if (currentAwardee.hasCustomLayout) {
      setAwardees(prev => prev.map((a, idx) => idx === currentAwardeeIdx ? { ...a, customElements: cleaned } : a));
    } else {
      const updatedHistory = history.slice(0, historyIndex + 1);
      updatedHistory.push(cleaned);
      setHistory(updatedHistory);
      setHistoryIndex(updatedHistory.length - 1);
      setElements(cleaned);
    }
  };

  const handleUndo = () => {
    if (!currentAwardee.hasCustomLayout && historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setElements(history[prevIndex]);
    }
  };

  const handleRedo = () => {
    if (!currentAwardee.hasCustomLayout && historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setElements(history[nextIndex]);
    }
  };

  const [selectedIds, setSelectedIds] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [marquee, setMarquee] = useState(null); 
  const dragStartRef = useRef({ clickX: 0, clickY: 0, initialPositions: {} });
  const resizeStartRef = useRef({ startX: 0, startWidth: 50, startElementWidth: 180 });

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const [canvasScale, setCanvasScale] = useState(1);
  const [zoomMultiplier, setZoomMultiplier] = useState(1);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      const targetWidth = 1100;
      const targetHeight = 850;
      const padding = 100;
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
  }, []);

  const zoomIn = () => setZoomMultiplier(prev => Math.min(2.5, prev + 0.15));
  const zoomOut = () => setZoomMultiplier(prev => Math.max(0.4, prev - 0.15));
  const resetZoom = () => setZoomMultiplier(1);

  const selectAllElements = () => {
    setSelectedIds(activeElements.map(el => el.id));
  };

  const getElementBounds = (el) => {
    let widthPct = 10;
    if (el.type === 'text') {
      widthPct = el.maxWidth || 50;
    } else if (el.type === 'line' || el.type === 'logo') {
      widthPct = ((el.width || 100) / 1100) * 100;
    }

    const isCentered = el.align === 'center' || el.type === 'logo';
    let left, center, right;

    if (isCentered) {
      center = el.x;
      left = el.x - widthPct / 2;
      right = el.x + widthPct / 2;
    } else {
      left = el.x;
      center = el.x + widthPct / 2;
      right = el.x + widthPct;
    }
    return { widthPct, isCentered, left, center, right, y: el.y };
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
        newX = match.isCentered ? targetVal + match.widthPct / 2 : targetVal;
      } else if (type === 'center') {
        newX = match.isCentered ? targetVal : targetVal - match.widthPct / 2;
      } else if (type === 'right') {
        newX = match.isCentered ? targetVal - match.widthPct / 2 : targetVal - match.widthPct;
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
        let newX = b.isCentered ? targetCenter : targetCenter - b.widthPct / 2;
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
      setGlobalData({ orgName: '', orgSubtext: '', dateLine: '', certificateTitle: '', eventDuties: '', bodyTemplate: '' });
      setSignatories([{ id: 'sig_1', name: '', title: '', signatureImg: null }]);
      setElements([]);
      setHistory([[]]);
      setHistoryIndex(0);
      setAwardees([{ id: '1', name: '', position: '', hasCustomLayout: false, customElements: null, customSignatories: null }]);
      setCurrentAwardeeIdx(0);
      setProjectName('Blank_BatchCert_Project');
      setCustomBg(null);
      setLogoImg(null);
      localStorage.removeItem('batchcert_project_auto');
    }
  };

  const handleSaveProject = () => {
    const projectState = { bgType, customBg, bgTransform, logoImg, globalData, signatories, awardees, elements, projectName };
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
        if (state.bgType) setBgType(state.bgType);
        if (state.customBg !== undefined) setCustomBg(state.customBg);
        if (state.bgTransform) setBgTransform(state.bgTransform);
        if (state.logoImg !== undefined) setLogoImg(state.logoImg);
        if (state.globalData) setGlobalData(state.globalData);
        if (state.signatories) setSignatories(state.signatories);
        if (state.awardees) setAwardees(state.awardees);
        if (state.projectName) setProjectName(state.projectName);
        if (state.elements) {
          const cleaned = deduplicateElements(state.elements);
          setElements(cleaned);
          setHistory([cleaned]);
          setHistoryIndex(0);
        }
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
      logoImg
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
          setHistory([cleaned]);
          setHistoryIndex(0);
        }
        if (state.signatories) setSignatories(state.signatories);
        if (state.bgType) setBgType(state.bgType);
        if (state.bgTransform) setBgTransform(state.bgTransform);
        if (state.logoImg !== undefined) setLogoImg(state.logoImg);
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

  const deleteSelectedElements = () => {
    if (selectedIds.length === 0) return;
    const updated = activeElements.filter(el => !selectedIds.includes(el.id));
    pushHistory(updated);
    setSelectedIds([]);
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
      fontSize: 24,
      font: 'sans',
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
      visible: true
    };
    const updated = [...activeElements, newEl];
    pushHistory(updated);
    setSelectedIds([newEl.id]);
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

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (isInput) return;
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        if (isInput) return;
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

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length > 0) {
        if (isInput || isEditingInline) return;
        e.preventDefault();
        deleteSelectedElements();
        return;
      }

      // Arrow Key Movement Handling
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

        pushHistory(updated);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, historyIndex, history, currentAwardeeIdx, currentAwardee.hasCustomLayout, activeElements, projectName, editingElementId]);

  const getElementText = (el) => {
    if (el.sigId) {
      const sig = activeSignatories.find(s => s.id === el.sigId);
      if (sig) return sig[el.sigField] || '';
    }

    if (el.text !== undefined && el.text !== null && !el.key) {
      return el.text;
    }

    const currentAwardeeObj = awardees[currentAwardeeIdx] || { name: '', position: '' };
    switch (el.key) {
      case 'orgName': return globalData.orgName || '';
      case 'orgSubtext': return globalData.orgSubtext || '';
      case 'certificateTitle': return globalData.certificateTitle || '';
      case 'bodyTemplate': {
        const template = globalData.bodyTemplate || '';
        const duties = globalData.eventDuties || '';
        if (template.includes('{{duties}}')) {
          return template.replace(/\{\{duties\}\}/g, duties);
        }
        return template;
      }
      case 'dateLine': return globalData.dateLine || '';
      case 'awardeeName': return currentAwardeeObj.name || '';
      case 'awardeePosition': return currentAwardeeObj.position || '';
      default: return el.text || '';
    }
  };

  const saveInlineEdit = (el, val) => {
    setEditingElementId(null);
    if (el.key === 'awardeeName') {
      setAwardees(prev => prev.map((a, idx) => idx === currentAwardeeIdx ? { ...a, name: val } : a));
    } else if (el.key === 'awardeePosition') {
      setAwardees(prev => prev.map((a, idx) => idx === currentAwardeeIdx ? { ...a, position: val } : a));
    } else if (el.key) {
      setGlobalData(prev => ({ ...prev, [el.key]: val }));
      updateElementByKeyOrSig({ key: el.key }, val);
    } else if (el.sigId) {
      if (currentAwardee.hasCustomLayout) {
        const updatedSigs = activeSignatories.map(s => s.id === el.sigId ? { ...s, [el.sigField]: val } : s);
        setAwardees(prev => prev.map((a, idx) => idx === currentAwardeeIdx ? { ...a, customSignatories: updatedSigs } : a));
      } else {
        setSignatories(prev => prev.map(s => s.id === el.sigId ? { ...s, [el.sigField]: val } : s));
      }
    } else {
      const updated = activeElements.map(item => item.id === el.id ? { ...item, text: val } : item);
      pushHistory(updated);
    }
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
    let newSelectedIds = [...selectedIds];

    if (e.shiftKey) {
      if (newSelectedIds.includes(id)) newSelectedIds = newSelectedIds.filter(i => i !== id);
      else newSelectedIds.push(id);
    } else {
      if (!newSelectedIds.includes(id)) newSelectedIds = [id];
    }

    setSelectedIds(newSelectedIds);
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
          const containerWidth = canvasRef.current ? canvasRef.current.clientWidth : 1100;
          const deltaPercent = (dx / (containerWidth * canvasScale * zoomMultiplier)) * 100;
          const newMaxWidth = Math.max(15, Math.min(100, resizeStartRef.current.startWidth + deltaPercent));
          const updated = activeElements.map(item => item.id === el.id ? { ...item, maxWidth: newMaxWidth } : item);
          if (currentAwardee.hasCustomLayout) {
            setAwardees(prev => prev.map((a, idx) => idx === currentAwardeeIdx ? { ...a, customElements: updated } : a));
          } else {
            setElements(updated);
          }
        } else if (el.type === 'line' || el.type === 'logo') {
          const newWidth = Math.max(30, resizeStartRef.current.startElementWidth + dx);
          const updated = activeElements.map(item => item.id === el.id ? { ...item, width: newWidth } : item);
          if (currentAwardee.hasCustomLayout) {
            setAwardees(prev => prev.map((a, idx) => idx === currentAwardeeIdx ? { ...a, customElements: updated } : a));
          } else {
            setElements(updated);
          }
        }
      }
      return;
    }

    if (!isDragging || selectedIds.length === 0) return;

    const deltaX = currX - dragStartRef.current.clickX;
    const deltaY = currY - dragStartRef.current.clickY;

    let isNearCenterX = false;
    let isNearCenterY = false;

    const updated = activeElements.map(el => {
      if (selectedIds.includes(el.id) && dragStartRef.current.initialPositions[el.id]) {
        const init = dragStartRef.current.initialPositions[el.id];
        let newX = init.x + deltaX;
        let newY = init.y + deltaY;

        if (Math.abs(newX - 50) < 1.0) {
          newX = 50;
          isNearCenterX = true;
        }
        if (Math.abs(newY - 50) < 1.0) {
          newY = 50;
          isNearCenterY = true;
        }

        newX = Math.max(2, Math.min(98, newX));
        newY = Math.max(2, Math.min(98, newY));
        return { ...el, x: newX, y: newY };
      }
      return el;
    });

    setSnapStatus({ x: isNearCenterX, y: isNearCenterY });

    if (currentAwardee.hasCustomLayout) {
      setAwardees(prev => prev.map((a, idx) => idx === currentAwardeeIdx ? { ...a, customElements: updated } : a));
    } else {
      setElements(updated);
    }
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

    if (isDragging || isResizing || marquee) pushHistory(activeElements);
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

  const handleCSVImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.split(/\r\n|\n/).filter(l => l.trim() !== '');
      
      const parsed = lines.slice(1).map((line, idx) => {
        const rawParts = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || line.split(',');
        const parts = rawParts.map(s => s.trim().replace(/^["']+|["']+$/g, '').replace(/""/g, '"'));

        return { 
          id: String(Date.now() + idx), 
          name: parts[0] || '', 
          position: parts[1] || '',
          hasCustomLayout: false,
          customElements: null,
          customSignatories: null
        };
      }).filter(item => item.name !== '');

      if (parsed.length > 0) {
        setAwardees(parsed);
        setCurrentAwardeeIdx(0);
        alert(`Successfully imported ${parsed.length} awardees! Layout and text formats remain unchanged.`);
      } else {
        alert('No valid rows found in CSV.');
      }
    };
    reader.readAsText(file);
  };

  const openExportModal = () => {
    setSelectedExportIndices(awardees.map((_, idx) => idx));
    setExportMode('all');
    setIsExportModalOpen(true);
  };

  const executeBatchZipExport = async () => {
    if (!canvasRef.current) return;
    setIsExportModalOpen(false);
    setIsExporting(true);
    setSelectedIds([]);

    const zip = new JSZip();
    const indicesToExport = exportMode === 'all' 
      ? awardees.map((_, idx) => idx) 
      : selectedExportIndices;

    const total = indicesToExport.length;

    for (let i = 0; i < total; i++) {
      const awardeeIdx = indicesToExport[i];
      setCurrentAwardeeIdx(awardeeIdx);
      setExportProgress(Math.round(((i + 1) / total) * 100));

      await new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 150)));

      const canvasElement = canvasRef.current;
      const renderedCanvas = await html2canvas(canvasElement, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const imgData = renderedCanvas.toDataURL('image/jpeg', 0.9);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'in',
        format: [11, 8.5]
      });
      pdf.addImage(imgData, 'JPEG', 0, 0, 11, 8.5);

      const awardeeObj = awardees[awardeeIdx];
      const safeName = (awardeeObj.name || `Awardee_${awardeeIdx + 1}`).replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `BatchCert_${awardeeIdx + 1}_${safeName}.pdf`;

      const pdfBlob = pdf.output('blob');
      zip.file(filename, pdfBlob);
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectName || 'BatchCert_Archive'}.zip`;
    link.click();
    URL.revokeObjectURL(url);

    setIsExporting(false);
    setExportProgress(0);
  };

  const getFontFamily = (font) => {
    switch (font) {
      case 'serif': return "'Georgia', 'Times New Roman', serif";
      case 'sans': return "'Inter', 'Helvetica', 'Arial', sans-serif";
      case 'cursive': return "'Brush Script MT', 'Great Vibes', cursive";
      case 'mono': return "'Courier New', monospace";
      default: return 'sans-serif';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white text-zinc-900 font-sans overflow-hidden select-none">
      
      {/* EXPORT MODAL */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-purple-200 rounded-xl w-[520px] max-h-[80vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-purple-100 flex justify-between items-center bg-purple-50/50 rounded-t-xl">
              <h3 className="text-sm font-bold text-purple-900 uppercase tracking-wider flex items-center gap-2">
                <Download size={16} className="text-purple-700" /> Export BatchCertificates (.zip Archive)
              </h3>
              <button 
                onClick={() => setIsExportModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-2">Select Export Scope:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setExportMode('all')}
                    className={`p-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition ${exportMode === 'all' ? 'border-purple-600 bg-purple-50 text-purple-900' : 'border-zinc-200 bg-white text-zinc-600'}`}
                  >
                    <CheckSquare size={16} className="text-purple-600" /> Export All ({awardees.length})
                  </button>
                  <button 
                    onClick={() => setExportMode('selected')}
                    className={`p-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition ${exportMode === 'selected' ? 'border-purple-600 bg-purple-50 text-purple-900' : 'border-zinc-200 bg-white text-zinc-600'}`}
                  >
                    <Users size={16} className="text-purple-600" /> Choose Specific
                  </button>
                </div>
              </div>

              {exportMode === 'selected' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[11px] text-zinc-500">
                    <span>Check awardees to include in ZIP:</span>
                    <button 
                      onClick={() => setSelectedExportIndices(awardees.map((_, i) => i))}
                      className="text-purple-700 hover:underline font-medium"
                    >
                      Select All
                    </button>
                  </div>
                  <div className="max-h-52 overflow-y-auto space-y-1.5 border border-purple-100 bg-purple-50/20 p-2 rounded-lg">
                    {awardees.map((awardee, idx) => {
                      const isChecked = selectedExportIndices.includes(idx);
                      return (
                        <label 
                          key={awardee.id || idx}
                          className="flex items-center justify-between p-2 rounded bg-white hover:bg-purple-50/60 cursor-pointer text-xs border border-purple-100/60 shadow-sm"
                        >
                          <span className="font-medium text-zinc-800">{idx + 1}. {awardee.name || '(Unnamed Awardee)'}</span>
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedExportIndices(prev => [...prev, idx]);
                              } else {
                                setSelectedExportIndices(prev => prev.filter(i => i !== idx));
                              }
                            }}
                            className="w-4 h-4 accent-purple-600 cursor-pointer rounded"
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-purple-100 bg-purple-50/50 flex justify-end gap-3 rounded-b-xl">
              <button 
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 text-xs font-semibold text-zinc-700 rounded transition shadow-sm"
              >
                Cancel
              </button>
              <button 
                onClick={executeBatchZipExport}
                disabled={exportMode === 'selected' && selectedExportIndices.length === 0}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded shadow transition disabled:opacity-50 flex items-center gap-2"
              >
                <Download size={14} /> Generate & Download ZIP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOP MENU BAR (Hidden in Preview Mode) */}
      {!isPreviewMode && (
        <div className="h-12 bg-white border-b border-purple-200 flex items-center justify-between px-4 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="text-xs font-extrabold text-purple-900 tracking-wider flex items-center gap-1.5 uppercase">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 100" width="100%" height="100%" className="h-9 w-auto flex-shrink-0">
                <defs>
                  <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#9333ea" />
                    <stop offset="100%" stop-color="#581c87" />
                  </linearGradient>
                </defs>
                
                <g transform="translate(10, 15) scale(0.75)">
                  <rect x="12" y="12" width="64" height="64" rx="8" fill="#f3e8ff" opacity="0.6" />
                  <rect x="4" y="4" width="64" height="64" rx="8" fill="url(#purpleGradient)" />
                  <line x1="16" y1="20" x2="44" y2="20" stroke="#ffffff" stroke-width="4" stroke-linecap="round" />
                  <line x1="16" y1="32" x2="56" y2="32" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.8" />
                  <line x1="16" y1="44" x2="36" y2="44" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.8" />
                  <circle cx="50" cy="50" r="14" fill="#ffffff" />
                  <path d="M44 50 L48 54 L57 44" fill="none" stroke="#581c87" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                </g>
                <text x="80" y="58" font-family="'Inter', 'Helvetica', sans-serif" font-size="28" font-weight="800" fill="#581c87" letter-spacing="-0.5">
                  Batch<tspan font-weight="400" fill="#9333ea">Cert</tspan>
                </text>
              </svg>
              </span>

            <div className="flex items-center gap-1 text-xs">
              <button 
                onClick={handleNewProject}
                className="px-2.5 py-1.5 hover:bg-purple-50 text-zinc-700 rounded font-medium flex items-center gap-1 transition"
              >
                <FilePlus size={13} className="text-purple-600" /> New
              </button>

              <label className="px-2.5 py-1.5 hover:bg-purple-50 text-zinc-700 rounded font-medium flex items-center gap-1 cursor-pointer transition">
                <FolderOpen size={13} className="text-purple-600" /> Open
                <input type="file" accept=".json" onChange={handleLoadProjectFromFile} className="hidden" />
              </label>

              <button 
                onClick={handleSaveProject}
                className="px-2.5 py-1.5 hover:bg-purple-50 text-zinc-700 rounded font-medium flex items-center gap-1 transition"
              >
                <Save size={13} className="text-purple-600" /> Save
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-500 font-medium">Project Name:</span>
            <input 
              type="text" 
              value={projectName} 
              onChange={(e) => setProjectName(e.target.value)}
              className="bg-purple-50/60 border border-purple-200 text-xs text-purple-950 font-semibold px-2.5 py-1 rounded focus:outline-none focus:border-purple-600 w-48 shadow-inner"
            />
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* SIDEBAR (Hidden in Preview Mode) */}
        {!isPreviewMode && (
          <div className="w-96 bg-white border-r border-purple-200 flex flex-col z-10 shadow-sm">
            
            <div className="flex border-b border-purple-100 bg-purple-50/40">
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
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-white">

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
                        placeholder=""
                        className="w-full mt-1 bg-white border border-purple-200 rounded px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-purple-600 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-600 font-medium">Campus & ISO Details</label>
                      <textarea 
                        rows={2}
                        value={globalData.orgSubtext} 
                        onChange={e => handleGlobalDataChange('orgSubtext', e.target.value)}
                        placeholder=""
                        className="w-full mt-1 bg-white border border-purple-200 rounded p-1.5 text-xs text-zinc-900 focus:outline-none focus:border-purple-600 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-600 font-medium">Certificate Title</label>
                      <input 
                        type="text" 
                        value={globalData.certificateTitle} 
                        onChange={e => handleGlobalDataChange('certificateTitle', e.target.value)}
                        placeholder=""
                        className="w-full mt-1 bg-white border border-purple-200 rounded px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-purple-600 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-purple-800 font-bold">Event / Duties (Applies to All)</label>
                      <textarea 
                        rows={3}
                        value={globalData.eventDuties} 
                        onChange={e => handleGlobalDataChange('eventDuties', e.target.value)}
                        placeholder=""
                        className="w-full mt-1 bg-white border border-purple-200 rounded p-1.5 text-xs text-purple-950 font-medium focus:outline-none focus:border-purple-600 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-600 font-medium">Body Sentence Template (use {'{{duties}}'})</label>
                      <textarea 
                        rows={3}
                        value={globalData.bodyTemplate} 
                        onChange={e => handleGlobalDataChange('bodyTemplate', e.target.value)}
                        placeholder=""
                        className="w-full mt-1 bg-white border border-purple-200 rounded p-1.5 text-xs text-zinc-900 focus:outline-none focus:border-purple-600 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-600 font-medium">Date & Location Line</label>
                      <textarea 
                        rows={2}
                        value={globalData.dateLine} 
                        onChange={e => handleGlobalDataChange('dateLine', e.target.value)}
                        placeholder=""
                        className="w-full mt-1 bg-white border border-purple-200 rounded p-1.5 text-xs text-zinc-900 focus:outline-none focus:border-purple-600 shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Awardees List */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider">Awardees List ({awardees.length})</h3>
                      <label className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 px-2.5 py-1 rounded-md cursor-pointer flex items-center gap-1 font-semibold transition shadow-sm">
                        <Upload size={12} className="text-purple-600" /> CSV Import
                        <input type="file" accept=".csv" onChange={handleCSVImport} className="hidden" />
                      </label>
                    </div>
                    <div className="p-2.5 bg-purple-50/60 border border-purple-200/80 rounded-xl space-y-1 text-xs">
                            <div className="flex items-center gap-1.5 font-semibold text-purple-900">
                              <Info className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                              <span>CSV Format Requirement</span>
                            </div>
                            <p className="text-[11px] text-gray-600 leading-tight">
                              First row header required: <b>Name, Position</b>
                            </p>
                            <div className="bg-white/80 border border-purple-100 p-1.5 rounded-lg text-[10px] font-mono text-purple-800 leading-tight">
                              Name,Position<br />
                              Juan Dela Cruz,Speaker<br />
                              Maria Clara,Participant
                            </div>
                            <p className="text-[11px] text-gray-600 leading-tight">
                            <b>Optional:</b> Add "" double quotes for positions with commas. <b>e.g ("Dean, College of Science")</b>
                            </p>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {awardees.map((item, idx) => (
                        <div 
                          key={item.id} 
                          onClick={() => setCurrentAwardeeIdx(idx)}
                          className={`p-3 rounded-xl border flex flex-col gap-2 cursor-pointer transition shadow-sm ${currentAwardeeIdx === idx ? 'border-purple-600 bg-purple-50/50' : 'border-purple-100 bg-white hover:bg-purple-50/20'}`}
                        >
                          <div className="flex justify-between items-center">
                            <input 
                              type="text" 
                              value={item.name} 
                              onChange={(e) => handleAwardeeChange('name', e.target.value)}
                              placeholder="Awardee Name"
                              className="w-full bg-transparent font-bold text-sm text-zinc-900 focus:outline-none"
                            />
                            <button 
                              onClick={(e) => { e.stopPropagation(); if (awardees.length > 1) setAwardees(awardees.filter((_, i) => i !== idx)); }}
                              className="text-zinc-400 hover:text-red-500 p-1 transition"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          
                          <div>
                            <label className="text-[10px] text-purple-700 block font-bold uppercase">POSITION</label>
                            <input 
                              type="text" 
                              value={item.position} 
                              onChange={(e) => handleAwardeeChange('position', e.target.value)}
                              placeholder="Position / Designation"
                              className="w-full bg-white border border-purple-200 rounded px-2 py-1 text-xs text-purple-950 font-semibold focus:outline-none focus:border-purple-600 uppercase shadow-sm"
                            />
                          </div>

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
                      ))}
                    </div>

                    <button 
                      onClick={() => setAwardees([...awardees, { id: String(Date.now()), name: '', position: '', hasCustomLayout: false, customElements: null, customSignatories: null }])} 
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
                          placeholder="Signatory Name"
                          className="w-full bg-white border border-purple-200 rounded px-2.5 py-1.5 text-xs font-bold text-zinc-900 shadow-sm focus:outline-none focus:border-purple-600"
                        />

                        <input 
                          type="text" 
                          value={sig.title} 
                          onChange={e => handleSignatoryChange(sig.id, 'title', e.target.value)}
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
                  {/* Custom Template Saving / Loading */}
                  <div className="space-y-2 bg-purple-50/30 p-3.5 rounded-xl border border-purple-100 shadow-sm">
                    <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                      <PenTool size={14} className="text-purple-600" /> Layout Template Management
                    </h3>
                    <p className="text-[11px] text-zinc-500">Save positions, fonts, logo, and signers as a reusable template.</p>
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

                  <div className="space-y-2 pt-2 border-t border-purple-100">
                    <label className="text-xs font-bold text-purple-900 uppercase tracking-wider block">Canvas Tools</label>
                    <div className="flex gap-2">
                      <button 
                        onClick={addTextElement}
                        className="flex-1 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-xs font-bold text-purple-900 flex items-center justify-center gap-1 transition shadow-sm"
                      >
                        <Plus size={14} /> Add Text Box
                      </button>
                      <button 
                        onClick={addLineElement}
                        className="flex-1 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-xs font-bold text-purple-900 flex items-center justify-center gap-1 transition shadow-sm"
                      >
                        <Minus size={14} /> Add Line Tool
                      </button>
                    </div>
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
                      const displayName = el.label || el.key || (el.type === 'line' ? 'Horizontal Line' : (el.text ? el.text.substring(0, 20) : el.id));
                      
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

            <div className="p-4 border-t border-purple-100 bg-purple-50/40">
              <button 
                onClick={openExportModal}
                disabled={isExporting}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 font-bold text-white rounded-xl shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <Download size={18} />
                {isExporting ? `Exporting ZIP (${exportProgress}%)...` : `Export Certificates (ZIP)`}
              </button>
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50">
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

        {/* WORKSPACE CANVAS WITH RULERS */}
        <div className="flex-1 flex flex-col bg-slate-100 relative overflow-hidden">
          
          {/* FLOATING EXIT PREVIEW BUTTON */}
          {isPreviewMode && (
            <button 
              onClick={() => setIsPreviewMode(false)}
              className="fixed top-6 right-6 z-50 bg-white/90 text-purple-900 border border-purple-300 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold hover:bg-white backdrop-blur transition"
            >
              <Minimize2 size={15} /> Exit Preview Mode
            </button>
          )}

          {/* CANVAS TOOLBAR (Hidden in Preview Mode) */}
          {!isPreviewMode && (
            <div className="min-h-[56px] border-b border-purple-200 bg-white/95 backdrop-blur px-4 py-2 flex flex-wrap items-center justify-between gap-3 z-20 shadow-sm">
              
              <div className="flex flex-wrap items-center gap-3">
                {/* QUICK AWARDEE SWITCHER DROPDOWN */}
                <div className="flex items-center gap-1 bg-purple-50/80 border border-purple-200 rounded-lg px-1.5 py-1 relative shadow-sm">
                  <button 
                    onClick={() => setCurrentAwardeeIdx(prev => Math.max(0, prev - 1))}
                    disabled={currentAwardeeIdx === 0}
                    className="p-1 hover:bg-purple-100 rounded text-zinc-700 disabled:opacity-30 transition"
                    title="Previous Awardee"
                  >
                    <ChevronLeft size={14} />
                  </button>

                  <div className="relative">
                    <button 
                      onClick={() => setIsAwardeeDropdownOpen(prev => !prev)}
                      className="text-xs text-purple-900 font-bold px-2 hover:bg-purple-100 rounded-md flex items-center gap-1 py-0.5 transition"
                      title="Click to search and jump to awardee"
                    >
                      Awardee {currentAwardeeIdx + 1} of {awardees.length} ▾
                    </button>

                    {isAwardeeDropdownOpen && (
                      <div className="absolute left-0 mt-2 w-64 bg-white border border-purple-200 rounded-xl shadow-2xl z-50 p-2 space-y-2">
                        <div className="flex items-center gap-1 bg-purple-50 px-2 py-1.5 rounded-lg border border-purple-200">
                          <Search size={13} className="text-purple-600" />
                          <input 
                            type="text"
                            placeholder="Search awardee..."
                            value={awardeeSearchQuery}
                            onChange={(e) => setAwardeeSearchQuery(e.target.value)}
                            className="bg-transparent text-xs text-zinc-900 focus:outline-none w-full font-medium"
                            autoFocus
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto space-y-1">
                          {awardees
                            .map((a, idx) => ({ ...a, originalIdx: idx }))
                            .filter(a => (a.name || '').toLowerCase().includes(awardeeSearchQuery.toLowerCase()))
                            .map((a) => (
                              <button
                                key={a.id || a.originalIdx}
                                onClick={() => {
                                  setCurrentAwardeeIdx(a.originalIdx);
                                  setIsAwardeeDropdownOpen(false);
                                  setAwardeeSearchQuery('');
                                }}
                                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition ${currentAwardeeIdx === a.originalIdx ? 'bg-purple-100 text-purple-950 font-bold' : 'hover:bg-purple-50 text-zinc-700'}`}
                              >
                                <span className="truncate">{a.originalIdx + 1}. {a.name || '(Unnamed)'}</span>
                                {currentAwardeeIdx === a.originalIdx && <Check size={12} className="text-purple-700" />}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => setCurrentAwardeeIdx(prev => Math.min(awardees.length - 1, prev + 1))}
                    disabled={currentAwardeeIdx === awardees.length - 1}
                    className="p-1 hover:bg-purple-100 rounded text-zinc-700 disabled:opacity-30 transition"
                    title="Next Awardee"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>

                {/* Alignment & Distribution Tools */}
                {selectedIds.length > 0 && (
                  <div className="flex items-center gap-1 border border-purple-200 rounded-lg px-2 py-1 bg-purple-50/50 shadow-sm">
                    <span className="text-[10px] text-purple-900 uppercase font-bold mr-1">Align:</span>
                    <button onClick={() => handleAlign('left')} className="p-1 text-zinc-700 hover:text-purple-700 hover:bg-purple-100 rounded transition" title="Align Left"><AlignLeft size={14} /></button>
                    <button onClick={() => handleAlign('center')} className="p-1 text-zinc-700 hover:text-purple-700 hover:bg-purple-100 rounded transition" title="Align Center"><AlignCenter size={14} /></button>
                    <button onClick={() => handleAlign('right')} className="p-1 text-zinc-700 hover:text-purple-700 hover:bg-purple-100 rounded transition" title="Align Right"><AlignRight size={14} /></button>
                    {selectedIds.length >= 3 && (
                      <>
                        <div className="h-3 w-[1px] bg-purple-200 mx-1" />
                        <span className="text-[10px] text-purple-900 uppercase font-bold mr-1">Distribute:</span>
                        <button onClick={() => handleDistribute('horizontal')} className="px-1.5 py-0.5 text-[10px] text-purple-900 hover:bg-purple-200 bg-purple-100 rounded font-bold transition" title="Distribute Horizontally">H</button>
                        <button onClick={() => handleDistribute('vertical')} className="px-1.5 py-0.5 text-[10px] text-purple-900 hover:bg-purple-200 bg-purple-100 rounded font-bold transition" title="Distribute Vertically">V</button>
                      </>
                    )}
                  </div>
                )}

                {selectedIds.length === 1 && primarySelectedElement && primarySelectedElement.type === 'text' ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <select 
                      value={primarySelectedElement.font} 
                      onChange={e => updateSelectedElement('font', e.target.value)}
                      className="bg-white text-xs border border-purple-200 rounded-lg px-2.5 py-1 text-zinc-800 font-medium shadow-sm focus:outline-none focus:border-purple-600"
                    >
                      <option value="serif">Classic Serif</option>
                      <option value="sans">Modern Sans</option>
                      <option value="cursive">Calligraphy</option>
                    </select>

                    <div className="flex items-center gap-1 border border-purple-200 rounded-lg px-2 py-1 bg-white shadow-sm">
                      <span className="text-xs text-zinc-500 font-medium">Size:</span>
                      <input 
                        type="number" 
                        value={primarySelectedElement.fontSize} 
                        onChange={e => updateSelectedElement('fontSize', Number(e.target.value))}
                        className="w-10 bg-transparent text-xs text-zinc-900 font-semibold focus:outline-none"
                      />
                      <span className="text-xs text-zinc-400">px</span>
                    </div>

                    <div className="flex items-center gap-1 border border-purple-200 rounded-lg px-2 py-1 bg-white shadow-sm">
                      <span className="text-xs text-zinc-500 font-medium">Color:</span>
                      <input 
                        type="color" 
                        value={primarySelectedElement.color || '#1f2937'} 
                        onChange={e => updateSelectedElement('color', e.target.value)}
                        className="w-6 h-5 bg-transparent cursor-pointer border-0 p-0 rounded"
                      />
                    </div>

                    <div className="flex border border-purple-200 rounded-lg overflow-hidden bg-white shadow-sm">
                      <button onClick={() => applyTextFormat('bold')} className="p-1.5 text-zinc-700 hover:text-purple-700 hover:bg-purple-50 transition" title="Bold"><Bold size={14} /></button>
                      <button onClick={() => applyTextFormat('italic')} className="p-1.5 text-zinc-700 hover:text-purple-700 hover:bg-purple-50 transition" title="Italic"><Italic size={14} /></button>
                      <button onClick={() => applyTextFormat('underline')} className="p-1.5 text-zinc-700 hover:text-purple-700 hover:bg-purple-50 transition" title="Underline"><Underline size={14} /></button>
                    </div>
                    <button onClick={deleteSelectedElements} className="px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded-lg text-xs font-semibold shadow-sm transition">Delete</button>
                  </div>
                ) : selectedIds.length === 1 && primarySelectedElement && (primarySelectedElement.type === 'line' || primarySelectedElement.type === 'logo') ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-purple-900 font-bold">{primarySelectedElement.type === 'logo' ? 'Logo Element:' : 'Line Tool:'}</span>
                    <div className="flex items-center gap-1 border border-purple-200 rounded-lg px-2 py-1 bg-white shadow-sm">
                      <span className="text-xs text-zinc-500 font-medium">Width:</span>
                      <input 
                        type="number" 
                        value={primarySelectedElement.width} 
                        onChange={e => updateSelectedElement('width', Number(e.target.value))}
                        className="w-14 bg-transparent text-xs text-zinc-900 font-semibold focus:outline-none"
                      />
                      <span className="text-xs text-zinc-400">px</span>
                    </div>
                    <button onClick={deleteSelectedElements} className="px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded-lg text-xs font-semibold shadow-sm transition">Delete</button>
                  </div>
                ) : null}
              </div>

              <div className="flex items-center gap-3">
                {/* GUIDES TOGGLE BUTTON */}
                <button 
                  onClick={() => setShowGuides(prev => !prev)}
                  className={`px-2.5 py-1.5 border rounded-lg text-xs flex items-center gap-1.5 transition font-bold shadow-sm ${showGuides ? 'bg-purple-100 border-purple-400 text-purple-950' : 'bg-white border-purple-200 text-zinc-600 hover:bg-purple-50'}`}
                  title="Toggle Ruler Guides"
                >
                  <Grid size={13} className="text-purple-600" /> Guides: {showGuides ? 'On' : 'Off'}
                </button>

                {/* PREVIEW MODE TOGGLE BUTTON */}
                <button 
                  onClick={() => setIsPreviewMode(true)}
                  className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-lg text-xs flex items-center gap-1.5 transition font-bold shadow-sm"
                  title="Toggle Full-Screen Preview"
                >
                  <Maximize2 size={13} className="text-purple-600" /> Preview Mode
                </button>

                {/* Visible Undo / Redo Buttons */}
                <div className="flex items-center gap-1 border border-purple-200 rounded-lg px-1.5 py-1 bg-white shadow-sm">
                  <button 
                    onClick={handleUndo} 
                    disabled={historyIndex === 0 || currentAwardee.hasCustomLayout} 
                    className="p-1 hover:bg-purple-50 rounded text-zinc-700 disabled:opacity-30 transition" 
                    title="Undo (Ctrl+Z)"
                  >
                    <Undo2 size={14} />
                  </button>
                  <button 
                    onClick={handleRedo} 
                    disabled={historyIndex >= history.length - 1 || currentAwardee.hasCustomLayout} 
                    className="p-1 hover:bg-purple-50 rounded text-zinc-700 disabled:opacity-30 transition" 
                    title="Redo (Ctrl+Y)"
                  >
                    <RotateCcw size={14} className="transform scale-x-[-1]" />
                  </button>
                </div>

                <div className="h-4 w-[1px] bg-purple-200" />

                <button onClick={zoomOut} className="p-1.5 bg-white border border-purple-200 hover:bg-purple-50 rounded-lg text-zinc-700 shadow-sm transition" title="Zoom Out"><ZoomOut size={14} /></button>
                <button onClick={resetZoom} className="text-xs font-bold text-purple-900" title="Reset Zoom">{Math.round(zoomMultiplier * 100)}%</button>
                <button onClick={zoomIn} className="p-1.5 bg-white border border-purple-200 hover:bg-purple-50 rounded-lg text-zinc-700 shadow-sm transition" title="Zoom In"><ZoomIn size={14} /></button>
              </div>
            </div>
          )}

          <div 
            ref={containerRef}
            className={`flex-1 flex items-center justify-center p-12 overflow-auto relative select-none ${isPreviewMode ? 'bg-zinc-950' : 'bg-purple-50/20'}`}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {/* SCALED WRAPPER CONTAINER */}
            <div 
              className="relative flex-shrink-0"
              style={{
                width: `${1100 * canvasScale * zoomMultiplier}px`,
                height: `${850 * canvasScale * zoomMultiplier}px`,
              }}
            >
              
              {/* TOP HORIZONTAL RULER (Shown only when showGuides is true) */}
              {!isPreviewMode && showGuides && (
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
              )}

              {/* LEFT VERTICAL RULER (Shown only when showGuides is true) */}
              {!isPreviewMode && showGuides && (
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
              )}

              {/* CANVAS */}
              <div 
                ref={canvasRef}
                onPointerDown={handleCanvasPointerDown}
                className="absolute inset-0 shadow-2xl overflow-hidden cursor-crosshair rounded-sm"
                style={{
                  width: '1100px',
                  height: '850px',
                  transform: `scale(${canvasScale * zoomMultiplier})`,
                  transformOrigin: 'top left',
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

                {/* Render Signature Images above signature fields automatically if uploaded */}
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
                      className={`absolute ${!isPreviewMode ? 'cursor-move' : ''} ${isSelected ? 'ring-2 ring-purple-600 bg-purple-600/5' : (!isPreviewMode ? 'hover:ring-1 hover:ring-purple-400/50' : '')}`}
                      style={{
                        left: `${el.x}%`,
                        top: `${el.y}%`,
                        transform: el.type === 'logo' || el.align === 'center' ? 'translateX(-50%)' : 'none',
                        width: el.type === 'text' && el.maxWidth ? `${el.maxWidth}%` : (el.type === 'line' || el.type === 'logo') ? `${el.width || 100}px` : 'auto',
                        zIndex: isSelected ? 30 : 10
                      }}
                    >
                      {el.type === 'text' ? (
                        isEditing ? (
                          <div
                            contentEditable
                            suppressContentEditableWarning
                            autoFocus
                            dangerouslySetInnerHTML={{ __html: getElementText(el) }}
                            onBlur={(e) => saveInlineEdit(el, e.currentTarget.innerHTML)}
                            onKeyDown={(e) => { if (e.key === 'Escape') saveInlineEdit(el, e.currentTarget.innerHTML); }}
                            onPointerDown={(e) => e.stopPropagation()}
                            className="w-full border-2 border-purple-600 rounded p-1.5 focus:outline-none bg-white shadow-2xl selection:bg-purple-200 selection:text-purple-950"
                            style={{
                              fontFamily: getFontFamily(el.font),
                              fontSize: `${el.fontSize}px`,
                              color: el.color,
                              textAlign: el.align,
                              fontWeight: el.bold ? 'bold' : 'normal',
                              lineHeight: 1.3
                            }}
                          />
                        ) : (
                          <div 
                            onDoubleClick={(e) => { if (!isPreviewMode) { e.stopPropagation(); setEditingElementId(el.id); } }}
                            style={{
                              fontFamily: getFontFamily(el.font),
                              fontSize: `${el.fontSize}px`,
                              color: el.color,
                              textAlign: el.align,
                              fontWeight: el.bold ? 'bold' : 'normal',
                              whiteSpace: 'pre-wrap',
                              lineHeight: 1.3,
                              cursor: isPreviewMode ? 'default' : 'text'
                            }}
                            title={isPreviewMode ? '' : "Double-click to edit text & highlight specific letters/words"}
                            dangerouslySetInnerHTML={{ __html: getElementText(el) }}
                          />
                        )
                      ) : el.type === 'line' ? (
                        <div 
                          style={{
                            width: '100%',
                            height: `${el.height || 2}px`,
                            backgroundColor: el.color || '#1f2937'
                          }}
                        />
                      ) : el.type === 'logo' && logoImg ? (
                        <img 
                          src={logoImg} 
                          alt="Institution Logo" 
                          className="w-full h-auto object-contain pointer-events-none select-none"
                        />
                      ) : null}

                      {isSelected && !isPreviewMode && (
                        <div 
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            setIsResizing(true);
                            resizeStartRef.current = { startX: e.clientX, startWidth: el.maxWidth || 50, startElementWidth: el.width || 100 };
                          }}
                          className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-8 bg-purple-600 rounded-sm cursor-ew-resize z-40 shadow hover:bg-purple-500"
                          title="Drag to resize width"
                        />
                      )}
                    </div>
                  );
                })}

                {/* MARQUEE SELECTION BOX VISUAL OVERLAY */}
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

              {/* GUIDE LINES OVERLAY (Shown only when showGuides is true) */}
              {!isPreviewMode && showGuides && (
                <div 
                  className="absolute inset-0 pointer-events-none overflow-hidden"
                  style={{
                    transform: `scale(${canvasScale * zoomMultiplier})`,
                    transformOrigin: 'top left',
                    width: '1100px',
                    height: '850px',
                    zIndex: 50
                  }}
                >
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

      {/* FOOTER */}
      <div className="h-8 bg-purple-50 border-t border-purple-200 flex items-center justify-center px-4 text-xs font-medium text-purple-900 z-30 shadow-inner">
        Created by: IndiannoGibbs August 2026
      </div>

    </div>
  );
}