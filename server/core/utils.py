from PIL import Image, ImageDraw, ImageFont


def int_to_code(n: float) -> str:
    num = int(n)  # truncate decimals
    mapping = {
        1: "L",
        2: "U",
        3: "C",
        4: "K",
        5: "Y",
        6: "S",
        7: "T",
        8: "O",
        9: "R",
        0: "E",
    }
    return "".join(mapping[int(d)] for d in str(abs(num)))


def wrap_text(text, font, max_width):
    """
    Wrap text to fit within max_width
    """
    lines = []
    words = text.split(" ")
    current_line = []

    for word in words:
        test_line = " ".join(current_line + [word])
        # Create a temporary image to test text width
        temp_img = Image.new("RGB", (1, 1))
        temp_draw = ImageDraw.Draw(temp_img)
        bbox = temp_draw.textbbox((0, 0), test_line, font=font)
        text_width = bbox[2] - bbox[0]

        if text_width <= max_width:
            current_line.append(word)
        else:
            if current_line:
                lines.append(" ".join(current_line))
                current_line = [word]
            else:
                # Single word is too long, add it anyway
                lines.append(word)
                current_line = []

    if current_line:
        lines.append(" ".join(current_line))

    return lines


class ReportBuilder:

    def wrap_text(self, text, font, max_width):
        words = text.split()
        lines, current = [], ""
        for word in words:
            test = current + " " + word if current else word
            if self.draw.textlength(test, font=font) <= max_width:
                current = test
            else:
                lines.append(current)
                current = word
        if current:
            lines.append(current)
        return lines

    def __init__(self, width=800, height=600, bg="white", font_path=None):
        self.img = Image.new("RGB", (width, height), bg)
        self.draw = ImageDraw.Draw(self.img)
        self.width = width
        self.height = height
        self.font_path = font_path

    def font(self, size=20):
        if self.font_path:
            try:
                return ImageFont.truetype(self.font_path, size)
            except OSError:
                return ImageFont.load_default()
        else:
            return ImageFont.load_default()

    def header(self, text, pos=(10, 10), size=40, color="black"):
        self.draw.text(pos, text, font=self.font(size), fill=color)
        return self

    def line(self, y, thickness=2, color="black"):
        self.draw.line([(0, y), (self.width, y)], fill=color, width=thickness)
        return self

    def table(
        self,
        data,
        start=(10, 100),
        cell_size=(150, 40),
        font_size=20,
        border_color="black",
    ):
        x0, y0 = start
        rows = len(data)
        cols = len(data[0]) if rows > 0 else 0

        for r in range(rows):
            for c in range(cols):
                x = x0 + c * cell_size[0]
                y = y0 + r * cell_size[1]

                # Draw cell border
                self.draw.rectangle(
                    [x, y, x + cell_size[0], y + cell_size[1]],
                    outline=border_color,
                    width=2,
                )

                # Wrap text to fit inside the cell
                lines = self.wrap_text(
                    str(data[r][c]), self.font(font_size), cell_size[0] - 10
                )
                for i, line in enumerate(lines):
                    self.draw.text(
                        (x + 5, y + 5 + i * (font_size + 2)),
                        line,
                        font=self.font(font_size),
                        fill="black",
                    )
        return self

    def save(self, path="report.png"):
        self.img.save(path)
        return path
