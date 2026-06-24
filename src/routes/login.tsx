import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Eye, EyeOff, Moon, Sun, Sunset } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login | Family Care" },
      { name: "description", content: "Accesso all'area di amministrazione." },
    ],
  }),
  beforeLoad: async () => {
    // Se è già loggato, reindirizza ad admin
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      throw redirect({ to: "/admin" });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState("Good Evening");
  const [Icon, setIcon] = useState<any>(Moon);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("Good Morning");
      setIcon(Sun);
    } else if (hour >= 12 && hour < 18) {
      setGreeting("Good Afternoon");
      setIcon(Sun);
    } else if (hour >= 18 && hour < 21) {
      setGreeting("Good Evening");
      setIcon(Sunset);
    } else {
      setGreeting("Good Evening");
      setIcon(Moon);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        toast.success("Accesso effettuato con successo");
        navigate({ to: "/admin" });
      }
    } catch (error: any) {
      toast.error("Credenziali non valide o errore di rete.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#13161f] flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      
      <div className="w-full max-w-[420px] bg-[#24283b] rounded-3xl p-10 shadow-2xl z-10 relative">
        
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <h1 className="text-[40px] font-extrabold text-white italic tracking-tight">
            Family<span className="text-white/80">Care</span>
          </h1>
        </div>

        {/* Greeting */}
        <div className="text-center mb-10">
          <h2 className="flex items-center justify-center gap-2 text-[26px] font-semibold text-[#c0caf5] mb-3">
            <Icon className="w-7 h-7 text-[#a6accd]" strokeWidth={2.5} />
            {greeting}
          </h2>
          <p className="text-[#565f89] text-[13px] font-bold tracking-[0.2em] uppercase">
            SIGN IN TO CONTINUE
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-5">
            <div className="relative">
              <Input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-14 bg-[#1a1b26] border border-transparent text-[#a9b1d6] placeholder:text-[#565f89] placeholder:font-medium rounded-xl px-5 focus-visible:ring-1 focus-visible:ring-[#7aa2f7] focus-visible:border-transparent transition-all shadow-inner"
                required
              />
            </div>
            
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-14 bg-[#1a1b26] border border-transparent text-[#a9b1d6] placeholder:text-[#565f89] placeholder:font-medium rounded-xl pl-5 pr-12 focus-visible:ring-1 focus-visible:ring-[#7aa2f7] focus-visible:border-transparent transition-all shadow-inner"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#565f89] hover:text-[#a9b1d6] transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <a href="#" className="text-[13px] font-bold text-[#7aa2f7] hover:text-[#8db0f8] uppercase tracking-wider transition-colors">
              Forgot password?
            </a>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-[60px] bg-[#a6c1ee] hover:bg-[#b8d1fc] text-[#13161f] text-lg font-bold rounded-full transition-all mt-4 shadow-[0_4px_14px_0_rgba(166,193,238,0.39)] hover:shadow-[0_6px_20px_rgba(166,193,238,0.23)] hover:-translate-y-[1px]"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-10 border-t border-[#1a1b26] pt-8 text-center">
          <p className="text-[13px] font-bold text-[#565f89] tracking-wider uppercase">
            Admin Area Access Only
          </p>
        </div>
      </div>
    </div>
  );
}
