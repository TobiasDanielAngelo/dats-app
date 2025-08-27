from PIL import Image, ImageDraw, ImageFont
from core.utils import wrap_text
import io


def create_order_summary_image(purchase):
    """
    Create an order summary image similar to your React Native layout
    """
    # Image dimensions (half letter paper size)
    width = 306 * 4  # 4.25" at 72 DPI
    height = 936 * 4  # 13" at 72 DPI
    # Create image with white background
    image = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(image)

    # Define fonts (adjust paths for your system)
    try:
        header_font = ImageFont.truetype("arial.ttf", 18 * 4)
        normal_font = ImageFont.truetype("arial.ttf", 12 * 4)
        small_font = ImageFont.truetype("arial.ttf", 10 * 4)
    except:
        # Fallback to default font
        header_font = ImageFont.load_default(18 * 4)
        normal_font = ImageFont.load_default(12 * 4)
        small_font = ImageFont.load_default(10 * 4)

    # Colors
    BLACK = "#000000"
    GRAY = "#333333"
    LIGHT_GRAY = "#555555"

    y_position = 20 * 4
    padding = 20 * 4

    # Header
    header_text = f"Order Summary - Purchase #{purchase.id}"
    header_bbox = draw.textbbox((0, 0), header_text, font=header_font)
    header_width = header_bbox[2] - header_bbox[0]
    header_x = (width - header_width) // 2

    draw.text((header_x, y_position), header_text, fill=BLACK, font=header_font)
    y_position += 20 * 4

    # Divider line
    draw.line(
        [(padding, y_position), (width - padding, y_position)], fill=LIGHT_GRAY, width=2
    )
    y_position += 10 * 4

    # Table header
    draw.text((padding, y_position), "Qty", fill=BLACK, font=normal_font)
    draw.text(
        (padding + 30 * 4, y_position), "Description", fill=BLACK, font=normal_font
    )
    y_position += 20 * 4

    # Header underline
    draw.line(
        [(padding, y_position), (width - padding, y_position)], fill=LIGHT_GRAY, width=1
    )
    y_position += 10 * 4

    items = []
    if hasattr(purchase, "temporarypurchase_purchase"):
        items = purchase.temporarypurchase_purchase.all()

    # Draw items
    for item in items:
        qty = int(item.quantity)
        description = item.product

        qty_text = str(qty)
        qty_bbox = draw.textbbox((0, 0), qty_text, font=normal_font)
        qty_width = qty_bbox[2] - qty_bbox[0]
        qty_x = padding + (30 * 4 - qty_width) // 2

        draw.text((qty_x, y_position), qty_text, fill=GRAY, font=normal_font)

        description_lines = wrap_text(
            description, normal_font, width - padding - 80 * 4
        )
        for line in description_lines:
            draw.text((padding + 30 * 4, y_position), line, fill=GRAY, font=normal_font)
            y_position += 18 * 4

        # Add some spacing between items
        y_position += 2 * 4

        # Light separator line
        draw.line(
            [(padding, y_position), (width - padding, y_position)],
            fill="#EEEEEE",
            width=1,
        )
        y_position += 10 * 4

    # Footer
    footer_y = height - 20 * 4

    # Footer separator line
    draw.line(
        [(padding, footer_y - 10 * 4), (width - padding, footer_y - 10 * 4)],
        fill=LIGHT_GRAY,
        width=1,
    )

    # Convert to bytes
    img_byte_arr = io.BytesIO()
    image.save(img_byte_arr, format="JPEG", quality=90)
    img_byte_arr.seek(0)

    return img_byte_arr.read()
