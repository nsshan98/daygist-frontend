import Footer from "@/components/organisms/footer";


export default function Home() {
  return (
    <div>
      <div className="w-full relative">
        {/* Amber Glow Background */}
        <div
          className="absolute inset-0 -z-1 opacity-50"
          style={{
            backgroundImage: `
            radial-gradient(125% 125% at 100% 30%, #ffffff 60%, #9ECE58 100%)
            `,
            backgroundSize: "100% 100%",
          }}
        />
      </div>
      <Footer />
    </div>
  );
}
