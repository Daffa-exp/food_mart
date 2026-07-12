import AuthHeroPanel from "@/components/auth/AuthHeroPanel";
import AuthTabs from "@/components/auth/AuthTabs";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <AuthTabs active="daftar" />
          <div className="mt-8">
            <RegisterForm />
          </div>
        </div>
      </div>
      <AuthHeroPanel />
    </div>
  );
}
