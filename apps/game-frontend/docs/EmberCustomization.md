# 🔥 Ember Effect Customization Guide

## 🎯 **Overview**

The Ember effect has been enhanced with extensive customization options, allowing you to create unique visual experiences tailored to your game's needs. From size and color variations to physics simulation and texture customization, you now have full control over every aspect of the ember particles.

## ✨ **New Customization Options**

### **1. Size Customization** 📏
```typescript
embers: {
    scale: {
        min: 0.4,      // Minimum scale (0.1 - 2.0)
        max: 1.2       // Maximum scale (0.1 - 2.0)
    }
}
```
- **Range**: 0.1 to 2.0
- **Default**: min: 0.6, max: 1.0
- **Effect**: Creates variety in ember sizes for more natural appearance

### **2. Color Customization** 🎨
```typescript
embers: {
    colors: [
        0xffb15e,      // Golden orange
        0xff8c42,      // Bright orange
        0xff6b35,      // Deep orange
        0xff4500,      // Red-orange
        0xffd700       // Gold
    ],
    colorBlend: true   // Randomly select from colors
}
```
- **colors**: Array of hex color values
- **colorBlend**: 
  - `true`: Randomly select from colors array
  - `false`: Use first color only
- **Default**: Warm ember colors (orange to gold spectrum)

### **3. Animation Customization** 🎬
```typescript
embers: {
    rise: {
        min: 120,      // Minimum rise distance (px)
        max: 320       // Maximum rise distance (px)
    },
    duration: {
        min: 1200,     // Minimum animation duration (ms)
        max: 3000      // Maximum animation duration (ms)
    },
    sway: {
        min: -40,      // Minimum horizontal sway (px)
        max: 40        // Maximum horizontal sway (px)
    }
}
```
- **rise**: Controls how high embers float
- **duration**: Controls animation speed
- **sway**: Controls horizontal movement during rise

### **4. Visual Effects** 👁️
```typescript
embers: {
    alpha: {
        min: 0.6,      // Minimum alpha (0.0 - 1.0)
        max: 0.95      // Maximum alpha (0.0 - 1.0)
    },
    blendMode: 'add'   // Blend mode for embers
}
```
- **alpha**: Controls transparency range
- **blendMode**: 
  - `'add'`: Additive blending (glow effect)
  - `'screen'`: Screen blending (bright effect)
  - `'multiply'`: Multiply blending (dark effect)
  - `'normal'`: Standard blending

### **5. Physics Simulation** 🌪️
```typescript
embers: {
    gravity: -0.5,     // Gravity effect (negative = upward drift)
    wind: 0.2          // Wind effect (positive = rightward drift)
}
```
- **gravity**: 
  - `0`: No gravity effect
  - `negative`: Upward drift (floating effect)
  - `positive`: Downward drift (falling effect)
- **wind**: 
  - `0`: No wind effect
  - `positive`: Rightward drift
  - `negative`: Leftward drift

### **6. Texture Customization** 🎭
```typescript
embers: {
    texture: {
        key: 'fx-ember-custom',  // Custom texture key
        size: 16,                // Texture size (px)
        shape: 'circle'          // Texture shape
    }
}
```
- **key**: Unique identifier for the texture
- **size**: Texture dimensions in pixels
- **shape**: 
  - `'circle'`: Circular embers
  - `'square'`: Square embers
  - `'star'`: Star-shaped embers
  - `'diamond'`: Diamond-shaped embers

## 🚀 **Complete Configuration Example**

```typescript
{
    type: 'effect',
    id: 'embers-effect',
    effectType: 'embers',
    
    // Basic configuration
    count: 50,      // Number of embers in the pool
    budget: 50,     // How many embers are active at once
    debugSpawnArea: false,
    
    // Spawn area configuration
    spawnArea: { 
        x: 0, y: 1200, width: 2560, height: 500
    },
    
    // Enhanced customization options
    embers: {
        // Size customization
        scale: { min: 0.4, max: 1.2 },
        
        // Color customization
        colors: [0xffb15e, 0xff8c42, 0xff6b35, 0xff4500, 0xffd700],
        colorBlend: true,
        
        // Animation customization
        rise: { min: 120, max: 320 },
        duration: { min: 1200, max: 3000 },
        sway: { min: -40, max: 40 },
        
        // Visual effects
        alpha: { min: 0.6, max: 0.95 },
        blendMode: 'add',
        
        // Physics simulation
        gravity: -0.5,
        wind: 0.2,
        
        // Texture customization
        texture: {
            key: 'fx-ember-custom',
            size: 16,
            shape: 'circle'
        }
    }
}
```

## 🎨 **Preset Configurations**

### **🔥 Classic Fire Embers**
```typescript
embers: {
    scale: { min: 0.5, max: 1.0 },
    colors: [0xff4500, 0xff6b35, 0xff8c42],
    colorBlend: true,
    rise: { min: 100, max: 250 },
    duration: { min: 1500, max: 2500 },
    sway: { min: -20, max: 20 },
    alpha: { min: 0.7, max: 0.9 },
    blendMode: 'add',
    gravity: 0,
    wind: 0,
    texture: { key: 'fx-ember-fire', size: 12, shape: 'circle' }
}
```

### **✨ Magical Sparkles**
```typescript
embers: {
    scale: { min: 0.3, max: 0.8 },
    colors: [0x00ffff, 0xff00ff, 0xffff00, 0xffffff],
    colorBlend: true,
    rise: { min: 200, max: 400 },
    duration: { min: 2000, max: 4000 },
    sway: { min: -60, max: 60 },
    alpha: { min: 0.8, max: 1.0 },
    blendMode: 'screen',
    gravity: -1.0,
    wind: 0.5,
    texture: { key: 'fx-ember-sparkle', size: 20, shape: 'star' }
}
```

### **🍂 Autumn Leaves**
```typescript
embers: {
    scale: { min: 0.8, max: 1.5 },
    colors: [0xffa500, 0xff8c00, 0x8b4513, 0xcd853f],
    colorBlend: true,
    rise: { min: 50, max: 150 },
    duration: { min: 3000, max: 6000 },
    sway: { min: -80, max: 80 },
    alpha: { min: 0.6, max: 0.8 },
    blendMode: 'normal',
    gravity: 0.3,
    wind: -0.2,
    texture: { key: 'fx-ember-leaf', size: 24, shape: 'diamond' }
}
```

### **❄️ Snow Flakes**
```typescript
embers: {
    scale: { min: 0.2, max: 0.6 },
    colors: [0xffffff, 0xf0f8ff, 0xe6e6fa],
    colorBlend: true,
    rise: { min: -100, max: 50 },
    duration: { min: 4000, max: 8000 },
    sway: { min: -30, max: 30 },
    alpha: { min: 0.7, max: 0.9 },
    blendMode: 'normal',
    gravity: 0.8,
    wind: 0.1,
    texture: { key: 'fx-ember-snow', size: 16, shape: 'star' }
}
```

## 🔧 **Advanced Usage Tips**

### **Performance Optimization**
- **count**: Keep under 100 for optimal performance
- **budget**: Set to 50-80% of count for smooth animation
- **texture size**: Use smaller sizes (12-16px) for better performance

### **Visual Quality**
- **blendMode**: Use `'add'` for glowing effects, `'normal'` for realistic particles
- **alpha range**: Keep min > 0.3 for visibility
- **scale range**: Avoid extreme differences (min/max ratio < 3:1)

### **Physics Tuning**
- **gravity**: Small values (-0.5 to 0.5) work best
- **wind**: Use small values (0.1 to 0.5) for subtle movement
- **rise**: Balance with gravity for natural movement

## 🐛 **Debugging**

### **Enable Debug Mode**
```typescript
debugSpawnArea: true  // Shows red rectangle for spawn area
```

### **Logging**
The system provides detailed logging for troubleshooting:
- **Constructor**: Shows all customization options
- **Spawn**: Shows individual ember properties
- **Physics**: Shows calculated final positions

### **Common Issues**
1. **Embers not visible**: Check alpha range and blend mode
2. **Performance issues**: Reduce count and budget
3. **Wrong positioning**: Verify spawnArea coordinates
4. **Texture errors**: Ensure texture key is unique

## 🎯 **Best Practices**

1. **Start Simple**: Begin with basic settings, then enhance gradually
2. **Test Performance**: Monitor frame rate with different configurations
3. **Use Presets**: Leverage preset configurations for common effects
4. **Balance Values**: Avoid extreme ranges that might cause visual issues
5. **Unique Keys**: Use unique texture keys for different ember types

## 🚀 **Future Enhancements**

The ember system is designed to be extensible. Future versions may include:
- **Particle trails**: Following effects
- **Sound integration**: Audio feedback
- **Interactive physics**: Mouse/touch interaction
- **Advanced shapes**: Custom geometry support
- **Animation curves**: Custom easing functions

---

**Ready to create stunning ember effects?** 🎆

Start with the basic configuration and gradually add customization options to achieve the perfect visual effect for your game!
