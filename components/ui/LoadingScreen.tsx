import Spinner from "@/components/ui/Spinner";

type LoadingScreenProps = {
  label?: string;
};

export default function LoadingScreen({
  label = "Loading your account..."
}: LoadingScreenProps) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="card-surface flex w-full max-w-sm flex-col items-center gap-4 rounded-3xl p-10 text-center">
        <Spinner size="lg" />
        <p className="text-sm font-medium text-slate-600">{label}</p>
      </div>
    </main>
  );
}
