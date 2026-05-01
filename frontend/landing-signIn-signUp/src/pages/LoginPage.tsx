import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { AuthDivider, AuthInput, AuthLayout, SocialButton } from '../components/auth';

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<LoginErrors>({});

  useEffect(() => {
    document.title = 'Login - FlowX';
  }, []);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const nextErrors: LoginErrors = {};
    const emailPattern = /\S+@\S+\.\S+/;

    if (!email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!emailPattern.test(email)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!password.trim()) {
      nextErrors.password = 'Password is required.';
    } else if (password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      // TODO: wire login API
      console.log('Login submitted');
    }
  };

  return (
    <AuthLayout>
      <h2 className="mb-2 text-2xl font-bold tracking-tight text-brand-blue lg:text-3xl">Welcome back</h2>
      <p className="mb-8 text-sm font-light text-brand-blue/50">Sign in to your FlowX account</p>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
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
          <a href="#" className="text-xs font-semibold text-brand-teal transition-colors hover:text-brand-teal/80">
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          className={[
            'group flex w-full items-center justify-center gap-2 rounded-xl bg-brand-blue py-3.5 text-sm font-semibold text-white',
            'transition-colors duration-200 hover:bg-brand-blue/90',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
          ].join(' ')}
        >
          Sign In
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </form>

      <AuthDivider />

      <SocialButton icon={<GoogleIcon />} label="Continue with Google" />

      <p className="mt-8 text-center text-sm text-brand-blue/50">
        Don't have an account?{' '}
        <Link to="/signup" className="font-semibold text-brand-teal transition-colors hover:text-brand-teal/80">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}
