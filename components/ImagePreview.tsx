import React from 'react'
interface ImagePreviewProps {
  currentIndex: number;
  images: string[];
  onClose: () => void;
  onChangeIndex: (index: number) => void;
}
const ImagePreview = () => {
  return (
    <div>ImagePreview</div>
  )
}

export default ImagePreview