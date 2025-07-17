
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthMode = "login" | "signup";

export default function Auth() {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) window.location.replace("/");
    });
    // subscribe to prevent flicker
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) window.location.replace("/");
    });
    return () => listener?.subscription.unsubscribe();
  }, []);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    if (!email || !password) {
      setErr("Compila tutti i campi.");
      setLoading(false);
      return;
    }

    if (authMode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setErr(error.message);
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin + "/" }
      });
      // NIENTE conferma email: non viene mostrato nulla che la richieda!
      if (error) setErr(error.message);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7] px-2">
      <div className="bg-white max-w-sm w-full rounded-lg shadow-lg p-8 border border-gray-200 animate-fade-in">
        <h1 className="text-2xl font-bold mb-6 text-center text-[#b43434] tracking-tight select-none">
          {authMode === "login" ? "Entra nel tuo account" : "Crea un nuovo account"}
        </h1>
        <form className="space-y-5" onSubmit={handleAuth}>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="esempio@email.com"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={authMode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="La tua password"
            />
          </div>
          {err && <div className="text-red-500 text-sm">{err}</div>}
          <button
            type="submit"
            className="w-full bg-[#b43434] text-white font-semibold py-2 rounded-md shadow-md hover:bg-[#932a2a] transition active:scale-95 mt-2"
            disabled={loading}
          >
            {loading
              ? "Attendi..."
              : authMode === "login"
              ? "Accedi"
              : "Registrati"}
          </button>
        </form>
        <div className="text-[13px] text-gray-600 text-center mt-6">
          {authMode === "login" ? (
            <>
              Non hai un account?{" "}
              <button
                className="text-[#b43434] underline font-semibold"
                onClick={() => setAuthMode("signup")}
                type="button"
              >
                Registrati
              </button>
            </>
          ) : (
            <>
              Hai già un account?{" "}
              <button
                className="text-[#b43434] underline font-semibold"
                onClick={() => setAuthMode("login")}
                type="button"
              >
                Accedi
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
