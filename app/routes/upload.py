from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlmodel import Session, select
from app.database import get_session
from app.models.user import User
from app.models.vendor import Vendor
from app.models.product import Product
from app.core.dependencies import get_current_user
from dotenv import load_dotenv
import cloudinary
import cloudinary.uploader
import os

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

router = APIRouter(prefix="/upload", tags=["Upload"])

@router.post("/", summary="Generic image upload")
async def upload_generic_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files allowed")
    
    # Use a generic 'uploads' folder for miscellaneous or new items
    image_url = upload_to_cloudinary(file, "general")
    return {
        "message": "Image uploaded successfully",
        "url": image_url,
        "filename": file.filename
    }

def upload_to_cloudinary(file: UploadFile, folder: str) -> str:
    try:
        contents = file.file.read()
        result = cloudinary.uploader.upload(
            contents,
            folder=f"quickmart/{folder}",
            resource_type="image",
            transformation=[
                {"width": 800, "height": 800, "crop": "limit"},
                {"quality": "auto"},
                {"fetch_format": "auto"}
            ]
        )
        return result["secure_url"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")

# Upload profile picture
@router.post("/profile-picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files allowed")
    
    image_url = upload_to_cloudinary(file, "profiles")
    current_user.profile_image = image_url
    session.commit()
    return {
        "message": "Profile picture updated successfully",
        "image_url": image_url
    }

# Upload vendor shop image
@router.post("/vendor-image")
async def upload_vendor_image(
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files allowed")
    
    vendor = session.exec(
        select(Vendor).where(Vendor.owner_id == current_user.id)
    ).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor profile not found")
    
    image_url = upload_to_cloudinary(file, "vendors")
    vendor.image_url = image_url
    session.commit()
    return {
        "message": "Shop image updated successfully",
        "image_url": image_url
    }

# Upload product image
@router.post("/product-image/{product_id}")
async def upload_product_image(
    product_id: str,
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files allowed")
    
    vendor = session.exec(
        select(Vendor).where(Vendor.owner_id == current_user.id)
    ).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor profile not found")
    
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.vendor_id != vendor.id:
        raise HTTPException(status_code=403, detail="You can only update your own products")
    
    image_url = upload_to_cloudinary(file, "products")
    product.image_url = image_url
    session.commit()
    return {
        "message": "Product image updated successfully",
        "image_url": image_url
    }