import { useDispatch, useSelector } from "react-redux";
import { uploadModel, deleteModel, clearMedia } from "../slice/mediaSlice";

export default function UploadSection() {
  const dispatch = useDispatch();
  const { mediaId, modelUrl, isLoading, isDeleting, error } = useSelector((state) => state.media);

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

  const loaderStyles = {
    spinner: {
      display: "inline-block",
      width: "20px",
      height: "20px",
      border: "3px solid rgba(0,0,0,.1)",
      borderRadius: "50%",
      borderTopColor: "#09f",
      animation: "spin 1s ease-in-out infinite",
    },
    container: {
      marginTop: "10px",
    },
    error: {
      color: "#d32f2f",
      marginTop: "8px",
      padding: "8px",
      backgroundColor: "#ffebee",
      borderRadius: "4px",
    },
  };

  return (
    <div style={loaderStyles.container}>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <input type="file" onChange={handleUpload} disabled={isLoading || isDeleting} />
      
      {isLoading && (
        <div style={{ marginTop: "10px" }}>
          <div style={loaderStyles.spinner}></div>
          <span style={{ marginLeft: "8px" }}>Uploading model...</span>
        </div>
      )}

      {error && (
        <div style={loaderStyles.error}>
          Error: {error}
        </div>
      )}

      {modelUrl && !isLoading && (
        <button 
          onClick={handleDelete} 
          disabled={isDeleting}
          style={{ marginTop: "10px", opacity: isDeleting ? 0.6 : 1 }}
        >
          {isDeleting ? "Deleting..." : "Delete Media"}
        </button>
      )}
    </div>
  );
}