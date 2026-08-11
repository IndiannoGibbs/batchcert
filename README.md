# BatchCert

Browser-based batch certificate generator. Design one template, import a CSV awardee list, and export hundreds of personalized PDFs or PNGs — no server required.

## Features

- **CSV-powered batch generation** — import spreadsheets with column mapping and validation
- **Visual editor** — drag text, logos, QR codes; per-awardee custom layouts
- **Dynamic tags** — use `{{ColumnName}}` to pull any CSV column into certificate text
- **Local QR codes** — generated in-browser (no external API)
- **HD export** — ZIP of individual PDFs/PNGs or a single multi-page PDF (1x / 2x / 3x scale)
- **Auto-save** — projects persist in browser localStorage with restore on launch
- **Onboarding wizard** — sample project, guided setup, or CSV-first paths for first-time users
- **In-app documentation** — Quick Start, CSV format, canvas presets, export troubleshooting

## Quick Start

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

### First launch options

1. **Try Sample Project** — loads a pre-built certificate with 3 awardees
2. **Start Creating** — opens the editor; first-time users see the setup wizard
3. **Documentation** — in-app docs from the landing page or editor top bar

## CSV Format

Your CSV must include a **header row**. BatchCert maps columns during import.

```csv
Name,Position,Department
Jane Doe,Student Leader,Student Council
John Smith,Volunteer,Outreach
```

| Purpose | Recognized column names |
|---------|-------------------------|
| Awardee name | `Name`, `Full Name`, `Awardee Name` |
| Position / title | `Position`, `Title`, `Role` |
| Custom fields | Any other header → use `{{Department}}` in text elements |

Download a template: [`public/sample-awardees.csv`](public/sample-awardees.csv)

## Canvas Presets for Print

| Preset | Size (px) | Best for |
|--------|-----------|----------|
| US Letter Landscape | 1100×850 | Standard US print (recommended) |
| US Letter Portrait | 850×1100 | Vertical certificates |
| A4 Landscape | 1123×794 | International print |
| A4 Portrait | 794×1123 | International vertical |

Change preset in **Design → Canvas Size**. Match your background image aspect ratio to avoid white margins.

**Export scale:** use **2x HD** for print; **3x Ultra HD** for large-format or archival quality.

## Export Troubleshooting

### PDF shows wrong orientation (portrait instead of landscape)

Ensure canvas width is greater than height. US Letter Landscape is 1100×850. Re-export after selecting the correct preset.

### White space or clipped content on export

Use a canvas preset that matches your background image. Custom backgrounds should fill 100% width/height in Design settings.

### Fonts look different in PDF

Google Fonts load on editor launch. Wait a moment after opening the editor before exporting. Use web-safe fallbacks for critical print jobs.

### Export is slow or browser freezes

Large batches use chunked async processing. Prefer **2x** over **3x** for lists over 100 awardees. Close other heavy tabs during export.

### QR codes missing in export

QR codes are rendered locally. Ensure each QR element has a valid URL or text value before exporting.

## Dynamic Tags

Insert CSV values into text elements with double-brace syntax:

```
{{Name}}
{{Position}}
{{Department}}
```

Tags are case-sensitive and must match CSV headers exactly.

## Project Files

- **Save** (top bar) — downloads a `.json` project backup
- **Open** — restores a saved project file
- **Auto-save** — automatic localStorage backup; restore prompt on next launch

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm test` | Run Vitest unit tests |
| `npm run lint` | ESLint |

## Project Structure

```
src/
├── App.jsx                 # Main editor shell
├── components/
│   ├── OnboardingWizard.jsx
│   ├── DocsModal.jsx
│   ├── CsvImportModal.jsx
│   ├── ExportModal.jsx
│   └── ...
├── constants/
│   ├── index.js            # Canvas presets, fonts, backgrounds
│   └── sampleProject.js    # Sample onboarding project
├── hooks/
│   ├── useAutoSave.js
│   └── useCertificateExport.js
└── lib/
    ├── autosave.js
    ├── onboarding.js
    ├── csv/                  # Parse + validate CSV
    └── export/               # PDF/PNG export pipeline
```

## License

Private project — see repository owner for usage terms.
