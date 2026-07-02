import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, User, Mail, Phone } from "lucide-react";

interface AppointmentBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professionalType?: string;
  onBookingSubmit?: (booking: BookingFormData) => void;
}

export interface BookingFormData {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  professionalType: string;
  appointmentDate: string;
  appointmentTime: string;
  notes?: string;
}

// Available time slots
const TIME_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
];

export function AppointmentBookingModal({
  open,
  onOpenChange,
  professionalType = "teacher",
  onBookingSubmit,
}: AppointmentBookingModalProps) {
  const [step, setStep] = useState<"info" | "datetime">("info");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [formData, setFormData] = useState<BookingFormData>({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    professionalType,
    appointmentDate: "",
    appointmentTime: "",
    notes: "",
  });

  const handleInfoSubmit = () => {
    if (formData.clientName && formData.clientEmail && formData.clientPhone) {
      setStep("datetime");
    }
  };

  const handleDateTimeSubmit = () => {
    if (selectedDate && selectedTime) {
      const bookingData: BookingFormData = {
        ...formData,
        appointmentDate: format(selectedDate, "yyyy-MM-dd"),
        appointmentTime: selectedTime,
      };

      if (onBookingSubmit) {
        onBookingSubmit(bookingData);
      }

      // Reset form
      setStep("info");
      setFormData({
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        professionalType,
        appointmentDate: "",
        appointmentTime: "",
        notes: "",
      });
      setSelectedDate(undefined);
      setSelectedTime("");
      onOpenChange(false);
    }
  };

  const handleBack = () => {
    setStep("info");
    setSelectedDate(undefined);
    setSelectedTime("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md rounded-2xl border-0 bg-white shadow-2xl">
        <DialogHeader className="border-b border-gray-100 pb-4">
          <DialogTitle className="text-2xl font-bold text-navy-900">
            {step === "info" ? "Schedule Your Consultation" : "Pick Your Time"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {step === "info" ? (
            // Contact Information Step
            <div className="space-y-4">
              <div>
                <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                <Input
                  placeholder="John Doe"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                />
              </div>

              <div>
                <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                  className="border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                />
              </div>

              <div>
                <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  type="tel"
                  placeholder="(361) 613-8336"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                  className="border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                />
              </div>

              <div>
                <Label className="mb-2 text-sm font-semibold text-gray-700">Professional Type</Label>
                <Select value={formData.professionalType} onValueChange={(value) => setFormData({ ...formData, professionalType: value })}>
                  <SelectTrigger className="border-gray-200 focus:border-amber-500 focus:ring-amber-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="barber">Barber</SelectItem>
                    <SelectItem value="salon_owner">Salon Owner</SelectItem>
                    <SelectItem value="hairstylist">Hairstylist</SelectItem>
                    <SelectItem value="cosmetologist">Cosmetologist</SelectItem>
                    <SelectItem value="realtor">Realtor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-2 text-sm font-semibold text-gray-700">Notes (Optional)</Label>
                <textarea
                  placeholder="Tell us anything we should know..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="min-h-24 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>
          ) : (
            // Date & Time Selection Step
            <div className="space-y-6">
              <div>
                <Label className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <CalendarIcon className="h-4 w-4" />
                  Select Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start border-gray-200 text-left font-normal hover:bg-gray-50"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "MMM dd, yyyy") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
                      className="rounded-md border"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {selectedDate && (
                <div>
                  <Label className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Clock className="h-4 w-4" />
                    Select Time
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {TIME_SLOTS.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        className={`${
                          selectedTime === time
                            ? "bg-amber-500 text-white hover:bg-amber-600"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {selectedDate && selectedTime && (
                <div className="rounded-lg bg-amber-50 p-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">Appointment confirmed for:</span>
                    <br />
                    {format(selectedDate, "EEEE, MMMM dd, yyyy")} at {selectedTime}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 border-t border-gray-100 pt-4">
          {step === "datetime" && (
            <Button variant="outline" onClick={handleBack} className="flex-1 border-gray-200">
              Back
            </Button>
          )}
          <Button
            onClick={step === "info" ? handleInfoSubmit : handleDateTimeSubmit}
            disabled={
              step === "info"
                ? !formData.clientName || !formData.clientEmail || !formData.clientPhone
                : !selectedDate || !selectedTime
            }
            className="flex-1 bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50"
          >
            {step === "info" ? "Continue" : "Confirm Booking"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
