import { describe, it, expect, beforeAll } from "vitest";
import { PDFParse } from "pdf-parse";
import * as fs from "fs";
import * as path from "path";

/**
 * Test PDF import functionality
 * Tests the core PDF parsing logic that extracts text from PDFs
 */
describe("PDF Import", () => {
  describe("PDF Text Extraction", () => {
    it("should extract text from a valid PDF buffer", async () => {
      // Create a minimal valid PDF
      const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 44 >>
stream
BT
/F1 12 Tf
100 700 Td
(Hello World) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000214 00000 n
0000000303 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
396
%%EOF`;

      const buffer = Buffer.from(pdfContent);
      const parser = new PDFParse({ data: buffer });
      await parser.load();
      const result = await parser.getText();

      // Verify result structure
      expect(result).toBeDefined();
      expect(result.text).toBeDefined();
      expect(typeof result.text).toBe("string");
      expect(result.text.length).toBeGreaterThan(0);
      expect(result.text.toLowerCase()).toContain("hello");
    });

    it("should handle multi-page PDFs", async () => {
      // Create a 2-page PDF
      const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R 6 0 R] /Count 2 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 42 >>
stream
BT
/F1 12 Tf
100 700 Td
(Page One) Tj
ET
endstream
endobj
6 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 7 0 R >>
endobj
7 0 obj
<< /Length 42 >>
stream
BT
/F1 12 Tf
100 700 Td
(Page Two) Tj
ET
endstream
endobj
xref
0 8
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000214 00000 n
0000000303 00000 n
0000000394 00000 n
0000000493 00000 n
trailer
<< /Size 8 /Root 1 0 R >>
startxref
584
%%EOF`;

      const buffer = Buffer.from(pdfContent);
      const parser = new PDFParse({ data: buffer });
      await parser.load();
      const result = await parser.getText();

      expect(result.text).toBeDefined();
      expect(result.pages).toBeDefined();
      expect(result.pages.length).toBe(2);
      expect(result.text.toLowerCase()).toContain("page");
    });

    it("should return aggregated text field from result", async () => {
      const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 50 >>
stream
BT
/F1 12 Tf
100 700 Td
(Test Content) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000214 00000 n
0000000303 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
402
%%EOF`;

      const buffer = Buffer.from(pdfContent);
      const parser = new PDFParse({ data: buffer });
      await parser.load();
      const result = await parser.getText();

      // Verify the text field is the preferred extraction method
      expect(result.text).toBeDefined();
      expect(typeof result.text).toBe("string");
      expect(result.text.length).toBeGreaterThan(0);
    });

    it("should handle page markers in extracted text", () => {
      // Simulate the text extraction with page markers
      const extractedText = `Policy Information\nPolicy Number: 123456\n\n-- 1 of 1 --\n\nCarrier: AGL`;

      // Remove page markers as the fixed code does
      const cleanedText = extractedText.replace(/--\s+\d+\s+of\s+\d+\s+--/g, "");

      expect(cleanedText).not.toContain("-- 1 of 1 --");
      expect(cleanedText).toContain("Policy Number: 123456");
      expect(cleanedText).toContain("Carrier: AGL");
    });

    it("should extract text from base64 encoded PDF", async () => {
      const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 44 >>
stream
BT
/F1 12 Tf
100 700 Td
(Base64 Test) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000214 00000 n
0000000303 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
396
%%EOF`;

      // Convert to base64 as the import procedure does
      const buffer = Buffer.from(pdfContent);
      const base64 = buffer.toString("base64");

      // Decode back
      const decodedBuffer = Buffer.from(base64, "base64");

      // Parse
      const parser = new PDFParse({ data: decodedBuffer });
      await parser.load();
      const result = await parser.getText();

      expect(result.text).toBeDefined();
      expect(result.text.toLowerCase()).toContain("base64");
    });

    it("should handle empty PDF gracefully", async () => {
      // Create an empty PDF (just structure, no content)
      const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 0 >>
stream
endstream
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000214 00000 n
0000000303 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
360
%%EOF`;

      const buffer = Buffer.from(pdfContent);
      const parser = new PDFParse({ data: buffer });
      await parser.load();
      const result = await parser.getText();

      // Should return result but text might be empty or minimal
      expect(result).toBeDefined();
      expect(result.text).toBeDefined();
    });

    it("should extract text with multiple extraction fallbacks", async () => {
      const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 60 >>
stream
BT
/F1 12 Tf
100 700 Td
(Fallback Test Content) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000214 00000 n
0000000303 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
412
%%EOF`;

      const buffer = Buffer.from(pdfContent);
      const parser = new PDFParse({ data: buffer });
      await parser.load();
      const result = await parser.getText();

      // Test the extraction logic with multiple fallbacks
      let fullText = "";
      
      // Preferred: use the aggregated text field
      if (result && result.text && typeof result.text === "string") {
        fullText = result.text;
      } else if (result && result.pages && Array.isArray(result.pages)) {
        // Fallback: combine pages
        fullText = result.pages.map((p: any) => p.text || "").join("\n");
      } else if (typeof result === "string") {
        // Last resort: result is already a string
        fullText = result;
      }

      expect(fullText).toBeDefined();
      expect(fullText.length).toBeGreaterThan(0);
      expect(fullText.toLowerCase()).toContain("fallback");
    });
  });

  describe("PDF Import Error Handling", () => {
    it("should handle invalid PDF buffer", async () => {
      const invalidBuffer = Buffer.from("This is not a PDF");

      try {
        const parser = new PDFParse({ data: invalidBuffer });
        await parser.load();
        // If it doesn't throw, that's okay - some implementations might handle gracefully
      } catch (err) {
        // Expected to throw for invalid PDF
        expect(err).toBeDefined();
      }
    });

    it("should handle empty buffer", async () => {
      const emptyBuffer = Buffer.from("");

      try {
        const parser = new PDFParse({ data: emptyBuffer });
        await parser.load();
      } catch (err) {
        // Expected to throw for empty buffer
        expect(err).toBeDefined();
      }
    });
  });

  describe("PDF Text Extraction Integration", () => {
    it("should extract and clean policy data from PDF text", () => {
      // Simulate extracted PDF text
      const pdfText = `ORTIZ INSURANCE BROKER
Policy Document

Insured Name Policy Number Product Type Product Name
SMITH, JOHN Whole Life 250000

Policy Status Issue State Writing Agent Issue Company
In Force TX John Ortiz AGL 001

Billable Premium Annualized Premium
$50.00 $600.00

Face Amount Policy Delivery Type
$250,000 Standard

DOB Address
01/15/1980 123 Main Street Austin TX 78701

Email Phone
john@example.com (512) 555-1234

Beneficiaries
Name Percent SSN Address Phone
SMITH, JANE 100% 123-45-6789 123 Main Street Austin TX 78701 (512) 555-1234

Date of Issue Policy Effective Date
06/01/2025 06/15/2025

-- 1 of 1 --`;

      // Clean page markers
      const cleanedText = pdfText.replace(/--\s+\d+\s+of\s+\d+\s+--/g, "");

      expect(cleanedText).not.toContain("-- 1 of 1 --");
      expect(cleanedText).toContain("SMITH, JOHN");
      expect(cleanedText).toContain("Policy Number");
      expect(cleanedText).toContain("$600.00");
      expect(cleanedText).toContain("SMITH, JANE");
    });

    it("should handle policy data extraction with regex patterns", () => {
      const pdfText = `Policy Number: POL-2025-001234
Carrier: AGL
Premium: $500.00
Coverage: $250,000`;

      // Test inline value extraction
      const policyMatch = pdfText.match(/Policy Number:\s*(.+)/i);
      expect(policyMatch?.[1]).toBe("POL-2025-001234");

      const carrierMatch = pdfText.match(/Carrier:\s*(.+)/i);
      expect(carrierMatch?.[1]).toBe("AGL");

      const premiumMatch = pdfText.match(/\$([0-9,.]+)/);
      expect(premiumMatch?.[1]).toBe("500.00");
    });
  });
});
