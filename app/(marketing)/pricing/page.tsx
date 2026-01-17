import { Pricing } from "../_components/Pricing";
import { Testimonials } from "../_components/Testimonials";

export const metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for Inbox Zero. Start free, upgrade when you're ready.",
};

export default function PricingPage() {
  return (
    <div className="pt-16">
      <Pricing />
      <Testimonials />
    </div>
  );
}
