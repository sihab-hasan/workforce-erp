import {
  ContactFaqSection,
  ContactHeroSection,
  DemoRequestFormSection,
  WhatToExpectSection,
} from "@/modules/contact/components/contact-sections"

export default function DemoRequestPage() {
  return (
    <main>
      <ContactHeroSection />
      <DemoRequestFormSection />
      <WhatToExpectSection />
      <ContactFaqSection />
    </main>
  )
}
