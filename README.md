# Atom Model Explorer Simulator

**Live Demo:** [https://erencanakyuz.github.io/AtomModelExplorerSimulator/](https://erencanakyuz.github.io/AtomModelExplorerSimulator/)

This project provides an interactive 3D visualization of four fundamental atomic models, created for educational purposes. Explore the evolution of our understanding of the atom!

## Features

*   **Interactive 3D Visualizations:** Explore detailed representations of:
    *   **Bohr Model:** Electrons orbiting a central nucleus in fixed shells.
    *   **Plum Pudding Model:** Electrons embedded within a sphere of positive charge.
    *   **Rutherford Model:** A dense nucleus with electrons orbiting like planets (includes alpha particle scattering simulation).
    *   **Quantum Cloud Model:** Visualizes electron probability clouds (orbitals).
*   **Element Selection:** Choose different elements to see how their atomic structure is represented in each model.
*   **Model Controls:** Adjust parameters like animation speed, visual effects (bloom), and model-specific properties using the control panel (top-right).
*   **Modern Effects:** Utilizes shaders and post-processing (bloom) for enhanced visuals.
*   **Responsive Layout:** Adapts to different screen sizes.

## Technologies Used

*   **Three.js:** Core 3D rendering library.
*   **Vite:** Fast frontend tooling (development server, build process).
*   **Tailwind CSS:** Utility-first CSS framework for styling the UI.
*   **Alpine.js:** Minimal JavaScript framework for UI interactions (dark mode toggle, panel visibility).
*   **lil-gui:** Lightweight graphical user interface for controls.

## Running Locally

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/erencanakyuz/AtomModelExplorerSimulator.git
    cd AtomModelExplorerSimulator
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start the development server:**
    ```bash
    npm run dev
    ```
    This will usually open the application automatically in your browser at `http://localhost:3000`.

## Building for Production

To create an optimized build for deployment:

```bash
npm run build
```
The output files will be located in the `dist` directory.

## Deployment (GitHub Pages)

This project is configured for easy deployment to GitHub Pages:

1.  Ensure the `base` property in `vite.config.js` matches your repository name (`/AtomModelExplorerSimulator/`).
2.  Run the build command: `npm run build`.
3.  Run the deploy script: `npm run deploy`. (This uses the `gh-pages` package to push the `dist` folder contents to the `gh-pages` branch).
4.  Configure your repository's GitHub Pages settings to deploy from the `gh-pages` branch.
