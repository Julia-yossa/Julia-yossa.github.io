var color, height, width;
// Select color input
color = $("#colorPicker").val();
/*event.default is used to prevent the grid from refreshing each 
time submit is clicked*/
$("#sizePicker").submit(function(event){event.preventDefault();
// Select size input
h = $("#inputHeight").val();
w = $("#inputWeight").val();
makeGrid(h,w);
});
// When size is submitted by the user, call makeGrid()
function makeGrid(h,w) {

// Your code goes here!
  for( var i = 1; i <= h; i++){
  $("#pixelCanvas").append('<tr id=row' +i +'></tr>');
  for ( var j = 1; j <= w; j++){
    $("#row"+i).append("<td></td>");
    $("td").attr("class","pixel");
  }
 }
} 
;
// select and apply color using event delegation
    $("#pixelCanvas").on("click",".pixel", function(){
    	$(this).css("background-color", color);
    });
