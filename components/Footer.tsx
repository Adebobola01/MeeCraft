import Logo from "@/components/Logo";
import Link from "next/link";
import Image from "next/image";
import React from "react";

const Footer = () => {
  return (
    <footer className="shop-footer">
      <div className="shop-footer-main shop-content">
        <div>
          <Link href="/" className="shop-wordmark">
            <Logo />
          </Link>
          <p>Thoughtful shoes and bags for everyday life.</p>
        </div>
        <nav aria-label="Shop MeeCraft">
          <Link href="/products">Shop all</Link>
          <Link href="/products?category=Shoes">Shoes</Link>
          <Link href="/products?category=Bags">Bags</Link>
          <Link href="/gifts">Gift guide</Link>
        </nav>
        <nav
          aria-label="MeeCraft social links (existing Aurvella accounts, temporary)"
          className="shop-footer-socials"
        >
          <a
            href="https://www.instagram.com/m.e.e.crafts?rpxt=NTlzcWtoaTYwaDlo&utm_source=qr"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/9/95/Instagram_logo_2022.svg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original"
              alt=""
              width={18}
              height={18}
              unoptimized
            />
            Instagram
          </a>
          <a
            href="https://www.tiktok.com/@meecrafts_ng?_r=1&_t=ZS-9B1Pp987BES"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a6/Tiktok_icon.svg/960px-Tiktok_icon.svg.png?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail"
              alt=""
              width={18}
              height={18}
              unoptimized
            />
            TikTok
          </a>
          <a
            href="https://wa.me/2348106662454"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4c/WhatsApp_Logo_green.svg/960px-WhatsApp_Logo_green.svg.png?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail"
              alt=""
              width={18}
              height={18}
              unoptimized
            />
            WhatsApp
          </a>
        </nav>
      </div>
      <div className="shop-footer-bottom shop-content">
        <span>© {new Date().getFullYear()} MeeCraft</span>
        <span>Social links currently point to Aurvella accounts.</span>
      </div>
    </footer>
  );
};

export default Footer;
