import React from "react";
import { Helmet } from "react-helmet";
import Intro from "../../img/footer-flip.jpg";
import { Fade } from "react-awesome-reveal";

export const RemovableProgram = props => {
    return (
        <div style={styles.page}>
            <Helmet>
                <title>KPD Removable Program | 30-Day Warranty & Forever Replacement</title>
                <meta name="description" content="Every KPD removable prosthetic comes with a 30-day breakage warranty and a forever replacement program at $100 off. No questions asked. Serving Florida dental practices." />
                <link rel="canonical" href="https://kpdlabs.com/removable-program" />
            </Helmet>

            {/* Hero */}
            <div style={{
                ...styles.hero,
                backgroundImage: `linear-gradient(to bottom, rgba(10,10,10,0.7) 0%, rgba(10,10,10,0.85) 100%), url(${Intro})`
            }}>
                <div style={styles.heroInner}>
                    <p style={styles.heroEyebrow}>KPD Dental Laboratory</p>
                    <h1 style={styles.heroTitle}>The KPD<br />Removable Program</h1>
                    <div style={styles.heroRule} />
                    <p style={styles.heroSub}>
                        We stand behind every removable we craft — long after it leaves our lab.
                    </p>
                    <p style={styles.heroBreadcrumb}>
                        <a href="/" style={styles.breadcrumbLink}>Home</a>
                        <span style={styles.breadcrumbSep}>›</span>
                        Removable Program
                    </p>
                </div>
            </div>

            {/* Intro */}
            <div style={styles.introSection}>
                <Fade triggerOnce>
                <div style={styles.introInner}>
                    <div style={styles.introLeft}>
                        <div style={styles.introAccent} />
                        <p style={styles.eyebrow}>Our Commitment</p>
                        <h2 style={styles.introTitle}>A Warranty Program Built Around Your Practice</h2>
                        <p style={styles.introDesc}>
                            Most dental labs stop at delivery. At KPD, delivery is just the beginning. The KPD Removable Program is our commitment to your practice and your patients — a safety net that protects everyone after the appliance is approved and seated.
                        </p>
                        <p style={styles.introDesc}>
                            No complicated claims process. No back-and-forth. Just straightforward support, because that's what a real lab partner looks like.
                        </p>
                    </div>
                    <div style={styles.introRight}>
                        <div style={styles.statGrid}>
                            {[
                                { num: "30", unit: "Days", label: "Full breakage warranty on every removable" },
                                { num: "$100", unit: "Off", label: "Forever replacement after the warranty period" },
                                { num: "0", unit: "Questions", label: "Asked during the warranty period" },
                            ].map((stat, i) => (
                                <div key={i} style={styles.statCard}>
                                    <div style={styles.statNum}>{stat.num}<span style={styles.statUnit}>{stat.unit}</span></div>
                                    <p style={styles.statLabel}>{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                </Fade>
            </div>

            {/* Two warranty cards */}
            <div style={styles.cardsSection}>
                <div style={styles.cardsInner}>
                    <p style={styles.eyebrowLight}>What's Included</p>
                    <h2 style={styles.cardsSectionTitle}>Two Levels of Protection</h2>
                    <div style={styles.cardsGrid}>

                        {/* 30-day */}
                        <div style={styles.card}>
                            <div style={styles.cardIconRow}>
                                <i className="fa-solid fa-shield-halved" style={styles.cardIcon}></i>
                                <span style={styles.cardBadge}>Included with Every Removable</span>
                            </div>
                            <h3 style={styles.cardTitle}>30-Day Warranty</h3>
                            <p style={styles.cardDesc}>
                                After the device is approved by both the dentist and the patient, every KPD removable prosthetic comes with a 30-day breakage warranty — no questions asked.
                            </p>
                            <div style={styles.cardDivider} />
                            <ul style={styles.cardList}>
                                {[
                                    "Applies to all KPD Premier Partials and KPD Premier Dentures",
                                    "Covers breakage after patient approval and delivery",
                                    "No claim forms, no back-and-forth — just contact us",
                                    "Replacement at no additional charge within the warranty period",
                                ].map((item, i) => (
                                    <li key={i} style={styles.cardListItem}>
                                        <i className="fa-solid fa-check" style={styles.cardCheck}></i>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Forever replacement */}
                        <div style={{ ...styles.card, ...styles.cardDark }}>
                            <div style={styles.cardIconRow}>
                                <i className="fa-solid fa-rotate" style={{ ...styles.cardIcon, color: "#ffaa17" }}></i>
                                <span style={{ ...styles.cardBadge, backgroundColor: "rgba(255,170,23,0.15)", color: "#ffaa17" }}>After Warranty Period</span>
                            </div>
                            <h3 style={{ ...styles.cardTitle, color: "white" }}>Forever Replacement</h3>
                            <p style={{ ...styles.cardDesc, color: "rgba(255,255,255,0.6)" }}>
                                After the 30-day warranty period ends, the KPD Forever Replacement program kicks in. We'll replace any removable at <strong style={{ color: "#ffaa17" }}>$100 off</strong> — for the life of the case.
                            </p>
                            <div style={{ ...styles.cardDivider, backgroundColor: "rgba(255,255,255,0.1)" }} />
                            <ul style={styles.cardList}>
                                {[
                                    "No need for realigns or wasted chair time",
                                    "Patient keeps their existing device while we make a new one",
                                    "Applies to KPD Premier Partials and KPD Premier Dentures",
                                    "$100 off the standard lab fee, no expiration",
                                ].map((item, i) => (
                                    <li key={i} style={styles.cardListItem}>
                                        <i className="fa-solid fa-check" style={{ ...styles.cardCheck, color: "#ffaa17" }}></i>
                                        <span style={{ color: "rgba(255,255,255,0.7)" }}>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Applies to */}
            <div style={styles.appliesSection}>
                <div style={styles.appliesInner}>
                    <p style={styles.eyebrow}>Coverage</p>
                    <h2 style={styles.sectionTitle}>What the Program Covers</h2>
                    <div style={styles.appliesGrid}>
                        {[
                            {
                                icon: "◈",
                                title: "KPD Premier Partial",
                                desc: "Our precision-fit, flexible, metal-free removable partial. More stable than nylon, more comfortable than metal. Available in 4 gingival shades.",
                                link: "/partial"
                            },
                            {
                                icon: "◉",
                                title: "KPD Premier Denture",
                                desc: "CNC-milled fracture-resistant PMMA base with multi-layer PMMA teeth and hand-characterized Vita Akzent gingiva.",
                                link: "/denture"
                            },
                        ].map((item, i) => (
                            <div key={i} style={styles.appliesCard}>
                                <span style={styles.appliesIcon}>{item.icon}</span>
                                <h3 style={styles.appliesTitle}>{item.title}</h3>
                                <p style={styles.appliesDesc}>{item.desc}</p>
                                <a href={item.link} style={styles.appliesLink}>View Product Details →</a>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* How it works */}
            <div style={styles.howSection}>
                <div style={styles.howInner}>
                    <p style={styles.eyebrowLight}>Simple Process</p>
                    <h2 style={styles.howTitle}>How to Use the Program</h2>
                    <div style={styles.howSteps}>
                        {[
                            { num: "01", title: "Submit Your Case", body: "Send your removable case through your KPD account as normal. The warranty applies automatically — no enrollment required." },
                            { num: "02", title: "Patient Approves & Receives", body: "Once both you and the patient approve the device and it's delivered, the 30-day warranty window opens." },
                            { num: "03", title: "Contact Us if Needed", body: "If a breakage occurs within 30 days, contact us directly. We'll handle the remake at no charge, no questions asked." },
                            { num: "04", title: "Forever Replacement After That", body: "After the warranty period, just reach out for a replacement at $100 off. Your patient stays in their existing appliance while we work." },
                        ].map((step, i) => (
                            <div key={i} style={styles.howStep}>
                                <span style={styles.howNum}>{step.num}</span>
                                <div>
                                    <h4 style={styles.howStepTitle}>{step.title}</h4>
                                    <p style={styles.howStepBody}>{step.body}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div style={styles.ctaBanner}>
                <h2 style={styles.ctaTitle}>Ready to Send a Removable Case?</h2>
                <p style={styles.ctaSub}>Every KPD Premier Partial and Denture is backed by our full program from the moment it's approved.</p>
                <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" }}>
                    <a href="/signup" style={styles.ctaBtn}>Send Us a Case →</a>
                    <a href="/pricing" style={styles.ctaBtnGhost}>Request Pricing →</a>
                </div>
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
    heroTitle: { fontSize: "clamp(48px, 7vw, 84px)", fontWeight: "400", color: white, lineHeight: "1.05", marginBottom: "24px", letterSpacing: "-1px" },
    heroRule: { width: "60px", height: "2px", backgroundColor: gold, margin: "0 auto 24px" },
    heroSub: { fontSize: "17px", color: "rgba(255,255,255,0.65)", fontFamily: "'Arial', sans-serif", lineHeight: "1.8", marginBottom: "24px" },
    heroBreadcrumb: { fontSize: "13px", color: "rgba(255,255,255,0.4)", fontFamily: "'Arial', sans-serif" },
    breadcrumbLink: { color: "rgba(255,255,255,0.4)", textDecoration: "none" },
    breadcrumbSep: { margin: "0 8px", color: gold },

    eyebrow: { fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase", color: gold, fontFamily: "'Arial', sans-serif", fontWeight: "600", marginBottom: "12px" },
    eyebrowLight: { fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase", color: gold, fontFamily: "'Arial', sans-serif", fontWeight: "600", marginBottom: "12px" },
    sectionTitle: { fontSize: "clamp(28px, 4vw, 44px)", fontWeight: "400", color: dark, marginBottom: "48px", letterSpacing: "-0.5px" },

    // Intro
    introSection: { padding: "100px 60px", maxWidth: "1200px", margin: "0 auto" },
    introInner: { display: "flex", gap: "80px", alignItems: "flex-start", flexWrap: "wrap" },
    introLeft: { flex: "1.2", minWidth: "300px", position: "relative", paddingLeft: "24px" },
    introAccent: { position: "absolute", left: "0", top: "0", width: "3px", height: "100%", backgroundColor: gold },
    introTitle: { fontSize: "clamp(28px, 4vw, 44px)", fontWeight: "400", color: dark, marginBottom: "24px", letterSpacing: "-0.5px" },
    introDesc: { fontSize: "15px", color: muted, fontFamily: "'Arial', sans-serif", lineHeight: "1.8", marginBottom: "20px" },
    introRight: { flex: "1", minWidth: "280px" },
    statGrid: { display: "flex", flexDirection: "column", gap: "2px", backgroundColor: border },
    statCard: { backgroundColor: white, padding: "28px 32px" },
    statNum: { fontSize: "48px", fontWeight: "400", color: dark, lineHeight: "1", marginBottom: "8px" },
    statUnit: { fontSize: "20px", color: gold, marginLeft: "6px" },
    statLabel: { fontSize: "13px", color: muted, fontFamily: "'Arial', sans-serif", margin: "0", lineHeight: "1.6" },

    // Cards
    cardsSection: { backgroundColor: dark, padding: "100px 60px", borderTop: `3px solid ${gold}` },
    cardsInner: { maxWidth: "1200px", margin: "0 auto" },
    cardsSectionTitle: { fontSize: "clamp(28px, 4vw, 44px)", fontWeight: "400", color: white, marginBottom: "48px", letterSpacing: "-0.5px" },
    cardsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2px", backgroundColor: "rgba(255,170,23,0.15)" },
    card: { backgroundColor: light, padding: "48px 40px" },
    cardDark: { backgroundColor: "#1a1e22" },
    cardIconRow: { display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" },
    cardIcon: { fontSize: "32px", color: dark },
    cardBadge: { fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Arial', sans-serif", fontWeight: "700", backgroundColor: "#f0ede6", color: muted, padding: "4px 12px" },
    cardTitle: { fontSize: "26px", fontWeight: "400", color: dark, marginBottom: "16px" },
    cardDesc: { fontSize: "14px", color: muted, fontFamily: "'Arial', sans-serif", lineHeight: "1.8", marginBottom: "24px" },
    cardDivider: { height: "1px", backgroundColor: border, marginBottom: "24px" },
    cardList: { listStyle: "none", padding: "0", margin: "0", display: "flex", flexDirection: "column", gap: "12px" },
    cardListItem: { display: "flex", alignItems: "flex-start", gap: "12px", fontSize: "13px", color: muted, fontFamily: "'Arial', sans-serif", lineHeight: "1.6" },
    cardCheck: { color: dark, fontSize: "12px", marginTop: "3px", flexShrink: "0" },

    // Applies to
    appliesSection: { padding: "100px 60px", maxWidth: "1200px", margin: "0 auto" },
    appliesInner: { maxWidth: "1200px" },
    appliesGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2px", backgroundColor: border },
    appliesCard: { backgroundColor: white, padding: "48px 40px" },
    appliesIcon: { fontSize: "28px", color: gold, display: "block", marginBottom: "20px" },
    appliesTitle: { fontSize: "22px", fontWeight: "400", color: dark, marginBottom: "12px" },
    appliesDesc: { fontSize: "14px", color: muted, fontFamily: "'Arial', sans-serif", lineHeight: "1.7", marginBottom: "24px" },
    appliesLink: { fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", color: dark, fontFamily: "'Arial', sans-serif", fontWeight: "700", textDecoration: "none", borderBottom: `1px solid ${gold}`, paddingBottom: "2px" },

    // How it works
    howSection: { backgroundColor: dark, padding: "100px 60px", borderTop: `3px solid ${gold}` },
    howInner: { maxWidth: "1200px", margin: "0 auto" },
    howTitle: { fontSize: "clamp(28px, 4vw, 44px)", fontWeight: "400", color: white, marginBottom: "60px", letterSpacing: "-0.5px" },
    howSteps: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "2px", backgroundColor: "rgba(255,170,23,0.1)" },
    howStep: { backgroundColor: dark, padding: "40px 32px", display: "flex", gap: "20px", alignItems: "flex-start" },
    howNum: { fontSize: "32px", color: "rgba(255,170,23,0.25)", fontWeight: "400", minWidth: "44px", lineHeight: "1" },
    howStepTitle: { fontSize: "16px", color: white, fontWeight: "400", marginBottom: "10px" },
    howStepBody: { fontSize: "13px", color: "rgba(255,255,255,0.5)", fontFamily: "'Arial', sans-serif", lineHeight: "1.7", margin: "0" },

    // CTA
    ctaBanner: { padding: "100px 60px", textAlign: "center", backgroundColor: light, borderTop: `1px solid ${border}` },
    ctaTitle: { fontSize: "clamp(28px, 4vw, 44px)", fontWeight: "400", color: dark, marginBottom: "16px", letterSpacing: "-0.5px" },
    ctaSub: { fontSize: "15px", color: muted, fontFamily: "'Arial', sans-serif", marginBottom: "40px", maxWidth: "500px", margin: "0 auto 40px", lineHeight: "1.8" },
    ctaBtn: { display: "inline-block", padding: "16px 48px", backgroundColor: dark, color: white, textDecoration: "none", fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Arial', sans-serif", fontWeight: "700" },
    ctaBtnGhost: { display: "inline-block", padding: "16px 48px", backgroundColor: "transparent", color: dark, border: `1px solid ${dark}`, textDecoration: "none", fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Arial', sans-serif", fontWeight: "700" },
};