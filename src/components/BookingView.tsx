import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight, 
  CreditCard, 
  Check, 
  Sparkles, 
  CalendarDays,
  Share2,
  Mail,
  AlertCircle,
  Globe
} from "lucide-react";
import { 
  getBusinessBySlug, 
  getServices, 
  getStaff, 
  getAppointments, 
  addAppointment, 
  getCustomers, 
  addCustomer 
} from "../lib/db";
import { Business, Service, Staff, Appointment } from "../types";
import { translations, Language } from "../lib/translations";

interface BookingViewProps {
  businessSlug: string;
  onBackToMain?: () => void;
}

export default function BookingView({ businessSlug, onBackToMain }: BookingViewProps) {
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<Language>(() => {
    const browserLang = navigator.language || "";
    if (browserLang.startsWith("pt")) return "pt";
    if (browserLang.startsWith("es")) return "es";
    return "en";
  });
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  // Wizard Steps: 1 = Service, 2 = Staff, 3 = Date & Time, 4 = Details & Payment, 5 = Confirmation
  const [step, setStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  // Selections
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(""); // YYYY-MM-DD
  const [selectedTime, setSelectedTime] = useState<string>(""); // HH:MM

  // Contact Info
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");

  // Payment configuration
  const [paymentOption, setPaymentOption] = useState<'deposit' | 'full' | 'venue'>('venue');
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Success details
  const [bookingResultId, setBookingResultId] = useState("");
  const [calendarSyncMsg, setCalendarSyncMsg] = useState("");

  // Available slots for selected day (e.g., 09:00 to 17:00, 30-min intervals)
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  // Fetch business and child details
  useEffect(() => {
    async function loadBookingPage() {
      try {
        setLoading(true);
        // Step 1: Query business by slug
        const bData = await getBusinessBySlug(businessSlug);
        
        if (!bData) {
          setErrorMsg("Business profile not found. Please verify the URL link.");
          setLoading(false);
          return;
        }

        setBusiness(bData);
        if (bData.defaultLanguage) {
          setLanguage(bData.defaultLanguage);
        }

        // Step 2: Fetch Services (enabled only)
        const sListFull = await getServices(bData.id);
        const sList = sListFull.filter(s => s.enabled);
        setServices(sList);

        // Step 3: Fetch Staff
        const stList = await getStaff(bData.id);
        setStaffList(stList);

        // Step 4: Fetch Appointments to calculate real-time slots
        const aList = await getAppointments(bData.id);
        setAppointments(aList);

        // Initialize default selected date (today)
        const todayStr = new Date().toISOString().split("T")[0];
        setSelectedDate(todayStr);

        setLoading(false);
      } catch (err: any) {
        console.error("Error loading booking details:", err);
        setErrorMsg("Failed to connect with database. Check your internet.");
        setLoading(false);
      }
    }

    if (businessSlug) {
      loadBookingPage();
    }
  }, [businessSlug]);

  // Recalculate available slots based on selected date and staff working hours
  useEffect(() => {
    if (!business || !selectedDate) return;

    // Determine working hours for selected weekday
    const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const dateObj = new Date(selectedDate);
    const dayName = daysOfWeek[dateObj.getUTCDay()];

    // Get staff working hour limits
    let startHour = 9;
    let endHour = 17;
    let isWorking = true;

    if (selectedStaff) {
      const hours = selectedStaff.workingHours?.[dayName];
      if (hours) {
        isWorking = hours.active;
        if (isWorking) {
          startHour = parseInt(hours.start.split(":")[0]) || 9;
          endHour = parseInt(hours.end.split(":")[0]) || 17;
        }
      }
    }

    if (!isWorking) {
      setAvailableSlots([]);
      return;
    }

    // Generate slots (30 mins intervals)
    const slots: string[] = [];
    for (let h = startHour; h < endHour; h++) {
      const hourStr = h.toString().padStart(2, "0");
      slots.push(`${hourStr}:00`);
      slots.push(`${hourStr}:30`);
    }

    // Filter slots by existing appointments (Double-Booking Prevention!)
    const bookedTimes = appointments
      .filter(app => {
        if (app.status === "cancelled") return false;
        const appDate = app.dateTime.split("T")[0];
        if (appDate !== selectedDate) return false;
        
        // If staff is chosen, check conflicts on that staff member
        if (selectedStaff && app.staffId !== selectedStaff.id) return false;
        return true;
      })
      .map(app => {
        // extract HH:MM from ISO string "YYYY-MM-DDT[HH:MM]:SS"
        const t = app.dateTime.split("T")[1];
        return t ? t.substring(0, 5) : "";
      });

    const finalAvailable = slots.filter(slot => !bookedTimes.includes(slot));
    setAvailableSlots(finalAvailable);
  }, [selectedDate, selectedStaff, appointments, business]);

  const handleNextStep = () => {
    setValidationError(null);
    if (step === 1 && !selectedService) {
      setValidationError(
        language === 'pt' ? "Por favor, selecione um serviço para continuar" :
        language === 'es' ? "Por favor, seleccione un servicio para continuar" :
        "Please select a service to continue"
      );
      return;
    }
    if (step === 2 && !selectedStaff) {
      setValidationError(
        language === 'pt' ? "Por favor, selecione um profissional para continuar" :
        language === 'es' ? "Por favor, seleccione un profesional para continuar" :
        "Please select a staff member to continue"
      );
      return;
    }
    if (step === 3 && (!selectedDate || !selectedTime)) {
      setValidationError(
        language === 'pt' ? "Por favor, selecione a data e o horário para continuar" :
        language === 'es' ? "Por favor, seleccione la fecha y la hora para continuar" :
        "Please select both a date and time slot"
      );
      return;
    }
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setValidationError(null);
    setStep(prev => prev - 1);
  };

  const handleReset = () => {
    setStep(1);
    setSelectedService(null);
    setSelectedStaff(null);
    setSelectedDate("");
    setSelectedTime("");
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setCustomerNotes("");
    setBookingResultId("");
    setPaymentSuccess(false);
    setValidationError(null);
    setCalendarSyncMsg("");
  };

  // Submit appointment to Firebase + trigger simulated payments and notifications
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    if (!business || !selectedService || !selectedStaff) return;

    if (!customerName || !customerPhone) {
      setValidationError(
        language === 'pt' ? "Por favor, preencha o seu nome e número de telefone." :
        language === 'es' ? "Por favor, complete su nombre y número de teléfono." :
        "Please fill in your name and phone number."
      );
      return;
    }

    setPaymentLoading(true);

    try {
      const finalEmail = customerEmail.trim() || `${customerPhone.replace(/[^0-9]/g, "") || "no-phone"}@luminabook.app`;
      
      // Calculate amount to pay - online payments disabled per user request (only pay at venue)
      const finalAmount = 0; 

      // 2. Save Appointment doc in Firebase under subcollection
      const isoDateTime = `${selectedDate}T${selectedTime}:00`;
      const appData = {
        customerName,
        customerEmail: finalEmail,
        customerPhone,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        staffId: selectedStaff.id,
        staffName: selectedStaff.name,
        dateTime: isoDateTime,
        status: "confirmed" as const,
        paymentStatus: "unpaid" as const,
        paymentAmount: finalAmount,
        notes: customerNotes,
        createdAt: new Date().toISOString(),
      };

      const docId = await addAppointment(business.id, appData);

      // 3. Create simulated Customer record in CRM under subcollection
      // Check if customer already exists first
      const allCust = await getCustomers(business.id);
      const exists = allCust.some(c => c.phone === customerPhone);

      if (!exists) {
        await addCustomer(business.id, {
          name: customerName,
          email: finalEmail,
          phone: customerPhone,
          notes: `Added during booking for ${selectedService.name}.`,
          createdAt: new Date().toISOString(),
        });
      }

      // 4. Trigger Instant Simulated Email Notification Logs (to business and customer)
      // Notification to Customer
      await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: business.id,
          type: "confirmation",
          recipientEmail: finalEmail,
          subject: `Appointment Confirmed! - ${business.name}`,
          body: `Hi ${customerName},\n\nYour appointment for ${selectedService.name} with ${selectedStaff.name} is confirmed for ${selectedDate} at ${selectedTime}.\n\nLocation: ${business.name}\nTotal Price: $${selectedService.price}\nPayment Option: Pay at Venue\n\nThank you for choosing us!`,
        }),
      });

      // Notification to Business Owner / Staff
      await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: business.id,
          type: "confirmation",
          recipientEmail: selectedStaff.email,
          subject: `New Booking! - ${customerName} (${selectedService.name})`,
          body: `Hi ${selectedStaff.name},\n\nYou have a new booking!\n\nClient: ${customerName}\nService: ${selectedService.name}\nDate: ${selectedDate} at ${selectedTime}\nContact: ${customerPhone} / ${finalEmail}\n\nCheck your dashboard for details.`,
        }),
      });

       setBookingResultId(docId);
      setPaymentSuccess(true);
      setPaymentLoading(false);
      setStep(5); // Go to Success Confirmation
    } catch (err: any) {
      console.error("Booking error:", err);
      const errMsg = err instanceof Error ? err.message : String(err);
      setValidationError(`Error processing your booking: ${errMsg}`);
      setPaymentLoading(false);
    }
  };

  // Sync to external calendar (real pre-filled calendar compose link)
  const handleCalendarSync = async (provider: 'google' | 'outlook') => {
    if (!business || !selectedService) return;

    try {
      // Still trigger the backend logger API
      await fetch("/api/calendar/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          appointmentId: bookingResultId,
          customerName,
          serviceName: selectedService.name,
          dateTime: `${selectedDate}T${selectedTime}:00`,
        }),
      });

      // Parse dates safely in user's local timezone
      const [yr, mo, dy] = selectedDate.split("-").map(Number);
      const [hr, mn] = selectedTime.split(":").map(Number);
      const startDate = new Date(yr, mo - 1, dy, hr, mn);
      const durationMin = selectedService.duration || 30;
      const endDate = new Date(startDate.getTime() + durationMin * 60000);

      const title = encodeURIComponent(`${selectedService.name} - ${business.name}`);
      const details = encodeURIComponent(
        `Agendamento confirmado via Luminabook.\n\n` +
        `Serviço: ${selectedService.name}\n` +
        `Profissional: ${selectedStaff?.name || "Qualquer Profissional"}\n` +
        `Estúdio: ${business.name}\n` +
        `Observações: ${customerNotes || "Nenhuma"}`
      );
      
      const formatISOCompact = (d: Date) => {
        return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      };

      const startISO = formatISOCompact(startDate);
      const endISO = formatISOCompact(endDate);

      let url = "";
      if (provider === 'google') {
        url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startISO}/${endISO}&details=${details}`;
      } else {
        url = `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${title}&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}&body=${details}`;
      }

      window.open(url, "_blank");

      const successMsg = language === 'pt'
        ? `Agendamento sincronizado! Abrindo seu calendário no ${provider === 'google' ? 'Google' : 'Outlook'}...`
        : language === 'es'
        ? `¡Reserva sincronizada! Abriendo su calendario en ${provider === 'google' ? 'Google' : 'Outlook'}...`
        : `Booking synchronized! Opening your ${provider === 'google' ? 'Google' : 'Outlook'} calendar...`;

      setCalendarSyncMsg(successMsg);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F9FAFB] text-slate-500 font-sans" id="booking-loading">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="mt-4 text-sm font-semibold">Loading Booking Page...</div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F9FAFB] p-6 text-center font-sans" id="booking-error">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900">{errorMsg}</h2>
        <p className="text-sm text-slate-500 mt-2">The custom subdomain may not have been created yet by the owner.</p>
        {onBackToMain && (
          <button 
            onClick={onBackToMain}
            className="mt-6 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Go Back to Main Site
          </button>
        )}
      </div>
    );
  }

  if (!business) return null;

  // Set brand theme styles dynamically
  const brandBg = business.brandColor || "#2563EB";

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#FAF9F5] via-[#F4F4F6] to-[#FAF9F5] py-4 md:py-12 px-4 md:px-6 font-sans flex flex-col justify-between" id="booking-wizard-wrapper">
      {/* Top utility bar (Language selection) */}
      <div className="max-w-4xl mx-auto w-full flex justify-between items-center mb-4 px-2">
        <div />
        
        {/* Language switcher */}
        <div className="flex gap-1.5 items-center bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/80 shadow-2xs">
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <button 
            onClick={() => setLanguage('pt')} 
            className={`text-xs font-semibold px-1.5 py-0.5 rounded transition-all ${language === 'pt' ? 'bg-black text-white' : 'text-slate-600 hover:text-slate-900'}`}
          >
            PT
          </button>
          <button 
            onClick={() => setLanguage('es')} 
            className={`text-xs font-semibold px-1.5 py-0.5 rounded transition-all ${language === 'es' ? 'bg-black text-white' : 'text-slate-600 hover:text-slate-900'}`}
          >
            ES
          </button>
          <button 
            onClick={() => setLanguage('en')} 
            className={`text-xs font-semibold px-1.5 py-0.5 rounded transition-all ${language === 'en' ? 'bg-black text-white' : 'text-slate-600 hover:text-slate-900'}`}
          >
            EN
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[550px]">
        
        {/* Left column: Business Profile Summary Card */}
        <div className="md:w-1/3 bg-slate-50 p-6 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3">
              {business.logoUrl ? (
                <img 
                  src={business.logoUrl} 
                  alt={business.name} 
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-lg object-cover bg-white border border-slate-200"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg text-white font-bold flex items-center justify-center text-xl shadow-xs" style={{ backgroundColor: brandBg }}>
                  {business.name[0]}
                </div>
              )}
              <div>
                <h3 className="font-bold text-slate-900 text-base">{business.name}</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  {language === 'pt' ? 'Página de Agendamento' : language === 'es' ? 'Página de Reservas' : 'Booking Page'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-4 leading-relaxed">
              {business.description || (
                language === 'pt' ? "Bem-vindo ao nosso portal de agendamentos. Escolha um serviço abaixo." :
                language === 'es' ? "Bienvenido a nuestro portal de reservas. Elija un servicio a continuación." :
                "Welcome to our booking portal. Select a service below to schedule your appointment."
              )}
            </p>
            
            {/* Selections breakdown */}
            <div className="mt-8 space-y-4">
              {selectedService && (
                <div className="flex gap-2.5 items-start">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      {language === 'pt' ? 'Serviço' : language === 'es' ? 'Servicio' : 'Service'}
                    </div>
                    <div className="text-xs font-semibold text-slate-800">{selectedService.name}</div>
                    <div className="text-[10px] text-slate-500">
                      {selectedService.duration} {language === 'pt' ? 'min' : language === 'es' ? 'min' : 'mins'} • ${selectedService.price}
                    </div>
                  </div>
                </div>
              )}

              {selectedStaff && (
                <div className="flex gap-2.5 items-start">
                  <User className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      {language === 'pt' ? 'Profissional' : language === 'es' ? 'Profesional' : 'Staff Member'}
                    </div>
                    <div className="text-xs font-semibold text-slate-800">{selectedStaff.name}</div>
                  </div>
                </div>
              )}

              {selectedDate && selectedTime && (
                <div className="flex gap-2.5 items-start">
                  <CalendarIcon className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      {language === 'pt' ? 'Data e Horário' : language === 'es' ? 'Fecha y Hora' : 'Date & Time'}
                    </div>
                    <div className="text-xs font-semibold text-slate-800">{selectedDate}</div>
                    <div className="text-xs text-slate-500">
                      {language === 'pt' ? 'às' : language === 'es' ? 'a las' : 'at'} {selectedTime}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Dynamic Booking Step Form */}
        <div className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col justify-between" id="booking-wizard-step-form">
          
          {/* Progress Header */}
          {step < 5 && (
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {language === 'pt' ? `Passo ${step} de 4` : language === 'es' ? `Paso ${step} de 4` : `Step ${step} of 4`}
              </span>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map(s => (
                  <div 
                    key={s} 
                    className={`h-1.5 rounded-full transition-all ${
                      s === step 
                        ? "w-6 bg-black" 
                        : s < step 
                        ? "w-2 bg-emerald-500" 
                        : "w-2 bg-gray-200"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {validationError && (
            <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-xl flex items-start gap-2 animate-fade-in relative">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
              <span className="flex-1 font-medium">{validationError}</span>
              <button 
                onClick={() => setValidationError(null)} 
                className="text-amber-500 hover:text-amber-700 font-bold ml-1 text-sm leading-none focus:outline-none cursor-pointer"
              >
                ×
              </button>
            </div>
          )}

          {/* STEP 1: SELECT SERVICE */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                {translations[language].booking.selectService}
              </h2>
              <p className="text-xs text-gray-500 mb-4">{translations[language].booking.selectServiceDesc}</p>

              {services.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl">
                  <p className="text-sm text-gray-400">{translations[language].booking.noServices}</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                  {services.map(srv => (
                    <motion.div
                      key={srv.id}
                      id={`srv-option-${srv.id}`}
                      onClick={() => setSelectedService(srv)}
                      whileHover={{ scale: 1.005, y: -0.5 }}
                      whileTap={{ scale: 0.995 }}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${
                        selectedService?.id === srv.id
                          ? "border-black bg-gray-50/70 shadow-sm"
                          : "border-gray-200 hover:border-gray-300 hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="flex-1 pr-4">
                        <div className="font-semibold text-sm text-gray-900">{srv.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-3 md:line-clamp-none">{srv.description}</div>
                        <div className="flex gap-2.5 items-center mt-2">
                          <span className="inline-flex items-center gap-1 text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-medium">
                            <Clock className="w-3 h-3" /> {srv.duration} {translations[language].booking.duration}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-bold text-base text-gray-900">${srv.price}</div>
                        {selectedService?.id === srv.id && (
                          <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">✓ {translations[language].booking.selected}</span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 2: SELECT STAFF MEMBER */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <h2 className="text-lg font-bold text-gray-900 mb-1">{translations[language].booking.selectStaff}</h2>
              <p className="text-xs text-gray-500 mb-4">{translations[language].booking.selectStaffDesc}</p>

              {staffList.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl">
                  <p className="text-sm text-gray-400">{translations[language].booking.noStaff}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-1">
                  {staffList
                    // Filter staff that can perform selected service (or allow all if list empty)
                    .filter(st => st.assignedServices?.length === 0 || st.assignedServices?.includes(selectedService?.id || ""))
                    .map(st => (
                      <motion.div
                        key={st.id}
                        id={`staff-option-${st.id}`}
                        onClick={() => setSelectedStaff(st)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                          selectedStaff?.id === st.id
                            ? "border-black bg-gray-50/70 shadow-sm"
                            : "border-gray-200 hover:border-gray-300 hover:bg-slate-50/50"
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-semibold flex items-center justify-center text-sm border border-slate-200 shrink-0">
                          {st.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-xs text-gray-900 truncate">{st.name}</div>
                          <div className="text-[10px] text-gray-400 truncate">
                            {language === 'pt' ? 'Especialista Profissional' : language === 'es' ? 'Especialista Profesional' : 'Professional Specialist'}
                          </div>
                          {selectedStaff?.id === st.id && (
                            <span className="text-[9px] text-emerald-600 font-bold block mt-0.5">✓ {translations[language].booking.selected}</span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 3: DATE & TIME SELECTOR */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <h2 className="text-lg font-bold text-gray-900 mb-1">{translations[language].booking.pickDateTime}</h2>
              <p className="text-xs text-gray-500 mb-4">{translations[language].booking.pickDateTimeDesc}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Date Input Column */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">{translations[language].booking.dateLabel}</label>
                  <input
                    type="date"
                    id="booking-date-input"
                    value={selectedDate}
                    min={new Date().toLocaleDateString("en-CA")}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedTime(""); // reset time when date changes
                    }}
                    className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm font-medium focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all shadow-2xs"
                  />
                </div>

                {/* Slots Column */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">{translations[language].booking.slotsLabel}</label>
                  {availableSlots.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-gray-100 rounded-xl text-xs text-gray-400">
                      {translations[language].booking.noSlots}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-1.5 max-h-[220px] overflow-y-auto pr-1">
                      {availableSlots.map(slot => (
                        <motion.button
                          key={slot}
                          type="button"
                          id={`time-slot-${slot.replace(':', '-')}`}
                          onClick={() => setSelectedTime(slot)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`py-2 rounded-lg text-xs font-semibold transition-all border ${
                            selectedTime === slot
                              ? "bg-black text-white border-black shadow-xs"
                              : "bg-white text-slate-800 border-gray-200 hover:border-gray-400 hover:bg-slate-50/50"
                          }`}
                        >
                          {slot}
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: CONTACT INFO */}
          {step === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <form onSubmit={handleBookingSubmit} id="booking-info-payment-form" className="max-w-md mx-auto w-full space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-1">{translations[language].booking.confirmBooking}</h2>
                  <p className="text-xs text-gray-500 mb-4">{translations[language].booking.confirmBookingDesc}</p>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{translations[language].booking.fullName}</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-3 text-xs font-medium focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{translations[language].booking.phone}</label>
                    <input
                      type="tel"
                      required
                      placeholder={language === 'pt' ? "(11) 99999-9999" : language === 'es' ? "+34 600 000 000" : "+1 (555) 000-0000"}
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-3 text-xs font-medium focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{translations[language].booking.notes}</label>
                    <textarea
                      placeholder={translations[language].booking.notesPlaceholder}
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-3 text-xs font-medium focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all h-16 resize-none"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    id="submit-booking-action-btn"
                    disabled={paymentLoading}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full text-white bg-black hover:bg-slate-800 text-xs font-bold py-3 rounded-lg mt-4 flex items-center justify-center gap-1.5 transition-all disabled:bg-slate-400 cursor-pointer shadow-sm"
                  >
                    {paymentLoading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>{translations[language].booking.scheduleButton}</>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}

          {/* STEP 5: SUCCESS CONFIRMATION */}
          {step === 5 && (
            <motion.div
              key="step-5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="text-center py-6 flex flex-col justify-between h-full"
              id="booking-success-container"
            >
              <div>
                <motion.div 
                  initial={{ scale: 0.8, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
                  className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Check className="w-8 h-8 text-emerald-600" />
                </motion.div>
                <h2 className="text-2xl font-black text-gray-900 leading-tight">{translations[language].booking.successTitle}</h2>
                <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto">
                  {language === 'pt' ? (
                    <>
                      Seu agendamento para <span className="font-semibold text-slate-800">{selectedService?.name}</span> com <span className="font-semibold text-slate-800">{selectedStaff?.name}</span> foi confirmado para o dia <span className="font-semibold text-slate-800">{selectedDate}</span> às <span className="font-semibold text-slate-800">{selectedTime}</span>.
                    </>
                  ) : language === 'es' ? (
                    <>
                      Su reserva para <span className="font-semibold text-slate-800">{selectedService?.name}</span> con <span className="font-semibold text-slate-800">{selectedStaff?.name}</span> ha sido confirmada para el día <span className="font-semibold text-slate-800">{selectedDate}</span> a las <span className="font-semibold text-slate-800">{selectedTime}</span>.
                    </>
                  ) : (
                    <>
                      Your appointment for <span className="font-semibold text-slate-800">{selectedService?.name}</span> with <span className="font-semibold text-slate-800">{selectedStaff?.name}</span> is confirmed for <span className="font-semibold text-slate-800">{selectedDate}</span> at <span className="font-semibold text-slate-800">{selectedTime}</span>.
                    </>
                  )}
                </p>

                {/* Notification receipt message */}
                <div className="mt-4 inline-flex items-center gap-1.5 bg-emerald-50/40 border border-emerald-100/80 rounded-full px-4 py-1.5 text-xs text-emerald-800 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{translations[language].booking.receiptPhone} <strong>{customerPhone}</strong></span>
                </div>

                {/* Reset & Book Another Appointment Button */}
                <div className="mt-6 pt-2">
                  <motion.button
                    onClick={handleReset}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-black hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-6 rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    {translations[language].booking.scheduleAnother}
                  </motion.button>
                </div>

                {/* Calendar buttons */}
                <div className="mt-8 border-t border-slate-100 pt-6">
                  <h4 className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-3">{translations[language].booking.addToCalendar}</h4>
                  <div className="flex flex-col sm:flex-row justify-center gap-2.5 sm:gap-3">
                    <button
                      onClick={() => handleCalendarSync('google')}
                      id="google-cal-sync-btn"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-white border border-slate-200 px-4 py-2.5 sm:py-2 rounded-lg text-xs font-semibold hover:border-slate-400 hover:bg-slate-50 transition-all shadow-xs"
                    >
                      <CalendarDays className="w-4 h-4 text-blue-600" /> Google Calendar
                    </button>
                    <button
                      onClick={() => handleCalendarSync('outlook')}
                      id="outlook-cal-sync-btn"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-white border border-slate-200 px-4 py-2.5 sm:py-2 rounded-lg text-xs font-semibold hover:border-slate-400 hover:bg-slate-50 transition-all shadow-xs"
                    >
                      <CalendarDays className="w-4 h-4 text-red-500" /> Outlook Calendar
                    </button>
                  </div>
                  {calendarSyncMsg && (
                    <p className="text-[10px] text-emerald-600 font-semibold mt-3 bg-emerald-50/50 inline-block px-3 py-1 rounded-md border border-emerald-100">
                      {calendarSyncMsg}
                    </p>
                  )}
                </div>
              </div>

              {onBackToMain && (
                <div className="mt-8 border-t border-gray-100 pt-6">
                  <button
                    onClick={onBackToMain}
                    id="success-home-btn"
                    className="text-xs font-medium text-gray-500 hover:text-black transition-colors underline"
                  >
                    {translations[language].booking.goBackHome}
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Action Footer Buttons */}
          {step < 4 && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
              {step > 1 ? (
                <button
                  type="button"
                  id="booking-back-step-btn"
                  onClick={handlePrevStep}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-black transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> {translations[language].booking.back}
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                id="booking-next-step-btn"
                onClick={handleNextStep}
                className="inline-flex items-center gap-1.5 bg-black text-white hover:bg-gray-800 text-xs font-semibold px-4 py-2 rounded-lg shadow-xs transition-colors"
              >
                {translations[language].booking.next} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
      
      {/* Centered Page Footer Credits */}
      <div className="text-[10px] text-slate-400 text-center mt-6">
        {translations[language].booking.poweredBy} <span className="font-semibold text-slate-500">Luminabook</span>
      </div>
    </div>
  );
}
