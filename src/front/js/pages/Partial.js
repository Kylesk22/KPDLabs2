import React, { useState } from "react";
import { Helmet } from "react-helmet";
import Intro from "../../img/footer-flip.jpg";
import { Fade } from "react-awesome-reveal";
import { PARTIAL_NAME, PARTIAL_MATERIAL } from '../component/partialCatalog';
import PartialFront from '../../img/flexible-pmma-partial-front.png';
import '../../styles/partial.css';

const shades = [
    { name: 'Pink Gingival Composite', desc: 'Pink gingival composite applied to a 100% clear flexible PMMA base. Included in the base price for unilateral and bilateral partials.', swatch: '#d99a9f' },
    { name: 'Meharry Gingival Composite', desc: 'Meharry gingival composite applied to the same 100% clear flexible PMMA base. Included in the base price for unilateral and bilateral partials.', swatch: '#986c67' },
];

export const Partial = props => {
    const [activeShade, setActiveShade] = useState(0);

    return (
        <div className="kpd-partial-page" style={styles.page}>
            <Helmet>
                <title>Flexible PMMA with Gingival Composite | KPD Premier Partial</title>
                <meta name="description" content="KPD Premier Partial: Flexible PMMA with Gingival Composite. A 100% clear flexible PMMA base with Pink or Meharry composite, available as unilateral or bilateral partials." />
                <link rel="canonical" href="https://kpdlabs.com/partial" />
            </Helmet>
            {/* Hero */}
            <div style={{
                ...styles.hero,
                backgroundImage: `linear-gradient(to bottom, rgba(10,10,10,0.7) 0%, rgba(10,10,10,0.85) 100%), url(${Intro})`
            }}>
                <div style={styles.heroInner}>
                    <p style={styles.heroEyebrow}>KPD Dental Laboratory</p>
                    <h1 style={styles.heroTitle}>{PARTIAL_NAME}</h1>
                    <p className="kpd-partial-material">{PARTIAL_MATERIAL}</p>
                    <div style={styles.heroRule}/>
                    <p style={styles.heroBreadcrumb}><a href="/" style={styles.breadcrumbLink}>Home</a> <span style={styles.breadcrumbSep}>›</span> Products <span style={styles.breadcrumbSep}>›</span> Partial</p>
                </div>
            </div>

            {/* Product Overview */}
            <div className="kpd-partial-overview" style={styles.overviewSection}>
                <Fade triggerOnce>
                <div style={styles.overviewInner}>
                    <div className="kpd-partial-copy" style={styles.overviewLeft}>
                        <div style={styles.overviewAccent}/>
                        <p style={styles.eyebrow}>The KPD Premier Partial</p>
                        <h2 style={styles.overviewTitle}>{PARTIAL_MATERIAL}</h2>
                        <p style={styles.overviewDesc}>
                            The KPD Premier Partial combines a 100% clear flexible PMMA (polymethyl methacrylate) base with gingival composite. Choose Pink or Meharry composite for the gingival areas of your restoration.
                        </p>
                        <p style={styles.overviewDesc}>
                            Order a unilateral or bilateral partial, with gingival composite included in the base price. Try-ins remain available as a separate order option.
                        </p>
                        <div style={styles.compareRow}>
                            <div style={styles.compareCard}>
                                <span style={styles.compareLabel}>Clear base</span>
                                <span style={styles.compareText}>100% clear flexible PMMA forms the base of the partial.</span>
                            </div>
                            <div style={styles.compareCard}>
                                <span style={styles.compareLabel}>Gingival composite</span>
                                <span style={styles.compareText}>Pink or Meharry gingival composite, included with either final partial option.</span>
                            </div>
                        </div>
                        <a href="/signup" style={styles.ctaBtn}>Send Us a Case →</a>
                    </div>
                    <div className="kpd-partial-visual" style={styles.overviewRight}>
                        <figure className="kpd-partial-gallery">
                            <img className="kpd-partial-main-photo" src={PartialFront} alt="KPD partial with a clear flexible PMMA base and Pink gingival composite, front view" />
                            <figcaption>Pink gingival composite shown.</figcaption>
                        </figure>
                        <div style={styles.specsStack}>
                            {[
                                { label: "Indications", value: "Unilateral & Bilateral Removable Partials" },
                                { label: "Base Material", value: "100% Clear Flexible PMMA" },
                                { label: "Gingival Composite", value: "Pink or Meharry" },
                                { label: "Scan Requirement", value: "Full Arch + 15mm Gingiva" },
                            ].map((spec, i) => (
                                <div key={i} style={styles.specRow}>
                                    <span style={styles.specLabel}>{spec.label}</span>
                                    <span style={styles.specValue}>{spec.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                </Fade>
            </div>

            {/* Shade Selector */}
            <div className="kpd-partial-shades" style={styles.shadeSection}>
                <div style={styles.shadeInner}>
                    <p style={styles.eyebrowLight}>Gingival Composite</p>
                    <h2 style={styles.shadeSectionTitle}>One Clear Base. Two Composite Shades.</h2>
                    <p style={styles.shadeSectionSub}>Both options use 100% clear flexible PMMA. Select Pink or Meharry gingival composite when you place your order. Color swatches are illustrative; the photographs show Pink composite.</p>
                    <div style={styles.shadeGrid}>
                        {shades.map((spec, i) => (
                            <button
                                key={i}
                                type="button"
                                aria-pressed={activeShade === i}
                                onClick={() => setActiveShade(i)}
                                style={{
                                    ...styles.shadeCard,
                                    ...(activeShade === i ? styles.shadeCardActive : {})
                                }}
                            >
                                <div style={{ ...styles.shadeSwatch, backgroundColor: spec.swatch }}/>
                                <span style={styles.shadeName}>{spec.name}</span>
                            </button>
                        ))}
                    </div>
                    <Fade key={activeShade} triggerOnce={false}>
                    <div style={styles.shadeDetail}>
                        <div style={{ ...styles.shadeDetailSwatch, backgroundColor: shades[activeShade].swatch }}/>
                        <div>
                            <h4 style={styles.shadeDetailName}>{shades[activeShade].name}</h4>
                            <p style={styles.shadeDetailDesc}>{shades[activeShade].desc}</p>
                        </div>
                    </div>
                    </Fade>
                </div>
            </div>

            {/* CTA Banner */}
            <div style={styles.ctaBanner}>
                <h2 style={styles.ctaBannerTitle}>Ready to Send a Partial Case?</h2>
                <p style={styles.ctaBannerSub}>Full arch intraoral scan or physical impressions. Dentition + 15mm of gingival tissue captured throughout the arch on both buccal and lingual aspects.</p>
                <a href="/signup" style={styles.ctaBannerBtn}>Get Started →</a>
            </div>
        </div>
    );
};

const gold = "#ffaa17";
const dark = "#222429";
const light = "#f8f6f1";
const white = "#ffffff";
const muted = "#6b7280";
const border = "#e5e0d8";

const styles = {
    page: { fontFamily: "'Georgia', serif", backgroundColor: light, color: dark, overflowX: "hidden" },
    hero: { minHeight: "60vh", backgroundSize: "cover", backgroundPosition: "center", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "180px 40px 80px" },
    heroInner: { maxWidth: "700px" },
    heroEyebrow: { fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase", color: gold, fontFamily: "'Arial', sans-serif", fontWeight: "600", marginBottom: "20px" },
    heroTitle: { fontSize: "clamp(40px, 6vw, 80px)", fontWeight: "400", color: white, lineHeight: "1.05", marginBottom: "24px", letterSpacing: "-1px" },
    heroRule: { width: "60px", height: "2px", backgroundColor: gold, margin: "0 auto 24px" },
    heroBreadcrumb: { fontSize: "13px", color: "rgba(255,255,255,0.55)", fontFamily: "'Arial', sans-serif" },
    breadcrumbLink: { color: "rgba(255,255,255,0.55)", textDecoration: "none" },
    breadcrumbSep: { margin: "0 8px", color: gold },
    eyebrow: { fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase", color: gold, fontFamily: "'Arial', sans-serif", fontWeight: "600", marginBottom: "12px" },
    eyebrowLight: { fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase", color: gold, fontFamily: "'Arial', sans-serif", fontWeight: "600", marginBottom: "12px" },

    overviewSection: { padding: "100px 60px", maxWidth: "1200px", margin: "0 auto" },
    overviewInner: { display: "flex", gap: "80px", alignItems: "flex-start", flexWrap: "wrap" },
    overviewLeft: { flex: "1.3", minWidth: "300px", position: "relative", paddingLeft: "24px" },
    overviewAccent: { position: "absolute", left: "0", top: "0", width: "3px", height: "100%", backgroundColor: gold },
    overviewTitle: { fontSize: "clamp(30px, 4vw, 46px)", fontWeight: "400", color: dark, marginBottom: "24px", letterSpacing: "-0.5px" },
    overviewDesc: { fontSize: "15px", color: muted, fontFamily: "'Arial', sans-serif", lineHeight: "1.8", marginBottom: "20px" },
    compareRow: { display: "flex", gap: "2px", backgroundColor: border, marginBottom: "36px", marginTop: "8px" },
    compareCard: { flex: "1", backgroundColor: white, padding: "20px 24px", display: "flex", flexDirection: "column", gap: "8px" },
    compareLabel: { fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: gold, fontFamily: "'Arial', sans-serif", fontWeight: "700" },
    compareText: { fontSize: "13px", color: muted, fontFamily: "'Arial', sans-serif", lineHeight: "1.7" },
    ctaBtn: { display: "inline-block", padding: "14px 36px", backgroundColor: dark, color: white, textDecoration: "none", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Arial', sans-serif", fontWeight: "700" },
    overviewRight: { flex: "1", minWidth: "280px" },
    specsStack: { display: "flex", flexDirection: "column", gap: "2px", backgroundColor: border },
    specRow: { backgroundColor: white, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px", flexWrap: "wrap" },
    specLabel: { fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase", color: muted, fontFamily: "'Arial', sans-serif", fontWeight: "700" },
    specValue: { fontSize: "14px", color: dark, fontFamily: "'Georgia', serif", textAlign: "right" },

    shadeSection: { backgroundColor: dark, padding: "100px 60px", borderTop: `3px solid ${gold}` },
    shadeInner: { maxWidth: "1200px", margin: "0 auto" },
    shadeSectionTitle: { fontSize: "clamp(28px, 4vw, 44px)", fontWeight: "400", color: white, marginBottom: "16px", letterSpacing: "-0.5px" },
    shadeSectionSub: { fontSize: "14px", color: "rgba(255,255,255,0.5)", fontFamily: "'Arial', sans-serif", lineHeight: "1.8", marginBottom: "48px", maxWidth: "560px" },
    shadeGrid: { display: "flex", gap: "2px", flexWrap: "wrap", marginBottom: "40px" },
    shadeCard: { flex: "1", minWidth: "140px", padding: "24px 20px", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", transition: "all 0.2s ease" },
    shadeCardActive: { backgroundColor: "rgba(255,170,23,0.1)", borderColor: gold },
    shadeSwatch: { width: "48px", height: "48px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.2)" },
    shadeName: { fontSize: "12px", color: white, fontFamily: "'Arial', sans-serif", textAlign: "center", letterSpacing: "0.5px" },
    shadeDetail: { display: "flex", alignItems: "center", gap: "28px", padding: "32px", backgroundColor: "rgba(255,255,255,0.05)", borderLeft: `3px solid ${gold}` },
    shadeDetailSwatch: { width: "64px", height: "64px", borderRadius: "50%", flexShrink: "0", border: "2px solid rgba(255,255,255,0.2)" },
    shadeDetailName: { fontSize: "20px", color: white, fontWeight: "400", marginBottom: "8px" },
    shadeDetailDesc: { fontSize: "14px", color: "rgba(255,255,255,0.55)", fontFamily: "'Arial', sans-serif", lineHeight: "1.7", margin: "0" },

    ctaBanner: { backgroundColor: dark, borderTop: `3px solid ${gold}`, padding: "80px 60px", textAlign: "center" },
    ctaBannerTitle: { fontSize: "clamp(28px, 4vw, 44px)", fontWeight: "400", color: white, marginBottom: "16px", letterSpacing: "-0.5px" },
    ctaBannerSub: { fontSize: "14px", color: "rgba(255,255,255,0.55)", fontFamily: "'Arial', sans-serif", marginBottom: "40px", maxWidth: "600px", margin: "0 auto 40px", lineHeight: "1.8" },
    ctaBannerBtn: { display: "inline-block", padding: "16px 48px", backgroundColor: gold, color: dark, textDecoration: "none", fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Arial', sans-serif", fontWeight: "700" },
};
