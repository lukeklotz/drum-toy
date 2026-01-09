import './style.css'
import { Grid } from './synth'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="everything-container">
    <h1>drum toy</h1>
    <div id="grid-container"></div>
    <button id="add-row" class="add-row-button">add row</button>
  </div>
`

const grids: Grid[] = [];


//create a row (i need to change the same of the class)
const grid = new Grid();
const grid2 = new Grid();
const grid3 = new Grid();
const grid4 = new Grid();

//display 
grid.displayGrid(100, 100, 100);
grid2.displayGrid(100, 200, 200);
grid3.displayGrid(140, 300, 500);
grid4.displayGrid(100, 400, 200);


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