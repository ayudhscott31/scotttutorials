/** Navbar / app brand palette */
export const brand = {
  navBg: '#000000',
  navActive: '#DFFF4F',
  navInactive: '#CCCCCC',
  navActiveFg: '#000000',
  accentMuted: '#F4FFD6',
  gradientFrom: '#000000',
  gradientTo: '#3D3D3D',
  gradientLimeFrom: '#DFFF4F',
  gradientLimeTo: '#B8D63F',
} as const;

export const brandGradient = `linear-gradient(135deg, ${brand.gradientFrom} 0%, ${brand.gradientTo} 100%)`;
export const brandHeroGradient = `linear-gradient(135deg, ${brand.navBg} 0%, #1A1A1A 55%, ${brand.navActive} 140%)`;
export const brandLimeGradient = `linear-gradient(135deg, ${brand.gradientLimeFrom}, ${brand.gradientLimeTo})`;
