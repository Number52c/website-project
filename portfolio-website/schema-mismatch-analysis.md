# Schema Mismatch Analysis

## policies table

### Drizzle schema columns:
id, clientId, policyNumber, carrier, type, coverageAmount, premiumAmount, yearlyAP, premiumFrequency, effectiveDate, expirationDate, contractAnniversaryMonth, renewalDate, status, underwritingStatus, commissionRate, commissionAmount, commissionPaidDate, notes, internalNotes, createdAt, updatedAt

### Actual DB columns:
id, clientId, policyNumber, type, carrier, status, premiumAmount, premiumFrequency, coverageAmount, deductible, effectiveDate, expirationDate, description, createdAt, updatedAt, yearlyAP, isPaid, paymentMethod, paymentMethodLast4, beneficiaries, draftDate, riders, notes, contractAnniversaryMonth, renewalDate, underwritingStatus, commissionRate, commissionAmount, commissionPaidDate, internalNotes

### Columns in DB but NOT in Drizzle schema:
- deductible
- description
- isPaid
- paymentMethod
- paymentMethodLast4
- beneficiaries
- draftDate
- riders

### Columns in Drizzle schema but NOT in DB:
(none - all Drizzle columns exist in DB)

### Impact: The JOIN query fails because Drizzle tries to SELECT columns that exist in the schema. Since all schema columns DO exist in the DB, the JOIN failure must be a different issue.

---

## sales_entries table

### Drizzle schema columns:
id, agentId, clientId, clientName, carrier, product, premium, annualPremium, commission, saleDate, policyType, status, notes, month, year, createdAt, updatedAt

### Actual DB columns:
id, clientName, productType, carrier, premium, annualPremium, commissionPercent, saleDate, saleMonth, saleYear, notes, createdAt, updatedAt, commissionOverride, isPaid, effectiveDate, isCanceled, agentId, clientId

### Columns in DB but NOT in Drizzle schema:
- productType (schema has 'product' mapped to SQL column "product")
- commissionPercent (schema has 'commission' mapped to SQL column "commission")
- saleMonth (schema has 'month' mapped to SQL column "month")
- saleYear (schema has 'year' mapped to SQL column "year")
- commissionOverride
- isPaid
- effectiveDate
- isCanceled

### Columns in Drizzle schema but NOT in DB:
- product (DB has productType)
- commission (DB has commissionPercent)
- month (DB has saleMonth)
- year (DB has saleYear)
- policyType
- status

### CRITICAL: The Drizzle schema maps JS field 'product' to SQL column "product" but the actual DB column is "productType". This means ALL sales queries are broken!

---

## expenses table

### Drizzle schema columns:
id, agentId, description, amount, category, expenseDate, month, year, createdAt, updatedAt

### Actual DB columns:
id, agentId, category, expenseDate, month, year, amount, description, expenseMonth, expenseYear, createdAt, updatedAt

### Columns in DB but NOT in Drizzle schema:
- expenseMonth
- expenseYear

### Impact: The DB has NOT NULL columns (expenseMonth, expenseYear) that the Drizzle schema doesn't know about, causing INSERT failures.
