// IconoFlecha.jsx
export const IconoFlecha = ({ size = 20, color = "currentColor", className = "" }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="17" y1="17" x2="7" y2="7" />
    <polyline points="17 7 7 7 7 17" />
  </svg>
);