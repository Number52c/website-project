import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader as Loader2 } from "lucide-react";

export interface ClientFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  age: string;
  gender: string;
  smoker: boolean;
  goal: string;
  medicalConditions: string;

  // Health and Background
  healthConditions: {
    heartAttack: boolean;
    congestiveHeartFailure: boolean;
    highBloodPressure: boolean;
    asthma: boolean;
    epilepsy: boolean;
    cancer: boolean;
    lupus: boolean;
    highCholesterol: boolean;
    sleepApnea: boolean;
    ptsd: boolean;
    stroke: boolean;
    diabetes: boolean;
    hivAids: boolean;
    copd: boolean;
  };
  prescriptions: string;
  surgeries: string;
  height: string;
  weight: string;
  maritalStatus: string;
  kids: string;
  beneficiary: string;
  additionalHealthNotes: string;

  // Legal and Medical Contacts
  driverLicense: string;
  licenseState: string;
  ssn: string;
  placeOfBirth: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  citizenship: string;
  resident: boolean;
  cardNumber: string;
  cardExpiration: string;
  doctorOrClinic: string;
  lastVisit: string;
  doctorPhone: string;
  doctorAddress: string;

  // Beneficiaries
  beneficiary1Name: string;
  beneficiary1DOB: string;
  beneficiary1Relationship: string;
  beneficiary2Name: string;
  beneficiary2DOB: string;
  beneficiary2Relationship: string;
  beneficiary3Name: string;
  beneficiary3DOB: string;
  beneficiary3Relationship: string;

  // Bank and Policy Information
  paymentMethod: string; // 'bank' | 'credit_card' | ''
  bankName: string;
  accountType: string;
  routingNumber: string;
  accountNumber: string;
  creditCardNumber: string;
  creditCardCVV: string;
  creditCardExpiration: string;
  carrier: string;
  productPolicyType: string;
  policyNumber: string;
  coverageDeathBenefit: string;
  premiumAmount: string;
  yearlyAP: string;
  soldDate: string;
  effectiveDate: string;
  statusSelected: boolean;
  statusDenied: boolean;
  existingLifeInsuranceSource: string;
  commissionPercent: string;
}

interface ClientIntakeFormProps {
  onSubmit: (data: ClientFormData) => Promise<void>;
  isLoading?: boolean;
  onClose?: () => void;
}

const INITIAL_FORM_DATA: ClientFormData = {
  firstName: "", lastName: "", email: "", phone: "",
  dateOfBirth: "", age: "", gender: "", smoker: false,
  goal: "", medicalConditions: "",
  healthConditions: {
    heartAttack: false, congestiveHeartFailure: false, highBloodPressure: false,
    asthma: false, epilepsy: false, cancer: false, lupus: false,
    highCholesterol: false, sleepApnea: false, ptsd: false, stroke: false,
    diabetes: false, hivAids: false, copd: false,
  },
  prescriptions: "", surgeries: "", height: "", weight: "",
  maritalStatus: "", kids: "", beneficiary: "", additionalHealthNotes: "",
  driverLicense: "", licenseState: "", ssn: "", placeOfBirth: "",
  address: "", city: "", state: "", zip: "", citizenship: "", resident: false,
  cardNumber: "", cardExpiration: "",
  doctorOrClinic: "", lastVisit: "", doctorPhone: "", doctorAddress: "",
  beneficiary1Name: "", beneficiary1DOB: "", beneficiary1Relationship: "",
  beneficiary2Name: "", beneficiary2DOB: "", beneficiary2Relationship: "",
  beneficiary3Name: "", beneficiary3DOB: "", beneficiary3Relationship: "",
  paymentMethod: "", bankName: "", accountType: "", routingNumber: "", accountNumber: "",
  creditCardNumber: "", creditCardCVV: "", creditCardExpiration: "",
  carrier: "", productPolicyType: "", policyNumber: "",
  coverageDeathBenefit: "", premiumAmount: "", yearlyAP: "", soldDate: "", effectiveDate: "",
  statusSelected: false, statusDenied: false,
  existingLifeInsuranceSource: "", commissionPercent: "",
};

export function ClientIntakeForm({ onSubmit, isLoading = false, onClose }: ClientIntakeFormProps) {
  const [formData, setFormData] = useState<ClientFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    age: "",
    gender: "",
    smoker: false,
    goal: "",
    medicalConditions: "",
    healthConditions: {
      heartAttack: false,
      congestiveHeartFailure: false,
      highBloodPressure: false,
      asthma: false,
      epilepsy: false,
      cancer: false,
      lupus: false,
      highCholesterol: false,
      sleepApnea: false,
      ptsd: false,
      stroke: false,
      diabetes: false,
      hivAids: false,
      copd: false,
    },
    prescriptions: "",
    surgeries: "",
    height: "",
    weight: "",
    maritalStatus: "",
    kids: "",
    beneficiary: "",
    additionalHealthNotes: "",
    driverLicense: "",
    licenseState: "",
    ssn: "",
    placeOfBirth: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    citizenship: "",
    resident: false,
    cardNumber: "",
    cardExpiration: "",
    doctorOrClinic: "",
    lastVisit: "",
    doctorPhone: "",
    doctorAddress: "",
    beneficiary1Name: "",
    beneficiary1DOB: "",
    beneficiary1Relationship: "",
    beneficiary2Name: "",
    beneficiary2DOB: "",
    beneficiary2Relationship: "",
    beneficiary3Name: "",
    beneficiary3DOB: "",
    beneficiary3Relationship: "",
    paymentMethod: "",
    bankName: "",
    accountType: "",
    routingNumber: "",
    accountNumber: "",
    creditCardNumber: "",
    creditCardCVV: "",
    creditCardExpiration: "",
    carrier: "",
    productPolicyType: "",
    policyNumber: "",
    coverageDeathBenefit: "",
    premiumAmount: "",
    yearlyAP: "",
    soldDate: "",
    effectiveDate: "",
    statusSelected: false,
    statusDenied: false,
    existingLifeInsuranceSource: "",
    commissionPercent: "",
  });

  // Format phone number with dashes (XXX-XXX-XXXX)
  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  // Format SSN with dashes (XXX-XX-XXXX)
  const formatSSN = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 5) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5, 9)}`;
  };

  // Calculate age from date of birth
  const calculateAge = (dob: string) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  };

  const handleInputChange = (field: string, value: any) => {
    let formattedValue = value;

    // Auto-format phone number
    if (field === "phone") {
      formattedValue = formatPhoneNumber(value);
    }
    // Auto-format SSN
    else if (field === "ssn") {
      formattedValue = formatSSN(value);
    }
    // Auto-format doctor phone
    else if (field === "doctorPhone") {
      formattedValue = formatPhoneNumber(value);
    }
    // Auto-calculate annual premium from monthly premium (monthly × 12)
    else if (field === "premiumAmount") {
      formattedValue = value;
      const monthly = parseFloat(value);
      const annual = !isNaN(monthly) && monthly > 0 ? (monthly * 12).toFixed(2) : "";
      setFormData((prev) => ({
        ...prev,
        premiumAmount: formattedValue,
        yearlyAP: annual,
      }));
      return;
    }
    // Auto-calculate age from DOB
    else if (field === "dateOfBirth") {
      formattedValue = value;
      const calculatedAge = calculateAge(value);
      setFormData((prev) => ({
        ...prev,
        dateOfBirth: formattedValue,
        age: calculatedAge,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: formattedValue,
    }));
  };

  const handleHealthConditionChange = (condition: keyof typeof formData.healthConditions, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      healthConditions: {
        ...prev.healthConditions,
        [condition]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Check for duplicate client before submitting
    const fullName = `${formData.firstName} ${formData.lastName}`.trim().toLowerCase();
    if (fullName.length > 0) {
      const confirmed = window.confirm(
        `Creating client: ${formData.firstName} ${formData.lastName}\n\nPlease verify this is not a duplicate. Click OK to proceed.`
      );
      if (!confirmed) return;
    }
    await onSubmit(formData);
    setFormData({ ...INITIAL_FORM_DATA });
    if (onClose) onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">First & Last Name</Label>
              <Input
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                placeholder="First name"
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-300">Last Name</Label>
              <Input
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                placeholder="Last name"
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">Sold Date</Label>
              <Input
                type="date"
                value={formData.soldDate}
                onChange={(e) => handleInputChange("soldDate", e.target.value)}
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-300">Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="XXX-XXX-XXXX"
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-slate-300">Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="client@example.com"
              className="bg-slate-700 border-slate-600 text-white mt-1"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-slate-300">Date of Birth</Label>
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-300">Age</Label>
              <Input
                value={formData.age}
                onChange={(e) => handleInputChange("age", e.target.value)}
                placeholder="30"
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-300">Gender</Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white mt-1">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={formData.smoker}
                onCheckedChange={(checked) => handleInputChange("smoker", checked)}
                className="border-slate-600"
              />
              <Label className="text-slate-300 cursor-pointer">Smoker</Label>
            </div>
          </div>

          <div>
            <Label className="text-slate-300">Goal</Label>
            <Input
              value={formData.goal}
              onChange={(e) => handleInputChange("goal", e.target.value)}
              placeholder="Client's insurance goal"
              className="bg-slate-700 border-slate-600 text-white mt-1"
            />
          </div>

          <div>
            <Label className="text-slate-300">Medical Conditions / Concerns</Label>
            <Input
              value={formData.medicalConditions}
              onChange={(e) => handleInputChange("medicalConditions", e.target.value)}
              placeholder="List any medical conditions or concerns"
              className="bg-slate-700 border-slate-600 text-white mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Health and Background */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Health and Background</CardTitle>
          <CardDescription className="text-slate-400">Check any conditions that apply</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {Object.entries({
              heartAttack: "Heart Attack",
              congestiveHeartFailure: "Congestive Heart Failure",
              highBloodPressure: "High Blood Pressure",
              asthma: "Asthma",
              epilepsy: "Epilepsy / Seizures",
              cancer: "Cancer",
              lupus: "Lupus",
              highCholesterol: "High Cholesterol",
              sleepApnea: "Sleep Apnea",
              ptsd: "PTSD",
              stroke: "Stroke",
              diabetes: "Diabetes",
              hivAids: "HIV / AIDS",
              copd: "COPD",
            }).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <Checkbox
                  checked={formData.healthConditions[key as keyof typeof formData.healthConditions]}
                  onCheckedChange={(checked) =>
                    handleHealthConditionChange(key as keyof typeof formData.healthConditions, checked as boolean)
                  }
                  className="border-slate-600"
                />
                <Label className="text-slate-300 cursor-pointer text-sm">{label}</Label>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">Prescriptions / Dates</Label>
              <Input
                value={formData.prescriptions}
                onChange={(e) => handleInputChange("prescriptions", e.target.value)}
                placeholder="List prescriptions and dates"
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-300">Surgeries / Dates</Label>
              <Input
                value={formData.surgeries}
                onChange={(e) => handleInputChange("surgeries", e.target.value)}
                placeholder="List surgeries and dates"
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label className="text-slate-300">Height</Label>
              <Input
                value={formData.height}
                onChange={(e) => handleInputChange("height", e.target.value)}
                placeholder="5'10"
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-300">Weight</Label>
              <Input
                value={formData.weight}
                onChange={(e) => handleInputChange("weight", e.target.value)}
                placeholder="180 lbs"
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-300">Marital Status</Label>
              <Select
                value={formData.maritalStatus}
                onValueChange={(value) => handleInputChange("maritalStatus", value)}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white mt-1">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="married">Married</SelectItem>
                  <SelectItem value="divorced">Divorced</SelectItem>
                  <SelectItem value="widowed">Widowed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-300">Kids</Label>
              <Input
                value={formData.kids}
                onChange={(e) => handleInputChange("kids", e.target.value)}
                placeholder="Number or names"
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-slate-300">Beneficiary</Label>
            <Input
              value={formData.beneficiary}
              onChange={(e) => handleInputChange("beneficiary", e.target.value)}
              placeholder="Primary beneficiary name"
              className="bg-slate-700 border-slate-600 text-white mt-1"
            />
          </div>

          <div>
            <Label className="text-slate-300">Additional Health Notes</Label>
            <Input
              value={formData.additionalHealthNotes}
              onChange={(e) => handleInputChange("additionalHealthNotes", e.target.value)}
              placeholder="Any additional health information"
              className="bg-slate-700 border-slate-600 text-white mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Legal and Medical Contacts */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Legal and Medical Contacts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">Driver License</Label>
              <Input
                value={formData.driverLicense}
                onChange={(e) => handleInputChange("driverLicense", e.target.value)}
                placeholder="License number"
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-300">State</Label>
              <Input
                value={formData.licenseState}
                onChange={(e) => handleInputChange("licenseState", e.target.value)}
                placeholder="TX"
                maxLength={2}
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">SSN / ITIN #</Label>
              <Input
                value={formData.ssn}
                onChange={(e) => handleInputChange("ssn", e.target.value)}
                placeholder="XXX-XX-XXXX"
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-300">Place of Birth</Label>
              <Input
                value={formData.placeOfBirth}
                onChange={(e) => handleInputChange("placeOfBirth", e.target.value)}
                placeholder="City, State"
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-slate-300">Address</Label>
            <Input
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Street address"
              className="bg-slate-700 border-slate-600 text-white mt-1"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-slate-300">City</Label>
              <Input
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="City"
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-300">State</Label>
              <Input
                value={formData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                placeholder="TX"
                maxLength={2}
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-300">Zip</Label>
              <Input
                value={formData.zip}
                onChange={(e) => handleInputChange("zip", e.target.value)}
                placeholder="78401"
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">Citizenship</Label>
              <Select value={formData.citizenship} onValueChange={(value) => handleInputChange("citizenship", value)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white mt-1">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="citizen">Citizen</SelectItem>
                  <SelectItem value="resident">Resident</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={formData.resident}
                  onCheckedChange={(checked) => handleInputChange("resident", checked)}
                  className="border-slate-600"
                />
                <Label className="text-slate-300 cursor-pointer">Resident</Label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">Card #</Label>
              <Input
                value={formData.cardNumber}
                onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                placeholder="Card number"
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-300">Exp</Label>
              <Input
                value={formData.cardExpiration}
                onChange={(e) => handleInputChange("cardExpiration", e.target.value)}
                placeholder="MM/YY"
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-slate-300">Last Visit</Label>
              <Input
                type="date"
                value={formData.lastVisit}
                onChange={(e) => handleInputChange("lastVisit", e.target.value)}
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-300">Doctor Phone</Label>
              <Input
                value={formData.doctorPhone}
                onChange={(e) => handleInputChange("doctorPhone", e.target.value)}
                placeholder="XXX-XXX-XXXX"
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-300">Doctor or Clinic</Label>
              <Input
                value={formData.doctorOrClinic}
                onChange={(e) => handleInputChange("doctorOrClinic", e.target.value)}
                placeholder="Doctor/Clinic name"
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-slate-300">Doctor Address</Label>
            <Input
              value={formData.doctorAddress}
              onChange={(e) => handleInputChange("doctorAddress", e.target.value)}
              placeholder="Doctor's address"
              className="bg-slate-700 border-slate-600 text-white mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Beneficiaries */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Beneficiaries</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((num) => (
            <div key={num} className="grid grid-cols-3 gap-4 pb-4 border-b border-slate-700 last:border-b-0">
              <div>
                <Label className="text-slate-300">Name</Label>
                <Input
                  value={formData[`beneficiary${num}Name` as keyof typeof formData] as string}
                  onChange={(e) => handleInputChange(`beneficiary${num}Name`, e.target.value)}
                  placeholder="Beneficiary name"
                  className="bg-slate-700 border-slate-600 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-slate-300">DOB</Label>
                <Input
                  type="date"
                  value={formData[`beneficiary${num}DOB` as keyof typeof formData] as string}
                  onChange={(e) => handleInputChange(`beneficiary${num}DOB`, e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-slate-300">Relationship</Label>
                <Input
                  value={formData[`beneficiary${num}Relationship` as keyof typeof formData] as string}
                  onChange={(e) => handleInputChange(`beneficiary${num}Relationship`, e.target.value)}
                  placeholder="Relationship"
                  className="bg-slate-700 border-slate-600 text-white mt-1"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Bank and Policy Information */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Bank and Policy Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Payment Method Selector */}
          <div>
            <Label className="text-slate-300">Payment Method</Label>
            <Select
              value={formData.paymentMethod}
              onValueChange={(value) => handleInputChange("paymentMethod", value)}
            >
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white mt-1">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank">Bank Account (ACH)</SelectItem>
                <SelectItem value="credit_card">Credit Card</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bank Account Fields */}
          {formData.paymentMethod === "bank" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Bank Name</Label>
                  <Input
                    value={formData.bankName}
                    onChange={(e) => handleInputChange("bankName", e.target.value)}
                    placeholder="Bank name"
                    className="bg-slate-700 border-slate-600 text-white mt-1"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Checking or Savings</Label>
                  <Select
                    value={formData.accountType}
                    onValueChange={(value) => handleInputChange("accountType", value)}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white mt-1">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Checking</SelectItem>
                      <SelectItem value="savings">Savings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Routing #</Label>
                  <Input
                    value={formData.routingNumber}
                    onChange={(e) => handleInputChange("routingNumber", e.target.value)}
                    placeholder="Routing number"
                    className="bg-slate-700 border-slate-600 text-white mt-1"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Account #</Label>
                  <Input
                    value={formData.accountNumber}
                    onChange={(e) => handleInputChange("accountNumber", e.target.value)}
                    placeholder="Account number"
                    className="bg-slate-700 border-slate-600 text-white mt-1"
                  />
                </div>
              </div>
            </>
          )}

          {/* Credit Card Fields */}
          {formData.paymentMethod === "credit_card" && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-slate-300">Credit Card #</Label>
                <Input
                  value={formData.creditCardNumber}
                  onChange={(e) => handleInputChange("creditCardNumber", e.target.value)}
                  placeholder="Card number"
                  className="bg-slate-700 border-slate-600 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-slate-300">Security Code (CVV)</Label>
                <Input
                  value={formData.creditCardCVV}
                  onChange={(e) => handleInputChange("creditCardCVV", e.target.value)}
                  placeholder="CVV"
                  className="bg-slate-700 border-slate-600 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-slate-300">Card Expiration</Label>
                <Input
                  value={formData.creditCardExpiration}
                  onChange={(e) => handleInputChange("creditCardExpiration", e.target.value)}
                  placeholder="MM/YY"
                  className="bg-slate-700 border-slate-600 text-white mt-1"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">Carrier</Label>
              <Input
                value={formData.carrier}
                onChange={(e) => handleInputChange("carrier", e.target.value)}
                placeholder="Insurance carrier"
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-300">Product / Policy Type</Label>
              <Input
                value={formData.productPolicyType}
                onChange={(e) => handleInputChange("productPolicyType", e.target.value)}
                placeholder="Policy type"
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-slate-300">Policy Number</Label>
            <Input
              value={formData.policyNumber}
              onChange={(e) => handleInputChange("policyNumber", e.target.value)}
              placeholder="Policy number"
              className="bg-slate-700 border-slate-600 text-white mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">Coverage / Death Benefit $</Label>
              <Input
                value={formData.coverageDeathBenefit}
                onChange={(e) => handleInputChange("coverageDeathBenefit", e.target.value)}
                placeholder="$250,000"
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-300">Monthly Premium $</Label>
              <Input
                value={formData.premiumAmount}
                onChange={(e) => handleInputChange("premiumAmount", e.target.value)}
                placeholder="$50"
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">Annual Premium $</Label>
              <Input
                value={formData.yearlyAP}
                onChange={(e) => handleInputChange("yearlyAP", e.target.value)}
                placeholder="$600"
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-300">Effective Date</Label>
              <Input
                type="date"
                value={formData.effectiveDate}
                onChange={(e) => handleInputChange("effectiveDate", e.target.value)}
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">Commission %</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={formData.commissionPercent}
                onChange={(e) => handleInputChange("commissionPercent", e.target.value)}
                placeholder="50"
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>
            <div />
          </div>

          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={formData.statusSelected}
                onCheckedChange={(checked) => handleInputChange("statusSelected", checked)}
                className="border-slate-600"
              />
              <Label className="text-slate-300 cursor-pointer">Selected</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={formData.statusDenied}
                onCheckedChange={(checked) => handleInputChange("statusDenied", checked)}
                className="border-slate-600"
              />
              <Label className="text-slate-300 cursor-pointer">Denied</Label>
            </div>
          </div>

          <div>
            <Label className="text-slate-300">Existing Life Insurance Source</Label>
            <Input
              value={formData.existingLifeInsuranceSource}
              onChange={(e) => handleInputChange("existingLifeInsuranceSource", e.target.value)}
              placeholder="Current insurance provider"
              className="bg-slate-700 border-slate-600 text-white mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Client"
        )}
      </Button>
    </form>
  );
}
