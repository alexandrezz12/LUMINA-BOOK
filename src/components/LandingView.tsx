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
  ArrowUpRight,
  UserCheck,
  Percent,
  Play,
  Globe
} from "lucide-react";
import { motion } from "motion/react";
import { translations, Language } from "../lib/translations";

interface LandingViewProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

export default function LandingView({ onGetStarted, onSignIn, language, setLanguage }: LandingViewProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const t = translations[language].landing;

  const features = [
    {
      icon: <Clock className="w-5 h-5 text-gray-900" />,
      title: t.feature1Title,
      desc: t.feature1Desc
    },
    {
      icon: <Users className="w-5 h-5 text-gray-900" />,
      title: t.feature2Title,
      desc: t.feature2Desc
    },
    {
      icon: <DollarSign className="w-5 h-5 text-gray-900" />,
      title: t.feature3Title,
      desc: t.feature3Desc
    },
    {
      icon: <MessageSquare className="w-5 h-5 text-gray-900" />,
      title: t.feature4Title,
      desc: t.feature4Desc
    },
    {
      icon: <Smartphone className="w-5 h-5 text-gray-900" />,
      title: t.feature5Title,
      desc: t.feature5Desc
    },
    {
      icon: <Sparkles className="w-5 h-5 text-gray-900" />,
      title: t.feature6Title,
      desc: t.feature6Desc
    }
  ];

  const testimonials = [
    {
      quote: t.test1Quote,
      author: "Marcus Vance",
      role: "Owner, Syndicate Barbershop",
      rating: 5
    },
    {
      quote: t.test2Quote,
      author: "Elena Rostova",
      role: "Director, Rostova Aesthetics",
      rating: 5
    },
    {
      quote: t.test3Quote,
      author: "Sarah Jenkins",
      role: "Founder, Willow Spa & Wellness",
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: language === "pt" ? "R$ 99" : "$19",
      desc: t.planStarterDesc,
      features: [
        t.planStarterFeature1,
        t.planStarterFeature2,
        t.planStarterFeature3,
        t.planStarterFeature4,
        t.planStarterFeature5
      ],
      cta: t.planCtaTrial,
      popular: false
    },
    {
      name: "Professional",
      price: language === "pt" ? "R$ 199" : "$39",
      desc: t.planProfessionalDesc,
      features: [
        t.planProfessionalFeature1,
        t.planProfessionalFeature2,
        t.planProfessionalFeature3,
        t.planProfessionalFeature4,
        t.planProfessionalFeature5,
        t.planProfessionalFeature6,
        t.planProfessionalFeature7
      ],
      cta: t.planCtaTrial,
      popular: true
    },
    {
      name: "Enterprise",
      price: language === "pt" ? "R$ 399" : "$79",
      desc: t.planEnterpriseDesc,
      features: [
        t.planEnterpriseFeature1,
        t.planEnterpriseFeature2,
        t.planEnterpriseFeature3,
        t.planEnterpriseFeature4,
        t.planEnterpriseFeature5,
        t.planEnterpriseFeature6
      ],
      cta: t.planCtaContact,
      popular: false
    }
  ];

  const faqs = [
    {
      q: t.faq1Q,
      a: t.faq1A
    },
    {
      q: t.faq2Q,
      a: t.faq2A
    },
    {
      q: t.faq3Q,
      a: t.faq3A
    },
    {
      q: t.faq4Q,
      a: t.faq4A
    }
  ];

  return (
    <div className="bg-[#FAF9F5] min-h-screen text-slate-900 font-sans" id="landing-page-container">
      {/* Navigation Header */}
      <nav className="border-b border-slate-200/60 py-3.5 px-4 sm:px-6 md:px-12 flex justify-between items-center bg-[#FAF9F5]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-1.5 sm:gap-2 cursor-pointer" onClick={() => window.location.reload()}>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base sm:text-lg shrink-0">
            B
          </div>
          <span className="font-bold text-base sm:text-lg tracking-tight text-slate-900 font-sans">{t.brand}</span>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
          {/* Header Language Switcher */}
          <div className="flex items-center gap-1 bg-white border border-slate-200/80 rounded-full px-2 sm:px-3 py-1 sm:py-1.5 shadow-2xs">
            <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500 shrink-0" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="text-[10px] sm:text-xs font-semibold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="en">EN</option>
              <option value="pt">PT</option>
              <option value="es">ES</option>
            </select>
          </div>

          <button 
            id="nav-signin-btn"
            onClick={onSignIn}
            className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-950 transition-colors px-1 sm:px-2 py-1 shrink-0"
          >
            {t.signIn}
          </button>
          <button 
            id="nav-trial-btn"
            onClick={onGetStarted}
            className="hidden sm:inline-flex text-xs sm:text-sm font-semibold bg-indigo-600 text-white px-3 py-1.5 sm:px-5 sm:py-2 rounded-full hover:bg-indigo-700 hover:scale-102 transition-all shadow-2xs shrink-0"
          >
            {t.startTrial}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 sm:py-20 md:py-24 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto text-center animate-fade-in" id="landing-hero">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold text-indigo-800 mb-4 sm:mb-6"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
          <span>{t.heroBadge}</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight"
          id="hero-heading"
        >
          {t.heroHeading} <br />
          <span className="text-indigo-600 font-extrabold">{t.heroHeadingSub}</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-sm sm:text-lg md:text-xl text-slate-500 mt-4 sm:mt-6 max-w-2xl mx-auto leading-relaxed"
          id="hero-subheading"
        >
          {t.heroDesc}
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4"
        >
          <motion.button
            id="hero-cta-btn"
            onClick={onGetStarted}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto bg-indigo-600 text-white hover:bg-indigo-700 text-base font-semibold px-8 py-4 rounded-full flex items-center justify-center gap-2 transition-all shadow-md"
          >
            {t.heroCta} <ArrowRight className="w-5 h-5" />
          </motion.button>
          <motion.button
            id="hero-demo-btn"
            onClick={onSignIn}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto bg-white text-slate-700 border border-slate-200 hover:border-slate-350 hover:text-slate-900 text-base font-semibold px-8 py-4 rounded-full flex items-center justify-center gap-2 transition-all"
          >
            <Play className="w-4 h-4 text-slate-600 fill-slate-600" /> {t.heroDemo}
          </motion.button>
        </motion.div>

        {/* Dashboard Mock Preview */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-4 md:p-6 shadow-xl max-w-5xl mx-auto overflow-hidden relative"
        >
          <div className="absolute top-0 left-0 right-0 h-10 bg-white border-b border-slate-200 flex items-center px-4 gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
            <div className="bg-slate-50 border border-slate-200 rounded-md text-[10px] px-4 py-0.5 ml-4 text-slate-400 w-1/2 text-left truncate">
              www.luminabook.app/?b=aesthetic-clinic
            </div>
          </div>
          <div className="pt-10 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="text-xs font-semibold text-slate-400 uppercase">{t.revenue}</div>
              <div className="text-2xl font-bold mt-1 text-slate-900">{language === "pt" ? "R$ 12.450,00" : "$12,450.00"}</div>
              <div className="text-xs text-emerald-600 font-medium mt-2">{t.revenueSub}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="text-xs font-semibold text-slate-400 uppercase">{t.appointments}</div>
              <div className="text-2xl font-bold mt-1 text-slate-900">{language === "pt" ? "184 Agendamentos" : "184 Bookings"}</div>
              <div className="text-xs text-emerald-600 font-medium mt-2">{t.appointmentsSub}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="text-xs font-semibold text-slate-400 uppercase">{t.retention}</div>
              <div className="text-2xl font-bold mt-1 text-slate-900">84.2%</div>
              <div className="text-xs text-blue-600 font-medium mt-2">{t.retentionSub}</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Trust & Stats Grid */}
      <section className="bg-[#F9FAFB] py-12 px-6 border-y border-slate-200">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-extrabold text-slate-900">{t.statsBookings}</div>
            <div className="text-sm text-slate-500 mt-1">{t.statsBookingsSub}</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900">{t.statsReliability}</div>
            <div className="text-sm text-slate-500 mt-1">{t.statsReliabilitySub}</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900">{t.statsSalons}</div>
            <div className="text-sm text-slate-500 mt-1">{t.statsSalonsSub}</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900">{t.statsPayments}</div>
            <div className="text-sm text-slate-500 mt-1">{t.statsPaymentsSub}</div>
          </div>
        </div>
      </section>

      {/* Features Matrix */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto" id="landing-features">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">{t.featuresTitle}</h2>
          <p className="text-slate-500 mt-4 leading-relaxed">{t.featuresSub}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feat, i) => (
            <div key={i} className="border border-slate-150 rounded-2xl p-6 hover:shadow-xs hover:border-slate-300 transition-all bg-white flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center mb-4 text-indigo-600">
                  {feat.icon}
                </div>
                <h3 className="font-semibold text-lg text-slate-900">{feat.title}</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#F9FAFB] py-24 px-6 md:px-12" id="landing-testimonials">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">{t.testimonialsTitle}</h2>
            <p className="text-slate-500 mt-4 leading-relaxed">{t.testimonialsSub}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((test, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs flex flex-col justify-between">
                <p className="text-slate-600 italic leading-relaxed text-sm">"{test.quote}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700">
                    {test.author[0]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{test.author}</div>
                    <div className="text-xs text-slate-500">{test.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Matrix */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto" id="landing-pricing">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">{t.pricingTitle}</h2>
          <p className="text-slate-500 mt-4 leading-relaxed">{t.pricingSub}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {pricingPlans.map((plan, i) => (
            <div 
              key={i} 
              className={`rounded-2xl p-8 border ${
                plan.popular 
                  ? "border-indigo-600 shadow-md bg-white relative md:-translate-y-2" 
                  : "border-slate-200 bg-white"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                  {language === "pt" ? "Mais Popular" : "Most Popular"}
                </div>
              )}
              <h3 className="font-bold text-xl text-slate-900">{plan.name}</h3>
              <p className="text-sm text-slate-500 mt-2">{plan.desc}</p>
              
              <div className="my-6">
                <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                <span className="text-slate-500 text-sm font-medium"> {language === "pt" ? "/ mês" : "/ month"}</span>
              </div>

              <motion.button
                onClick={onGetStarted}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3 rounded-full font-semibold text-sm transition-all mb-8 ${
                  plan.popular 
                    ? "bg-indigo-600 text-white hover:bg-indigo-700" 
                    : "bg-slate-50 text-slate-800 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {plan.cta}
              </motion.button>

              <div className="space-y-3.5">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{language === "pt" ? "Recursos inclusos:" : "Features included:"}</div>
                {plan.features.map((feat, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive FAQ Accordion */}
      <section className="bg-[#F9FAFB] py-24 px-6 md:px-12 border-t border-slate-200" id="landing-faq">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">{t.faqTitle}</h2>
            <p className="text-slate-500 mt-3 leading-relaxed">{t.faqSub}</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div 
                key={i} 
                className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full text-left py-5 px-6 flex justify-between items-center font-semibold text-slate-900 hover:bg-slate-50"
                >
                  <span>{faq.q}</span>
                  <ChevronRight 
                    className={`w-5 h-5 text-slate-400 transform transition-transform ${
                      activeFaq === i ? "rotate-90 text-indigo-600" : ""
                    }`} 
                  />
                </button>
                {activeFaq === i && (
                  <div className="px-6 pb-5 text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 px-6 text-center max-w-5xl mx-auto border-t border-slate-200">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">{t.footerHeading}</h2>
        <p className="text-slate-500 mt-4 max-w-xl mx-auto">{t.footerSub}</p>
        <div className="mt-8">
          <motion.button 
            onClick={onGetStarted}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-indigo-600 text-white hover:bg-indigo-700 font-semibold px-8 py-4 rounded-full inline-flex items-center gap-2 transition-all shadow-md"
          >
            {t.startTrial} <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
        <div className="text-xs text-slate-400 mt-4">{t.footerTrialNote}</div>
      </section>

      {/* Simple Footer */}
      <footer className="border-t border-slate-200 py-12 text-center text-xs text-slate-400 bg-white">
        <div>{t.footerRights}</div>
      </footer>
    </div>
  );
}
