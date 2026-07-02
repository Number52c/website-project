export function maskSSN(ssn: string | null | undefined): string | null | undefined {
  if (!ssn) return ssn;
  const cleaned = ssn.replace(/\D/g, '');
  if (cleaned.length !== 9) return ssn;
  return `***-**-${cleaned.slice(-4)}`;
}

export function maskAccountNumber(account: string | null | undefined): string | null | undefined {
  if (!account) return account;
  const cleaned = account.replace(/\D/g, '');
  if (cleaned.length < 4) return account;
  return `****${cleaned.slice(-4)}`;
}

export function maskRoutingNumber(routing: string | null | undefined): string | null | undefined {
  if (!routing) return routing;
  const cleaned = routing.replace(/\D/g, '');
  if (cleaned.length < 4) return routing;
  return `****${cleaned.slice(-4)}`;
}

export function maskEmail(email: string | null | undefined): string | null | undefined {
  if (!email) return email;
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  if (local.length <= 2) return email;
  return `${local[0]}***@${domain}`;
}

export function maskPhone(phone: string | null | undefined): string | null | undefined {
  if (!phone) return phone;
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 4) return phone;
  const areaCode = cleaned.slice(0, 3);
  const lastFour = cleaned.slice(-4);
  return `(${areaCode}) ***-${lastFour}`;
}

export function maskCardNumber(card: string | null | undefined): string | null | undefined {
  if (!card) return card;
  const cleaned = card.replace(/\D/g, '');
  if (cleaned.length < 4) return card;
  const lastFour = cleaned.slice(-4);
  return `****-****-****-${lastFour}`;
}

export function maskDOB(dob: string | null | undefined): string | null | undefined {
  if (!dob) return dob;
  const yearMatch = dob.match(/\d{4}/);
  if (!yearMatch) return dob;
  return `****/**/${yearMatch[0]}`;
}

export function maskGeneric(value: string | null | undefined, showLastN: number = 4): string | null | undefined {
  if (!value) return value;
  if (value.length <= showLastN) return value;
  const masked = '*'.repeat(value.length - showLastN);
  return masked + value.slice(-showLastN);
}

export function maskClientSensitiveFields(client: Record<string, any>): Record<string, any> {
  const masked = { ...client };
  if (masked.ssn) masked.ssn = maskSSN(masked.ssn);
  if (masked.bankAccountNumber) masked.bankAccountNumber = maskAccountNumber(masked.bankAccountNumber);
  if (masked.routingNumber) masked.routingNumber = maskRoutingNumber(masked.routingNumber);
  if (masked.email) masked.email = maskEmail(masked.email);
  if (masked.phone) masked.phone = maskPhone(masked.phone);
  if (masked.cardNumber) masked.cardNumber = maskCardNumber(masked.cardNumber);
  if (masked.dateOfBirth) masked.dateOfBirth = maskDOB(masked.dateOfBirth);
  return masked;
}

export function maskPolicySensitiveFields(policy: Record<string, any>): Record<string, any> {
  const masked = { ...policy };
  if (masked.policyNumber) masked.policyNumber = maskGeneric(masked.policyNumber, 4);
  if (masked.contractNumber) masked.contractNumber = maskGeneric(masked.contractNumber, 4);
  return masked;
}
