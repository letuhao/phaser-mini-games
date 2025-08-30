# 🔥 Ember Customization Quick Reference

## ⚡ **Quick Setup**

```typescript
embers: {
    scale: { min: 0.4, max: 1.2 },
    colors: [0xffb15e, 0xff8c42, 0xff6b35],
    colorBlend: true,
    rise: { min: 120, max: 320 },
    duration: { min: 1200, max: 3000 },
    sway: { min: -40, max: 40 },
    alpha: { min: 0.6, max: 0.95 },
    blendMode: 'add',
    gravity: -0.5,
    wind: 0.2,
    texture: { key: 'fx-ember-custom', size: 16, shape: 'circle' }
}
```

## 🎨 **Color Presets**

| Theme | Colors | Blend Mode |
|-------|--------|------------|
| **Fire** | `[0xff4500, 0xff6b35, 0xff8c42]` | `'add'` |
| **Magic** | `[0x00ffff, 0xff00ff, 0xffff00]` | `'screen'` |
| **Nature** | `[0xffa500, 0xff8c00, 0x8b4513]` | `'normal'` |
| **Winter** | `[0xffffff, 0xf0f8ff, 0xe6e6fa]` | `'normal'` |

## 📏 **Size Ranges**

| Effect | Scale Range | Use Case |
|--------|-------------|----------|
| **Subtle** | `{ min: 0.2, max: 0.6 }` | Background effects |
| **Standard** | `{ min: 0.4, max: 1.0 }` | General use |
| **Prominent** | `{ min: 0.8, max: 1.5 }` | Foreground effects |
| **Dramatic** | `{ min: 1.0, max: 2.0 }` | Hero effects |

## 🎬 **Animation Settings**

| Speed | Duration Range | Rise Range | Sway Range |
|-------|----------------|------------|------------|
| **Fast** | `{ min: 800, max: 1500 }` | `{ min: 80, max: 200 }` | `{ min: -20, max: 20 }` |
| **Normal** | `{ min: 1200, max: 3000 }` | `{ min: 120, max: 320 }` | `{ min: -40, max: 40 }` |
| **Slow** | `{ min: 2000, max: 5000 }` | `{ min: 200, max: 500 }` | `{ min: -60, max: 60 }` |

## 🌪️ **Physics Values**

| Effect | Gravity | Wind | Result |
|--------|---------|------|--------|
| **Floating** | `-0.5` | `0` | Gentle upward drift |
| **Falling** | `0.5` | `0` | Natural downward fall |
| **Windy** | `0` | `0.3` | Rightward drift |
| **Swirling** | `-0.2` | `0.1` | Upward + rightward |

## 🎭 **Texture Shapes**

| Shape | Size | Use Case |
|-------|------|----------|
| **Circle** | `12-16px` | Standard embers |
| **Square** | `16-20px` | Geometric effects |
| **Star** | `20-24px` | Magical effects |
| **Diamond** | `18-22px` | Crystal effects |

## 🔧 **Performance Tips**

- **Count**: Keep under 100 particles
- **Budget**: Set to 50-80% of count
- **Texture Size**: Use 12-16px for best performance
- **Blend Mode**: `'add'` is most performant

## 🚀 **Quick Themes**

### **Fire Embers**
```typescript
embers: {
    scale: { min: 0.5, max: 1.0 },
    colors: [0xff4500, 0xff6b35, 0xff8c42],
    colorBlend: true,
    blendMode: 'add',
    gravity: 0,
    texture: { shape: 'circle', size: 12 }
}
```

### **Magic Sparkles**
```typescript
embers: {
    scale: { min: 0.3, max: 0.8 },
    colors: [0x00ffff, 0xff00ff, 0xffff00],
    colorBlend: true,
    blendMode: 'screen',
    gravity: -1.0,
    texture: { shape: 'star', size: 20 }
}
```

### **Autumn Leaves**
```typescript
embers: {
    scale: { min: 0.8, max: 1.5 },
    colors: [0xffa500, 0xff8c00, 0x8b4513],
    colorBlend: true,
    blendMode: 'normal',
    gravity: 0.3,
    texture: { shape: 'diamond', size: 24 }
}
```

---

**💡 Tip**: Start with these presets and customize gradually!
