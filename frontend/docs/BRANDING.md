# EstateFox Branding Guide

## Colors

### Brand Colors (from logo)
- **Primary Navy**: `#17425a` - Dark blue (used in "Fox" text in logo)
- **Primary Light Blue**: `#2d99d1` - Light blue (used in "Estate" text in logo)
- **Accent Orange**: `#ea8a2e` - Orange accent color

### Extended Palette (from old site CSS)
- **Blue**: `#3399F3` (link color)
- **Blue Dark**: `#405A6A`
- **Brand Primary**: `#197db9` (main action color)
- **Brand Warning**: `#d46500` (orange)
- **Green**: `#819E37`
- **Red**: `#CD0200`

### Grays
- **Gray Darker**: `#222222`
- **Gray Dark**: `#333333`
- **Gray**: `#555555`
- **Gray Light**: `#999999`
- **Gray Lighter**: `#eeeeee`

## Typography

### Font Families (from old site)
- **Primary Sans-serif**: Raleway (weights: 400, 700)
  - Used for: Headings, navigation, buttons
  - Fallback: "Helvetica Neue", Helvetica, Arial, sans-serif

- **Primary Serif**: Bitter (weights: 400, 700)
  - Used for: Body text, descriptions
  - Fallback: Georgia, "Times New Roman", Times, serif

### Font Import
```css
@import url('https://fonts.googleapis.com/css?family=Raleway:400,700|Bitter:400,700');
```

## Logos

### Available Logo Assets
- **Full Logo**: `logo-full.png` - Complete logo with fox icon and "EstateFox" text
- **Horizontal Logo**: `logo-horizontal.png` - Horizontal layout version
- **Fox Icon**: `fox-icon.png` - Standalone fox icon (suitable for favicon/app icon)
- **Favicon**: `favicon.ico` - Browser favicon

### Logo Usage Guidelines
- Use full logo for landing page header
- Use horizontal logo for navigation bars
- Use fox icon for app icons and favicons
- Maintain aspect ratios
- Ensure sufficient padding around logos

## Design Principles

### From Old Site Analysis
- Clean, professional aesthetic
- Real estate focused
- Emphasis on luxury and trust
- Blue conveys stability and professionalism
- Orange provides energy and calls-to-action
- Fox mascot adds distinctive brand identity

## Implementation Notes

### For Expo/React Native
- Font loading: Use `@expo-google-fonts/raleway` and `@expo-google-fonts/bitter`
- Image assets: Use `require()` for local assets or expo-asset for web
- Color tokens: Define in theme constants

### For Web
- Use Google Fonts CDN or self-hosted fonts
- Optimize images for web (consider WebP with PNG fallback)
- Implement responsive logo sizing
