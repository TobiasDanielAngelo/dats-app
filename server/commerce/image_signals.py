# signals.py
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.files.base import ContentFile
from PIL import Image, ImageDraw, ImageFont
import io
from datetime import datetime
from .models import PrintJob


@receiver(post_save, sender=PrintJob)
def ensure_unique_printjob(sender, instance, created, **kwargs):
    if not created:
        return  # only care about new ones

    if instance.purchase_id:
        PrintJob.objects.filter(purchase_id=instance.purchase_id).exclude(
            id=instance.id
        ).delete()

    if instance.sale_id:
        PrintJob.objects.filter(sale_id=instance.sale_id).exclude(
            id=instance.id
        ).delete()


@receiver(post_delete, sender=PrintJob)
def delete_printjob_image(sender, instance, **kwargs):
    if instance.image:  # ImageField
        instance.image.delete(save=False)


@receiver(post_save, sender=PrintJob)
def generate_order_image(sender, instance, created, **kwargs):
    """
    Generate an order summary image whenever a PrintJob is created
    """
    if created and instance.purchase:  # Only for new PrintJob instances with a purchase
        try:
            # Generate the image
            image_data = create_order_summary_image(instance.purchase)

            # Create filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"order_{instance.purchase.id}_{timestamp}.jpg"

            # Save to the PrintJob's image field
            instance.image.save(filename, ContentFile(image_data), save=True)

            print(f"✅ Generated image for PrintJob {instance.id}: {filename}")

        except Exception as e:
            print(f"❌ Error generating image for PrintJob {instance.id}: {str(e)}")


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
        header_font = ImageFont.load_default()
        normal_font = ImageFont.load_default()
        small_font = ImageFont.load_default()

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
