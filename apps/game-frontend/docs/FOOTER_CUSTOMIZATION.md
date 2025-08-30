# Footer Customization Guide

## Quick Settings

### 1. **Footer Height** (in `objects.levisR3.ts`)
```typescript
height: 80,    // Change this value to adjust footer height
```

### 2. **Text Size** (in `objects.levisR3.ts`)
```typescript
fontSize: '20px', // Change this to adjust text height
```

### 3. **Text Position** (in `objects.levisR3.ts`)
```typescript
x: 250,        // Left padding - adjust for text positioning
y: -40,        // Vertical centering: -height/2 for center alignment
```

## Auto-Scaling Settings (in `appConfig.ts`)

```typescript
footer: {
    autoScale: true,           // Enable automatic scaling
    baseWidth: 2560,           // Base width (matches background)
    baseHeight: 80,            // Base height (can be adjusted)
    textSize: 20,              // Base text size in pixels
    textPadding: 20,           // Padding from edges
    minHeight: 40,             // Minimum height
    maxHeight: 120,            // Maximum height
}
```

## Height Calculation Formula

**Perfect Footer Height = Text Size + (Padding × 2)**

### Examples:
- **Text: 16px + Padding: 20px** → Height: 16 + (20×2) = **56px**
- **Text: 20px + Padding: 20px** → Height: 20 + (20×2) = **80px** ✅ (Current)
- **Text: 24px + Padding: 20px** → Height: 24 + (20×2) = **88px**
- **Text: 18px + Padding: 15px** → Height: 18 + (15×2) = **48px**

## Quick Fixes

### **Text Too Tall?**
1. Reduce `fontSize` in `objects.levisR3.ts`
2. Reduce `baseHeight` in `appConfig.ts`
3. Reduce `textPadding` in `appConfig.ts`

### **Text Too Small?**
1. Increase `fontSize` in `objects.levisR3.ts`
2. Increase `baseHeight` in `appConfig.ts`
3. Increase `textPadding` in `appConfig.ts`

### **Footer Too Wide/Narrow?**
1. Adjust `baseWidth` in `appConfig.ts` to match your background
2. The footer will automatically scale to match the background width

## Current Settings (Working Well)
- **Footer Height**: 80px
- **Text Size**: 20px
- **Padding**: 20px
- **Total**: 20 + (20×2) = 80px ✅

## Debug Information
Check the browser console for real-time footer scaling information:
```
Footer scaling: {
    backgroundWidth: 1440,
    backgroundHeight: 810,
    footerScale: 0.5625,
    footerWidth: 1440,
    footerHeight: 45,
    textSize: 11.25
}
```
