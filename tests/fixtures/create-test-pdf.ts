import fs from 'node:fs';
import path from 'node:path';

/**
 * Creates a minimal valid 9-page PDF file with text content on each page.
 * Used for automated testing of multi-page slide decks in Syma Tech.
 */
export function generateNinePagePdfBuffer(): Buffer {
  const pageTitles = [
    'Lesson 1: What is Data?',
    'Understanding Data Observations',
    'Data vs Information',
    'Information vs Insight',
    'Qualitative and Quantitative Data',
    'Discrete and Continuous Data',
    'Structured and Unstructured Data',
    'The 7-Stage Data Lifecycle',
    'Summary and Key Takeaways',
  ];

  let objects: string[] = [];
  let offsets: number[] = [];

  function addObject(content: string): number {
    objects.push(content);
    return objects.length; // 1-based obj index
  }

  // 1: Catalog
  addObject(`<< /Type /Catalog /Pages 2 0 R >>`);

  // 2: Pages (placeholder, updated later)
  const pagesObjIndex = 2;
  objects.push(''); // placeholder for Pages

  // 3: Font
  const fontObjIndex = addObject(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`);

  const pageObjIndices: number[] = [];

  for (let i = 0; i < pageTitles.length; i++) {
    const pageNum = i + 1;
    const title = pageTitles[i];

    // Content stream for page
    const streamContent = `BT
/F1 24 Tf
50 500 Td
(SYMA TECH - Page ${pageNum} of 9) Tj
ET
BT
/F1 18 Tf
50 450 Td
(${title}) Tj
ET
BT
/F1 12 Tf
50 400 Td
(In-app slide deck learning experience verification.) Tj
ET`;

    const streamLength = Buffer.byteLength(streamContent, 'utf-8');
    const contentObjIndex = addObject(`<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream`);

    // Page object
    const pageObjIndex = addObject(`<<
  /Type /Page
  /Parent 2 0 R
  /MediaBox [0 0 612 792]
  /Contents ${contentObjIndex} 0 R
  /Resources <<
    /Font << /F1 ${fontObjIndex} 0 R >>
  >>
>>`);
    pageObjIndices.push(pageObjIndex);
  }

  // Update object 2 (Pages)
  const kidsStr = pageObjIndices.map((idx) => `${idx} 0 R`).join(' ');
  objects[pagesObjIndex - 1] = `<<
  /Type /Pages
  /Kids [ ${kidsStr} ]
  /Count ${pageTitles.length}
>>`;

  // Build full PDF file
  let pdf = `%PDF-1.4\n`;
  offsets.push(0); // dummy for index 0

  for (let i = 0; i < objects.length; i++) {
    const objNum = i + 1;
    offsets.push(Buffer.byteLength(pdf, 'utf-8'));
    pdf += `${objNum} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf, 'utf-8');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += `0000000000 65535 f \n`;

  for (let i = 1; i <= objects.length; i++) {
    const offsetStr = String(offsets[i]).padStart(10, '0');
    pdf += `${offsetStr} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, 'utf-8');
}

export function ensureTestPdfFixture(): string {
  const dir = path.resolve(process.cwd(), 'tests', 'fixtures');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const filePath = path.join(dir, 'what-is-data-9pages.pdf');
  const buffer = generateNinePagePdfBuffer();
  fs.writeFileSync(filePath, buffer);
  return filePath;
}
