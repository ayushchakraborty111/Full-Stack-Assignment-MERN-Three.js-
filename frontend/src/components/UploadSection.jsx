import { useDispatch, useSelector } from "react-redux";
import { uploadModel, deleteModel, clearMedia } from "../slice/mediaSlice";

export default function UploadSection() {
  const dispatch = useDispatch();
  const { mediaId, modelUrl } = useSelector((state) => state.media);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) dispatch(uploadModel(file));
  };

  const handleDelete = async () => {
    if (mediaId) {
      await dispatch(deleteModel(mediaId));
      dispatch(clearMedia());
    }
  };

  return (
    <div>
      <input type="file" onChange={handleUpload} />
      {modelUrl && <button onClick={handleDelete}>Delete Media</button>}
    </div>
  );
}