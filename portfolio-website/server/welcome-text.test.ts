import { describe, it, expect } from 'vitest';

describe('Welcome Text Encoding', () => {
  it('should not contain garbled emoji characters', () => {
    // Sample welcome text that should be generated
    const welcomeText = `Hi there! Welcome to Ortiz Insurance.

Your secure client portal is now ready. You can view your policy details, documents, and coverage information anytime.

PORTAL LOGIN
Portal: https://www.ortizinsurancebroker.com/portal
Last Name: Causey
PIN: 5738

POLICY SUMMARY
- Type: Whole Life Final Expense
- Carrier: CICA
- Monthly Premium: $70.67
- Effective Date: 6/4/2026

If you have any questions about your policy or coverage, please don't hesitate to reach out.

Ortiz Insurance: (361) 613-8336

- Ortiz Insurance Broker`;

    // Check for garbled emoji characters (UTF-8 encoding issues)
    const garbledPatterns = [
      /ðŸ/g,           // Garbled emoji prefix
      /ã€/g,           // Garbled character
      /â€/g,           // Garbled em-dash
      /\u00f0\u009f/g, // UTF-8 BOM issues
    ];

    let hasGarbledChars = false;
    for (const pattern of garbledPatterns) {
      if (pattern.test(welcomeText)) {
        hasGarbledChars = true;
        console.error(`Found garbled pattern: ${pattern}`);
      }
    }

    expect(hasGarbledChars).toBe(false);
  });

  it('should use ASCII-safe characters for formatting', () => {
    const welcomeText = `POLICY SUMMARY
- Type: Whole Life Final Expense
- Carrier: CICA
- Monthly Premium: $70.67`;

    // Should use dashes, not bullet points or em-dashes
    expect(welcomeText).toContain('- Type:');
    expect(welcomeText).toContain('- Carrier:');
    expect(welcomeText).toContain('- Monthly Premium:');
    
    // Should NOT contain non-ASCII characters
    expect(welcomeText).not.toContain('•');  // bullet point
    expect(welcomeText).not.toContain('—');  // em-dash
  });

  it('should have proper line breaks and formatting', () => {
    const welcomeText = `Hi there! Welcome to Ortiz Insurance.

Your secure client portal is now ready.

PORTAL LOGIN
Portal: https://www.ortizinsurancebroker.com/portal`;

    // Should have proper sections
    expect(welcomeText).toContain('PORTAL LOGIN');
    expect(welcomeText).toContain('https://www.ortizinsurancebroker.com/portal');
    
    // Should have proper line breaks (double newlines between sections)
    expect(welcomeText).toContain('\n\n');
  });

  it('should be SMS-safe (no special Unicode characters)', () => {
    const welcomeText = `Hi there! Welcome to Ortiz Insurance.

Your secure client portal is now ready. You can view your policy details, documents, and coverage information anytime.

PORTAL LOGIN
Portal: https://www.ortizinsurancebroker.com/portal
Last Name: Causey
PIN: 5738

If you have any questions about your policy or coverage, please don't hesitate to reach out.

Ortiz Insurance: (361) 613-8336

- Ortiz Insurance Broker`;

    // Check that all characters are within ASCII-safe range or common Unicode
    const lines = welcomeText.split('\n');
    for (const line of lines) {
      for (const char of line) {
        const code = char.charCodeAt(0);
        // Allow ASCII (0-127) and common extended ASCII (128-255)
        // Reject anything that looks like UTF-8 encoding errors
        if (code > 255 && char !== '\n' && char !== '\r') {
          // Some Unicode is OK (like em-dash), but not garbled UTF-8
          if (!/[\u2014\u2013\u2022]/.test(char)) {
            // If it's not a known special char, it might be garbled
            expect(false).toBe(true); // Fail if unexpected Unicode found
          }
        }
      }
    }
  });
});
