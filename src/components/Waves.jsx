// Three stacked SVG wave layers that loop horizontally to read as ocean depth.
const BACK_PATH =
  'M0,120 C360,166 1080,166 1440,120 C1800,166 2520,166 2880,120 L2880,200 L0,200 Z'
const FRONT_PATH =
  'M0,128 C360,170 1080,170 1440,128 C1800,170 2520,170 2880,128 L2880,200 L0,200 Z'

export default function Waves() {
  return (
    <div className="waves">
      <div className="wave w1">
        <svg viewBox="0 0 2880 200" preserveAspectRatio="none">
          <path d={BACK_PATH} fill="#0077b6" />
        </svg>
      </div>
      <div className="wave w2">
        <svg viewBox="0 0 2880 200" preserveAspectRatio="none">
          <path d={BACK_PATH} fill="#00a6e6" />
        </svg>
      </div>
      <div className="wave w3">
        <svg viewBox="0 0 2880 200" preserveAspectRatio="none">
          <path d={FRONT_PATH} fill="#cdeefb" />
        </svg>
      </div>
    </div>
  )
}
