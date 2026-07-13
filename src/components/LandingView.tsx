import React, { useState } from "react";
import { 
  Calendar, 
  Sparkles, 
  Clock, 
  Users, 
  CheckCircle2, 
  ChevronRight, 
  DollarSign, 
  Smartphone, 
  ShieldCheck, 
  MessageSquare,
  Zap,
  ArrowRight,
  Play,
  Globe,
  Menu,
  X,
  Star,
  Scissors,
  TrendingUp,
  Coins,
  ArrowUpRight,
  Inbox,
  AlertTriangle,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Language } from "../lib/translations";

interface LandingViewProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

export default function LandingView({ onGetStarted, onSignIn, language, setLanguage }: LandingViewProps) {
  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Interactive Hero Device Mockup States
  const [heroSimService, setHeroSimService] = useState<'haircut' | 'beard'>('haircut');
  const [heroSimTime, setHeroSimTime] = useState<'10:00 AM' | '02:30 PM' | '04:00 PM'>('02:30 PM');
  const [heroSimBooked, setHeroSimBooked] = useState(false);

  // Live Demo Modal State
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoSelectedService, setDemoSelectedService] = useState<string | null>(null);
  const [demoSelectedStaff, setDemoSelectedStaff] = useState<string | null>(null);
  const [demoSelectedTime, setDemoSelectedTime] = useState<string | null>(null);
  const [demoClientName, setDemoClientName] = useState("");
  const [demoClientPhone, setDemoClientPhone] = useState("");
  const [demoStep, setDemoStep] = useState<'service' | 'staff' | 'time' | 'checkout' | 'success'>('service');

  // FAQ Accordion States
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Data for Interactive Demo Modal
  const demoServices = [
    { id: '1', name: 'Signature Haircut & Style', price: 45, duration: '40 min', desc: 'Precision cut, premium wash, warm towel finish, and custom styling.' },
    { id: '2', name: 'Beard Grooming & Hot Towel Shave', price: 30, duration: '30 min', desc: 'Detail trim, straight razor outline, essential oils, and hot steam towel.' },
    { id: '3', name: 'Executive Grooming Package', price: 70, duration: '75 min', desc: 'Signature cut, complete beard trim, premium charcoal face mask, and massage.' }
  ];

  const demoStaff = [
    { id: 's1', name: 'Marcus Vance', role: 'Master Barber / Owner', rating: '5.0 (248 reviews)' },
    { id: 's2', name: 'Sophia Sterling', role: 'Senior Stylist', rating: '4.9 (184 reviews)' }
  ];

  const demoTimeSlots = ['09:30 AM', '11:00 AM', '01:30 PM', '02:30 PM', '04:00 PM', '05:30 PM'];

  // Handlers for Live Demo
  const openLiveDemo = () => {
    setDemoSelectedService(null);
    setDemoSelectedStaff(null);
    setDemoSelectedTime(null);
    setDemoClientName("");
    setDemoClientPhone("");
    setDemoStep('service');
    setIsDemoModalOpen(true);
  };

  const handleSelectDemoService = (serviceId: string) => {
    setDemoSelectedService(serviceId);
    setDemoStep('staff');
  };

  const handleSelectDemoStaff = (staffId: string) => {
    setDemoSelectedStaff(staffId);
    setDemoStep('time');
  };

  const handleSelectDemoTime = (time: string) => {
    setDemoSelectedTime(time);
    setDemoStep('checkout');
  };

  const handleCompleteDemoBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoClientName || !demoClientPhone) return;
    setDemoStep('success');
  };

  const pricingFeatures = [
    "Unlimited Bookings & Clients",
    "Automated 2-way SMS Reminders",
    "Stripe Instant Deposit Payments",
    "Custom Subdomain Link (yourname.luminabook.com)",
    "Clean Multi-staff Calendars",
    "Modern Analytics & Revenue Reports"
  ];

  const faqs = [
    {
      q: "Do my clients need to download an app?",
      a: "No, absolutely not. Your booking page loads as a beautiful, lightweight mobile website. Clients can book their appointment in just 3 clicks directly from their iPhone, Android, or desktop browser without any sign-ups."
    },
    {
      q: "How long does it take to set up?",
      a: "Less than 5 minutes. All you need to do is enter your salon details, add your services and hours, and connect Stripe if you want to take deposit payments. Your custom link is instantly ready to share!"
    },
    {
      q: "Can I accept payments and deposits?",
      a: "Yes, we integrate seamlessly with Stripe. You can require a custom deposit percentage (e.g., 20% or 50%) or full prepayment before clients can reserve a spot on your calendar. This completely eliminates last-minute flake-outs."
    },
    {
      q: "Can I use LuminaBook on my Instagram and TikTok bio?",
      a: "Yes! Your custom booking link (e.g., luminabook.app/your-salon) is designed to fit perfectly in your Instagram Bio, Google Maps listing, Yelp profile, or TikTok bio to convert social media traffic instantly."
    }
  ];

  return (
    <div className="bg-[#08090E] min-h-screen text-slate-100 font-sans relative overflow-x-hidden selection:bg-indigo-500 selection:text-white" id="luminabook-landing">
      {/* Background Radial Light Rays */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-[600px] bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(99,102,241,0.18),rgba(255,255,255,0))] pointer-events-none z-0" />
      <div className="absolute top-[800px] -right-[200px] w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.05),transparent_70%)] pointer-events-none" />

      {/* 1. HEADER / NAVBAR */}
      <header className="border-b border-slate-800/60 py-4 px-4 sm:px-6 md:px-12 bg-[#08090E]/80 backdrop-blur-md sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-indigo-600/20 shrink-0">
              L
            </div>
            <span className="font-bold text-xl tracking-tight text-white font-sans">
              Lumina<span className="text-indigo-500">Book</span>
            </span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <button onClick={openLiveDemo} className="text-indigo-400 hover:text-indigo-300 transition-colors font-semibold flex items-center gap-1">
              Live Demo <span className="text-[10px] bg-indigo-500/10 px-1.5 py-0.5 rounded text-indigo-400">Try Client View</span>
            </button>
          </nav>

          {/* Header Action CTAs */}
          <div className="flex items-center gap-3">
            {/* Language switch */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-full px-2.5 py-1 text-xs">
              <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="text-[11px] font-semibold text-slate-300 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="en" className="bg-slate-950">EN</option>
                <option value="es" className="bg-slate-950">ES</option>
              </select>
            </div>

            <button 
              onClick={onSignIn}
              className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors px-2.5 py-1.5 cursor-pointer"
            >
              Log In
            </button>
            <button 
              onClick={onGetStarted}
              className="hidden sm:inline-flex text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition-all shadow-sm shadow-indigo-600/10 hover:scale-[1.02] cursor-pointer"
            >
              Start Free Trial
            </button>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="md:hidden p-1 text-slate-400 hover:text-white cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile navigation panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-slate-800 bg-[#08090E] px-6 py-6 space-y-4 relative z-30"
          >
            <a 
              href="#features" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-slate-300 font-medium hover:text-white py-1"
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-slate-300 font-medium hover:text-white py-1"
            >
              How It Works
            </a>
            <a 
              href="#pricing" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-slate-300 font-medium hover:text-white py-1"
            >
              Pricing
            </a>
            <button 
              onClick={() => {
                setIsMobileMenuOpen(false);
                openLiveDemo();
              }}
              className="w-full text-left font-semibold text-indigo-400 hover:text-indigo-300 py-1"
            >
              View Client Live Demo
            </button>
            <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onGetStarted();
                }}
                className="w-full text-center bg-indigo-600 hover:bg-indigo-50 text-white font-bold py-3 rounded-xl text-sm"
              >
                Start Free Trial
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. HERO SECTION */}
      <section className="pt-8 pb-16 sm:py-20 md:py-28 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto z-10 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 text-left space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full text-xs font-semibold text-indigo-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Beautiful 3-Click Client Bookings</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.08]">
              Get more appointments. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-500 font-black">
                Eliminate no-shows.
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed">
              A beautifully simple, 3-click booking link designed for beauty professionals and barbers. Set up your page in less than 5 minutes.
            </p>

            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={onGetStarted}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-base font-bold px-8 py-4.5 rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-indigo-600/25 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  Create Your Link For Free <ArrowRight className="w-5 h-5 shrink-0" />
                </button>
                <button
                  onClick={openLiveDemo}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 text-base font-semibold px-6 py-4.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-slate-300 text-slate-300" /> Watch Live Demo
                </button>
              </div>
              <p className="text-xs text-slate-500 pl-1">
                7-day free trial. No credit card required.
              </p>
            </div>

            {/* Micro badges below hero */}
            <div className="pt-4 border-t border-slate-800/60 grid grid-cols-3 gap-4 text-xs text-slate-400 font-medium">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>Stripe Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>99.9% Uptime</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>Instant Set Up</span>
              </div>
            </div>
          </div>

          {/* Hero Right: Interactive Mobile Mockup */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
            {/* Subtle glow behind phone */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -z-10" />

            {/* Interactive iOS Smartphone Container */}
            <div className="w-full max-w-[310px] bg-slate-950 rounded-[44px] p-3.5 shadow-2xl border-[6px] border-slate-800 shrink-0 relative hover:border-slate-700 transition-colors">
              {/* Dynamic Island Notch */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-950 rounded-full z-20 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-850 absolute right-4"></div>
              </div>

              {/* iPhone screen canvas */}
              <div className="bg-[#FAF9F5] rounded-[32px] overflow-hidden p-4 text-slate-800 font-sans text-xs min-h-[460px] flex flex-col justify-between relative shadow-inner">
                {heroSimBooked ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-1 flex flex-col items-center justify-center text-center p-3"
                  >
                    <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center text-emerald-600 font-black text-2xl mb-4">
                      ✓
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">Booking Confirmed! 🎉</h4>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                      Your appointment is reserved for tomorrow at <strong className="text-slate-800">{heroSimTime}</strong> with <strong className="text-slate-800">Marcus Vance</strong>.
                    </p>
                    <div className="mt-4 bg-emerald-50 text-emerald-800 font-semibold text-[10px] px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      SMS confirmation sent!
                    </div>

                    <button
                      onClick={() => setHeroSimBooked(false)}
                      className="mt-8 text-xs font-bold bg-slate-900 text-white px-4 py-2.5 rounded-xl hover:bg-slate-800 cursor-pointer"
                    >
                      Book Another Service
                    </button>
                  </motion.div>
                ) : (
                  <>
                    {/* Merchant Header */}
                    <div className="border-b border-slate-200/80 pb-3 text-center pt-3">
                      <div className="w-8 h-8 bg-indigo-600 rounded-lg text-white font-extrabold mx-auto flex items-center justify-center text-sm shadow-xs">
                        S
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 mt-1.5">Syndicate Barbershop</h4>
                      <p className="text-[9px] text-slate-500 flex items-center justify-center gap-1">
                        <span>Lower East Side, NYC</span>
                        <span>•</span>
                        <span className="text-amber-500 font-semibold flex items-center">★ 4.9</span>
                      </p>
                    </div>

                    {/* Booking Form steps */}
                    <div className="flex-1 py-4 space-y-4">
                      <div>
                        <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-2">1. Select Service</div>
                        <div className="space-y-1.5">
                          <div 
                            onClick={() => setHeroSimService('haircut')}
                            className={`p-2.5 rounded-xl border cursor-pointer flex justify-between items-center transition-all ${
                              heroSimService === 'haircut' 
                                ? 'border-indigo-600 bg-indigo-50/50 shadow-2xs' 
                                : 'border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <div className="text-left">
                              <div className="font-bold text-[10px] text-slate-900">Classic Haircut</div>
                              <div className="text-[8px] text-slate-400">30 mins • Warm towel finish</div>
                            </div>
                            <div className="font-bold text-[10px] text-slate-950">$35</div>
                          </div>
                          
                          <div 
                            onClick={() => setHeroSimService('beard')}
                            className={`p-2.5 rounded-xl border cursor-pointer flex justify-between items-center transition-all ${
                              heroSimService === 'beard' 
                                ? 'border-indigo-600 bg-indigo-50/50 shadow-2xs' 
                                : 'border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <div className="text-left">
                              <div className="font-bold text-[10px] text-slate-900">Beard Grooming</div>
                              <div className="text-[8px] text-slate-400 font-medium">20 mins • Line-up & oils</div>
                            </div>
                            <div className="font-bold text-[10px] text-slate-950">$25</div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-2">2. Select Available Slot</div>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(['10:00 AM', '02:30 PM', '04:00 PM'] as const).map((tSlot) => (
                            <button
                              key={tSlot}
                              onClick={() => setHeroSimTime(tSlot)}
                              className={`rounded-lg text-[9px] py-1.5 text-center font-bold transition-all border ${
                                heroSimTime === tSlot 
                                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs' 
                                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                              }`}
                            >
                              {tSlot}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Footer CTA */}
                    <div className="pt-2 border-t border-slate-100">
                      <button
                        onClick={() => setHeroSimBooked(true)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-[10px] transition-all shadow-md shadow-indigo-600/10 cursor-pointer flex items-center justify-center gap-1"
                      >
                        <span>Confirm & Complete in 3 Clicks</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                      <div className="text-[8px] text-slate-400 text-center mt-1.5 flex items-center justify-center gap-1">
                        <Lock className="w-2 h-2 text-slate-400" /> Secure payment via Stripe
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Home Indicator line */}
              <div className="w-24 h-1 bg-slate-800 rounded-full mx-auto mt-2.5"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SOCIAL PROOF / TRUST LOGOS */}
      <section className="border-y border-slate-800/80 py-8 bg-[#090A11] px-4">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-400/80">
            Trusted by over 400+ modern beauty businesses
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 text-sm font-semibold text-slate-500 opacity-80">
            <span className="flex items-center gap-1.5 hover:text-slate-300 transition-colors">💈 Syndicate Barbershop</span>
            <span className="flex items-center gap-1.5 hover:text-slate-300 transition-colors">✨ Willow Spa & Wellness</span>
            <span className="flex items-center gap-1.5 hover:text-slate-300 transition-colors">⚓ Highline Tattoo Studio</span>
            <span className="flex items-center gap-1.5 hover:text-slate-300 transition-colors">💄 Blush Aesthetics</span>
            <span className="flex items-center gap-1.5 hover:text-slate-300 transition-colors">🌿 Organic Hair Collective</span>
          </div>
        </div>
      </section>

      {/* 4. THE THREE MAIN PAIN POINTS (Seção de Benefícios) */}
      <section className="py-20 md:py-28 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto" id="features">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-indigo-400 text-xs font-bold uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full">
            Maximize Retention & Revenue
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Designed for the demands of busy shops
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Stop losing bookings to busy phone lines, missed Instagram comments, and empty calendar slots.
          </p>
        </div>

        {/* Pain points grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pain Point 1 */}
          <div className="bg-[#0C0D16] border border-slate-800/80 rounded-2xl p-6 hover:border-slate-700/80 transition-all flex flex-col justify-between group relative">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-transparent rounded-t-2xl opacity-0 group-hover:opacity-100 transition-all" />
            <div>
              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-5 text-indigo-400 border border-indigo-500/10">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">24/7 Instant Booking</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Let your clients book at 11 PM when your salon is closed. Stop losing money on missed Instagram DMs.
              </p>
            </div>
            <div className="mt-6 flex items-center text-xs font-semibold text-indigo-400">
              Increase bookings by 35% <ArrowRight className="w-3 h-3 ml-1" />
            </div>
          </div>

          {/* Pain Point 2 */}
          <div className="bg-[#0C0D16] border border-slate-800/80 rounded-2xl p-6 hover:border-slate-700/80 transition-all flex flex-col justify-between group relative">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-transparent rounded-t-2xl opacity-0 group-hover:opacity-100 transition-all" />
            <div>
              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-5 text-indigo-400 border border-indigo-500/10">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No-Show Protection</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Automated SMS and email reminders that keep your schedule full and ensure clients show up on time.
              </p>
            </div>
            <div className="mt-6 flex items-center text-xs font-semibold text-indigo-400">
              Reduce flake-outs to under 2% <ArrowRight className="w-3 h-3 ml-1" />
            </div>
          </div>

          {/* Pain Point 3 */}
          <div className="bg-[#0C0D16] border border-slate-800/80 rounded-2xl p-6 hover:border-slate-700/80 transition-all flex flex-col justify-between group relative">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-transparent rounded-t-2xl opacity-0 group-hover:opacity-100 transition-all" />
            <div>
              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-5 text-indigo-400 border border-indigo-500/10">
                <Coins className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Seamless Payments</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Accept deposits or full payments instantly via Stripe or Apple Pay before they even step into your shop.
              </p>
            </div>
            <div className="mt-6 flex items-center text-xs font-semibold text-indigo-400">
              Get paid securely, instantly <ArrowRight className="w-3 h-3 ml-1" />
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS (3 Simple Steps) */}
      <section className="bg-[#090A11] border-y border-slate-800/60 py-20 md:py-28 px-4 sm:px-6 md:px-12" id="how-it-works">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-indigo-400 text-xs font-bold uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full">
              Zero Technical Skills Required
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Get up and running in 3 simple steps
            </h2>
            <p className="text-slate-400 text-sm">
              We design our flow to get you set up and taking bookings in less time than a coffee break.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Step 1 */}
            <div className="text-left space-y-4 relative">
              <div className="absolute -top-6 -left-3 text-7xl font-black text-slate-800/30 select-none z-0">01</div>
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold relative z-10 shadow-md">
                1
              </div>
              <h3 className="text-lg font-bold text-white relative z-10">Create your profile</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed relative z-10">
                Add your services, hours, pricing, and upload your studio logo to make your booking page unique.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-left space-y-4 relative">
              <div className="absolute -top-6 -left-3 text-7xl font-black text-slate-800/30 select-none z-0">02</div>
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold relative z-10 shadow-md">
                2
              </div>
              <h3 className="text-lg font-bold text-white relative z-10">Share your unique link</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed relative z-10">
                Paste your custom subdomain link in your Instagram Bio, Google Maps profile, or text it to regular clients.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-left space-y-4 relative">
              <div className="absolute -top-6 -left-3 text-7xl font-black text-slate-800/30 select-none z-0">03</div>
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold relative z-10 shadow-md">
                3
              </div>
              <h3 className="text-lg font-bold text-white relative z-10">Watch your calendar fill up</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed relative z-10">
                Clients book instantly in 3 clicks. You receive notifications and secure payments right into your bank account.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. LIVE DEMO CALLOUT */}
      <section className="py-20 md:py-24 px-4 sm:px-6 md:px-12 max-w-5xl mx-auto text-center">
        <div className="bg-gradient-to-r from-indigo-950/40 via-[#0E1020] to-indigo-950/40 border border-indigo-500/20 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          {/* Ambient lighting inside callout */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Want to see the exact client experience?
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto mt-3 mb-8 leading-relaxed">
            Test our fully interactive booking simulation to see how simple and responsive it is for clients to schedule and confirm on their mobile devices.
          </p>

          <button
            onClick={openLiveDemo}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm sm:text-base font-bold px-8 py-4 rounded-xl inline-flex items-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <Smartphone className="w-4 h-4 shrink-0" /> View a Live Demo Salon Page
          </button>
        </div>
      </section>

      {/* 7. PRICING SECTION */}
      <section className="py-20 md:py-28 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto" id="pricing">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-indigo-400 text-xs font-bold uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full">
            Unbeatable Low Ticket SaaS Value
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            One simple, fully transparent price
          </h2>
          <p className="text-slate-400 text-sm">
            Everything you need with zero hidden setup fees or contracts. Cancel anytime with a click.
          </p>
        </div>

        {/* Center alignment for the primary plan */}
        <div className="max-w-md mx-auto">
          <div className="bg-[#0C0D16] border-2 border-indigo-600/80 rounded-3xl p-8 relative shadow-xl shadow-indigo-600/5">
            {/* Absolute badge */}
            <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md">
              Unlimited Professional
            </div>

            <div className="text-center space-y-2 mt-2">
              <h3 className="font-extrabold text-2xl text-white">Full-Access Monthly</h3>
              <p className="text-slate-400 text-xs">Best value for barbershops, spas, & aesthetic practitioners</p>
            </div>

            <div className="my-8 text-center bg-slate-900/40 py-5 rounded-2xl border border-slate-800/80">
              <span className="text-5xl font-black text-white">$19</span>
              <span className="text-slate-400 text-sm font-medium"> / month</span>
              <p className="text-xs text-indigo-400 mt-2 font-semibold">7-day free trial • Cancel anytime</p>
            </div>

            <button
              onClick={onGetStarted}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-xl font-bold text-sm transition-all mb-8 shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              Start Your Free Trial Now
            </button>

            <div className="space-y-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Features included:</div>
              {pricingFeatures.map((feat, fIdx) => (
                <div key={fIdx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <p className="text-center text-[10px] text-slate-500 mt-6 font-semibold">
              No setup fees • No contracts • Secure Stripe integration
            </p>
          </div>
        </div>
      </section>

      {/* 8. FAQ SECTION (Morte de Objeções) */}
      <section className="bg-[#090A11] border-t border-slate-800/60 py-20 md:py-28 px-4 sm:px-6 md:px-12" id="faq">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-3xl font-black tracking-tight text-white">Frequently Asked Questions</h2>
            <p className="text-slate-400 text-sm">Everything you need to know about setting up and using LuminaBook.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div 
                key={i} 
                className="bg-[#0C0D16] border border-slate-850 rounded-2xl overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left py-5 px-6 flex justify-between items-center font-bold text-slate-200 hover:bg-slate-900/50 cursor-pointer"
                >
                  <span className="text-sm sm:text-base pr-4">{faq.q}</span>
                  <ChevronRight 
                    className={`w-5 h-5 text-slate-400 shrink-0 transform transition-transform ${
                      openFaq === i ? "rotate-90 text-indigo-400" : ""
                    }`} 
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-850 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="border-t border-slate-900 bg-[#06070B] py-16 px-4 sm:px-6 md:px-12 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          {/* Footer Logo & Brand info */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-base shadow-md shrink-0">
                L
              </div>
              <span className="font-bold text-lg tracking-tight text-white font-sans">
                Lumina<span className="text-indigo-500">Book</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Beautifully simple appointment and schedule booking for modern salons, barbers, and tattoo studios across the US and Canada.
            </p>
          </div>

          {/* Footer Navigation */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest">Product</h4>
            <ul className="space-y-2 text-xs text-slate-400 font-semibold">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><button onClick={openLiveDemo} className="hover:text-white transition-colors text-left">Interactive Client Demo</button></li>
            </ul>
          </div>

          {/* Footer Support */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest">Support & Trust</h4>
            <ul className="space-y-2 text-xs text-slate-400 font-semibold">
              <li>
                <a href="mailto:support@luminabook.app" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Inbox className="w-3.5 h-3.5" /> support@luminabook.app
                </a>
              </li>
              <li className="text-slate-500">Stripe Verified Integration</li>
              <li className="text-slate-500">SSL Encrypted Booking API</li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-900/60 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-500 font-medium">
          <div>
            &copy; 2026 LuminaBook. All rights reserved.
          </div>
          <div className="flex gap-6">
            <span className="hover:text-slate-300 transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-300 transition-colors cursor-pointer">Privacy Policy</span>
          </div>
        </div>
      </footer>

      {/* IMMERSIVE LIVE DEMO MODAL OVERLAY */}
      <AnimatePresence>
        {isDemoModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            {/* Modal Body */}
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl relative grid grid-cols-1 md:grid-cols-12"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button 
                onClick={() => setIsDemoModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-950/40 p-1.5 rounded-full z-20 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Left Panel: Guide info */}
              <div className="md:col-span-5 bg-gradient-to-b from-indigo-950/60 to-[#0A0B12] p-8 text-left flex flex-col justify-between border-r border-slate-800/60">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase text-indigo-400 tracking-wider">
                    Interactive Simulation
                  </div>
                  <h3 className="text-xl font-black text-white">LuminaBook Client Experience</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    This simulator demonstrates exactly what your salon, spa, or barbershop clients see on their smartphones.
                  </p>
                  
                  <div className="space-y-3 pt-4">
                    <div className="flex items-start gap-2.5 text-xs">
                      <div className="w-5 h-5 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</div>
                      <span className="text-slate-300">Choose a service catalog list item</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs">
                      <div className="w-5 h-5 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</div>
                      <span className="text-slate-300">Select dedicated professional staff</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs">
                      <div className="w-5 h-5 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</div>
                      <span className="text-slate-300">Pick preferred real-time calendar slot</span>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-800/80 mt-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">LB</div>
                    <div>
                      <div className="text-[11px] font-bold text-white">LuminaBook Assistant</div>
                      <div className="text-[9px] text-indigo-400">Low-Ticket B2B Platform</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Right Panel: Interactive simulated checkout portal */}
              <div className="md:col-span-7 bg-[#FAF9F5] text-slate-800 p-6 sm:p-8 flex flex-col justify-between min-h-[500px]">
                {demoStep === 'service' && (
                  <div className="space-y-4 text-left flex-1">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">Aura Beauty & Spa</h4>
                        <p className="text-[10px] text-slate-500">Miami, FL • Premium Client Booking Page</p>
                      </div>
                      <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Step 1 of 4</span>
                    </div>

                    <h5 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Select a Service</h5>
                    <div className="space-y-2.5">
                      {demoServices.map((srv) => (
                        <div 
                          key={srv.id}
                          onClick={() => handleSelectDemoService(srv.id)}
                          className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-slate-400 hover:shadow-sm cursor-pointer transition-all flex justify-between items-center text-left"
                        >
                          <div className="space-y-1 pr-4">
                            <div className="font-bold text-xs text-slate-900">{srv.name}</div>
                            <div className="text-[10px] text-slate-500 line-clamp-1">{srv.desc}</div>
                            <div className="text-[9px] text-indigo-600 font-semibold">{srv.duration}</div>
                          </div>
                          <div className="font-extrabold text-sm text-slate-900 shrink-0">
                            ${srv.price}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {demoStep === 'staff' && (
                  <div className="space-y-4 text-left flex-1">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">Aura Beauty & Spa</h4>
                        <p className="text-[10px] text-slate-500">Service: <strong className="text-slate-800">{demoServices.find(s => s.id === demoSelectedService)?.name}</strong></p>
                      </div>
                      <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Step 2 of 4</span>
                    </div>

                    <h5 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Select a Professional</h5>
                    <div className="space-y-2.5">
                      {demoStaff.map((st) => (
                        <div 
                          key={st.id}
                          onClick={() => handleSelectDemoStaff(st.id)}
                          className="p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-400 hover:shadow-sm cursor-pointer transition-all flex items-center gap-3 text-left"
                        >
                          <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 font-bold text-indigo-700 flex items-center justify-center text-xs shrink-0">
                            {st.name[0]}
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-xs text-slate-900">{st.name}</div>
                            <div className="text-[10px] text-slate-400">{st.role}</div>
                            <div className="text-[9px] text-amber-500 font-medium">★ {st.rating}</div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={() => setDemoStep('service')}
                      className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-1 mt-4"
                    >
                      ← Back to services
                    </button>
                  </div>
                )}

                {demoStep === 'time' && (
                  <div className="space-y-4 text-left flex-1">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">Aura Beauty & Spa</h4>
                        <p className="text-[10px] text-slate-500">Staff: <strong className="text-slate-800">{demoStaff.find(s => s.id === demoSelectedStaff)?.name}</strong></p>
                      </div>
                      <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Step 3 of 4</span>
                    </div>

                    <h5 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Select Available Time</h5>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {demoTimeSlots.map((ts) => (
                        <button
                          key={ts}
                          onClick={() => handleSelectDemoTime(ts)}
                          className="py-3 px-2 rounded-xl border border-slate-200 bg-white hover:border-indigo-600 hover:text-indigo-600 font-bold text-xs text-slate-700 transition-all cursor-pointer"
                        >
                          {ts}
                        </button>
                      ))}
                    </div>

                    <button 
                      onClick={() => setDemoStep('staff')}
                      className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-1 mt-4"
                    >
                      ← Back to professional select
                    </button>
                  </div>
                )}

                {demoStep === 'checkout' && (
                  <form onSubmit={handleCompleteDemoBooking} className="space-y-4 text-left flex-1">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">Aura Beauty & Spa</h4>
                        <p className="text-[10px] text-slate-500">Appointment summary ready</p>
                      </div>
                      <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Step 4 of 4</span>
                    </div>

                    <div className="bg-slate-100/60 p-4 rounded-xl border border-slate-200 text-xs space-y-2.5">
                      <div className="font-bold text-slate-900">Booking Summary</div>
                      <div className="flex justify-between text-slate-600">
                        <span>Service:</span>
                        <strong className="text-slate-850">{demoServices.find(s => s.id === demoSelectedService)?.name}</strong>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Professional:</span>
                        <strong className="text-slate-850">{demoStaff.find(s => s.id === demoSelectedStaff)?.name}</strong>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Time:</span>
                        <strong className="text-slate-850">Tomorrow, {demoSelectedTime}</strong>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-900">
                        <span>Total Price:</span>
                        <span>${demoServices.find(s => s.id === demoSelectedService)?.price}</span>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Your Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. John Doe"
                          value={demoClientName}
                          onChange={(e) => setDemoClientName(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:border-indigo-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Mobile Phone Number (For SMS confirmation)</label>
                        <input
                          type="tel"
                          required
                          placeholder="+1 (555) 019-9234"
                          value={demoClientPhone}
                          onChange={(e) => setDemoClientPhone(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:border-indigo-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-4"
                    >
                      <span>Complete Simulated Booking</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </form>
                )}

                {demoStep === 'success' && (
                  <div className="text-center py-8 space-y-6 flex-1 flex flex-col justify-center items-center">
                    <div className="w-16 h-16 bg-emerald-50 border-2 border-emerald-300 rounded-full flex items-center justify-center text-emerald-600 font-extrabold text-3xl shadow-sm">
                      ✓
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-extrabold text-lg text-slate-900">Simulated Booking Successful! 🎉</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                        In a real application, your client <strong className="text-slate-800">{demoClientName}</strong> would instantly receive an automated 2-way SMS reminder. 
                        Your calendar updates in real time and Stripe reserves the payment.
                      </p>
                    </div>

                    <div className="bg-[#0C0D16] text-slate-100 p-4 rounded-xl text-left text-xs max-w-sm border border-slate-850 space-y-1.5 shadow-md">
                      <div className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Mock SMS Notification sent to {demoClientPhone}</div>
                      <p className="text-[11px] leading-relaxed italic text-slate-300">
                        "Hey {demoClientName}! Your appointment at Aura Beauty & Spa is confirmed for tomorrow at {demoSelectedTime} with {demoStaff.find(s => s.id === demoSelectedStaff)?.name}. Reply 1 to Confirm or click here to modify."
                      </p>
                    </div>

                    <button
                      onClick={() => setIsDemoModalOpen(false)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-6 py-3 rounded-xl cursor-pointer"
                    >
                      Close Simulator
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
