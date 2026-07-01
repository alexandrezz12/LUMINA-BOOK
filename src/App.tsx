import React, { useState, useEffect } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { auth } from "./lib/firebase";
import LandingView from "./components/LandingView";
import DashboardView from "./components/DashboardView";
import BookingView from "./components/BookingView";
import { Sparkles, Calendar, Lock, Mail, UserPlus, Info, AlertCircle, Globe } from "lucide-react";
import { translations, Language } from "./lib/translations";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Language State (SaaS Landing & Admin)
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("bookinglink_lang") as Language;
    if (saved && (saved === "en" || saved === "pt" || saved === "es")) {
      return saved;
    }
    // Auto-detect browser language
    const browserLang = navigator.language || "";
    if (browserLang.startsWith("pt")) {
      return "pt";
    }
    if (browserLang.startsWith("es")) {
      return "es";
    }
    return "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("bookinglink_lang", lang);
  };
  
  // Navigation states: 'landing', 'auth-form'
  const [currentView, setCurrentView] = useState<'landing' | 'auth-form'>('landing');
  const [isSignUp, setIsSignUp] = useState(false);

  // Form Inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authErrorCode, setAuthErrorCode] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Booking page slug routing checker
  const [bookingSlug, setBookingSlug] = useState<string | null>(null);

  // Monitor routing and auth state on init
  useEffect(() => {
    // Check URL query parameters (e.g., ?b=my-subdomain)
    const params = new URLSearchParams(window.location.search);
    const bSlug = params.get("b");
    if (bSlug) {
      setBookingSlug(bSlug);
    }

    // Monitor Firebase Auth session state change
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        // Fallback check for virtual local session
        const localSession = localStorage.getItem("bookinglink_virtual_session");
        if (localSession) {
          try {
            setCurrentUser(JSON.parse(localSession));
          } catch {
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen for hash modifications for router fallback
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith("#/b/")) {
        const slug = hash.substring(4);
        if (slug) {
          setBookingSlug(slug);
        }
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Authentication Submission (Login / Register)
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthErrorCode("");
    setAuthSubmitting(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setCurrentView("landing"); // resets view, if authenticated, the layout will transition to Dashboard automatically
      setAuthSubmitting(false);
    } catch (err: any) {
      console.error("Authentication error:", err);
      let cleanMsg = err.message;
      const code = err.code || "";
      setAuthErrorCode(code);

      if (code === "auth/weak-password") {
        cleanMsg = "Password must be at least 6 characters long.";
      } else if (code === "auth/invalid-credential") {
        cleanMsg = "Incorrect email address or password credentials.";
      } else if (code === "auth/email-already-in-use") {
        cleanMsg = "Email is already registered. Try signing in instead.";
      } else if (code === "auth/operation-not-allowed") {
        cleanMsg = language === "pt"
          ? "O provedor de login com E-mail/Senha está desativado no Firebase Console deste projeto."
          : language === "es"
          ? "El proveedor de inicio de sesión por Correo/Contraseña está desactivado en Firebase Console."
          : "The Email/Password sign-in provider is disabled in this Firebase project.";
      }
      setAuthError(cleanMsg);
      setAuthSubmitting(false);
    }
  };

  // Google Provider Authentication Sign-In
  const handleGoogleSignIn = async () => {
    setAuthError("");
    setAuthErrorCode("");
    setAuthSubmitting(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setCurrentView("landing");
      setAuthSubmitting(false);
    } catch (err: any) {
      console.error("Google Authentication error:", err);
      let cleanMsg = err.message;
      const code = err.code || "";
      setAuthErrorCode(code);
      if (code === "auth/popup-closed-by-user") {
        cleanMsg = "Google login was cancelled. Please try again.";
      } else if (code === "auth/unauthorized-domain") {
        cleanMsg = "This domain is not authorized for Google authentication. Please access via the official custom domain.";
      }
      setAuthError(cleanMsg);
      setAuthSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      localStorage.removeItem("bookinglink_virtual_session");
      await signOut(auth);
      setCurrentUser(null);
      setBookingSlug(null);
      setCurrentView("landing");
      // Clean query params so user goes back to root landing view safely
      if (window.location.search) {
        window.history.pushState({}, document.title, window.location.pathname);
      }
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-500 font-sans" id="auth-loading-spinner">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        <div className="mt-4 text-sm font-medium">Checking Credentials Session...</div>
      </div>
    );
  }

  // RENDER ROUTE 1: Public Client Booking Page
  if (bookingSlug) {
    return (
      <BookingView 
        businessSlug={bookingSlug} 
        onBackToMain={() => {
          // Remove query params and go home
          window.history.pushState({}, document.title, window.location.pathname);
          setBookingSlug(null);
        }}
      />
    );
  }

  // RENDER ROUTE 2: Authenticated Merchant Control Dashboard
  if (currentUser) {
    return (
      <DashboardView 
        userId={currentUser.uid}
        userEmail={currentUser.email || "merchant@luminabook.io"}
        onSignOut={handleSignOut}
      />
    );
  }

  // RENDER ROUTE 3: Sign In / Sign Up Form
  if (currentView === "auth-form") {
    const t = translations[language].auth;
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6 font-sans text-slate-900 relative" id="auth-screen-container">
        {/* Floating Language Selector */}
        <div className="absolute top-6 right-6 flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-xs">
          <Globe className="w-4 h-4 text-slate-400" />
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer bg-transparent"
          >
            <option value="en">English (US)</option>
            <option value="pt">Português (BR)</option>
            <option value="es">Español (ES)</option>
          </select>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm max-w-md w-full space-y-6">
          
          <div className="text-center">
            <div 
              className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl mx-auto cursor-pointer shadow-sm hover:bg-blue-700 transition-colors"
              onClick={() => setCurrentView("landing")}
            >
              B
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-4">
              {isSignUp ? t.titleRegister : t.titleLogin}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {t.subtitle}
            </p>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={authSubmitting}
            type="button"
            className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-xs"
            id="google-signin-btn"
          >
            <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>{isSignUp ? t.googleRegister : t.googleLogin}</span>
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t.orEmail}</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          {authError && (
            <div className="space-y-3">
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-red-500" />
                <span>{authError}</span>
              </div>
              
              {authErrorCode === "auth/operation-not-allowed" && (
                <div className="bg-amber-50 border border-amber-200 text-slate-800 text-xs p-4 rounded-xl space-y-2.5">
                  <div className="font-bold text-amber-800 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-amber-600 shrink-0" />
                    {language === "pt" ? "Como ativar no seu Firebase:" : language === "es" ? "Cómo activar en tu Firebase:" : "How to enable in Firebase:"}
                  </div>
                  
                  {language === "pt" ? (
                    <div className="space-y-1.5 text-slate-600 font-medium leading-relaxed">
                      <p>Este erro ocorre porque o provedor de autenticação por <strong>E-mail/Senha</strong> está desativado no Firebase Console deste projeto.</p>
                      <ol className="list-decimal list-inside space-y-1 pl-1 text-[11px]">
                        <li>Acesse o <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-semibold">Firebase Console</a>.</li>
                        <li>Selecione o projeto do seu app.</li>
                        <li>No menu esquerdo, clique em <strong>Build &gt; Authentication</strong>.</li>
                        <li>Clique na aba <strong>Sign-in method</strong> e depois em <strong>Adicionar novo provedor</strong>.</li>
                        <li>Selecione <strong>E-mail/Senha</strong>, ative a opção e clique em <strong>Salvar</strong>.</li>
                        <li>Atualize esta página e tente criar sua conta de novo!</li>
                      </ol>
                      <p className="text-[11px] mt-1 bg-amber-100 text-amber-950 p-2 rounded-lg font-semibold">
                        💡 Dica: Você pode clicar no botão verde <strong className="text-emerald-800 font-bold">"Usar Conta Demo"</strong> abaixo para ignorar e testar o painel completo instantaneamente sem precisar configurar nada!
                      </p>
                    </div>
                  ) : language === "es" ? (
                    <div className="space-y-1.5 text-slate-600 font-medium leading-relaxed">
                      <p>Este error ocurre porque el proveedor de inicio de sesión con <strong>Correo/Contraseña</strong> está desactivado en Firebase Console.</p>
                      <ol className="list-decimal list-inside space-y-1 pl-1 text-[11px]">
                        <li>Vaya a <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-semibold">Firebase Console</a>.</li>
                        <li>Seleccione el proyecto de su app.</li>
                        <li>En el menú izquierdo, haga clic en <strong>Build &gt; Authentication</strong>.</li>
                        <li>Haga clic en la pestaña <strong>Sign-in method</strong> y luego en <strong>Añadir nuevo proveedor</strong>.</li>
                        <li>Seleccione <strong>Email/Password</strong>, active la casilla y haga clic en <strong>Guardar</strong>.</li>
                        <li>¡Refresque esta página e intente registrarse de nuevo!</li>
                      </ol>
                      <p className="text-[11px] mt-1 bg-amber-100 text-amber-950 p-2 rounded-lg font-semibold">
                        💡 Consejo: ¡Puede hacer clic en el botón verde <strong className="text-emerald-800 font-bold">"Usar Conta Demo"</strong> abajo para omitir y probar el panel completo al instante sin configurar nada!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 text-slate-600 font-medium leading-relaxed">
                      <p>This error occurs because the <strong>Email/Password</strong> sign-in provider is disabled in your Firebase Console.</p>
                      <ol className="list-decimal list-inside space-y-1 pl-1 text-[11px]">
                        <li>Go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-semibold">Firebase Console</a>.</li>
                        <li>Select your Firebase project.</li>
                        <li>On the left sidebar, navigate to <strong>Build &gt; Authentication</strong>.</li>
                        <li>Click on the <strong>Sign-in method</strong> tab, then click <strong>Add new provider</strong>.</li>
                        <li>Select <strong>Email/Password</strong>, enable the toggle, and click <strong>Save</strong>.</li>
                        <li>Refresh this page and register your account!</li>
                      </ol>
                      <p className="text-[11px] mt-1 bg-amber-100 text-amber-950 p-2 rounded-lg font-semibold">
                        💡 Tip: You can click the green <strong className="text-emerald-800 font-bold">"Use Demo Account"</strong> button below to immediately bypass and test the full dashboard without any configuration!
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4" id="saas-auth-form">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t.emailLabel}</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3.5 pl-10 text-xs font-semibold focus:border-blue-600 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t.passwordLabel}</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3.5 pl-10 text-xs font-semibold focus:border-blue-600 focus:outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authSubmitting}
              id="auth-form-submit-btn"
              className="w-full bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold py-3.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {authSubmitting ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isSignUp ? (
                <>{t.submitRegister}</>
              ) : (
                <>{t.submitLogin}</>
              )}
            </button>
          </form>

          {/* Alternate Signup/Login link */}
          <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-100">
            {isSignUp ? t.alreadyHaveAccount : t.newToBookingLink}{" "}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setAuthError("");
              }}
              id="toggle-auth-mode-btn"
              className="font-bold text-blue-600 hover:underline focus:outline-none cursor-pointer"
            >
              {isSignUp ? t.toggleLogin : t.toggleRegister}
            </button>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => setCurrentView("landing")}
              className="text-[10px] font-semibold text-slate-400 hover:text-slate-900 transition-colors underline cursor-pointer"
            >
              {t.backToHome}
            </button>
          </div>

        </div>
      </div>
    );
  }

  // RENDER ROUTE 4: Landing Page
  return (
    <LandingView 
      language={language}
      setLanguage={setLanguage}
      onGetStarted={() => {
        setIsSignUp(true);
        setCurrentView("auth-form");
      }}
      onSignIn={() => {
        setIsSignUp(false);
        setCurrentView("auth-form");
      }}
    />
  );
}
