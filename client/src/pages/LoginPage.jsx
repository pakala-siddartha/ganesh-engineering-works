import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Lock, Eye, EyeOff, Factory } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { ROUTES } from "../constants/routes";

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
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Soft liquid glow backdrops */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-500 ease-out">
        <div className="bg-white/80 backdrop-blur-xl border border-black/5 rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.03)] overflow-hidden p-8">
          
          {/* Brand Logo & Heading */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
              <Factory size={24} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-orange-500 mb-0.5">
                Private Access
              </p>
              <h1 className="text-xl font-extrabold text-[#1d1d1f] tracking-tight leading-tight">
                Ganesh Engineering
              </h1>
              <p className="text-xs text-gray-400 font-medium">Operations Dashboard</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 pl-1"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  autoFocus
                  placeholder="Enter access password"
                  {...register("password")}
                  className="w-full bg-[#f2f2f7] border border-black/5 rounded-2xl px-4 py-3.5 pl-11 pr-12 text-sm text-[#1d1d1f] placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-orange-500/20 focus:ring-4 focus:ring-orange-500/5 transition-all duration-300 ease-out"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
              variant="primary"
              size="lg"
              className="w-full justify-center py-3.5"
              loading={isSubmitting}
            >
              Login
            </Button>
          </form>

          <p className="mt-8 text-center text-[10px] text-gray-400 uppercase tracking-wider font-bold">
            Ganesh Engineering Works · Internal Use Only
          </p>
        </div>
      </div>
    </div>
  );
}
