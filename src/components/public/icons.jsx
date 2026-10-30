// Interface icons of the public pages: one style (24 grid, stroke 1.8, round ends), currentColor,
// always decorative (aria-hidden). Brand marks (GitHub, LinkedIn, Instagram) are filled glyphs from
// Simple Icons (CC0), like the skill logos.

function Icon({ size = 20, children, className, strokeWidth = 1.8 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {children}
    </svg>
  )
}

function Glyph({ size = 20, d, className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d={d} />
    </svg>
  )
}

export const SunIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
  </Icon>
)

export const MoonIcon = (p) => (
  <Icon {...p}>
    <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7Z" />
  </Icon>
)

export const SoundOnIcon = (p) => (
  <Icon {...p}>
    <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4Z" />
    <path d="M15.5 9a4.2 4.2 0 0 1 0 6M18.5 6.5a7.8 7.8 0 0 1 0 11" />
  </Icon>
)

export const SoundOffIcon = (p) => (
  <Icon {...p}>
    <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4Z" />
    <path d="m16 9.5 5 5M21 9.5l-5 5" />
  </Icon>
)

export const MenuIcon = (p) => (
  <Icon {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Icon>
)

export const CloseIcon = (p) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
)

export const DownloadIcon = (p) => (
  <Icon {...p}>
    <path d="M12 4v11M7 10.5l5 5 5-5M5 19.5h14" />
  </Icon>
)

export const ArrowRightIcon = (p) => (
  <Icon {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
)

export const ArrowLeftIcon = (p) => (
  <Icon {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Icon>
)

export const ArrowUpIcon = (p) => (
  <Icon {...p}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </Icon>
)

export const ArrowDownIcon = (p) => (
  <Icon strokeWidth={2} {...p}>
    <path d="M12 5v14M19 12l-7 7-7-7" />
  </Icon>
)

export const ArrowUpRightIcon = (p) => (
  <Icon strokeWidth={2} {...p}>
    <path d="M7 7h10v10M7 17 17 7" />
  </Icon>
)

// Page with lines (case study)
export const FileTextIcon = (p) => (
  <Icon strokeWidth={2} {...p}>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8" />
  </Icon>
)

export const CopyIcon = (p) => (
  <Icon strokeWidth={2} {...p}>
    <rect x="8" y="8" width="14" height="14" rx="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </Icon>
)

export const TerminalIcon = (p) => (
  <Icon strokeWidth={2} {...p}>
    <path d="m4 17 6-6-6-6M12 19h8" />
  </Icon>
)

// Building with columns (university)
export const UniversityIcon = (p) => (
  <Icon strokeWidth={2} {...p}>
    <path d="M14 21v-3a2 2 0 0 0-4 0v3M18 12h.01M18 16h.01M22 7a1 1 0 0 0-1-1h-2a2 2 0 0 1-1.1-.3L12.6 2.2a1 1 0 0 0-1.2 0L6 5.7A2 2 0 0 1 5 6H3a1 1 0 0 0-1 1v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2zM6 12h.01M6 16h.01" />
    <circle cx="12" cy="10" r="2" />
  </Icon>
)

export const ExternalIcon = (p) => (
  <Icon {...p}>
    <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </Icon>
)

export const ChevronLeftIcon = (p) => (
  <Icon {...p}>
    <path d="M15 5l-7 7 7 7" />
  </Icon>
)

export const ChevronRightIcon = (p) => (
  <Icon {...p}>
    <path d="M9 5l7 7-7 7" />
  </Icon>
)

export const ChevronDownIcon = (p) => (
  <Icon {...p}>
    <path d="M5 9l7 7 7-7" />
  </Icon>
)

export const MailIcon = (p) => (
  <Icon {...p}>
    <rect x="3" y="5" width="18" height="14" rx="1.5" />
    <path d="M3.5 6.5 12 13l8.5-6.5" />
  </Icon>
)

export const MapPinIcon = (p) => (
  <Icon {...p}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
    <circle cx="12" cy="10" r="2.3" />
  </Icon>
)

export const CalendarIcon = (p) => (
  <Icon {...p}>
    <rect x="3.5" y="5" width="17" height="15" rx="1.5" />
    <path d="M3.5 9.5h17M8 3v4M16 3v4" />
  </Icon>
)

export const LockIcon = (p) => (
  <Icon {...p}>
    <rect x="5" y="10.5" width="14" height="10" rx="1.5" />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
  </Icon>
)

export const StarIcon = (p) => (
  <Icon {...p}>
    <path d="m12 3.5 2.6 5.3 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.8Z" />
  </Icon>
)

export const ChatIcon = (p) => (
  <Icon {...p}>
    <path d="M4 5.5h16v10H9.5L5 19.5v-4H4Z" />
    <path d="M8 9.5h8M8 12.5h5" />
  </Icon>
)

// Notebook with a pen (the guestbook button)
export const NotebookPenIcon = (p) => (
  <Icon strokeWidth={2} {...p}>
    <path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4" />
    <path d="M2 6h4M2 10h4M2 14h4M2 18h4" />
    <path d="M21.4 5.6a1 1 0 1 0-3-3l-5 5a2 2 0 0 0-.5.9l-.9 2.9a.5.5 0 0 0 .6.6l2.9-.9a2 2 0 0 0 .9-.5z" />
  </Icon>
)

export const SendIcon = (p) => (
  <Icon {...p}>
    <path d="M20.5 3.5 10 14M20.5 3.5 14 20.5l-4-6.5-6.5-4Z" />
  </Icon>
)

export const CheckIcon = (p) => (
  <Icon {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Icon>
)

export const AlertIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v5.5M12 16.5v.01" />
  </Icon>
)

export const PlayIcon = (p) => (
  <Icon {...p}>
    <path d="M8 5.5v13l10-6.5Z" />
  </Icon>
)

export const PauseIcon = (p) => (
  <Icon {...p}>
    <path d="M9 5.5v13M15 5.5v13" />
  </Icon>
)

export const ImageIcon = (p) => (
  <Icon {...p}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" />
    <circle cx="9" cy="10" r="1.8" />
    <path d="m4 18 5.5-5.5 4 4 2.5-2.5 4.5 4.5" />
  </Icon>
)

export const FileIcon = (p) => (
  <Icon {...p}>
    <path d="M14 3.5H7a1.5 1.5 0 0 0-1.5 1.5v14A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5V8Z" />
    <path d="M14 3.5V8h4.5M9 13h6M9 16.5h4" />
  </Icon>
)

export const BadgeCheckIcon = (p) => (
  <Icon {...p}>
    <path d="M12 3 4.5 6v5.5c0 4.5 3.2 8.2 7.5 9.5 4.3-1.3 7.5-5 7.5-9.5V6Z" />
    <path d="m8.8 12 2.3 2.3 4.2-4.6" />
  </Icon>
)

export const AwardIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="9" r="5.5" />
    <path d="M8.5 13.3 7 20.5l5-2.5 5 2.5-1.5-7.2" />
  </Icon>
)

export const TrophyIcon = (p) => (
  <Icon {...p}>
    <path d="M7.5 4h9v5a4.5 4.5 0 0 1-9 0Z" />
    <path d="M7.5 6H4.5v1.5A3 3 0 0 0 7.6 10.5M16.5 6h3v1.5a3 3 0 0 1-3.1 3M12 13.5V17M8.5 20.5h7M9.5 17h5v3.5h-5Z" />
  </Icon>
)

export const UsersIcon = (p) => (
  <Icon {...p}>
    <circle cx="9" cy="8.5" r="3.5" />
    <path d="M2.5 20a6.5 6.5 0 0 1 13 0M15.5 5.2a3.5 3.5 0 0 1 0 6.6M18 14.2a6.5 6.5 0 0 1 3.5 5.8" />
  </Icon>
)

export const BriefcaseIcon = (p) => (
  <Icon {...p}>
    <rect x="3.5" y="7" width="17" height="12.5" rx="1.5" />
    <path d="M8.5 7V5.5A1.5 1.5 0 0 1 10 4h4a1.5 1.5 0 0 1 1.5 1.5V7M3.5 12.5h17" />
  </Icon>
)

export const CapIcon = (p) => (
  <Icon {...p}>
    <path d="M2.5 9.5 12 5l9.5 4.5L12 14Z" />
    <path d="M6.5 11.5v4.5c3.3 2.3 7.7 2.3 11 0v-4.5M21.5 9.5v5" />
  </Icon>
)

/* Generic skill icons per category (used when a skill has no brand logo and no uploaded icon) */

export const LayoutIcon = (p) => (
  <Icon {...p}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" />
    <path d="M3.5 9h17M9.5 9v10.5" />
  </Icon>
)

export const ServerIcon = (p) => (
  <Icon {...p}>
    <rect x="4" y="4" width="16" height="7" rx="1.5" />
    <rect x="4" y="13" width="16" height="7" rx="1.5" />
    <path d="M7.5 7.5h.01M7.5 16.5h.01M11 7.5h5.5M11 16.5h5.5" />
  </Icon>
)

export const PhoneIcon = (p) => (
  <Icon {...p}>
    <rect x="6.5" y="2.5" width="11" height="19" rx="2" />
    <path d="M10.5 18.5h3" />
  </Icon>
)

export const DatabaseIcon = (p) => (
  <Icon {...p}>
    <ellipse cx="12" cy="5.5" rx="7" ry="2.5" />
    <path d="M5 5.5v13c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-13M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5" />
  </Icon>
)

export const NetworkIcon = (p) => (
  <Icon {...p}>
    <rect x="9" y="3" width="6" height="5" rx="1" />
    <rect x="2.5" y="16" width="6" height="5" rx="1" />
    <rect x="15.5" y="16" width="6" height="5" rx="1" />
    <path d="M12 8v4M5.5 16v-4h13v4" />
  </Icon>
)

export const WrenchIcon = (p) => (
  <Icon {...p}>
    <path d="M14.5 6.5a4 4 0 0 0 5.2 5.2l-8.6 8.6a2.1 2.1 0 0 1-3-3l8.6-8.6a4 4 0 0 1-2.2-2.2Z" />
    <path d="M14.5 6.5 17 4l3 3-2.5 2.5" />
  </Icon>
)

export const SparkIcon = (p) => (
  <Icon {...p}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />
  </Icon>
)

export const CodeIcon = (p) => (
  <Icon {...p}>
    <path d="m8.5 7-5 5 5 5M15.5 7l5 5-5 5M13.5 4.5l-3 15" />
  </Icon>
)

export const LinkIcon = (p) => (
  <Icon {...p}>
    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
    <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
  </Icon>
)

export const PlayCircleIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M10 8.5v7l5.5-3.5Z" />
  </Icon>
)

/* Brand glyphs (Simple Icons, CC0) */

export const GithubIcon = (p) => (
  <Glyph
    {...p}
    d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
  />
)

export const LinkedinIcon = (p) => (
  <Glyph
    {...p}
    d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
  />
)

export const InstagramIcon = (p) => (
  <Icon {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
    <circle cx="12" cy="12" r="4" />
    <path d="M17.2 6.8h.01" />
  </Icon>
)
