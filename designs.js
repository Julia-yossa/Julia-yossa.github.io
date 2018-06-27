var color, height, width;
// Select color input
color = $("#colorPicker").val();
// Select size input
height = $("#inputHeight").val();
width = $("#inputWeight").val();
// When size is submitted by the user, call makeGrid()
$("#sizePicker").submit(function makeGrid(height,width) {

// Your code goes here!
  for( var i = 1; i <= height; i++){
    $("table").append("<tr></tr>");
    for ( var j = 1; j <= width; j++){
      $("tr").append("<td></td>");
      }
     }
   $("td").click(function colorChange(color){
        $(this).css("background-color", color);
      });
});
