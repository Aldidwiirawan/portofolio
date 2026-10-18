// Every line of the chicken, the duck and robot a+ on the public pages (BRIEF §5–6), as approved by the
// owner on 19 October 2026 (plans/tahap-3b-publik.md §10). Each line has an Indonesian (id) and an English
// (en) text and follows the language chosen on the page; {name} is the owner's first name.
// To add a line, add an { id, en } object to the right list; it is picked up automatically.

export const CHARACTER_LINES = {
  // First time the chicken and duck are on screen
  greet: {
    chicken: { id: 'Petok! Selamat datang!', en: 'Bawk! Welcome!' },
    duck: { id: 'Kwek, halo...', en: 'Quack, hi...' },
  },
  // Said once, later in the visit
  thanks: { who: 'chicken', id: 'Makasih sudah mampir!', en: 'Thanks for stopping by!' },
  // By the visitor's clock: morning 04–10, noon 11–14, afternoon 15–17, evening 18–21, late night 22–03
  timeOfDay: {
    morning: { who: 'chicken', id: 'Kukuruyuk! Selamat pagi!', en: 'Cock-a-doodle-doo! Morning!' },
    noon: { who: 'chicken', id: 'Selamat siang! Jangan lupa makan.', en: "Good afternoon! Don't skip lunch." },
    afternoon: { who: 'duck', id: 'Sore-sore begini enaknya santai...', en: 'Afternoons are for chilling...' },
    evening: { who: 'chicken', id: 'Selamat malam! Masih semangat?', en: 'Good evening! Still going strong?' },
    lateNight: { who: 'duck', id: 'Begadang, ya? Aku juga.', en: 'Up late? Me too.' },
  },
  // Random small talk every 10–15 seconds
  chatter: {
    chicken: [
      { id: 'Sudah lihat proyeknya? Keren, lho.', en: "Seen the projects? They're cool." },
      { id: 'Jangan lupa isi buku tamu!', en: "Don't forget the guestbook!" },
    ],
    duck: [
      { id: 'Aku lupa mau ke mana.', en: 'I forgot where I was going.' },
      { id: 'Kwek.', en: 'Quack.' },
      { id: 'Aku bebek. Itu saja.', en: "I'm a duck. That's all." },
    ],
    // Only while a CV can be downloaded
    chickenCv: { id: 'CV-nya bisa diunduh, lho!', en: 'Psst, the CV is ready to download!' },
  },
  // The two stop side by side and talk: [speaker, line] pairs
  conversations: [
    [
      ['chicken', { id: 'Siapa yang bikin web ini?', en: 'Who built this site?' }],
      ['duck', { id: '{name}, dong.', en: '{name}, of course.' }],
    ],
    [
      ['duck', { id: 'Kenapa kita di sini?', en: 'Why are we here?' }],
      ['chicken', { id: 'Jaga portofolio {name}, dong.', en: "Guarding {name}'s portfolio, of course." }],
    ],
    [
      ['chicken', { id: 'Kamu sudah baca proyeknya?', en: 'Did you read the projects?' }],
      ['duck', { id: 'Sudah... yang mana, ya?', en: 'I did... which one was it?' }],
    ],
  ],
  // The mouse comes close fast (desktop); "!" alone is used between the lines
  flee: {
    chicken: [
      { id: 'Petok! Kaget!', en: 'Bawk! You scared me!' },
      { id: 'Kursornya galak!', en: "That cursor's fierce!" },
    ],
    duck: [{ id: 'Kweeek! Lari!', en: 'Quaaack! Run!' }],
  },
  alarm: { id: '!', en: '!' },
  // The mouse comes close slowly: they stay
  calm: { who: 'duck', id: 'Halo, kursor.', en: 'Hi, cursor.' },
  // Clicked or tapped: a jump
  jump: {
    chicken: [
      { id: 'Hup!', en: 'Hop!' },
      { id: 'Lagi, lagi!', en: 'Again!' },
    ],
    duck: [{ id: 'Wiii!', en: 'Wheee!' }],
  },
  // Reactions to what the visitor does
  react: {
    dark: { who: 'chicken', id: 'Eh, sudah malam?', en: 'Wait, is it night already?' },
    light: { who: 'duck', id: 'Silau...', en: 'So bright...' },
    // Said in the new language
    toEnglish: { who: 'duck', en: 'Quack! Switching to English!' },
    toIndonesian: { who: 'duck', id: 'Kwek! Ganti ke bahasa Indonesia!' },
    projects: { who: 'chicken', id: 'Nah, ini proyek-proyek {name}!', en: "Here are {name}'s projects!" },
    labelNear: {
      duck: { id: 'Aduh, kepalaku!', en: 'Ouch, my head!' },
      chicken: { id: 'Hei, hati-hati!', en: 'Hey, watch it!' },
    },
  },
  // The visitor has not moved for a while
  idle: {
    stillThere: { who: 'duck', id: 'Masih di situ?', en: 'Still there?' },
    sleep: { id: 'Zzz', en: 'Zzz' },
    wake: { who: 'chicken', id: 'Eh! Aku nggak tidur, kok.', en: "Huh! I wasn't sleeping." },
  },
  // Clicked 10 times in a row
  easterEgg: {
    chicken: { id: 'Oke, oke, aku menyerah!', en: 'Okay, okay, I give up!' },
    duck: { id: 'Kwek... pusing...', en: 'Quack... dizzy...' },
    recover: { id: '...Aku cuma pura-pura.', en: '...I was only pretending.' },
  },
  // Robot a+ (footer and guestbook panel)
  robot: {
    backToTop: { id: 'Kembali ke atas?', en: 'Back to top?' },
    typing: { id: 'Tulis yang baik, ya!', en: 'Keep it kind, okay?' },
    sent: { id: 'Terkirim, makasih!', en: 'Sent, thanks!' },
    emptyMessage: { id: 'Pesannya masih kosong, nih.', en: 'Your message is still empty.' },
    emptyName: { id: 'Namanya diisi dulu, ya.', en: 'Your name first, please.' },
    failed: { id: 'Yah, belum terkirim. Coba lagi, ya.', en: 'Oops, not sent. Try again?' },
  },
}

/** Text of a line in a language (falls back to the other language), with {name} filled in. */
export function lineText(line, lang, vars = {}) {
  if (!line) return ''
  const text = line[lang] ?? line.id ?? line.en ?? ''
  return text.replace(/\{(\w+)\}/g, (_, key) => (vars[key] == null ? '' : String(vars[key])))
}

/** Part of the day by the visitor's clock (see CHARACTER_LINES.timeOfDay). */
export function timeOfDay(date = new Date()) {
  const hour = date.getHours()
  if (hour >= 4 && hour < 11) return 'morning'
  if (hour >= 11 && hour < 15) return 'noon'
  if (hour >= 15 && hour < 18) return 'afternoon'
  if (hour >= 18 && hour < 22) return 'evening'
  return 'lateNight'
}
