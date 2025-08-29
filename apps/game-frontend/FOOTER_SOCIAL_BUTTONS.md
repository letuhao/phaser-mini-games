# Adding Social Media Buttons to Footer

## 🎯 **Goal:**
Add social media buttons (Facebook, Instagram, YouTube, TikTok) to your footer using the new enhanced button system.

## 🚀 **Step 1: Load Social Media Icons**

### **In your scene's preload method:**
```typescript
// apps/game-frontend/src/scenes/LevisR3WheelScene.ts

preload() {
    // Load background image
    this.load.image('bg-16x9', 'assets/backgrounds/levisR3_BG.png');
    
    // Load social media icons
    this.load.image('facebook-icon', 'assets/icons/facebook.png');
    this.load.image('instagram-icon', 'assets/icons/instagram.png');
    this.load.image('youtube-icon', 'assets/icons/youtube.png');
    this.load.image('tiktok-icon', 'assets/icons/tiktok.png');
    
    // Load sound effects (optional)
    this.load.audio('button-hover', 'assets/sounds/hover.mp3');
    this.load.audio('button-click', 'assets/sounds/click.mp3');
}
```

## 🎨 **Step 2: Create Social Media Buttons**

### **Add this method to your scene:**
```typescript
private createSocialButtons() {
    const buttonSize = 50;
    const spacing = 60;
    const startX = 1600; // Position on the right side of footer
    const y = 0; // Will be positioned by footer container
    
    // Facebook Button
    const facebookBtn = new UIButton(this, {
        icon: 'facebook-icon',
        width: buttonSize,
        height: buttonSize,
        shape: 'circle',
        displayMode: 'icon',
        backgroundColor: 0x1877f2, // Facebook blue
        borderColor: 0x0d5aa7,
        hoverScale: 1.1,
        clickScale: 0.95,
        hoverSound: 'button-hover',
        clickSound: 'button-click',
        onClick: () => window.open('https://facebook.com/acfc', '_blank')
    });
    
    // Instagram Button
    const instagramBtn = new UIButton(this, {
        icon: 'instagram-icon',
        width: buttonSize,
        height: buttonSize,
        shape: 'circle',
        displayMode: 'icon',
        backgroundColor: 0xe4405f, // Instagram pink
        borderColor: 0xc13584,
        hoverScale: 1.1,
        clickScale: 0.95,
        hoverSound: 'button-hover',
        clickSound: 'button-click',
        onClick: () => window.open('https://instagram.com/acfc', '_blank')
    });
    
    // YouTube Button
    const youtubeBtn = new UIButton(this, {
        icon: 'youtube-icon',
        width: buttonSize,
        height: buttonSize,
        shape: 'circle',
        displayMode: 'icon',
        backgroundColor: 0xff0000, // YouTube red
        borderColor: 0xcc0000,
        hoverScale: 1.1,
        clickScale: 0.95,
        hoverSound: 'button-hover',
        clickSound: 'button-click',
        onClick: () => window.open('https://youtube.com/acfc', '_blank')
    });
    
    // TikTok Button
    const tiktokBtn = new UIButton(this, {
        icon: 'tiktok-icon',
        width: buttonSize,
        height: buttonSize,
        shape: 'circle',
        displayMode: 'icon',
        backgroundColor: 0x000000, // TikTok black
        borderColor: 0x333333,
        hoverScale: 1.1,
        clickScale: 0.95,
        hoverSound: 'button-hover',
        clickSound: 'button-click',
        onClick: () => window.open('https://tiktok.com/@acfc', '_blank')
    });
    
    // Position buttons horizontally
    facebookBtn.root.setPosition(startX, y);
    instagramBtn.root.setPosition(startX + spacing, y);
    youtubeBtn.root.setPosition(startX + spacing * 2, y);
    tiktokBtn.root.setPosition(startX + spacing * 3, y);
    
    // Add buttons to footer container
    const footer = this.objects['footer'] as Phaser.GameObjects.Container;
    if (footer) {
        footer.add(facebookBtn.root);
        footer.add(instagramBtn.root);
        footer.add(youtubeBtn.root);
        footer.add(tiktokBtn.root);
    }
    
    return { facebookBtn, instagramBtn, youtubeBtn, tiktokBtn };
}
```

## 🔧 **Step 3: Call the Method**

### **In your create method:**
```typescript
create() {
    // ... existing code ...
    
    // 4) Position footer at the bottom of background image
    this.positionFooter();
    
    // 5) Create social media buttons
    this.createSocialButtons();
}
```

## 🎯 **Step 4: Alternative - Add to Objects Config**

### **Or add buttons directly to your objects config:**
```typescript
// apps/game-frontend/src/config/objects.levisR3.ts

export const LevisR3Objects: ObjectsConfig = [
    // ... existing background and footer ...
    {
        type: 'container',
        id: 'social-buttons',
        z: 201, // Above footer
        x: 1600,
        y: 0,
        children: [
            // Facebook
            {
                type: 'button',
                id: 'facebook-btn',
                x: 0,
                y: 0,
                icon: 'facebook-icon',
                width: 50,
                height: 50,
                shape: 'circle',
                displayMode: 'icon',
                backgroundColor: 0x1877f2,
                borderColor: 0x0d5aa7,
                onClick: () => window.open('https://facebook.com/acfc', '_blank')
            },
            // Instagram
            {
                type: 'button',
                id: 'instagram-btn',
                x: 60,
                y: 0,
                icon: 'instagram-icon',
                width: 50,
                height: 50,
                shape: 'circle',
                displayMode: 'icon',
                backgroundColor: 0xe4405f,
                borderColor: 0xc13584,
                onClick: () => window.open('https://instagram.com/acfc', '_blank')
            },
            // ... more buttons
        ]
    }
];
```

## 🎨 **Customization Options:**

### **Button Sizes:**
```typescript
const buttonSize = 40;  // Smaller buttons
const buttonSize = 60;  // Larger buttons
```

### **Colors:**
```typescript
// Custom brand colors
backgroundColor: 0xyourColor,
borderColor: 0xyourDarkerColor,
```

### **Effects:**
```typescript
hoverScale: 1.15,        // More dramatic hover
clickScale: 0.9,         // More dramatic click
hoverTint: 0xffffff,     // White tint on hover
```

### **Positioning:**
```typescript
const startX = 1400;      // More to the left
const startX = 1800;      // More to the right
const spacing = 70;       // More space between buttons
```

## 🔍 **Testing:**

1. **Hover effects**: Move mouse over buttons
2. **Click effects**: Click buttons to see animations
3. **Sound effects**: Check if sounds play (if loaded)
4. **Links**: Verify social media links open correctly
5. **Responsiveness**: Test on different screen sizes

## 🎯 **Result:**

You'll have beautiful, interactive social media buttons in your footer that:
- ✅ Scale smoothly on hover/click
- ✅ Play sound effects (if available)
- ✅ Open social media links in new tabs
- ✅ Automatically scale with your footer
- ✅ Look professional and polished

Your footer will now be complete with both text and social media buttons! 🎉
