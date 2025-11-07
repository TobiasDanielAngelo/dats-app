"""
Image generation utilities for creating order summaries and sale receipts.
"""

from PIL import Image, ImageDraw, ImageFont
from core.utils import wrap_text
import io
import os
import random
from datetime import datetime
from typing import Optional, Tuple, List
import math


class ImageConfig:
    """Configuration constants for image generation."""

    # DPI scaling factor
    SCALE = 4

    # Base dimensions (in inches at 72 DPI)
    ORDER_WIDTH = 306 * SCALE  # 4.25"
    ORDER_HEIGHT = int(1440 * SCALE * 0.6)  # 15" (reduced by 25%)
    SALE_WIDTH = 306 * SCALE
    SALE_HEIGHT = 432 * SCALE

    # Colors
    BLACK = "#000000"
    BLUE = "#0000FF"
    GRAY = "#333333"
    LIGHT_GRAY = "#555555"
    SEPARATOR_GRAY = "#EEEEEE"

    # Font sizes (scaled) - INCREASED
    HEADER_FONT_SIZE = 22 * SCALE  # Increased from 18
    NORMAL_FONT_SIZE = 20 * SCALE  # Increased from 12
    SMALL_FONT_SIZE = 14 * SCALE  # Increased from 10
    RANDOM_FONT_SIZE = 80

    # Spacing
    PADDING = 20 * SCALE
    SMALL_PADDING = 10 * SCALE
    LINE_SPACING = 20 * SCALE  # Increased from 18
    ITEM_SPACING = 4 * SCALE  # Increased from 2
    COLUMN_SPACING = 15 * SCALE  # Space between columns


class FontManager:
    """Manages font loading and fallbacks."""

    def __init__(self):
        self.fonts_dir = os.path.join(os.path.dirname(__file__), "fonts")
        self._load_fonts()

    def _load_fonts(self):
        """Load available fonts for random text generation."""
        try:
            font_files = [
                os.path.join(self.fonts_dir, f)
                for f in os.listdir(self.fonts_dir)
                if f.endswith(".ttf")
            ]
            self.random_fonts = [
                ImageFont.truetype(f, ImageConfig.RANDOM_FONT_SIZE) for f in font_files
            ]
        except (OSError, FileNotFoundError):
            self.random_fonts = []

    def get_standard_fonts(self):
        """Get standard fonts with fallback to default."""
        try:
            return {
                "header": ImageFont.truetype("arial.ttf", ImageConfig.HEADER_FONT_SIZE),
                "normal": ImageFont.truetype("arial.ttf", ImageConfig.NORMAL_FONT_SIZE),
                "small": ImageFont.truetype("arial.ttf", ImageConfig.SMALL_FONT_SIZE),
            }
        except OSError:
            return {
                "header": ImageFont.load_default(ImageConfig.HEADER_FONT_SIZE),
                "normal": ImageFont.load_default(ImageConfig.NORMAL_FONT_SIZE),
                "small": ImageFont.load_default(ImageConfig.SMALL_FONT_SIZE),
            }

    def get_random_font(self, size: int = ImageConfig.RANDOM_FONT_SIZE):
        """Get a random font for stylized text."""
        if not self.random_fonts:
            return ImageFont.load_default()

        font_file = random.choice(
            [
                os.path.join(self.fonts_dir, f)
                for f in os.listdir(self.fonts_dir)
                if f.endswith(".ttf")
            ]
        )
        return ImageFont.truetype(font_file, size)


def draw_random_font_text(
    draw: ImageDraw.ImageDraw,
    position: Tuple[int, int],
    text: str,
    fill: str = "black",
    size: int = ImageConfig.RANDOM_FONT_SIZE,
    max_width: Optional[int] = None,
    font_manager: Optional[FontManager] = None,
) -> int:
    """
    Draw text with random fonts and slight jitter for each character.

    Args:
        draw: ImageDraw object
        position: Starting (x, y) position
        text: Text to draw
        fill: Text color
        size: Font size
        max_width: Maximum width before stopping
        font_manager: FontManager instance

    Returns:
        Final x position after drawing
    """
    if font_manager is None:
        font_manager = FontManager()

    x, y = position

    for char in text:
        font = font_manager.get_random_font(size)
        bbox = draw.textbbox((x, y), char, font=font)
        char_width = bbox[2] - bbox[0]

        if max_width and x + char_width > max_width:
            break

        # Add slight random jitter
        jitter_x = random.randint(-1, 1)
        jitter_y = random.randint(-2, 2)

        draw.text((x + jitter_x, y + jitter_y), char, fill=fill, font=font)

        # Move to next character position with slight random spacing
        x += char_width + random.randint(-5, 1)

    return x


def draw_centered_text(
    draw: ImageDraw.ImageDraw,
    y_position: int,
    text: str,
    font: ImageFont.FreeTypeFont,
    fill: str,
    image_width: int,
) -> None:
    """Draw text centered horizontally on the image."""
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    x_position = (image_width - text_width) // 2
    draw.text((x_position, y_position), text, fill=fill, font=font)


def draw_horizontal_line(
    draw: ImageDraw.ImageDraw,
    y_position: int,
    padding: int,
    width: int,
    fill: str = ImageConfig.LIGHT_GRAY,
    line_width: int = 1,
) -> None:
    """Draw a horizontal line across the image."""
    draw.line(
        [(padding, y_position), (width - padding, y_position)],
        fill=fill,
        width=line_width,
    )


def draw_vertical_line(
    draw: ImageDraw.ImageDraw,
    x_position: int,
    height: int,
    start_at: int = 0,
    fill: str = ImageConfig.LIGHT_GRAY,
    line_width: int = 1,
) -> None:
    """Draw a vertical line across the image."""
    draw.line(
        [(x_position, start_at), (x_position, start_at + height)],
        fill=fill,
        width=line_width,
    )


def calculate_item_height(item, fonts, column_width: int) -> int:
    """Calculate the height needed for an item in pixels."""
    unit = item.unit.name if item.unit else ""
    unit_text = "" if unit.lower() == "pcs" else f" {unit}"
    description = item.product

    desc_x_offset = 50 * ImageConfig.SCALE
    description_lines = wrap_text(
        description,
        fonts["normal"],
        column_width - desc_x_offset,
    )

    num_lines = len(description_lines)
    item_height = (
        num_lines * ImageConfig.LINE_SPACING
        + ImageConfig.ITEM_SPACING
        + ImageConfig.SMALL_PADDING
    )

    return item_height


def distribute_items_to_columns(
    items: List,
    fonts,
    num_columns: int,
    column_width: int,
    available_height: int,
    max_per_column: int = 18,
) -> List[List]:
    """Distribute items across columns with max 18 items per column."""
    if not items:
        return [[] for _ in range(num_columns)]

    # Simply split items into chunks of 12
    columns = [[] for _ in range(num_columns)]

    for i, item in enumerate(items):
        col_index = i // max_per_column
        if col_index < num_columns:
            columns[col_index].append(item)

    return columns


def create_order_summary_image(purchase) -> bytes:
    """
    Create an order summary image for a purchase with 2-3 columns.

    Args:
        purchase: Purchase object with items

    Returns:
        JPEG image as bytes
    """
    # Initialize components
    font_manager = FontManager()
    fonts = font_manager.get_standard_fonts()

    # Get items
    items = []
    if hasattr(purchase, "temporarypurchase_purchase"):
        items = list(purchase.temporarypurchase_purchase.all().order_by("product"))

    # Determine number of columns based on item count (18 items per column)
    num_items = len(items)
    num_columns = max(1, math.ceil(num_items / 18))

    # Calculate image width based on number of columns
    single_column_width = 306 * ImageConfig.SCALE
    total_spacing = ImageConfig.COLUMN_SPACING * (num_columns - 1)
    image_width = (
        single_column_width * num_columns + total_spacing + ImageConfig.PADDING * 2
    )

    # Create image with adjusted width
    image = Image.new("RGB", (image_width, ImageConfig.ORDER_HEIGHT), "white")
    draw = ImageDraw.Draw(image)

    y_position = ImageConfig.PADDING

    # Header
    header_text = (
        f"Order {purchase.supplier.name} - Purchase #{purchase.id}"
        if purchase.supplier
        else f"Order Summary - Purchase #{purchase.id}"
    )
    draw_centered_text(
        draw,
        y_position,
        header_text,
        fonts["header"],
        ImageConfig.BLACK,
        image_width,
    )
    y_position += ImageConfig.PADDING

    # Header divider
    draw_horizontal_line(
        draw, y_position, ImageConfig.PADDING, image_width, line_width=2
    )
    y_position += ImageConfig.SMALL_PADDING

    # Calculate column width
    total_padding = ImageConfig.PADDING * 2
    total_spacing = ImageConfig.COLUMN_SPACING * (num_columns - 1)
    column_width = (image_width - total_padding - total_spacing) // num_columns

    # Store header start position
    header_start_y = y_position

    # Draw column headers and get max header height
    max_header_height = 0
    for col in range(num_columns):
        col_x = ImageConfig.PADDING + col * (column_width + ImageConfig.COLUMN_SPACING)

        # Qty header
        draw.text(
            (col_x, y_position),
            "Qty",
            fill=ImageConfig.BLACK,
            font=fonts["normal"],
        )
        # Description header
        draw.text(
            (col_x + 40 * ImageConfig.SCALE, y_position),
            "Description",
            fill=ImageConfig.BLACK,
            font=fonts["normal"],
        )

        header_height = ImageConfig.PADDING
        max_header_height = max(max_header_height, header_height)

    y_position += max_header_height

    # Draw header underlines for all columns
    for col in range(num_columns):
        col_x = ImageConfig.PADDING + col * (column_width + ImageConfig.COLUMN_SPACING)
        draw.line(
            [(col_x, y_position), (col_x + column_width, y_position)],
            fill=ImageConfig.LIGHT_GRAY,
            width=1,
        )

    y_position += ImageConfig.SMALL_PADDING

    # Calculate available height for items
    footer_height = ImageConfig.PADDING * 2
    available_height = ImageConfig.ORDER_HEIGHT - y_position - footer_height

    # Distribute items across columns
    column_items = distribute_items_to_columns(
        items, fonts, num_columns, column_width, available_height
    )

    # Draw vertical separators between columns
    for col in range(1, num_columns):
        separator_x = (
            ImageConfig.PADDING
            + col * (column_width + ImageConfig.COLUMN_SPACING)
            - ImageConfig.COLUMN_SPACING // 2
        )
        draw_vertical_line(
            draw,
            separator_x,
            ImageConfig.ORDER_HEIGHT - y_position - footer_height,
            start_at=header_start_y,
            fill=ImageConfig.SEPARATOR_GRAY,
            line_width=1,
        )

    # Draw items in each column
    for col in range(num_columns):
        col_x = ImageConfig.PADDING + col * (column_width + ImageConfig.COLUMN_SPACING)
        col_y = y_position

        for item in column_items[col]:
            qty = int(item.quantity)
            unit = item.unit.name if item.unit else ""
            unit_text = "" if unit.lower() == "pcs" else f" {unit}"

            qty_text = f"{qty}{unit_text}"
            description = item.product

            # Draw qty + unit together (centered in qty column)
            qty_bbox = draw.textbbox((0, 0), qty_text, font=fonts["normal"])
            qty_width = qty_bbox[2] - qty_bbox[0]
            qty_x = col_x + (40 * ImageConfig.SCALE - qty_width) // 2

            draw.text(
                (qty_x, col_y), qty_text, fill=ImageConfig.GRAY, font=fonts["normal"]
            )

            # Draw description
            desc_x = col_x + 50 * ImageConfig.SCALE
            description_lines = wrap_text(
                description,
                fonts["normal"],
                column_width - 50 * ImageConfig.SCALE,
            )

            for line in description_lines:
                draw.text(
                    (desc_x, col_y),
                    line,
                    fill=ImageConfig.GRAY,
                    font=fonts["normal"],
                )
                col_y += ImageConfig.LINE_SPACING

            # Item spacing + separator
            col_y += ImageConfig.ITEM_SPACING
            draw.line(
                [(col_x, col_y), (col_x + column_width, col_y)],
                fill=ImageConfig.SEPARATOR_GRAY,
                width=1,
            )
            col_y += ImageConfig.SMALL_PADDING

    # Footer separator
    footer_y = ImageConfig.ORDER_HEIGHT - ImageConfig.PADDING
    draw_horizontal_line(
        draw,
        footer_y - ImageConfig.SMALL_PADDING,
        ImageConfig.PADDING,
        ImageConfig.ORDER_WIDTH,
    )

    # Convert to bytes
    img_buffer = io.BytesIO()
    image.save(img_buffer, format="JPEG", quality=100)
    img_buffer.seek(0)

    return img_buffer.read()


def create_sale_images(sale) -> list[bytes]:
    """
    Create sale receipt images with stylized random fonts.
    Divides items into multiple receipts if more than 16 items per receipt.

    Args:
        sale: Sale object with customer and items

    Returns:
        List of JPEG images as bytes
    """
    # Get sale items
    items = []
    if hasattr(sale, "temporarysale_sale"):
        items = list(sale.temporarysale_sale.all())

    # If no items, create one empty receipt
    if not items:
        return [create_single_receipt(sale, [], 1, 1)]

    # Split items into chunks of 16
    item_chunks = [items[i : i + 16] for i in range(0, len(items), 16)]
    receipt_images = []

    # Create a receipt for each chunk
    for page_num, chunk in enumerate(item_chunks, 1):
        receipt_bytes = create_single_receipt(sale, chunk, page_num, len(item_chunks))
        receipt_images.append(receipt_bytes)

    return receipt_images


def create_single_receipt(sale, items, page_num, total_pages) -> bytes:
    """
    Create a single sale receipt image.

    Args:
        sale: Sale object with customer and items
        items: List of items for this receipt (max 16)
        page_num: Current page number
        total_pages: Total number of pages

    Returns:
        JPEG image as bytes
    """
    # Initialize components
    font_manager = FontManager()
    fonts = font_manager.get_standard_fonts()

    # Create image
    image = Image.new("RGB", (ImageConfig.SALE_WIDTH, ImageConfig.SALE_HEIGHT), "white")
    draw = ImageDraw.Draw(image)

    y_position = 0

    # Header
    header_text = f"DATS Motorcycle Parts"
    draw_centered_text(
        draw,
        y_position,
        header_text,
        fonts["header"],
        ImageConfig.BLUE,
        ImageConfig.ORDER_WIDTH,
    )

    y_position += 20 * ImageConfig.SCALE

    header_text = f"and Service Center"
    draw_centered_text(
        draw,
        y_position,
        header_text,
        fonts["header"],
        ImageConfig.BLUE,
        ImageConfig.ORDER_WIDTH,
    )

    y_position += 20 * ImageConfig.SCALE

    # Add page info if multiple pages
    # if total_pages > 1:
    #     page_text = f"Page {page_num} of {total_pages}"
    #     draw_centered_text(
    #         draw,
    #         y_position,
    #         page_text,
    #         fonts["normal"],
    #         ImageConfig.BLACK,
    #         ImageConfig.ORDER_WIDTH,
    #     )

    # Format timestamp
    now = datetime.now()
    timestamp = now.strftime("%b {day}, %Y").format(day=now.day)

    draw.text(
        (ImageConfig.SMALL_PADDING, y_position),
        "Name",
        fill=ImageConfig.BLACK,
        font=fonts["small"],
    )

    draw.text(
        (ImageConfig.SMALL_PADDING + 170 * ImageConfig.SCALE, y_position),
        "Date",
        fill=ImageConfig.BLACK,
        font=fonts["small"],
    )

    # Customer name and date header
    customer_name = sale.customer.replace("#", "")
    draw_random_font_text(
        draw,
        (ImageConfig.SMALL_PADDING + 40 * ImageConfig.SCALE, y_position),
        customer_name,
        font_manager=font_manager,
    )

    draw_random_font_text(
        draw,
        (ImageConfig.SMALL_PADDING + 200 * ImageConfig.SCALE, y_position),
        timestamp,
        font_manager=font_manager,
    )

    draw.line(
        [
            (
                ImageConfig.SMALL_PADDING + 35 * ImageConfig.SCALE,
                y_position + 52,
            ),
            (
                ImageConfig.SMALL_PADDING + 160 * ImageConfig.SCALE,
                y_position + 52,
            ),
        ],
        fill=ImageConfig.LIGHT_GRAY,
        width=3,
    )

    draw.line(
        [
            (
                ImageConfig.SMALL_PADDING + 200 * ImageConfig.SCALE,
                y_position + 52,
            ),
            (
                ImageConfig.SMALL_PADDING + 280 * ImageConfig.SCALE,
                y_position + 52,
            ),
        ],
        fill=ImageConfig.LIGHT_GRAY,
        width=3,
    )

    y_position += 50 * ImageConfig.SCALE

    draw_horizontal_line(
        draw,
        y_position - 100,
        ImageConfig.PADDING,
        ImageConfig.ORDER_WIDTH,
        line_width=3,
    )

    # Column headers
    draw.text(
        (
            ImageConfig.PADDING,
            y_position - 20 * ImageConfig.SCALE,
        ),
        "# Unit",
        fill=ImageConfig.BLACK,
        font=fonts["small"],
    )
    draw.text(
        (
            ImageConfig.PADDING + 40 * ImageConfig.SCALE,
            y_position - 20 * ImageConfig.SCALE,
        ),
        "Description",
        fill=ImageConfig.BLACK,
        font=fonts["small"],
    )

    draw.text(
        (
            ImageConfig.PADDING + 200 * ImageConfig.SCALE,
            y_position - 20 * ImageConfig.SCALE,
        ),
        "U/P",
        fill=ImageConfig.BLACK,
        font=fonts["small"],
    )

    draw.text(
        (
            ImageConfig.PADDING + 240 * ImageConfig.SCALE,
            y_position - 20 * ImageConfig.SCALE,
        ),
        "TOT",
        fill=ImageConfig.BLACK,
        font=fonts["small"],
    )

    draw_horizontal_line(
        draw, y_position - 20, ImageConfig.PADDING, ImageConfig.ORDER_WIDTH
    )

    # Vertical lines
    vertical_pos = [45, 200, 240]
    for i in vertical_pos:
        draw_vertical_line(
            draw,
            ImageConfig.SMALL_PADDING + i * ImageConfig.SCALE,
            20 * 17 * ImageConfig.SCALE,
            start_at=y_position - 100,
            line_width=3,
        )

    # Draw items with stylized fonts
    total_of_totals = 0

    for item in items:
        qty = int(item.quantity)
        description = item.product
        unit_name = item.unit.name if item.unit.name != "pcs" else ""
        unit_amount = str(int(item.unit_amount)) if item.quantity > 1 else ""
        total_amount = str(int(item.unit_amount) * int(item.quantity))

        total_of_totals += int(item.unit_amount) * int(item.quantity)

        # Quantity
        qty_bbox = draw.textbbox((0, 0), str(qty), font=font_manager.get_random_font())
        qty_width = qty_bbox[2] - qty_bbox[0]
        qty_x = ImageConfig.SMALL_PADDING + (30 * ImageConfig.SCALE - qty_width) // 2

        draw_random_font_text(
            draw, (qty_x, y_position), str(qty), font_manager=font_manager
        )

        # Unit
        draw_random_font_text(
            draw,
            (ImageConfig.SMALL_PADDING + 20 * ImageConfig.SCALE, y_position),
            unit_name,
            font_manager=font_manager,
        )

        # Description
        draw_random_font_text(
            draw,
            (ImageConfig.SMALL_PADDING + 50 * ImageConfig.SCALE, y_position),
            description,
            max_width=825,
            font_manager=font_manager,
        )

        # Unit amount
        draw_random_font_text(
            draw,
            (ImageConfig.SMALL_PADDING + 210 * ImageConfig.SCALE, y_position),
            unit_amount,
            font_manager=font_manager,
        )

        # Total amount
        draw_random_font_text(
            draw,
            (ImageConfig.SMALL_PADDING + 250 * ImageConfig.SCALE, y_position),
            total_amount,
            font_manager=font_manager,
        )
        y_position += 20 * ImageConfig.SCALE

        draw_horizontal_line(
            draw, y_position - 20, ImageConfig.PADDING, ImageConfig.ORDER_WIDTH
        )

    # Fill remaining rows with empty lines (up to 16 total)
    if len(items) < 16:
        for i in range(0, 16 - len(items)):
            y_position += 20 * ImageConfig.SCALE
            draw_horizontal_line(
                draw,
                y_position - 20,
                ImageConfig.PADDING,
                ImageConfig.ORDER_WIDTH,
                line_width=3,
            )

    # Show total for this page or "Continued..." if not last page
    if page_num == total_pages:
        # Calculate grand total from all items in the sale
        all_items = []
        if hasattr(sale, "temporarysale_sale"):
            all_items = list(sale.temporarysale_sale.all())

        grand_total = sum(
            int(item.unit_amount) * int(item.quantity) for item in all_items
        )

        draw_random_font_text(
            draw,
            (ImageConfig.SMALL_PADDING + 200 * ImageConfig.SCALE, y_position),
            "Total " + str(grand_total),
            font_manager=font_manager,
        )

        draw_random_font_text(
            draw,
            (ImageConfig.SMALL_PADDING, y_position),
            "Thank you, come again",
            font_manager=font_manager,
        )
    else:
        draw_random_font_text(
            draw,
            (ImageConfig.SMALL_PADDING + 10 * ImageConfig.SCALE, y_position),
            "Continued...",
            font_manager=font_manager,
        )

        # Show page subtotal
        draw_random_font_text(
            draw,
            (ImageConfig.SMALL_PADDING + 180 * ImageConfig.SCALE, y_position),
            "Subtotal " + str(total_of_totals),
            font_manager=font_manager,
        )

    # Convert to bytes
    img_buffer = io.BytesIO()
    image.save(img_buffer, format="JPEG", quality=90)
    img_buffer.seek(0)

    return img_buffer.read()
