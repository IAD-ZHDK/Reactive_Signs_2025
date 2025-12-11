Notes from Luke

- It turns out that many more lines were being rendered below the canvas border. The added if statement starting at line 557 is a quick fix which seems to solve the performance problem:

    if (word.y + totalOffsetY < height) {
      text(word.text, xPos, word.y + totalOffsetY);
    }

- I noticed the spotlight looks small at the museum than on my macbook, even though you have made this responsive. This is probably due to an issue with image() function and different pixel density. Try using pixelDensity(1) to simulate the appearance of the screen  

- Suggested improvements: higher contrast would improve the appearance on the museum setup. Getting the background, or just the non-spotlit areas, darker or completely black would improve this. 