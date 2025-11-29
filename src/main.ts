import './style.css'
import { Grid } from './synth'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1 id="drum-toy">drum toy</h1>
    <div id="grid-container"></div>
    <button id="add-row" class="add-row-button">+</button>
  </div>
`

const grids: Grid[] = [];

// Create a synth and grid, then display it
const grid = new Grid();
const grid2 = new Grid();
const grid3 = new Grid();
const grid4 = new Grid();

grid.displayGrid(500, 10, 100);
grid2.displayGrid(500, 2200, 200);
grid3.displayGrid(540, 200, 500);
grid4.displayGrid(100, 100, 200);

grids.push(grid, grid2, grid3, grid4);

grids.forEach(grid => grid.playGrid());
//Event listener for adding new grid
const appDiv = document.getElementById("add-row") as HTMLDivElement;
appDiv.addEventListener("click", () => {
    const newGrid = new Grid();
    newGrid.displayGrid(500, 10, 100);
    newGrid.playGrid();
    grids.push(newGrid);
});