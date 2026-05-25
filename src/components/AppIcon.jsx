const iconPaths = {
  eye: (
    <>
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" />
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3z" />
      <path d="M13.5 7.5l3 3" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M6 7l1 14h10l1-14" />
      <path d="M9 7V4h6v3" />
    </>
  ),
  close: (
    <>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </>
  ),
  save: (
    <>
      <path d="M5 4h12l2 2v14H5z" />
      <path d="M8 4v6h8V4" />
      <path d="M8 20v-6h8v6" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  search: (
    <>
      <path d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z" />
      <path d="M16 16l4 4" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 6v5h-5" />
      <path d="M4 18v-5h5" />
      <path d="M18 9a7 7 0 0 0-11.8-2.6L4 8.5" />
      <path d="M6 15a7 7 0 0 0 11.8 2.6L20 15.5" />
    </>
  ),
  login: (
    <>
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M14 4h5v16h-5" />
    </>
  ),
  logout: (
    <>
      <path d="M10 5H5v14h5" />
      <path d="M14 8l4 4-4 4" />
      <path d="M8 12h10" />
    </>
  ),
  reset: (
    <>
      <path d="M4 7v6h6" />
      <path d="M5.5 13A7 7 0 1 0 7 6.8L4 10" />
    </>
  ),
  list: (
    <>
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <path d="M3 6h.1" />
      <path d="M3 12h.1" />
      <path d="M3 18h.1" />
    </>
  ),
  check: (
    <>
      <path d="M20 6L9 17l-5-5" />
    </>
  ),
  calendar: (
    <>
      <path d="M7 3v4" />
      <path d="M17 3v4" />
      <path d="M4 8h16" />
      <path d="M5 5h14v15H5z" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </>
  ),
  chevronLeft: <path d="M15 6l-6 6 6 6" />,
  chevronRight: <path d="M9 6l6 6-6 6" />,
  chevronUp: <path d="M6 15l6-6 6 6" />,
  chevronDown: <path d="M6 9l6 6 6-6" />,
  lock: (
    <>
      <path d="M7 11V8a5 5 0 0 1 10 0v3" />
      <path d="M6 11h12v9H6z" />
    </>
  ),
  unlock: (
    <>
      <path d="M8 11V8a4 4 0 0 1 7.6-1.8" />
      <path d="M6 11h12v9H6z" />
    </>
  ),
  history: (
    <>
      <path d="M4 5v5h5" />
      <path d="M5.6 10A7 7 0 1 0 8 5.1L4 9" />
      <path d="M12 8v5l3 2" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 3l1.4 4.2L18 9l-4.6 1.8L12 15l-1.4-4.2L6 9l4.6-1.8z" />
      <path d="M5 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" />
      <path d="M18 16l.5 1.5 1.5.5-1.5.5L18 20l-.5-1.5L16 18l1.5-.5z" />
    </>
  ),
  wifi: (
    <>
      <path d="M5 10a11 11 0 0 1 14 0" />
      <path d="M8 13a6 6 0 0 1 8 0" />
      <path d="M11 16a2 2 0 0 1 2 0" />
      <path d="M12 19h.1" />
    </>
  ),
  snowflake: (
    <>
      <path d="M12 3v18" />
      <path d="M4 7l16 10" />
      <path d="M20 7L4 17" />
      <path d="M8 5l4 3 4-3" />
      <path d="M8 19l4-3 4 3" />
    </>
  ),
  tv: (
    <>
      <path d="M4 6h16v11H4z" />
      <path d="M9 21h6" />
      <path d="M12 17v4" />
    </>
  ),
  car: (
    <>
      <path d="M5 13l2-5h10l2 5" />
      <path d="M4 13h16v5H4z" />
      <path d="M7 18v2" />
      <path d="M17 18v2" />
      <path d="M7 15h.1" />
      <path d="M17 15h.1" />
    </>
  ),
  house: (
    <>
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v10h14V10" />
      <path d="M9 20v-6h6v6" />
    </>
  ),
  users: (
    <>
      <path d="M16 11a4 4 0 1 0-8 0" />
      <path d="M5 21a7 7 0 0 1 14 0" />
      <path d="M19 8a3 3 0 0 1 2 5" />
      <path d="M3 13a3 3 0 0 1 2-5" />
    </>
  ),
  utensils: (
    <>
      <path d="M6 3v8" />
      <path d="M4 3v4" />
      <path d="M8 3v4" />
      <path d="M6 11v10" />
      <path d="M17 3v18" />
      <path d="M14 3h6v8h-6z" />
    </>
  ),
  bath: (
    <>
      <path d="M4 12h16v3a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" />
      <path d="M6 12V6a3 3 0 0 1 5.7-1.3" />
      <path d="M10 7h4" />
    </>
  ),
  coffee: (
    <>
      <path d="M5 8h11v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z" />
      <path d="M16 10h2a2 2 0 0 1 0 4h-2" />
      <path d="M7 3v2" />
      <path d="M11 3v2" />
    </>
  ),
  wallet: (
    <>
      <path d="M4 7h15a2 2 0 0 1 2 2v10H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h13" />
      <path d="M17 12h4v4h-4a2 2 0 0 1 0-4z" />
      <path d="M17 14h.1" />
    </>
  ),
}

function AppIcon({ name }) {
  return (
    <svg aria-hidden="true" className="button-icon" fill="none" viewBox="0 0 24 24">
      {iconPaths[name]}
    </svg>
  )
}

export default AppIcon
