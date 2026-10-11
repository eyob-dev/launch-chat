import { ContactLauncher } from "@/components/ContactLauncher";
import AdBanner from "@/components/AdBanner";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <div className="mb-8 w-full px-4 md:w-4/12" aria-label="Advertisement">
        <div className="mb-5 w-full bg-black">
          <AdBanner
            dataAdFormat="auto"
            dataFullWidthResponsive={true}
            dataAdSlot="4459729434"
          />
        </div>
      </div>
      <ContactLauncher />
      <div className="mb-8 w-full px-4 md:w-4/12" aria-label="Advertisement">
        <div className="mb-5 w-full bg-black">
          <AdBanner
            dataAdFormat="auto"
            dataFullWidthResponsive={true}
            dataAdSlot="4459729434"
          />
        </div>
      </div>
    </main>
  );
}
