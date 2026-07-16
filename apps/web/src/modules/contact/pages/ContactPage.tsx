import {
  ContactFaqSection,
  ContactFormSection,
  ContactHeroSection,
  OfficeLocationsSection,
} from "@/modules/contact/components/contact-sections"

export default function ContactPage() {
  return (
    <main>
      <ContactHeroSection />
      <ContactFormSection />
      <OfficeLocationsSection />
      <ContactFaqSection />
    </main>
  )
}
