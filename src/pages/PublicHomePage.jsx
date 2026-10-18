import HeroSection from '../components/public/hero/HeroSection'
import AboutSection from '../components/public/sections/AboutSection'
import ProjectsSection from '../components/public/sections/ProjectsSection'
import SkillsSection from '../components/public/skills/SkillsSection'
import ExperienceSection from '../components/public/sections/ExperienceSection'
import EducationSection from '../components/public/sections/EducationSection'
import { usePublicData } from '../components/public/publicContexts'
import { SITE_NAME } from '../components/public/publicFormat'
import { useDocumentTitle } from '../components/public/useDocumentTitle'
import { useHashScroll } from '../components/public/useHashScroll'
import { useI18n } from '../i18n/i18nContext'

/**
 * Public home page (/): the sections in the order of the stage 3A plan. Every section reads the
 * public data from PublicLayout and hides itself when its table is empty.
 */
function PublicHomePage() {
  const data = usePublicData()
  const { t } = useI18n()
  const name = data.profile.data?.full_name || SITE_NAME
  const settled = !['profile', 'projects', 'experiences', 'skills'].some((key) => data[key].status === 'loading')

  useDocumentTitle(t('meta.title', { name }))
  useHashScroll(settled)

  return (
    <>
      <HeroSection />
      <AboutSection />
      <ProjectsSection />
      <ExperienceSection />
      <SkillsSection />
      <EducationSection />
    </>
  )
}

export default PublicHomePage
