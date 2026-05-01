import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import {
  AuthDivider,
  AuthInput,
  AuthLayout,
  SocialButton,
} from "../components/auth";
import { localAccountShortcuts } from "@/features/auth/data/localAccountShortcuts";
import useCurrentUser from "@/features/auth/hooks/useCurrentUser";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.4c-.2 1.3-1.6 3.9-5.4 3.9-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.6 3.6 14.5 2.7 12 2.7 6.9 2.7 2.8 6.9 2.8 12s4.1 9.3 9.2 9.3c5.3 0 8.8-3.7 8.8-9 0-.6-.1-1-.1-1.5H12z"
      />
    </svg>
  );
}

type LoginErrors = {
  email?: string;
  password?: string;
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, error } = useCurrentUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors] = useState<LoginErrors>({});

  useEffect(() => {
    document.title = "Login - FlowX";
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const nextErrors: LoginErrors = {};
    const emailPattern = /\S+@\S+\.\S+/;

    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!emailPattern.test(email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!password.trim()) {
      nextErrors.password = "Password is required.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      try {
        const user = await login({ email, password });
        if (!user) {
          setFormError("Invalid email or password.");
          return;
        }
        navigate("/dashboard", { replace: true });
      } catch (error) {
        setFormError(
          error instanceof Error ? error.message : "Invalid email or password.",
        );
      }
    }
  };

  const fillLocalCredentials = (role: "admin" | "user") => {
    const credentials = localAccountShortcuts.find(
      (item) => item.role === role,
    );
    if (!credentials) return;
    setEmail(credentials.email);
    setPassword(credentials.password);
  };

  return (
    <AuthLayout>
      <h2 className="mb-2 text-2xl font-bold tracking-tight text-brand-blue lg:text-3xl">
        Welcome back
      </h2>
      <p className="mb-8 text-sm font-light text-brand-blue/50">
        Sign in to your FlowX account
      </p>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => fillLocalCredentials("user")}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-left text-xs font-semibold text-brand-blue transition-colors hover:border-brand-teal/50"
          >
            User Account
          </button>
          <button
            type="button"
            onClick={() => fillLocalCredentials("admin")}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-left text-xs font-semibold text-brand-blue transition-colors hover:border-brand-teal/50"
          >
            Admin Account
          </button>
        </div>

        <AuthInput
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
          required
        />

        <AuthInput
          id="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
          endAdornment={
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="text-brand-blue/50 transition-colors hover:text-brand-blue"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          }
          required
        />

        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              className="rounded border-zinc-300 text-brand-teal focus:ring-brand-teal/20"
            />
            <span className="text-xs text-brand-blue/50">Remember me</span>
          </label>
          <a
            href="#"
            className="text-xs font-semibold text-brand-teal transition-colors hover:text-brand-teal/80"
          >
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={[
            "group flex w-full items-center justify-center gap-2 rounded-xl bg-brand-blue py-3.5 text-sm font-semibold text-white",
            "transition-colors duration-200 hover:bg-brand-blue/90",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
            "disabled:cursor-not-allowed disabled:opacity-60",
          ].join(" ")}
        >
          {loading ? "Please wait..." : "Sign In"}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>

        {(formError || error) && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
            {formError || error}
          </div>
        )}
      </form>

      <AuthDivider />

      <SocialButton icon={<GoogleIcon />} label="Continue with Google" />

      <p className="mt-8 text-center text-sm text-brand-blue/50">
        Don't have an account?{" "}
        <Link
          to="/signup"
          className="font-semibold text-brand-teal transition-colors hover:text-brand-teal/80"
        >
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}
