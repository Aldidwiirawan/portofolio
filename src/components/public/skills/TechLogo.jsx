import { SKILL_CATEGORY_KEYS } from '../../../i18n/translate'
import {
  CodeIcon,
  DatabaseIcon,
  LayoutIcon,
  NetworkIcon,
  PhoneIcon,
  ServerIcon,
  UsersIcon,
  WrenchIcon,
} from '../icons'
import { techLogoKey } from '../techLogoKeys'

const GENERIC_ICONS = {
  frontend: LayoutIcon,
  backend: ServerIcon,
  mobile: PhoneIcon,
  database: DatabaseIcon,
  network: NetworkIcon,
  tools: WrenchIcon,
  soft: UsersIcon,
}

/**
 * Icon of a skill, in this order (K1): the icon uploaded in the admin (icon_url), the brand logo
 * from techLogoPaths.js (`paths`, loaded on demand; an empty box of the same size until then), or a
 * generic icon for the category. Always decorative: the skill name is written next to it.
 */
function TechLogo({ skill, paths, size = 20 }) {
  if (skill.icon_url) {
    return (
      <img
        src={skill.icon_url}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        className="pub-techlogo pub-techlogo--image"
      />
    )
  }

  const key = techLogoKey(skill.name)
  if (key) {
    if (!paths?.[key]) return <span className="pub-techlogo" style={{ width: size, height: size }} aria-hidden="true" />
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="currentColor"
        className="pub-techlogo"
        aria-hidden="true"
        focusable="false"
      >
        <path d={paths[key]} />
      </svg>
    )
  }

  const Generic = GENERIC_ICONS[SKILL_CATEGORY_KEYS[skill.category]] ?? CodeIcon
  return <Generic size={size} className="pub-techlogo" />
}

export default TechLogo
