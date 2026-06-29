import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { ROUTES } from "../constants/routes";
import ganeshImage from "../assets/ganesh_image.jpeg";


const schema = z.object({
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ password }) => {
    const ok = login(password);
    if (!ok) {
      setError("password", { message: "Incorrect password. Try again." });
      toast.error("Incorrect password");
      return;
    }
    toast.success("Welcome back!");
    navigate(ROUTES.DASHBOARD);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* iOS Liquid glow backdrops - soft blue tones for light background */}
      <div className="absolute top-1/10 left-1/10 w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-[100px] pointer-events-none animate-liquid-blob-1" />
      <div className="absolute bottom-1/10 right-1/10 w-[450px] h-[450px] bg-indigo-100/30 rounded-full blur-[100px] pointer-events-none animate-liquid-blob-2" />
      <div className="absolute top-1/2 left-1/2 w-[350px] h-[350px] bg-cyan-100/30 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-liquid-blob-1" />

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-500 ease-out">
        <div className="bg-white/70 backdrop-blur-2xl border border-blue-100/60 rounded-3xl shadow-[0_12px_40px_rgba(0,122,255,0.06)] overflow-hidden p-8">
          
          {/* Brand Logo & Heading */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl overflow-hidden border border-blue-100 flex items-center justify-center bg-white shrink-0 shadow-md shadow-blue-500/10">
              <img
                src={ganeshImage}
                alt="Ganesh Engineering Works Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#1d1d1f] tracking-tight leading-tight">
                Ganesh Engineering Works
              </h1>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 pl-1"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500/80"
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  autoFocus
                  placeholder="Enter access password"
                  {...register("password")}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3.5 pl-11 pr-12 text-sm text-[#1d1d1f] placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 ease-out"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500 font-semibold pl-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="blue"
              size="lg"
              className="w-full justify-center py-3.5 liquid-glow-blue"
              loading={isSubmitting}
            >
              Login
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
