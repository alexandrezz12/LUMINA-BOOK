import express from "express";
import path from "path";
import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of Stripe to avoid startup crashes if key is missing
let stripeClient: Stripe | null = null;
function getStripe(): Stripe | null {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return null;
  }
  if (!stripeClient) {
    stripeClient = new Stripe(stripeKey);
  }
  return stripeClient;
}

// In-memory notification logs database for live-tracking simulations
interface NotificationLog {
  id: string;
  businessId: string;
  type: string;
  recipientEmail: string;
  subject: string;
  body: string;
  sentAt: string;
}
const notificationLogs: NotificationLog[] = [];

// API: Stripe Payment Intents
app.post("/api/stripe/payment-intent", async (req, res) => {
  try {
    const { amount, currency, businessName, serviceName, customerEmail } = req.body;

    if (!amount) {
      res.status(400).json({ error: "Amount is required" });
      return;
    }

    const stripe = getStripe();
    if (stripe) {
      // Real Stripe session
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // convert to cents
        currency: currency || "usd",
        metadata: { businessName, serviceName, customerEmail },
      });
      res.json({
        clientSecret: paymentIntent.client_secret,
        isDemo: false,
      });
    } else {
      // Fallback Demo payment session when no API Key is provided
      const dummySecret = `pi_mock_${Math.random().toString(36).substring(2, 15)}`;
      res.json({
        clientSecret: dummySecret,
        isDemo: true,
        message: "Demo Mode Active. (Provide STRIPE_SECRET_KEY in Secrets for real payments)",
      });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Stripe Create Subscription Checkout Session (SaaS Billing)
app.post("/api/stripe/create-subscription-session", async (req, res) => {
  try {
    const { planName, customerEmail, userId } = req.body;
    console.log("[STRIPE ROUTE] Requisição recebida:", { planName, customerEmail, userId });
    
    if (!planName || !userId) {
      console.warn("[STRIPE ROUTE] Erro: planName ou userId faltando.");
      res.status(400).json({ error: "planName and userId are required" });
      return;
    }

    const stripe = getStripe();
    
    // Determine the base app URL dynamically for redirects
    const host = req.headers.host || "localhost:3000";
    const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
    const appUrl = process.env.APP_URL || `${protocol}://${host}`;

    if (stripe) {
      console.log("[STRIPE ROUTE] Chave Stripe real detectada. Criando sessão...");
      const priceMap: { [key: string]: number } = {
        Starter: 1900,
        Professional: 3900,
        Enterprise: 7900
      };
      const unitAmount = priceMap[planName] || 1900;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `Plano ${planName} - BookingLink SaaS`,
                description: `Assinatura recorrente mensal para o estúdio/salão. Libera limites estendidos de serviços e equipe.`,
              },
              unit_amount: unitAmount,
              recurring: {
                interval: "month",
              },
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${appUrl}/dashboard?payment_success=true&plan=${planName}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/dashboard?payment_cancelled=true`,
        metadata: {
          userId: userId,
          planName: planName,
        },
        customer_email: customerEmail || undefined,
      });

      console.log("[STRIPE ROUTE] Sessão criada com sucesso:", session.url);
      res.json({
        url: session.url,
        isDemo: false,
      });
    } else {
      console.log("[STRIPE ROUTE] Nenhuma chave Stripe real. Rodando em modo de demonstração (Demo).");
      res.json({
        isDemo: true,
        message: "Demo Mode Active. (Provide STRIPE_SECRET_KEY in Secrets for real subscription payments)"
      });
    }
  } catch (err: any) {
    console.error("[STRIPE ROUTE] Erro durante a criação da sessão Stripe:", err);
    res.status(500).json({ error: err.message });
  }
});

// API: Simulated Email / SMS Notification Logs
app.post("/api/notifications/send", (req, res) => {
  const { businessId, type, recipientEmail, subject, body } = req.body;
  if (!businessId || !recipientEmail || !subject || !body) {
    res.status(400).json({ error: "Missing notification fields" });
    return;
  }

  const newLog: NotificationLog = {
    id: `notif_${Math.random().toString(36).substring(2, 9)}`,
    businessId,
    type: type || "confirmation",
    recipientEmail,
    subject,
    body,
    sentAt: new Date().toISOString(),
  };

  notificationLogs.unshift(newLog); // keep newest first
  res.json({ success: true, log: newLog });
});

app.get("/api/notifications/logs", (req, res) => {
  const { businessId } = req.query;
  if (!businessId) {
    res.json(notificationLogs);
    return;
  }
  const filtered = notificationLogs.filter(log => log.businessId === businessId);
  res.json(filtered);
});

// API: Calendar Sync Simulator
app.post("/api/calendar/sync", (req, res) => {
  const { provider, appointmentId, customerName, serviceName, dateTime } = req.body;
  // Simulates push to external provider
  res.json({
    success: true,
    provider,
    syncedEventId: `cal_${Math.random().toString(36).substring(2, 9)}`,
    message: `Successfully synchronized "${serviceName}" with ${customerName} to ${provider === 'google' ? 'Google Calendar' : 'Outlook Calendar'}.`,
    dateTime,
  });
});

async function startServer() {
  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
