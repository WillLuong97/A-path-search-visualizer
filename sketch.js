//creating a (5x5) grid:
var cols = 25;
var rows = 25;
//setting up the grid with the number of column
var grid = new Array(cols);

//open and closed set;
var openSet = [];
var closedSet = [];
var start;
var end;
var w, h;
var path=[];
var noSolution = false;

//helper function to remove an element from an array
function removeFromArray(arr, ele)
{
    for (var i = arr.length - 1; i >= 0; i--)
    {
        if(arr[i] == ele)
        {
            arr.splice(i ,1);
        }
    }
}

//function to retrieve coordinate from the form.
function getFormData()
{
    var coordinate = [];
    var startPoint = document.getElementById("startPoint").value;
    var endPoint = document.getElementById("endPoint").value;

    coordinate.push(startPoint);
    coordinate.push(endPoint);
    return coordinate;
    
}


function heuristic(a,b)
{
    //calculating the distance between the two node a and b
    var d = dist(a.i, a.j, b.i, b.j);
    // var d = abs(a.i-b.i) + abs(a.j - b.j);
    return d;
}

//constructor to create an object:
function Spot(i, j)
{
    //coordinate of each node (spot)
    this.i = i
    this.j = j
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.neighbors = [];
    this.previous = undefined;
    //adding obstacles a long the path
    //originally, there are no walls
    this.wall = false;

    if(random(1) < 0.1)
    {
        this.wall = true;
    }

    //displaying the path processes
    this.show = function(col)
    {
        fill(col);
        if(this.wall)
        {
            fill(0); //the color of a wall/obstacles are always black
        }
        noStroke();
        rect(this.i * w, this.j * h, w-1, h-1);

    }

    this.addNeighbors = function(grid)
    {
        var i = this.i;
        var j = this.j;
        if( i < cols - 1) 
        {
            this.neighbors.push(grid[i+1][j]);
        }

        if (i > 0)
        {
            this.neighbors.push(grid[i-1][j]);
        }

        if ( j < rows - 1)
        {
            this.neighbors.push(grid[i][j + 1]);
        }

        if( j > 0)
        {
            this.neighbors.push(grid[i][j - 1]);
        }
        //addding diagonal path
        if(i > 0 && j > 0)
        {
            this.neighbors.push(grid[i-1][j - 1]);
        }
        if(i < cols - 1 && j > 0)
        {
            this.neighbors.push(grid[i+1][j - 1]);
        }
        if(i > 0 && j < rows - 1)
        {
            this.neighbors.push(grid[i-1][j + 1]);
        }

        if(i < cols - 1 && j < rows - 1)
        {
            this.neighbors.push(grid[i+1][j + 1]);
        }

    }

}

//setting up an intializer:
function setup(){
    createCanvas(400, 400);
    console.log("Running A* algorithm!");

    //screen optimization: 
    //Grid cell size:
    w = width / cols;
    h = height/ rows;

    //making a 2d array:
    for (var i = 0; i < cols; i++)
    {
        grid[i] = new Array(rows);
    }
    //Setting up the nodes on the grid
    for (var i = 0; i < cols; i++)
    {
        for(var j = 0; j < rows; j++)
        {
            grid[i][j] = new Spot(i, j);

        }
        
    } //the grid now contains all the nodes.

    //adding the neighbors to the 
    for (var i = 0; i < cols; i++)
    {
        for(var j = 0; j < rows; j++ )
        {
            grid[i][j].addNeighbors(grid);

        }
        
    }
    //initializing the position of the start node:
    start = grid[0][0]; //top left
    end = grid[cols - 1][rows - 1]; //bottom right
    //the start and end points can never be an obstacles
    start.wall =false;
    end.wall = false;

    openSet.push(start) //The first node to be evalutated would be the start node


    console.log(grid);

}

//Drawing the path:
function draw()
{
    if (openSet.length > 0)
    {
        //best next option
        var winner = 0;
        for(var i = 0; i < openSet.length; i++)
        {
            if (openSet[i].f < openSet[winner].f){
                winner = i;
            }
        }
        var current = openSet[winner];

        if(current === end)
        {
            //find the path
            if(!noSolution)
            {
                path = [];
                var temp = current;
                path.push(temp);
                //as long as the temp has a previous nodes:
                while(temp.previous){
                    path.push(temp.previous);
                    temp = temp.previous; 

                }
                console.log('Done!');

            }
        }
        //openset.remove(current) -> remove the current index from openSet and move it to close
        removeFromArray(openSet, current);
        closedSet.push(current);
        //we can keep going through the node
        var neighbors = current.neighbors;
        //for loop to check for all the neighbors:
        for(var i = 0; i < neighbors.length; i++)
        {
            var neighbor = neighbors[i];

            if(!closedSet.includes(neighbor) && !neighbor.wall)
            {
                //we assume the distance all node is 1 
                var tempG = current.g + 1;
                
                var newPath = false;
                if(openSet.includes(neighbor))
                {
                    if(tempG < neighbor.g)
                    {

                        neighbor.g = tempG;
                        newPath = true;
                    }
                } else {
                    neighbor.g = tempG;
                    newPath = true;
                    openSet.push(neighbor); //this means the node is still good to be evaluated.
                }

                if(newPath){
                    neighbor.h = heuristic(neighbor, end); //how long can I guess to go from the current node to the end?
                    neighbor.f = neighbor.g + neighbor.h     //a* algorithm
                    neighbor.previous = current;
                }
            }
        }
    }

    else
    {
        //no solution
        console.log("No Solution");
        noSolution = true;
        noLoop();
    }

    background(0);

    //Debugging purposes:
    for(var i = 0; i < cols; i++)
    {
        for(var j = 0; j < rows; j++)
        {
            grid[i][j].show(color(255));
        }
    }

    //Color design for debugging
    //closed set would appear as red
    for (var i = 0; i < closedSet.length; i++)
    {
        closedSet[i].show(color(255, 0, 0));
    }
    //open set would appead on the grid on green 
    for(var i = 0; i < openSet.length; i++)
    {
        openSet[i].show(color(0, 255, 0));
    }

    //the path is blue!
    for(var i = 0; i < path.length; i++)
    {
        //showing the path from point A to point B
        path[i].show(color(0, 0, 255));
    }


    
}