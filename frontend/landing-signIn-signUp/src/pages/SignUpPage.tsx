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

type SignUpForm = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type SignUpErrors = Partial<Record<keyof SignUpForm, string>>;

export default function SignUpPage() {
  const [form, setForm] = useState<SignUpForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<SignUpErrors>({});

  useEffect(() => {
    document.title = 'Sign Up - FlowX';
  }, []);

  const setField = <K extends keyof SignUpForm>(field: K, value: SignUpForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const nextErrors: SignUpErrors = {};
    const emailPattern = /\S+@\S+\.\S+/;

    if (!form.firstName.trim()) nextErrors.firstName = 'First name is required.';
    if (!form.lastName.trim()) nextErrors.lastName = 'Last name is required.';

    if (!form.email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!emailPattern.test(form.email)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!form.password.trim()) {
      nextErrors.password = 'Password is required.';
    } else if (form.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.';
    }

    if (!form.confirmPassword.trim()) {
      nextErrors.confirmPassword = 'Confirm your password.';
    } else if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      // TODO: wire sign-up API
      console.log('Sign up submitted');
    }
  };

  return (
    <AuthLayout>
      <h2 className="mb-2 text-2xl font-bold tracking-tight text-brand-blue lg:text-3xl">Create your account</h2>
      <p className="mb-8 text-sm font-light text-brand-blue/50">Start sending money without borders</p>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AuthInput
            id="firstName"
            label="First name"
            placeholder="Mohammed"
            value={form.firstName}
            onChange={(event) => setField('firstName', event.target.value)}
            error={errors.firstName}
            required
          />

          <AuthInput
            id="lastName"
            label="Last name"
            placeholder="Ahmed"
            value={form.lastName}
            onChange={(event) => setField('lastName', event.target.value)}
            error={errors.lastName}
            required
          />
        </div>

        <AuthInput
          id="signupEmail"
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(event) => setField('email', event.target.value)}
          error={errors.email}
          required
        />

        <AuthInput
          id="signupPassword"
          label="Password"
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={(event) => setField('password', event.target.value)}
          error={errors.password}
          required
        />

        <AuthInput
          id="confirmPassword"
          label="Confirm password"
          type="password"
          placeholder="••••••••"
          value={form.confirmPassword}
          onChange={(event) => setField('confirmPassword', event.target.value)}
          error={errors.confirmPassword}
          required
        />

        <button
          type="submit"
          className={[
            'group flex w-full items-center justify-center gap-2 rounded-xl bg-brand-blue py-3.5 text-sm font-semibold text-white',
            'transition-colors duration-200 hover:bg-brand-blue/90',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
          ].join(' ')}
        >
          Create Account
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </form>

      <AuthDivider />

      <SocialButton icon={<GoogleIcon />} label="Continue with Google" />

      <p className="mt-8 text-center text-sm text-brand-blue/50">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand-teal transition-colors hover:text-brand-teal/80">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
