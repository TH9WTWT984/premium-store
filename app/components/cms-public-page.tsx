import Link from "next/link";
import styles from "./cms-public-page.module.css";
import { contentToBlocks, type PublicCmsPage } from "@/lib/cms";

const pageLinks = [["About","/about"],["FAQ","/faq"],["Contact","/contact"],["Shipping","/shipping"],["Returns","/returns"],["Privacy","/privacy"],["Terms","/terms"],["Refunds","/refund"]] as const;

export function CmsPublicPage({ page }: { page: PublicCmsPage }) {
  const blocks = contentToBlocks(page.content);
  let paragraphIndex = 0;

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>ATELIER</Link>
        <nav className={styles.nav} aria-label="Primary navigation">
          <Link href="/shop" className={styles.navLink}>Shop</Link>
          <Link href="/about" className={styles.navLink}>Our story</Link>
          <Link href="/contact" className={styles.navLink}>Contact</Link>
          <Link href="/cart" className={styles.navLink}>Bag</Link>
        </nav>
      </header>
      <div className={styles.rule} />

      <section className={styles.hero}>
        <div className={styles.heroMeta}>
          <span>{page.eyebrow || "ATELIER / INFORMATION"}</span>
          <span className={styles.heroSlug}>/{page.slug}</span>
        </div>
        <div className={styles.heroCopy}>
          <h1 className={styles.heroTitle}>{page.title}</h1>
          {page.excerpt ? <p className={styles.excerpt}>{page.excerpt}</p> : null}
        </div>
      </section>

      <section className={styles.body}>
        <aside className={styles.side}>
          <div className={styles.sideLabel}>Explore</div>
          <div className={styles.sideLinks}>
            {pageLinks.map(([label, href]) => (
              <Link key={href} href={href} className={`${styles.sideLink} ${href === `/${page.slug}` ? styles.active : ""}`}>
                {label}
              </Link>
            ))}
          </div>
        </aside>

        <article className={styles.article}>
          {blocks.map((block, index) => {
            if (block.type === "heading") {
              return <h2 key={index} className={`${styles.heading} ${index === 0 ? styles.firstHeading : ""}`}>{block.text}</h2>;
            }
            if (block.type === "question") {
              return <section key={index} className={styles.question}><h2 className={styles.questionTitle}>{block.text}</h2></section>;
            }
            const isLead = paragraphIndex++ === 0;
            return <p key={index} className={`${styles.paragraph} ${isLead ? styles.leadParagraph : ""}`}>{block.text}</p>;
          })}
        </article>
      </section>

      <footer className={styles.footer}>
        <div>
          <div className={styles.footerBrand}>ATELIER</div>
          <p className={styles.footerNote}>Considered essentials. Quietly made.</p>
        </div>
        <div className={styles.footerLinks}>
          {pageLinks.slice(0,4).map(([label, href]) => <Link key={href} href={href} className={styles.footerLink}>{label}</Link>)}
        </div>
      </footer>
    </main>
  );
}
