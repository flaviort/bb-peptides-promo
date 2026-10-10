import { HowItWorks } from './HowItWorks';
import { AssessmentBand } from './AssessmentBand';
import { FaqSection } from './FaqSection';
import { Footer } from './Footer';

// The one free-scrolling section. Its top is the "closing" section boundary the pager and timeline measure.
export function ClosingSection() {
  return (
    <section id="closing" data-section="closing" aria-label="How it works, assessment and questions" className="closing">
      <HowItWorks />
      <AssessmentBand />
      <FaqSection />
      <Footer />
    </section>
  );
}
