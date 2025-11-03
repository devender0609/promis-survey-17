"use client";
import Image from "next/image";

export default function LogoBar() {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "16px 0 6px",
      }}
    >
      {/* Use a transparent PNG at /public/logo_new.png.
         mixBlendMode helps hide any residual white halo if the PNG isn't fully transparent. */}
      <Image
        src="/logo_new.png"
        alt="Ascension | Seton"
        width={520}
        height={86}
        priority
        style={{
          height: "auto",
          width: "min(520px, 88vw)",
          objectFit: "contain",
          mixBlendMode: "multiply",
        }}
      />
    </header>
  );
}
