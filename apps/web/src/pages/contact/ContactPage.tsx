import {
  ContactFaqSection,
  ContactFormSection,
  ContactHeroSection,
  OfficeLocationsSection,
} from "#features/contact/components/contact-sections";

export default function ContactPage() {
  return (
    <main>
      <ContactHeroSection />
      <ContactFormSection />
      <OfficeLocationsSection />
      <ContactFaqSection />
    </main>
  );
}
