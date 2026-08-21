/**
 * Full-viewport Saudi green field background with readability scrims.
 * Painted directly (no live SVG filter) so scrolling stays smooth.
 */
export default function SaudiFlagWave() {


  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{
        filter: "blur(2px)",
        transform: "scale(1.01)",
      }}
    >
      {/*
        The filtered content is a single flat green field, so the animated
        displacement produced no visible difference while costing a
        full-viewport SVG filter repaint on every scroll frame. The field is
        now painted directly.
      */}
      <div className="absolute inset-0" style={{ background: "#006C35" }} />


      {/* Dark scrim for text readability */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, rgba(0,30,15,0.35) 0%, rgba(0,20,10,0.65) 55%, rgba(0,10,5,0.85) 100%)",
        }}
      />

      {/* Top/bottom edge vignettes for seamless blending */}
      <div
        className="absolute inset-x-0 top-0 h-32"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,30,15,0.55), transparent)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-40"
        style={{
          background:
            "linear-gradient(to top, rgba(0,30,15,0.75), transparent)",
        }}
      />
    </div>
  );
}
