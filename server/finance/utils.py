from PIL import Image, ImageDraw, ImageFont
from django.core.files.base import ContentFile
from datetime import datetime
from io import BytesIO


ones = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
]

tens = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
]

scales = ["", "thousand", "million", "billion"]


def num_to_words(n: int) -> str:
    if n == 0:
        return "zero"
    words = []
    group_index = 0
    while n > 0:
        n, chunk = divmod(n, 1000)
        if chunk:
            chunk_words = _chunk_to_words(chunk)
            if scales[group_index]:
                chunk_words += " " + scales[group_index]
            words.insert(0, chunk_words)
        group_index += 1
    return " ".join(words)


def _chunk_to_words(n: int) -> str:
    words = []
    hundreds, rem = divmod(n, 100)
    if hundreds:
        words.append(ones[hundreds])
        words.append("hundred")
    if rem:
        if rem < 20:
            words.append(ones[rem])
        else:
            t, o = divmod(rem, 10)
            words.append(tens[t])
            if o:
                words.append(ones[o])
    return " ".join([w for w in words if w])


def check_amount_words(amount: float) -> str:
    whole = int(amount)
    frac = round((amount - whole) * 100)
    words = num_to_words(whole)
    if frac > 0:
        return f"{words} & {frac:02d}/100 only"
    else:
        return f"{words} only"


def generate_check(self):

    timestamp = datetime.now().strftime("%y%m%d_%H%M")

    dpi = 300
    width = int(8 * dpi)  # 8 inches
    height = int(3 * dpi)  # 3 inches

    # Create white background
    img = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(img)

    # Load font (default if no TTF given)
    try:
        font = ImageFont.truetype("arial.ttf", 48)
    except:
        font = ImageFont.load_default()

    # Convert inches to px
    def to_px(x_in, y_in):
        return int(x_in * dpi), int(y_in * dpi)

    # Draw fields
    draw.text(to_px(1, 1), self.description.upper(), font=font, fill="black")
    draw.text(to_px(6, 1), f"{self.amount:.2f}", font=font, fill="black")
    draw.text(
        to_px(1, 2),
        check_amount_words(self.amount).upper(),
        font=font,
        fill="black",
    )

    buffer = BytesIO()
    img.save(buffer, format="PNG")

    if self.image:
        self.image.delete(save=False)

    self.image.save(
        f"check_{self.pk}_{timestamp}.png",
        ContentFile(buffer.getvalue()),
        save=True,
    )

    self.to_print = False
    self.save(update_fields=["to_print"])
