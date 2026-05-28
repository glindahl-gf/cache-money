/* Extracted from automate-rosette-figma.html */

(() => {
  const root = document.getElementById('automateRosette');
  if (!root) return;

  const r  = 140;
  const cx = 500, cy = 500;
  const D  = r * Math.sqrt(3);

  const flatTopHex = (cx, cy, r) => {
    const h = r * Math.sqrt(3) / 2;
    return [
      [cx + r,     cy        ],
      [cx + r / 2, cy + h    ],
      [cx - r / 2, cy + h    ],
      [cx - r,     cy        ],
      [cx - r / 2, cy - h    ],
      [cx + r / 2, cy - h    ],
    ];
  };
  const pointsStr = pts => pts.map(p => p.join(',')).join(' ');

  const angles = [-90, -30, 30, 90, 150, 210];
  const centers = angles.map(deg => {
    const rad = deg * Math.PI / 180;
    return { x: cx + D * Math.cos(rad), y: cy + D * Math.sin(rad) };
  });

  const centerVerts = flatTopHex(cx, cy, r);

  const steps = [
    { number: '1', verbs: ['Collect'] },
    { number: '2', verbs: ['Identify', 'Tag', 'Organize'] },
    { number: '3', verbs: ['Distribute'] },
    { number: '4', verbs: ['Activate'] },
    { number: '5', verbs: ['Measure'] },
    { number: '6', verbs: ['Automate'] },
  ];

  const centerLogo = `<span class="rosette-mark" role="img" aria-label="Greenfly"></span>`;

  let svg = `<svg class="rosette-svg" viewBox="0 0 1000 1000" aria-hidden="true">`;

  svg += `<polygon class="rosette-hex rosette-hex--center" points="${pointsStr(centerVerts)}"/>`;

  centers.forEach((c, i) => {
    const pts = pointsStr(flatTopHex(c.x, c.y, r));
    svg += `<polygon class="rosette-hex rosette-hex--step" data-i="${i}" points="${pts}"/>`;
  });

  const centerPath = `M ${centerVerts[0][0]} ${centerVerts[0][1]}
                      L ${centerVerts[1][0]} ${centerVerts[1][1]}
                      L ${centerVerts[2][0]} ${centerVerts[2][1]}
                      L ${centerVerts[3][0]} ${centerVerts[3][1]}
                      L ${centerVerts[4][0]} ${centerVerts[4][1]}
                      L ${centerVerts[5][0]} ${centerVerts[5][1]} Z`;
  svg += `
    <g class="rosette-signal rosette-signal--motion">
      <circle r="7" fill="#336A29">
        <animateMotion dur="18s" begin="0s" repeatCount="indefinite" rotate="auto"
                       path="${centerPath}"/>
      </circle>
      <circle r="5.5" fill="#659B3F">
        <animateMotion dur="18s" begin="-6s" repeatCount="indefinite" rotate="auto"
                       path="${centerPath}"/>
      </circle>
      <circle r="4" fill="#C1D95C">
        <animateMotion dur="18s" begin="-12s" repeatCount="indefinite" rotate="auto"
                       path="${centerPath}"/>
      </circle>
    </g>
    <g class="rosette-signal rosette-signal--static" aria-hidden="true">
      <circle r="7"   fill="#336A29"
              cx="${centerVerts[0][0]}" cy="${centerVerts[0][1]}"/>
      <circle r="5.5" fill="#659B3F"
              cx="${centerVerts[2][0]}" cy="${centerVerts[2][1]}"/>
      <circle r="4"   fill="#C1D95C"
              cx="${centerVerts[4][0]}" cy="${centerVerts[4][1]}"/>
    </g>`;

  svg += `</svg>`;

  let overlay = `<div class="rosette-overlay">`;
  overlay += `<div class="rosette-center-content" aria-hidden="true">${centerLogo}</div>`;
  steps.forEach((step, i) => {
    const c = centers[i];
    const left = (c.x / 10).toFixed(3);
    const top  = (c.y / 10).toFixed(3);
    const verbHtml = step.verbs.map(v => `<span class="rosette-verb">${v}</span>`).join('');
    overlay += `
      <div class="rosette-step" data-i="${i}"
           style="left:${left}%;top:${top}%">
        <span class="rosette-num">${step.number}</span>
        ${verbHtml}
      </div>`;
  });
  overlay += `</div>`;

  root.innerHTML = svg + overlay;
})();
