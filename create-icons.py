#!/usr/bin/env python3
"""Generate PNG icons for Subscriblytics"""

try:
    from PIL import Image, ImageDraw, ImageFont
    import os
    
    def create_icon(size, filename):
        """Create an icon with the letter 'S' on a dark background"""
        # Create image with transparent background
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # Draw rounded rectangle background
        radius = int(size * 0.2)
        # Create background with dark color
        background = Image.new('RGBA', (size, size), (26, 26, 26, 255))
        
        # Draw rounded corners
        mask = Image.new('L', (size, size), 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.rounded_rectangle(
            [(0, 0), (size, size)],
            radius=radius,
            fill=255
        )
        
        # Apply mask to background
        img = Image.composite(background, img, mask)
        draw = ImageDraw.Draw(img)
        
        # Draw "S" text
        try:
            font = ImageFont.truetype("arial.ttf", int(size * 0.6))
        except:
            font = ImageFont.load_default()
        
        text = "S"
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        position = ((size - text_width) // 2, (size - text_height) // 2 - bbox[1])
        draw.text(position, text, fill=(255, 255, 255, 255), font=font)
        
        # Save the image
        img.save(filename, 'PNG')
        print(f"Created {filename} ({size}x{size})")
    
    # Generate icons
    sizes = [32, 192, 512]
    for size in sizes:
        create_icon(size, f"icon-{size}x{size}.png")
    
    print("\nAll icons created successfully!")
    
except ImportError:
    print("Pillow (PIL) is required. Install it with: pip install Pillow")
    print("\nAlternatively, open generate-icons.html in your browser to generate icons.")
except Exception as e:
    print(f"Error: {e}")
    print("\nAlternatively, open generate-icons.html in your browser to generate icons.")

