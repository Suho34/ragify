import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <FAQ />
        <section id="cta" className="px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-light tracking-tight sm:text-4xl">
              Ready to <span className="font-semibold text-primary">try it?</span>
            </h2>
            <p className="mt-4 text-muted">
              Upload your first document and start a chat room in seconds.
            </p>
            <a
              href="/login"
              className="mt-8 inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-sm font-medium text-black transition-all duration-200 ease-out hover:bg-primary-hover hover:scale-[1.02]"
            >
              Try it now
            </a>
          </div>
        </section>
        <Footer />
      </main>
    </>
  );
}
