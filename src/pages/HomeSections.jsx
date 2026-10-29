import AboutSection from '../components/public/sections/AboutSection'
import ProjectsSection from '../components/public/sections/ProjectsSection'
import TechRibbon from '../components/public/sections/TechRibbon'
import ExperienceSection from '../components/public/sections/ExperienceSection'
import EducationSection from '../components/public/sections/EducationSection'
import CertificatesSection from '../components/public/sections/CertificatesSection'
import AchievementsSection from '../components/public/sections/AchievementsSection'
import OrganizationsSection from '../components/public/sections/OrganizationsSection'
import ContactSection from '../components/public/contact/ContactSection'
import { usePublicData } from '../components/public/publicContexts'
import { useHashScroll } from '../components/public/useHashScroll'

/**
 * The home page below the hero (its own chunk, stage 3C: the code and styles of these sections do not
 * delay the first paint). Monochrome order: Tentang (with the tech stack, /#keahlian), the tech ribbon,
 * Proyek, then the sections still to be redone. Scrolls to the section in the address (/#proyek) once
 * the data of the sections above it is in.
 */
function HomeSections() {
  const data = usePublicData()
  const settled = !['profile', 'projects', 'experiences', 'skills'].some((key) => data[key].status === 'loading')
  useHashScroll(settled)

  return (
    <>
      <AboutSection />
      <TechRibbon />
      <ProjectsSection />
      <ExperienceSection />
      <EducationSection />
      <CertificatesSection />
      <AchievementsSection />
      <OrganizationsSection />
      <ContactSection />
    </>
  )
}

export default HomeSections
