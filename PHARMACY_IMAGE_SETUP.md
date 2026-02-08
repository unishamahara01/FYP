# Pharmacy Image Setup Guide

## Overview
The dashboard has been updated to display a pharmacy overview image instead of the sales chart.

## How to Add Your Pharmacy Image

### Option 1: Using Local Image (Recommended)

1. **Save your pharmacy image** to the frontend assets folder:
   ```
   frontend/src/assets/pharmacy-overview.jpg
   ```

2. **Update the Dashboard.jsx** file (line ~460):
   
   Replace:
   ```jsx
   src="https://i.imgur.com/placeholder-pharmacy.jpg"
   ```
   
   With:
   ```jsx
   src={require('../assets/pharmacy-overview.jpg')}
   ```

### Option 2: Using Online Image URL

1. **Upload your image** to an image hosting service:
   - Imgur (https://imgur.com)
   - Cloudinary
   - Your own server

2. **Update the Dashboard.jsx** file (line ~460):
   
   Replace:
   ```jsx
   src="https://i.imgur.com/placeholder-pharmacy.jpg"
   ```
   
   With your image URL:
   ```jsx
   src="https://your-image-url.com/pharmacy.jpg"
   ```

### Option 3: Using Base64 (For Small Images)

1. Convert your image to base64 using an online tool
2. Replace the src with the base64 string:
   ```jsx
   src="data:image/jpeg;base64,YOUR_BASE64_STRING_HERE"
   ```

## Current Implementation

The pharmacy overview section now includes:
- ✅ Full-width image display
- ✅ "Live" badge in the header
- ✅ Responsive container (400px height)
- ✅ Fallback placeholder if image fails to load
- ✅ Smooth gradient background
- ✅ Professional styling matching your dashboard theme

## Styling Details

The image container has:
- Width: 100% of the card
- Height: 400px
- Border radius: 12px
- Object-fit: cover (maintains aspect ratio)
- Gradient background fallback

## Testing

After adding your image:
1. Start the frontend: `npm start` in the frontend folder
2. Navigate to the Dashboard
3. The pharmacy image should appear where the sales chart was

## Troubleshooting

**Image not showing?**
- Check the file path is correct
- Verify the image file exists in the assets folder
- Check browser console for errors
- Ensure the image format is supported (jpg, png, webp)

**Image looks stretched?**
- The CSS uses `object-fit: cover` to maintain aspect ratio
- For best results, use an image with 16:9 or similar wide aspect ratio

## Need Help?

If you encounter any issues, check:
1. File path is correct
2. Image file is in the right location
3. No typos in the import/src statement
4. Browser cache is cleared (Ctrl+Shift+R)
