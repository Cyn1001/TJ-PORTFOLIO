# RE:PORTFOLIO - MISSION INTEL

This is a portfolio template inspired by the Resident Evil 7/8 "Found Footage" aesthetic, featuring Three.js animations and digital glitch effects.

## Project Structure

- `index.html`: Main structure. Edit sections here.
- `css/style.css`: Visual styling, VHS overlays, and glitch animations.
- `js/app.js`: Three.js logic (background) and UI interactions (typewriter, timer).
- `images/`: Put your project screenshots and profile pictures here.

## How to Customize

### 1. Update Personal Info
Open `index.html` and replace placeholders like `[YOUR NAME]`, `[Your Profession]`, and project details.

### 2. Add Images
- Place your images in the `images/` folder.
- In `index.html`, replace `<div class="card-image-placeholder">...</div>` with `<img src="images/your-image.jpg" alt="Project Name">`.

### 3. Tweak Three.js Background
In `js/app.js`, you can modify the `CONFIG` object at the top:
- `glitchIntensity`: Increase for more frequent glitches.
- `particleCount`: Change the number of background particles.
- `accentColor`: Change the flash color (default is Umbrella Red).

### 4. Style Changes
In `css/style.css`, change the `--accent-color` in `:root` to switch from Red to Green (Old-school RE) or Blue (RE:Village).

## Running Locally
Just open `index.html` in your browser. Since it uses ES Modules for Three.js, you might need a simple local server (like Live Server in VS Code) to avoid CORS issues if you add local textures.
