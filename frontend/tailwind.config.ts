import type { Config } from "tailwindcss";

// Design tokens diekstrak dari screenshot Figma FoodMart.
// JANGAN ubah nilai ini tanpa mengecek ulang screenshot — warna ini
// adalah identitas visual utama (tombol oranye, hero gradient merah, dsb).
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#FFF4EC",
          100: "#FFE4CC",
          200: "#FFC999",
          300: "#FFA84D",
          400: "#FF8F26",
          500: "#F5821F", // warna tombol utama "Pesan Sekarang", badge, link aktif
          600: "#E06A0A",
          700: "#B85408",
          800: "#8F4106",
          900: "#663005",
        },
        accent: {
          // gradient merah pada Hero section (login/register/home banner)
          50: "#FDEEEE",
          100: "#F8CACB",
          300: "#E4572E",
          500: "#C1272D",
          700: "#7A1315",
          900: "#4A0C0D",
        },
        surface: {
          cream: "#FFF8F1", // background section "Menu Makanan", breadcrumb bar
          card: "#FFFFFF",
          border: "#F1E4D8",
        },
        success: {
          500: "#16A34A", // status "Berhasil", checkmark
          50: "#EAF8EF",
        },
        ink: {
          900: "#1F2937", // heading utama
          700: "#4B5563", // body text
          400: "#9CA3AF", // placeholder / muted
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
        pill: "999px",
        input: "10px",
      },
      boxShadow: {
        card: "0 2px 12px rgba(31, 41, 55, 0.06)",
        "card-hover": "0 12px 28px rgba(245, 130, 31, 0.18)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out forwards",
        "slide-up": "slide-up 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
