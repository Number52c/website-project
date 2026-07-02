/**
 * client/src/components/FieldMappingPreview.tsx
 * Component for previewing and configuring field mappings before import
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CircleAlert as AlertCircle, CircleCheck as CheckCircle2 } from "lucide-react";

export interface FieldMapping {
  [databaseField: string]: number | string | null; // Maps to column index or header name
}

export interface ImportPreviewData {
  headers: string[];
  sampleRows: (string | number | null)[][];
  detectedFields: { [key: string]: number | string | null };
}

interface FieldMappingPreviewProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (fieldMapping: FieldMapping) => void;
  previewData: ImportPreviewData | null;
  isLoading?: boolean;
}

const REQUIRED_FIELDS = ["firstName", "lastName", "carrier", "policyNumber"];

interface FieldConfig {
  key: string;
  label: string;
  required?: boolean;
}

const FIELD_GROUPS: Record<string, FieldConfig[]> = {
  "Client Information": [
    { key: "firstName", label: "First Name", required: true },
    { key: "lastName", label: "Last Name", required: true },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
  ],
  "Address Information": [
    { key: "address", label: "Address" },
    { key: "city", label: "City" },
    { key: "state", label: "State" },
    { key: "zip", label: "Zip Code" },
  ],
  "Personal Information": [
    { key: "dateOfBirth", label: "Date of Birth" },
    { key: "ssn", label: "Social Security Number" },
    { key: "driverLicense", label: "Driver License" },
    { key: "driverLicenseState", label: "Driver License State" },
    { key: "healthConditions", label: "Health Conditions" },
  ],
  "Beneficiary Information": [
    { key: "primaryBeneficiary", label: "Primary Beneficiary" },
    { key: "primaryBeneficiaryPercent", label: "Primary Beneficiary %" },
    { key: "contingentBeneficiary", label: "Contingent Beneficiary" },
    { key: "contingentBeneficiaryPercent", label: "Contingent Beneficiary %" },
  ],
  "Payment Method": [
    { key: "bankName", label: "Bank Name" },
    { key: "accountNumber", label: "Account Number" },
    { key: "routingNumber", label: "Routing Number" },
  ],
  "Policy Information": [
    { key: "policyNumber", label: "Policy Number", required: true },
    { key: "type", label: "Policy Type" },
    { key: "carrier", label: "Carrier", required: true },
    { key: "status", label: "Status" },
    { key: "premiumAmount", label: "Premium Amount" },
    { key: "premiumFrequency", label: "Premium Frequency" },
    { key: "coverageAmount", label: "Coverage Amount" },
    { key: "deductible", label: "Deductible" },
    { key: "effectiveDate", label: "Effective Date" },
    { key: "expirationDate", label: "Expiration Date" },
    { key: "description", label: "Description" },
  ],
};

export const FieldMappingPreview: React.FC<FieldMappingPreviewProps> = ({
  open,
  onClose,
  onConfirm,
  previewData,
  isLoading,
}) => {
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>({});

  React.useEffect(() => {
    if (previewData?.detectedFields) {
      setFieldMapping(previewData.detectedFields);
    }
  }, [previewData]);

  const handleFieldChange = (fieldKey: string, columnIndex: string) => {
    setFieldMapping(prev => ({
      ...prev,
      [fieldKey]: columnIndex === "" ? null : parseInt(columnIndex, 10),
    }));
  };

  const requiredFieldsMapped = REQUIRED_FIELDS.every(field => fieldMapping[field] !== null && fieldMapping[field] !== undefined);

  const handleConfirm = () => {
    if (!requiredFieldsMapped) {
      alert("Please map all required fields (marked with *)");
      return;
    }
    onConfirm(fieldMapping);
  };

  if (!previewData) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure Field Mapping</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview of sample data */}
          <div>
            <h3 className="font-semibold mb-3">Sample Data Preview</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded">
                <thead className="bg-gray-50">
                  <tr>
                    {previewData.headers.map((header, idx) => (
                      <th key={idx} className="px-3 py-2 text-left border-b">
                        Col {idx + 1}: {header || "(empty)"}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.sampleRows.slice(0, 3).map((row, rowIdx) => (
                    <tr key={rowIdx} className="border-b hover:bg-gray-50">
                      {row.map((cell, cellIdx) => (
                        <td key={cellIdx} className="px-3 py-2 text-gray-700">
                          {cell !== null && cell !== undefined ? String(cell).substring(0, 30) : "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Field mapping selectors */}
          <div>
            <h3 className="font-semibold mb-4">Map Database Fields to Columns</h3>
            <div className="space-y-6">
              {Object.entries(FIELD_GROUPS).map(([groupName, fields]) => (
                <div key={groupName} className="space-y-3">
                  <h4 className="font-medium text-sm text-gray-700">{groupName}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fields.map(field => {
                      const currentValue = fieldMapping[field.key];
                      const isMapped = currentValue !== null && currentValue !== undefined;
                      const isRequired = field.required;

                      return (
                        <div key={field.key} className="flex items-center gap-3">
                          <div className="flex-1">
                            <label className="text-sm font-medium">
                              {field.label}
                              {isRequired && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            <Select
                              value={currentValue !== null && currentValue !== undefined ? String(currentValue) : ""}
                              onValueChange={val => handleFieldChange(field.key, val)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select column..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">Not mapped</SelectItem>
                                {previewData.headers.map((header: string, idx: number) => (
                                  <SelectItem key={idx} value={String(idx)}>
                                    Col {idx + 1}: {header || "(empty)"}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {isMapped && (
                            <CheckCircle2 className="text-green-500 mt-6" size={20} />
                          )}
                          {isRequired && !isMapped && (
                            <AlertCircle className="text-red-500 mt-6" size={20} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status message */}
          {!requiredFieldsMapped && (
            <div className="bg-red-50 border border-red-200 rounded p-3 flex gap-2">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <p className="text-sm text-red-700">
                Please map all required fields (marked with *) before importing
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!requiredFieldsMapped || isLoading}>
            {isLoading ? "Importing..." : "Confirm & Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
