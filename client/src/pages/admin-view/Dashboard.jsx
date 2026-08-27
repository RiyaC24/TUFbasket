import ProductImageUpload from "@/components/admin-view/ImageUpload";
import { Button } from "@/components/ui/Button";
import { addFeatureImage, getFeatureImages,  deleteFeatureImage } from "@/store/commonSlice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

function AdminDashboard() {
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const dispatch = useDispatch();
  const { featureImageList } = useSelector((state) => state.commonFeature);

  function handleUploadFeatureImage() {
    dispatch(addFeatureImage(uploadedImageUrl)).then((data) => {
      if (data?.payload?.success) {
        dispatch(getFeatureImages());
        setImageFile(null);
        setUploadedImageUrl("");
      }
    });
  }

  function handleDeleteImage(id) {
  dispatch(deleteFeatureImage(id)).then((data) => {
    if (data?.payload?.success) {
      dispatch(getFeatureImages());
    }
  });
}

  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);

  return (
    <div>
      <ProductImageUpload
        imageFile={imageFile}
        setImageFile={setImageFile}
        uploadedImageUrl={uploadedImageUrl}
        setUploadedImageUrl={setUploadedImageUrl}
        setImageLoadingState={setImageLoadingState}
        imageLoadingState={imageLoadingState}
        isCustomStyling={true}
        // isEditMode={currentEditedId !== null}
      />
      <Button onClick={handleUploadFeatureImage} className="mt-5 w-full">
        Upload
      </Button>
      <div className="flex flex-col gap-4 mt-5">
        {featureImageList && featureImageList.length > 0
          ? featureImageList.map((featureImgItem, index) => (
              <div key={featureImgItem._id} className="relative">
  <img
    src={featureImgItem.image}
    className="w-full h-[300px] object-cover rounded-t-lg"
  />

  <Button
    variant="destructive"
    className="mt-2 w-full"
    onClick={() => handleDeleteImage(featureImgItem._id)}
  >
    Delete Image
  </Button>
</div>
            ))
          : null}
      </div>
    </div>
  );
}

export default AdminDashboard;
