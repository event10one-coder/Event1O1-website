'use client';

/**
 * BlogArticleLayout.jsx
 * ---------------------------------------------------------------------------
 * Reusable article shell for every Event 1O1 blog post. Extracted from the
 * Blog 1 (Wedding Budget) and Blog 2 (Baraat on Wheel) HTML builds — same
 * design system, same spacing rules, same image-placement logic.
 *
 * ASSUMPTIONS (adjust if your project differs):
 * 1. Shared <Navbar /> and <Footer /> components already exist at
 *    '@/components/Navbar' and '@/components/Footer' and are NOT duplicated
 *    here (they're identical across every page site-wide).
 * 2. Cormorant Garamond + Inter are loaded globally (e.g. via next/font in
 *    your root layout.jsx) — this file does not re-import fonts.
 * 3. Images are plain <img> tags pointing at Odoo-hosted URLs. If you later
 *    move images into Next's own asset pipeline, swap to next/image and add
 *    the Odoo domain to next.config.js remotePatterns.
 * 4. The actual article body (H2/H3/paragraphs/lists/tables/inline images)
 *    is passed in as `children` — typically rendered from an .mdx file.
 *    Inline images inside that MDX content should use className="img-left"
 *    or className="img-right" to get the float behaviour defined below.
 *
 * USAGE:
 * <BlogArticleLayout
 *   title="Wedding Budget Breakdown in Ahmedabad 2026"
 *   category="Wedding"
 *   date="3 July 2026"
 *   readTime="12 min read"
 *   author="Event 1O1"
 *   breadcrumbLabel="Wedding Budget"
 *   heroImage="https://www.event1o1.com/web/image/3924"
 *   heroAlt="Decorated ivory and gold wedding mandap setup in Ahmedabad at dusk"
 *   relatedArticles={[
 *     { icon: '💍', label: 'Wedding Event Management in Ahmedabad', href: '/wedding' },
 *     { icon: '🎂', label: 'Birthday Party Organizer in Ahmedabad 2026', href: '/blog/.../birthday-party-organizer-in-ahmedabad-2026-complete-planning-guide-14' },
 *   ]}
 *   ctaHeadline="Planning your wedding in Ahmedabad?"
 *   ctaBody="Get a free quote from Event 1O1 — complete wedding management starting from ₹1.5 lakh."
 *   tags={['Ahmedabad', 'Budget', 'Wedding']}
 * >
 *   {mdxContent}
 * </BlogArticleLayout>
 */

import { useEffect, useRef, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// ---------------------------------------------------------------------------
// FAQ Accordion — importable separately for use inside MDX content
// ---------------------------------------------------------------------------
export function FAQAccordion({ items = [] }) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="faq-accordion">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div className="faq-item" key={i}>
            <button
              className="faq-question"
              aria-expanded={isOpen}
              onClick={() => setOpenIndex(isOpen ? null : i)}
            >
              <span>{item.question}</span>
              <span className="faq-icon">{isOpen ? '−' : '+'}</span>
            </button>
            <div className="faq-answer" style={{ maxHeight: isOpen ? '500px' : '0px' }}>
              <p>{item.answer}</p>
            </div>
          </div>
        );
      })}

      <style jsx>{`
        .faq-accordion {
          margin: 24px 0;
        }
        .faq-item {
          border-bottom: 1px solid rgba(232, 160, 32, 0.15);
        }
        .faq-question {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: none;
          border: none;
          text-align: left;
          padding: 18px 4px;
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          font-weight: 600;
          color: #f5edd8;
          cursor: pointer;
        }
        .faq-icon {
          color: #e8a020;
          font-size: 20px;
          flex-shrink: 0;
          margin-left: 16px;
        }
        .faq-answer {
          overflow: hidden;
          transition: max-height 0.35s ease;
        }
        .faq-answer p {
          padding: 0 4px 18px;
          color: #ccc;
          font-size: 15px;
          line-height: 1.8;
          margin: 0;
        }
        @media (prefers-reduced-motion: reduce) {
          .faq-answer {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main layout
// ---------------------------------------------------------------------------
export default function BlogArticleLayout({
  title,
  category,
  date,
  readTime,
  author = 'Event 1O1',
  breadcrumbLabel,
  heroImage,
  heroAlt,
  relatedArticles = [],
  ctaHeadline,
  ctaBody,
  ctaPrimaryHref = '/contactus',
  ctaPrimaryLabel = 'Get Free Quote →',
  whatsappHref = 'https://wa.me/919537968007',
  tags = [],
  children,
}) {
  const [revealedIds, setRevealedIds] = useState(new Set());
  const containerRef = useRef(null);

  // Scroll-reveal (respects prefers-reduced-motion)
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const elements = containerRef.current?.querySelectorAll('.reveal') ?? [];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="blog-article">
      {/* Floating WhatsApp button */}
      <a
        className="whatsapp-fab"
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
      >
        💬
      </a>

      <Navbar active="Blog" />

      {/* Article header */}
      <header className="article-header">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <a href="/">Home</a> › <a href="/blog">Blog</a> › <span>{breadcrumbLabel || title}</span>
        </nav>
        {category && <span className="category-pill">{category.toUpperCase()}</span>}
        <h1 className="article-h1 reveal">{title}</h1>
        <div className="meta-row">
          {date && <span>📅 {date}</span>}
          {author && <span>✍️ {author}</span>}
          {readTime && <span>⏱ {readTime}</span>}
        </div>
      </header>

      {/* Hero image */}
      {heroImage && (
        <div className="hero-wrap">
          <img className="hero-image" src={heroImage} alt={heroAlt || ''} loading="eager" />
        </div>
      )}
      <div className="hero-divider" />

      {/* Article body — MDX content renders here */}
      <article className="article-body">{children}</article>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="tag-row">
          {tags.map((tag, i) => (
            <span className="tag-pill" key={i}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Related articles */}
      {relatedArticles.length > 0 && (
        <section className="related-section reveal">
          <p className="eyebrow">READ NEXT</p>
          <h2 className="related-h2">More from Event 1O1</h2>
          <div className="related-grid">
            {relatedArticles.map((item, i) => (
              <a className="related-card" href={item.href} key={i}>
                <span className="related-icon">{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="article-cta reveal">
        <p className="eyebrow">FREE CONSULTATION</p>
        <h2 className="cta-h2">{ctaHeadline}</h2>
        <p className="cta-body">{ctaBody}</p>
        <div className="cta-buttons">
          <a className="btn btn-gold" href={ctaPrimaryHref}>
            {ctaPrimaryLabel}
          </a>
          <a className="btn btn-whatsapp" href={whatsappHref} target="_blank" rel="noopener noreferrer">
            💬 WhatsApp Us
          </a>
        </div>
        <p className="slogan">
          <em>Event है?</em> <span className="slogan-bold">Call 1O1.</span>
        </p>
      </section>

      <Footer />

      <style jsx global>{`
        :root {
          --bg: #0d0d0d;
          --surface: #181818;
          --surface2: #222;
          --gold: #e8a020;
          --cream: #f5edd8;
          --body-text: #cccccc;
          --muted: #888888;
        }

        .blog-article {
          background: var(--bg);
        }

        /* --- WhatsApp floating button --- */
        .whatsapp-fab {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #25d366;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          z-index: 50;
          text-decoration: none;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
        }

        /* --- Article header --- */
        .article-header {
          max-width: 760px;
          margin: 0 auto;
          padding: 80px 60px 32px;
        }
        .breadcrumb {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          color: var(--muted);
          margin-bottom: 16px;
        }
        .breadcrumb a {
          color: var(--muted);
          text-decoration: none;
        }
        .breadcrumb a:hover {
          color: var(--gold);
        }
        .category-pill {
          display: inline-block;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          background: var(--gold);
          color: var(--bg);
          padding: 4px 12px;
          border-radius: 100px;
          margin-bottom: 16px;
        }
        .article-h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(36px, 6vw, 64px);
          line-height: 1.1;
          color: #fff;
          margin: 0 0 16px;
        }
        .meta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: var(--muted);
        }

        /* --- Hero image --- */
        .hero-wrap {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        .hero-image {
          width: 100%;
          height: 400px;
          object-fit: cover;
          border-radius: 16px;
          display: block;
        }
        .hero-divider {
          max-width: 760px;
          margin: 20px auto 0;
          height: 1px;
          background: rgba(232, 160, 32, 0.2);
        }
        @media (max-width: 768px) {
          .hero-image {
            height: 220px;
            border-radius: 12px;
          }
        }

        /* --- Article body typography --- */
        .article-body {
          max-width: 760px;
          margin: 0 auto;
          padding: 0 60px 40px;
          font-family: 'Inter', sans-serif;
        }
        .article-body h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(26px, 4vw, 36px);
          color: #fff;
          margin-top: 56px;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(232, 160, 32, 0.2);
        }
        .article-body h3 {
          font-family: 'Inter', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: var(--cream);
          margin-top: 36px;
          margin-bottom: 14px;
        }
        .article-body p {
          font-size: 16px;
          line-height: 1.9;
          color: var(--body-text);
          margin-bottom: 20px;
        }
        .article-body ul,
        .article-body ol {
          font-size: 15px;
          line-height: 1.8;
          color: var(--body-text);
          padding-left: 20px;
          margin-bottom: 20px;
        }
        .article-body strong {
          color: var(--cream);
          font-weight: 600;
        }
        .article-body a {
          color: var(--gold);
          text-decoration: underline;
        }

        /* --- Floated inline images (use inside MDX content) --- */
        .article-body .img-right {
          float: right;
          width: 45%;
          margin: 8px 0 24px 32px;
          border-radius: 12px;
        }
        .article-body .img-left {
          float: left;
          width: 45%;
          margin: 8px 32px 24px 0;
          border-radius: 12px;
        }
        .article-body .img-full {
          clear: both;
          width: 100%;
          border-radius: 16px;
          margin: 24px 0;
        }
        .article-body .clear {
          clear: both;
        }
        @media (max-width: 768px) {
          .article-body .img-right,
          .article-body .img-left {
            float: none;
            width: 100%;
            margin: 0 0 20px 0;
          }
        }

        /* --- Tables --- */
        .article-body .table-wrap {
          overflow-x: auto;
          margin: 24px 0;
        }
        .article-body table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
        }
        .article-body thead th {
          background: var(--gold);
          color: var(--bg);
          font-weight: 700;
          padding: 12px 16px;
          text-align: left;
        }
        .article-body tbody td {
          padding: 10px 16px;
          border: 1px solid rgba(232, 160, 32, 0.15);
          color: var(--body-text);
        }
        .article-body tbody tr:nth-child(even) {
          background: var(--surface);
        }
        .article-body tbody tr:nth-child(odd) {
          background: #1a1a1a;
        }
        .article-body tbody tr:last-child td {
          font-weight: 700;
          color: var(--cream);
          background: var(--surface2);
        }

        /* --- Checklist card (for "how to save money" style lists) --- */
        .article-body .checklist-card {
          background: var(--surface);
          border-radius: 12px;
          padding: 32px;
          border-left: 3px solid var(--gold);
          margin: 24px 0;
        }
        .article-body .checklist-card ul {
          list-style: none;
          padding-left: 0;
        }
        .article-body .checklist-card li {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
        }
        .article-body .checklist-card li::before {
          content: '✓';
          color: var(--gold);
          font-weight: 700;
          flex-shrink: 0;
        }

        /* --- Tags --- */
        .tag-row {
          max-width: 760px;
          margin: 0 auto;
          padding: 0 60px 40px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .tag-pill {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          color: var(--muted);
          border: 1px solid rgba(232, 160, 32, 0.2);
          border-radius: 100px;
          padding: 4px 14px;
        }

        /* --- Related articles --- */
        .related-section {
          max-width: 760px;
          margin: 0 auto 48px;
          background: var(--surface);
          border-radius: 12px;
          padding: 32px;
        }
        .eyebrow {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          letter-spacing: 2px;
          color: var(--gold);
          text-transform: uppercase;
          margin: 0 0 8px;
        }
        .related-h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 24px;
          color: #fff;
          margin: 0 0 20px;
        }
        .related-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .related-card {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--bg);
          border: 1px solid rgba(232, 160, 32, 0.2);
          border-radius: 8px;
          padding: 20px;
          color: var(--cream);
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          text-decoration: none;
          transition: border-color 0.2s;
        }
        .related-card:hover {
          border-color: var(--gold);
        }
        .related-icon {
          font-size: 20px;
        }
        @media (max-width: 768px) {
          .related-grid {
            grid-template-columns: 1fr;
          }
        }

        /* --- CTA --- */
        .article-cta {
          background: var(--surface);
          padding: 64px 60px;
          text-align: center;
        }
        .cta-h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(28px, 4vw, 36px);
          color: #fff;
          margin: 0 0 12px;
        }
        .cta-body {
          font-family: 'Inter', sans-serif;
          color: var(--muted);
          max-width: 480px;
          margin: 0 auto 28px;
        }
        .cta-buttons {
          display: flex;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }
        .btn {
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 14px;
          padding: 14px 28px;
          border-radius: 100px;
          text-decoration: none;
          transition: all 0.2s;
        }
        .btn-gold {
          border: 1px solid var(--gold);
          color: var(--gold);
        }
        .btn-gold:hover {
          background: var(--gold);
          color: var(--bg);
        }
        .btn-whatsapp {
          background: #25d366;
          color: #fff;
        }
        .slogan {
          font-family: 'Inter', sans-serif;
          color: var(--gold);
        }
        .slogan em {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 20px;
        }
        .slogan-bold {
          font-weight: 700;
        }
        @media (max-width: 768px) {
          .article-cta {
            padding: 48px 20px;
          }
        }

        /* --- Responsive padding --- */
        @media (max-width: 768px) {
          .article-header,
          .article-body,
          .tag-row {
            padding-left: 20px;
            padding-right: 20px;
          }
        }

        /* --- Scroll reveal --- */
        .reveal {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .reveal.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        @media (prefers-reduced-motion: reduce) {
          .reveal {
            opacity: 1;
            transform: none;
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}
