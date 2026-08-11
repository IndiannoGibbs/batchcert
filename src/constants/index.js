export const GOOGLE_FONTS = [
  { id: 'Cinzel', name: 'Cinzel', family: "'Cinzel', serif", category: 'Serif / Academic' },
  { id: 'Playfair Display', name: 'Playfair Display', family: "'Playfair Display', serif", category: 'Serif / Academic' },
  { id: 'Cormorant Garamond', name: 'Cormorant Garamond', family: "'Cormorant Garamond', serif", category: 'Serif / Academic' },
  { id: 'Merriweather', name: 'Merriweather', family: "'Merriweather', serif", category: 'Serif / Academic' },
  { id: 'Bodoni Moda', name: 'Bodoni Moda', family: "'Bodoni Moda', serif", category: 'Serif / Academic' },
  { id: 'Inter', name: 'Inter', family: "'Inter', sans-serif", category: 'Sans-Serif / Modern' },
  { id: 'Montserrat', name: 'Montserrat', family: "'Montserrat', sans-serif", category: 'Sans-Serif / Modern' },
  { id: 'Poppins', name: 'Poppins', family: "'Poppins', sans-serif", category: 'Sans-Serif / Modern' },
  { id: 'Roboto', name: 'Roboto', family: "'Roboto', sans-serif", category: 'Sans-Serif / Modern' },
  { id: 'Oswald', name: 'Oswald', family: "'Oswald', sans-serif", category: 'Sans-Serif / Modern' },
  { id: 'Great Vibes', name: 'Great Vibes', family: "'Great Vibes', cursive", category: 'Calligraphy / Script' },
  { id: 'Alex Brush', name: 'Alex Brush', family: "'Alex Brush', cursive", category: 'Calligraphy / Script' },
  { id: 'Dancing Script', name: 'Dancing Script', family: "'Dancing Script', cursive", category: 'Calligraphy / Script' },
  { id: 'Pinyon Script', name: 'Pinyon Script', family: "'Pinyon Script', cursive", category: 'Calligraphy / Script' },
  { id: 'Allura', name: 'Allura', family: "'Allura', cursive", category: 'Calligraphy / Script' },
];

export const CANVAS_PRESETS = [
  { id: 'letter-landscape', name: 'US Letter Landscape', width: 1100, height: 850 },
  { id: 'letter-portrait', name: 'US Letter Portrait', width: 850, height: 1100 },
  { id: 'a4-landscape', name: 'A4 Landscape', width: 1123, height: 794 },
  { id: 'a4-portrait', name: 'A4 Portrait', width: 794, height: 1123 },
];

export const PRESET_BACKGROUNDS = {
  purpleGold: {
    name: 'Royal Purple & Gold',
    style: {
      backgroundColor: '#ffffff',
      borderLeft: '24px solid #581c87',
      borderTop: '6px solid #d97706',
      borderRight: '6px solid #581c87',
      borderBottom: '6px solid #d97706',
    },
  },
  gold: {
    name: 'Gold Elegance',
    style: {
      background: 'linear-gradient(135deg, #fffdfa 0%, #fef8ec 100%)',
      border: '14px double #d97706',
      outline: '2px solid #b45309',
      outlineOffset: '-10px',
    },
  },
  classic: {
    name: 'Academic Classic',
    style: {
      backgroundColor: '#ffffff',
      border: '10px solid #581c87',
      outline: '2px dashed #c084fc',
      outlineOffset: '-14px',
    },
  },
  modernMinimal: {
    name: 'Modern Minimal',
    style: {
      backgroundColor: '#fafafa',
      border: '1px solid #e4e4e7',
      outline: '4px solid #f4f4f5',
      outlineOffset: '-8px',
    },
  },
  darkMode: {
    name: 'Midnight Dark Mode',
    style: {
      backgroundColor: '#09090b',
      border: '12px solid #27272a',
      outline: '2px solid #d4d4d8',
      outlineOffset: '-16px',
    },
  },
};

export const AUTOSAVE_KEY = 'batchcert_project_auto';

export const BUILT_IN_CSV_HEADER_VARIANTS = new Set([
  'name', 'awardee name', 'awardee_name',
  'position', 'awardee position', 'awardee_position',
  'title',
]);

export const NAME_COLUMN_VARIANTS = ['Name', 'name', 'Awardee Name', 'awardee name', 'awardee_name', 'Full Name', 'full name'];
export const POSITION_COLUMN_VARIANTS = ['Position', 'position', 'Title', 'title', 'Awardee Position', 'awardee position', 'awardee_position', 'Role', 'role'];
